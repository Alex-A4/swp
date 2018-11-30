define('Core/helpers/String/escapeHtml', function () {
   /**
    * Модуль, в котором описана функция <b>escapeHtml(str)</b>, которая производит экранирование HTML-тэгов в строке.
    * Функция возвращает экранированную строку.
    *
    * @class Core/helpers/String/escapeHtml
    * @public
    * @author Мальцев А.А.
    */

   var tagsToReplace = {
      '<'   : '&lt;',
      '>'   : '&gt;',
      "\""  : '&quot;'
   };

   return function (str) {
      if (typeof str === "string") {
         str = str.replace(/&([^#])/g, function escapeReplace(tag, suffix) {
            return '&amp;' + suffix;
         });

         return str.replace(/([<>"])/g, function escapeReplace(tag) {
            return tagsToReplace[tag] || tag;
         });
      } else {
         return str;
      }
   };
});