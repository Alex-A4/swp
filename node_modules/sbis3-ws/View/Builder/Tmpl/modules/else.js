define('View/Builder/Tmpl/modules/else',
   [
      'View/Builder/Tmpl/expressions/process',
      'View/Builder/Tmpl/handlers/error',
      'View/Builder/Tmpl/modules/utils/tag'
   ], function elseLoader(processExpressions, errorHandling, tagUtils) {
   'use strict';
   
   var capturingElse = function capturingElse(tag, data, source, elseSource, decor) {
         var processed = this._process(tag.children, data, decor);

         if (elseSource) {
            var elseExists = tag.next && tag.next.name === "ws:else";
            return ": (" + elseSource + ") ? ([" + processed + "])" +
               (elseExists ? '' : " : markupGenerator.createText('')), \n");
         }

         return " : ([" + processed + "])), \n";
      };
   
   return {
      module: function elseModule(tag, data) {
         var tagExpressionBody;
         tag.key = tagUtils.createTagKey(tag.prefix, tag.key);
         function resolveStatement(decor) {
            var source, elseSource;
            if (tagUtils.elseChecker(tag)) {
               errorHandling('There is no "if" for "else" module to use', this.filename);
            }
            try {
               source = tagUtils.getModuleExpressionBody(tag.prev).value;
            } catch (err) {
               errorHandling('There is no data for "else" module to use', this.filename);
            }

            if (tag.attribs !== undefined) {
               try {
                  tagExpressionBody = tagUtils.getModuleExpressionBody(tag);
                  tagExpressionBody.noEscape = true;
                  elseSource = processExpressions(tagExpressionBody, data, this.calculators, this.filename);
                  tagExpressionBody.value = elseSource;
               } catch (err) {
                  errorHandling('There is no data for "else" module to use for excluding place "elseif"', this.filename, err);
               }
            }

            return capturingElse.call(this, tag, data, source, elseSource, decor);
         }

         return function elseModuleReturnable(decor) {
            if (tag.children !== undefined) {
               return resolveStatement.call(this, decor);
            }
         };
      }
   };
});