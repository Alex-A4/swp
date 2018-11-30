define('Core/helpers/Object/getPropertyType', [
   'Core/helpers/getType'
], function(getType) {
   /**
    *
    * Модуль, в котором описана функция <b>getPropertyType(object, property)</b>, которая проверяет, что свойство есть в объекте, и возвращает его {@link Core/helpers/getType тип}.
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *   <li>{Object} object - проверяемый объект.</li>
    *   <li>{String} property - название свойства.</li>
    * </ul>
    *
    * <h2>Пример использования</h2>
    * <pre>
    *    require(['Core/helpers/Object/getPropertyType'], function(getPropertyType) {
    *
    *       // 'function'
    *       console.log(getPropertyType({}, 'valueOf'));
    *
    *       // 'number'
    *       console.log(getPropertyType([], 'length'));
    *
    *       // 'undefined'
    *       console.log(getPropertyType(1, 'valueOf'));
    *    });
    * </pre>
    *
    * @class Core/helpers/Object/getPropertyType
    * @public
    * @author Мальцев А.А.
    */
   return function getPropertyType(object, property) {
      var value = object && typeof(object) === 'object' && property in object ? object[property] : undefined;
      return getType(value);
   };
});
