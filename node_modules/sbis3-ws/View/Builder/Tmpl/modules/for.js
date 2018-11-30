define('View/Builder/Tmpl/modules/for',
   [
      'View/Builder/Tmpl/modules/utils/common',
      'View/Builder/Tmpl/expressions/process',
      'View/Builder/Tmpl/expressions/third-party/parser',
      'View/Builder/Tmpl/handlers/error',
      'Core/Deferred',
      'text!View/Builder/Tmpl/modules/templates/forModuleTemplate.jstpl',
      'text!View/Builder/Tmpl/modules/templates/forCustomTemplate.jstpl',
      'text!View/Builder/Tmpl/modules/templates/forProcessedBlock.jstpl'
   ],
   function (utils,
             processExpressions,
             beforejs,
             errorHandling,
             Deferred,
             forModuleTemplate,
             forCustomTemplate,
             forProcessedBlock) {
      'use strict';

      forModuleTemplate = forModuleTemplate.replace( '/*#PROCESSED_BLOCK#*/', forProcessedBlock).replace(/\r|\n/g, '');
      forCustomTemplate = forCustomTemplate.replace( '/*#PROCESSED_BLOCK#*/', forProcessedBlock).replace(/\r|\n/g, '');

      function getErrorMessage(err) {
         var message = err.message.split('Expecting')[0];
         message = message.split('line')[0] + 'line:' + message.slice(message.indexOf(':') + 1);
         return message;
      }

      var forM = {
         parse: function forParse(tag) {
            function createForConfig(key, value, main) {
               return {
                  key: key,
                  value: value,
                  main: main
               }
            }
            function resolveStatement() {
               var def = new Deferred(),
                  concreteSourceStrings = {
                     splittingKey: ' in ',
                     key: ' as ',
                     keyAlt: ','
                  },
                  forStampArguments,
                  source = '',
                  findForAllArguments = function forFindAllArguments(value, main) {
                     var crStringArray = value.split(concreteSourceStrings.key),
                        entityWhichIterates = crStringArray[0],
                        key;
                     if (crStringArray.length > 1) {
                        entityWhichIterates = crStringArray[1];
                        key = crStringArray[0];
                     } else {
                        crStringArray = utils.removeAllSpaces(value).split(concreteSourceStrings.keyAlt);
                        if (crStringArray.length > 1) {
                           entityWhichIterates = crStringArray[1];
                           key = crStringArray[0];
                        }
                     }
                     return createForConfig(key, entityWhichIterates, main);
                  },
                  fromAttr = tag.attribs.hasOwnProperty('for');
               try {
                  if (fromAttr) {
                     source = utils.clone(tag.attribs['for']);
                  } else {
                     source = tag.attribs.data;
                  }

                  if (source.indexOf(';')>-1) {
                     var forArgs = source.split(';');
                     tag.attribs.START_FROM_NAME = '{{"' + forArgs[0] + '"}}';
                     tag.attribs.START_FROM = '{{' + forArgs[0] + '}}';
                     tag.attribs.CUSTOM_CONDITION = '{{' + forArgs[1] + '}}';
                     tag.attribs.CUSTOM_ITERATOR = '{{' + forArgs[2] + '}}';
                     delete tag.attribs.data;
                  } else {
                     forStampArguments = source.split(concreteSourceStrings.splittingKey);
                     tag.forSource = findForAllArguments(forStampArguments[0], beforejs.parse(forStampArguments[1]));
                  }
                  tag.attribs = this._traverseTagAttributes(tag.attribs);
               } catch (err) {
                  var message = getErrorMessage(err);
                  errorHandling('Wrong arguments in for statement ' +
                     tag.name + '\n' + message, this.filename, err);
               }
               this.traversingAST(tag.children).addCallbacks(
                  function dataTraversing(tagDataAst) {
                     tag.children = tagDataAst;
                     def.callback(tag);
                  }.bind(this),
                  function dataTraversingFailed(reason) {
                     def.errback(reason);
                  }
               );
               return def;
            }
            return function forResolve() {
               return resolveStatement.call(this);
            };
         },
         module: function forModule(tag, data) {
            var statelessTag,
               fromAttr = tag.attribs.hasOwnProperty('for');
            statelessTag = { attribs: tag.attribs, children: tag.children, name: tag.name, type: tag.type };
            tag.key = tag.prefix ? tag.prefix + '-' + tag.key : tag.key;

            function resolveStatement2() {
               var START_FROM = tag.attribs.START_FROM.data[0]?processExpressions(tag.attribs.START_FROM.data[0], data, this.calculators, this.filename):'',
                  START_FROM_NAME = tag.attribs.START_FROM_NAME.data[0]?processExpressions(tag.attribs.START_FROM_NAME.data[0], data, this.calculators, this.filename):'',
                  CUSTOM_CONDITION = tag.attribs.CUSTOM_CONDITION.data[0]?processExpressions(tag.attribs.CUSTOM_CONDITION.data[0], data, this.calculators, this.filename):'',
                  CUSTOM_ITERATOR = tag.attribs.CUSTOM_ITERATOR.data[0]?processExpressions(tag.attribs.CUSTOM_ITERATOR.data[0], data, this.calculators, this.filename):'';

               var processed = this._process(fromAttr ? [statelessTag] : statelessTag.children, data);

               return forCustomTemplate
                  .replace('/*#START_FROM_NAME#*/', START_FROM_NAME)
                  .replace(/\/\*#START_FROM#\*\//g, START_FROM)
                  .replace('/*#CUSTOM_CONDITION#*/', CUSTOM_CONDITION)
                  .replace('/*#CUSTOM_ITERATOR#*/', CUSTOM_ITERATOR)
                  .replace('/*#PROCESSED#*/', processed);
            }

            function resolveStatement() {
               if (!tag.forSource) {
                  return resolveStatement2.call(this);
               }

               var scopeArray = processExpressions(
                   { 
                      type: 'var', 
                      name: tag.forSource.main, 
                      value: undefined 
                   }, 
                   data, 
                   this.calculators, 
                   this.filename
                  );

               if (fromAttr) {
                  tag.attribs['for'] = undefined;
               }

               var processed = this._process(fromAttr ? [statelessTag] : statelessTag.children, data);

               return forModuleTemplate.replace(/\/\*#SCOPE_ARRAY#\*\//g, scopeArray)
                  .replace('/*#TAG_OBJECT_STRING#*/', JSON.stringify({key: tag.forSource.key, value: tag.forSource.value}))
                  .replace('/*#PROCESSED#*/', processed);
            }

            return function forModuleReturnable() {
               if (tag.children !== undefined) {
                  return resolveStatement.call(this);
               }
            };
         }
      };
      return forM;
   });