define('View/Builder/Tmpl/expressions/process',
   [
      'View/Builder/Tmpl/expressions/types',
      'View/Builder/Tmpl/handlers/error',
      'View/Builder/Tmpl/modules/utils/common',
      'View/Builder/Tmpl/modules/data/utils/functionStringCreator'
   ], function processExpressionsCaller(expressions,
                                        errorHandling,
                                        common,
                                        FSC) {
   'use strict';
   /**
    * Фильтр для определения динамически
    * сгенерированного конфига
    * @param key
    * @returns {boolean}
    */
   function filterConfigObject(key) {
      return key.indexOf('__dirtyCheckingVars') === 0;
   }

   /**
    * Для определения динамически сгенерированный
    * configObject для partial или передан реальный конфиг
    * @param configObject
    * @returns {boolean}
    */
   function isConfigObjectDynamic(configObject) {
      if (configObject) {
         if (common.isString(configObject)) {
            return true;
         }
         return Object.keys(configObject).filter(filterConfigObject).length === 0;
      }
      return false;
   }
   /**
    * Process expressions entry point
    */
   function calculateStringResult(res, escape, sanitize) {
      if (escape) {
         return 'markupGenerator.escape(' + res + ')';
      } else if (sanitize) {
         return 'thelpers.Sanitize.apply(undefined, [' + res + '])';
      } else {
         return res;
      }
   }
   function resolveLocExpression(string) {
      return 'thelpers.rk(' + string + ')';
   }
   function calculateResultOfExpression(res, escape, sanitize) {
      if (common.isString(res)) {
         return calculateStringResult(res, escape, sanitize);
      }
      return res;
   }
   function resolveExpressionValue(body, res, composite) {
      if (typeof res !== 'string') {
         return FSC.wrapAroundEntity(JSON.stringify(res));
      } else if (body.expression.type === 'ObjectExpression' || body.expression.type === 'ArrayExpression') {
         return FSC.wrapAroundObject(res);
      } else {
         if (composite) {
            return res;
         }
         return FSC.wrapAroundExec(res, true);
      }
   }
   return function processExpressionsRec(expressionRaw, data, calculators, filename, isControl, configObject, attributeName, isAttribute) {
      var i, body, res, esc = configObject && configObject.esc !== undefined ? false : true;
      if (expressionRaw.type === 'var') {
         if (expressionRaw.localized) {
            // экранируем двойную кавычку, чтобы она не сломала синтаксис функции (строка будет обернута в двойные кавычки, а внутри этой строки будут экранированные двойные кавычки)
            res = expressionRaw.name.replace(/\\/g, '\\\\').replace(/"/g, '\\\"');
            res = FSC.wrapAroundQuotes(res);
            res = resolveLocExpression(res);
            expressionRaw.value = FSC.wrapAroundExec(res, true);
            return res;
         } else {
            if (expressionRaw.name.type === 'Program') {
               if (configObject) {
                  expressionRaw.noEscape = true;
               }

               body = expressionRaw.name.body;
               expressions.calculators = calculators;
               expressions.filename = filename;
               expressions.attributeName = attributeName;
               if (isControl) {
                  expressions.isControl = isControl;
               }
               expressions.configObject = configObject || {};
               expressions.attributeName = attributeName;
               for (i = 0; i < body.length; i++) {
                  if (expressions[body[i].type]) {
                     expressions.escape = esc;
                     expressions.sanitize = true;
                     res = expressions[body[i].type].call(expressions, body[i], data);

                     if (!expressionRaw.noEscape) {
                        res = calculateResultOfExpression(res, expressions.escape, expressions.sanitize);
                     }
                     expressionRaw.value = resolveExpressionValue(body[i], res, expressions.configObject.composite);

                     return res;
                  }
               }
            } else {
               errorHandling('Something wrong with the expression given', filename);
            }
         }
      } else {
         if (expressionRaw.value && isAttribute) {
            res = expressionRaw.value;
            res = res.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            res = common.escape(res);
            return res;
         } else {
            return expressionRaw.value;
         }
      }
   };
});
