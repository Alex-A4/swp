define('Core/helpers/String/unEscapeHtml', function () {
   /**
    * Модуль, в котором описана функция <b>unEscapeHtml(str)</b>, в котором описана функция <b>unEscapeHtml(str)</b>, которая производит разэкранирование HTML тэгов.
    *
    * @class Core/helpers/String/unEscapeHtml
    * @public
    * @author Мальцев А.А.
    */

   var translate_re = /&(amp|quot|lt|gt);/g,
      translate = {"amp" : "&","quot": "\"","lt" : "<","gt" : ">"};

   //FieldLink, Control
   return function (str) {
      if (typeof str === "string") {
         return str.replace(translate_re, function unescapeReplace(match, entity) {
            return translate[entity];
         });
      } else {
         return str;
      }
   };
});