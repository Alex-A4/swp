define('View/Builder/Tmpl/modules/template', [
      'View/Builder/Tmpl/handlers/error',
      'Core/Deferred'
   ], function templateLoader(errorHandling, Deferred) {
      'use strict';
      var templateM = {
         parse: function templateParse(tag) {
            function templateAST() {
               var unDef = new Deferred(), realDef = new Deferred();
               this.traversingAST(tag.children).addCallbacks(
                  function partialTraversing(modAST) {
                     unDef.callback(modAST);
                     tag.children = modAST;
                     realDef.callback(tag);
                  },
                  function brokenTraverse(reason) {
                     realDef.errback(reason);
                     errorHandling(reason, this.filename);
                  }.bind(this)
               );
               return { fake: unDef, real: realDef};
            }
            function resolveStatement() {
               var tagStates, name;

               try {
                  name = tag.attribs.name.trim();
               } catch (e) {
                  errorHandling("Something wrong with name attribute in ws:template tag", this.filename, e);
               }
               if (tag.children === undefined || tag.children.length === 0) {
                  errorHandling("There is got to be a children in ws:template tag", this.filename);
               }
               tagStates = templateAST.call(this);
               this.includeStack[name] = tagStates.fake;
               return tagStates.real;
            }
            return function templateResolve() {
               return resolveStatement.call(this);
            };
         },
         module: function templateModule(tag, data) {
            var name = tag.attribs.name;
            return function templateReady() {
               var result;
               if (!this.includeStack[name]) {
                  this.includeStack[name] = tag.children;
               }
               var fnStr = this.getString(this.includeStack[name], {}, this.handlers, {}, true);
               delete this.includeStack[name];
               if (this.includedFn){
                  fnStr = '{ var key = attr&&attr.key||"_";' +
                        'var forCounter = 0;' +
                        'var templateCount = 0;' +
                        'if (!attr.attributes){attr.attributes = {};}' +
                        'thelpers.prepareAttrsForFocus(attr&&attr.attributes, data);' +
                        'var defCollection = {id: [], def: undefined};'  +
                        'var viewController = thelpers.configResolver.calcParent(this, typeof currentPropertyName === "undefined" ? undefined : currentPropertyName, data);' +
                        fnStr +
                     '}';
                  this.includedFn[name] = fnStr;
                  return '';
               }
               result = '(function() { includedTemplates["' + name + '"] = (function (data,attr,context,isVdom) {'+ fnStr + '}.bind({ includedTemplates: includedTemplates })' + '); })(), \n';
               return result;
            };
         }
      };
      return templateM;
   });