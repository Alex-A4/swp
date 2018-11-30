define('View/Builder/Tmpl/expressions/statement', [
   'View/Builder/Tmpl/modules/utils/common',
   'View/Builder/Tmpl/expressions/third-party/parser'
], function (utils, parser) {
   'use strict';

   var valueIsLocale = function valueIsLocal(value) {
      return value && value.loc;
   },
   /**
    * Создание переменной во время парсинга, для последующего разбора
    * @param  {String} name  lexical name of variable
    * @param  {Undefined} value
    * @return {Object}       data object
    */
   createDataVar = function createDataVar(name, value, localized) {
      return {
         type: 'var',
         name: name,
         localized: localized,
         value: value
      };
   },
   /**
    * Создание ноды типа текст
    * @param  {String} value
    * @return {Object}       Object
    */
   createDataText = function createDataText(value) {
      return {
         type: 'text',
         value: value
      };
   };
   /**
    * Разбор переменных в парсере выражений.
    */
   return {
      processInnerStatements: function processInnerStatements(value, arrVars, localizedVars) {
         if (localizedVars && valueIsLocale(value) && utils.inArray(localizedVars, value.val)) {
            return createDataVar(value.val, undefined, true);
         }
         if (arrVars && utils.inArray(arrVars, value)) {
            return createDataVar(parser.parse(value, this.filename, value), undefined);
         }
         return createDataText(value);
      },
      processProperty: function processProperty(property) {
         return createDataVar(parser.parse(property), undefined);
      },
      createDataText: createDataText,
      createDataVar: createDataVar,
      isStaticString: function (string) {
         return string && !~string.indexOf('{{');
      }
   };
});
