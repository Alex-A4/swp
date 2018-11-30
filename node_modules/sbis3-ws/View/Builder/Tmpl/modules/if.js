define('View/Builder/Tmpl/modules/if',
   [
      'View/Builder/Tmpl/modules/utils/conditional',
      'View/Builder/Tmpl/modules/utils/tag'
   ], function ifLoader(challenge, tagUtils) {
   'use strict';
   var sourceTagsAttrib = function sourceTagsAttrib(tag, data, source, decor) {
         var savedData = tag.attribs['if'], processed;
         tag.attribs['if'] = undefined;

         processed = this._process([tag], data, decor);
         tag.attribs['if'] = savedData;
         var elseExists = false;
         return "" +
            "((" + source.value + ") ? ([" + processed + "])" +
            (elseExists ? '' : ": markupGenerator.createText('')), \n");
      },
      sourceTags = function sourceTags(tag, data, source, decor) {
         if (tag.children !== undefined) {
            tag.skip = true;

            var processed = this._process(tag.children, data, decor);

            var elseExists = tag.next && tag.next.name === "ws:else";
            return "" +
               "((" + source.value + ") ? ([" + processed + "])" +
               (elseExists ? '' : ": markupGenerator.createText('')), \n");
         } else {
            tag.skip = false;
         }
      };
   
   return {
      module: function ifModule(tag, data) {
         tag.key = tagUtils.createTagKey(tag.prefix, tag.key);
         function resolveStatement(source, decor) {
            return source.fromAttr ?
                  // Обработка модуля if в атрибуте тега
                  sourceTagsAttrib.call(this, tag, data, source, decor) :
                     // обработка тега ws:if
                     sourceTags.call(this, tag, data, source, decor);
         }
         return function ifModuleReturnable(decor) {
            if (tag.children !== undefined) {
               return resolveStatement.call(this, challenge.call(this, tag, 'if', false, data), decor);
            }
         };
      }
   };
});
