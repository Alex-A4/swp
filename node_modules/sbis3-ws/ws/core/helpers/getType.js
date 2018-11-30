define('Core/helpers/getType', function() {
   /**
    * Модуль, в котором описана функция <b>getType(elem)</b>.
    * Умеет распознавать следующие типы:
    * <ul>
    *    <li>number: 1, 0, -3, 123456;</li>
    *    <li>nan: NaN;</li>
    *    <li>infinity: Infinity, -Infinity;</li>
    *    <li>string: '', 'строчка';</li>
    *    <li>boolean: true, false;</li>
    *    <li>undefined: undefined;</li>
    *    <li>null: null;</li>
    *    <li>date: new Date();</li>
    *    <li>regexp: /регулярка/, /[0-9]{6,8}/;</li>
    *    <li>function: function(){};</li>
    *    <li>object: {}, { field1: 1, field2: '2' };</li>
    *    <li>array: [], [1, 'a'];</li>
    *    <li>error: new Error();</li>
    *    <li>element: document, document.body, document.head;</li>
    * </ul>
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *     <li><b>elem</b> {*} - переменная, тип котороой необходимо определить.</li>
    * </ul>
    *
    * <h2>Возвращает</h2>
    * {String} Возвращает тип переменной.
    *
    * <h2>Пример использования</h2>
    * <pre>
    * require(['Core/helpers/getType'], function(getType) {
    *    var classNames = ['news-list__item', 'news-list__item_short'],
    *       classAttribute;
    *    if (getType(classNames) === 'array') {
    *       classAttribute = classNames.join(' ');
    *    }
    * });
    * </pre>
    *
    * @class Core/helpers/getType
    * @public
    * @author Мальцев А.А.
    */
   return function getType(elem) {
      // обработка null для старых версий IE
      if (elem === null) {
         return 'null';
      }

      if (elem === undefined) {
         return 'undefined';
      }

      // обработка DOM-элементов
      if (elem && (elem.nodeType === 1 || elem.nodeType === 9)) {
         return 'element';
      }

      var regexp = /\[object (.*?)\]/,
         match = Object.prototype.toString.call(elem).match(regexp),
         name = match[1].toLowerCase();

      // обработка NaN и Infinity
      if (name === 'number') {
         if (isNaN(elem)) {
            return 'nan';
         }
         if (!isFinite(elem)) {
            return 'infinity';
         }
      }

      return name;
   };
});
