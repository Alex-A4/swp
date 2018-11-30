define('View/Builder/Tmpl/modules/control',
   [
      'View/Builder/Tmpl/modules/utils/tag',
      'View/Builder/Tmpl/modules/partial',
      'View/Builder/Tmpl/modules/utils/loader',
      'View/Builder/Tmpl/modules/utils/tag'
   ], function moduleLoader(utils, partial, straightFromFile, tagUtils) {
      'use strict';
      var moduleM = {
         parse: function modulePars(tag) {
            var name, readyName = tagUtils.splitWs(tag.name);
            tag.key = tag.prefix ? tag.prefix + '-' + tag.key : tag.key;
            var tagNameIndexOfColon = tag.name.indexOf(':');
            var wasCol = tagNameIndexOfColon > 2 || tagNameIndexOfColon === -1; //игнорируем те теги у которых есть ws:
            tag.name = tagUtils.resolveModuleName.call(this, readyName, tag.name, this.fromBuilderTmpl);
            name = tagUtils.createControlTagName(tag, utils.splitWs);
            name.simple = wasCol;
            function resolveStatement() {
               if (!this.includeStack[name.value]) {
                  this.includeStack[name.value] = straightFromFile.call(this, name);
               }
               if (tag.attribs === undefined) {
                  tag.attribs = {};
               }
               /**
                * Активный атрибут для вычисление модуля для require в шаблонизаторе. Сделано для того чтобы освободить такое популярное опции - template!
                * @private
                */
               tag.attribs._wstemplatename = name.value;
               return partial.parse(tag).call(this);
            }
            return function moduleParseResolve() {
               return resolveStatement.call(this);
            };
         },
         module: function moduleParsing(tag, data, decor) {
            return partial.module(tag, data, decor);
         }
   };
   return moduleM;
});
