define('View/Builder/Tmpl/modules/utils/template',
   [
      'View/Builder/Tmpl/modules/utils/names',
      'View/Builder/Tmpl/modules/utils/loader',
      'View/Builder/Tmpl/handlers/error',
      'View/Builder/Tmpl/modules/data/utils/functionStringCreator',
      'Core/Deferred',
      'View/Builder/Tmpl/modules/utils/common'
   ],
   function templateHelpers(names, straightFromFile, errorHandling, FSC, Deferred, common) {

      /**
       * Для проверки на то, есть ли вставленные теги данных
       * @param data
       * @returns {boolean}
       */
      var isDataInjected = function isDataInjected(data) {
            var emptySpace = ' ';
            if (data.length > 0) {
               for (var i = 0; i < data.length; i++) {
                  if (data[i].data !== emptySpace) {
                     return true;
                  }
               }
            }
            return false;
         },
         innerTemplateErrorLog = function innerTemplateErrorLog(filename, innerTemplate, ast) {
            return new Error('Required template or control in file ' + filename + ' did not return AST for' + innerTemplate + ". AST RESULT: " + ast);
         },
         resolveTemplate = function resolveTemplate(tag, tagData, template) {
            var def = new Deferred();
            if (this.includeStack[template] === undefined) {
               errorHandling('Requiring tag for "' + template + '" is not found!', this.filename);
               def.errback(new Error('Requiring tag for "' + template + '" is not found!'));
            } else {
               this.includeStack[template].addCallbacks(
                  function partialInclude(modAST) {
                     if (modAST) {
                        tag.children = modAST;
                        if (tagData && isDataInjected(tagData)) {
                           this.traversingAST(tagData, tag.key, true).addCallbacks(
                              function dataTraversing(tagDataAst) {
                                 if (tagDataAst) {
                                    tag.injectedData = tagDataAst;
                                    def.callback(tag);
                                 } else {
                                    def.errback(innerTemplateErrorLog(this.filename, template, tagDataAst));
                                 }
                              }.bind(this),
                              function resolveInjectedDataErr(reason) {
                                 def.errback(reason);
                              }
                           );
                        } else {
                           def.callback(tag);
                        }
                     } else {
                        def.errback(innerTemplateErrorLog(this.filename, template, modAST));
                     }
                     return modAST;
                  }.bind(this),
                  function brokenPartial(reason) {
                     def.errback(reason);
                     errorHandling(reason, this.filename);
                  }.bind(this)
               );
            }
            return def;
         },
         calculateData = function calculateData(sequence) {
            var string = '', attrData = sequence.data, i;
            if (attrData.length) {
               if (attrData.length === 1) {
                  return attrData[0].value;
               }
               for (i = 0; i < attrData.length; i++) {
                  string += attrData[i].value;
               }
               return string;
            }
            return sequence;
         },
         getTemplateCfg = function getTemplateCfg(internalStr) {
            var result = '{ "data": data, "ctx": this, "pName": typeof currentPropertyName !== "undefined" ? currentPropertyName : undefined, "viewController": viewController, ';

            // если передана служебная информация, записываем ее в поле "internal"
            // объекта templateCfg - конфигурации шаблона
            if (internalStr) {
               result += '"internal": ' + internalStr + ', ';
            }

            result += '}';

            return result;
         },
         createOptionalTag = function createOptionalTag(templateName) {
            return {value: templateName, type: 'optional'};
         },
         createTemplateTagName = function createTemplateTagName(templateName) {
            return {value: templateName, type: 'template'};
         },
         createSimpleControlTagName = function createSimpleControlTagName(templateName) {
            return { value: templateName, type: 'ws-control', simple: true };
         },
         createLibraryModuleTagName = function createLibraryModuleTagName(templateName) {
            var libPath = common.splitModule(templateName);
            return {
               libPath: libPath,
               value: libPath.library + ':' + libPath.module,
               type: 'ws-module',
               simple: true
            };
         };

      return {
         syncRequireTemplateOrControl: function syncRequireTemplateOrControl(url, preparedScope, decorAttribs, tag) {
            var
               templateName = calculateData(tag.attribs._wstemplatename),
               // превращаем объект с экранированными значениями (¥) в строку для добавления в шаблон
               decorInternal = (tag.internal && Object.keys(tag.internal).length > 0) ? FSC.getStr(tag.internal) : null;
            return FSC.injectFunctionCall('markupGenerator.createControl', [
                  '"resolver"', templateName.slice(1, -1), FSC.getStr(preparedScope),
                  decorAttribs, getTemplateCfg(decorInternal),
                  '(isVdom?context+"part_"+(templateCount++):context)', 'depsLocal', 'includedTemplates', 'thelpers.config', '{}', 'defCollection']) + ', \n';
         },
         resolveTemplate: resolveTemplate,
         /**
          * Разрешаем отложенный разбор, прокинутых шаблонов, через теговое представление
          * @param tag
          * @param state
          * @param tagData
          * @returns {p.promise|{then, fail, end}|jQuery.promise|promise|{is_promise, when}|Function|*}
          */
         resolveInjectedTemplate: function resolveInjectedTemplate(tag, tagData) {
            var def = new Deferred();
            var template = tag.attribs._wstemplatename.data;
            tag.injectedTemplate = template[0];
            if (tagData && isDataInjected(tagData)) {
               this.traversingAST(tagData, tag.key, true).addCallbacks(
                  function dataTraversing(tagDataAst) {
                     if (tagDataAst) {
                        tag.injectedData = tagDataAst;
                        def.callback(tag);
                     } else {
                        def.errback('Something wrong with template ' + this.filename + '.');
                     }
                  }.bind(this),
                  function resolveInjectedDataErr(reason) {
                     def.errback(reason);
                  }
               );
            } else {
               def.callback(tag);
            }
            return def;
         },
         getTemplateCfg: getTemplateCfg,
         checkRequirableTemplate: function checkRequirableTemplate(tag, tagData) {
            var tplName = tag.attribs._wstemplatename.data.value.trim(), name;
            if (names.isStringModules(tplName, this.config)) {
               if (names.isControlString(tplName) || names.isSlashedControl(tplName)) {
                  if (common.isLibraryModuleString(tplName)) {
                     name = createLibraryModuleTagName(tplName);
                  } else {
                     name = createSimpleControlTagName(tplName);
                  }
                  if (tag.attribs === undefined) {
                     tag.attribs = {};
                  }
                  tag.attribs._wstemplatename = name.value;
               }
               else if (names.isOptionalString(tplName)) {
                  name = createOptionalTag(tplName);
               } else {
                  name = createTemplateTagName(tplName);
               }
               if (!this.includeStack[name.value]) {
                  this.includeStack[name.value] = straightFromFile.call(this, name);
               }
               return resolveTemplate.call(this, tag, tagData, tplName);
            }
            return resolveTemplate.call(this, tag, tagData, tplName);
         },
         reflector: function reflector(children) {
            return children;
         }
      }
   });