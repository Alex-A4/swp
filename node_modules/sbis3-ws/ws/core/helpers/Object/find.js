define('Core/helpers/Object/find', [
   'Core/helpers/Object/findKey',
   'Core/helpers/Array/findIndex'
], function(findKey, findIndex) {
   /**
    * Модуль, в котором описана функция <b>find(obj, predicate, context, defaultResult)</b>, которая вызывает predicate для каждого элемента (при этом обрабатываются только собственные элементы-свойства объекта, прототипные игнорируются), и возвращает первый элемент, результат predicate для которого положителен.
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *   <li> {Object|Array} obj - исходный объект/массив. Если параметр obj - это массив, то predicate вызывается с аргументами (element, index, array), где array - исходный массив. Если параметр obj - это объект, то predicate вызывается с аргументами (value, key, obj), где obj - исходный объект.</li>
    *   <li> {Function} predicate - функция, вызываемая для каждого элемента/свойства. Должна возвращать true или эквивалентное ему значение, которое показывает, что поиск завершен. Может быть не указана, тогда вместо неё используется преобразование текущего элемента в Boolean.</li>
    *   <li> {Object} context (необязательный параметр) - контекст, в котором будет выполняться вызов predicate.</li>
    *   <li> {*} defaultResult (необязательный параметр) - результат, который надо отдавать в том случае, если элемент не найден.</li>
    * </ul>
    *
    * <h2>Возвращает</h2>
    * Функция возвращает найденный элемент.
    *
    * <h2>Пример использования</h2>
    * <pre>
    *    require(['Core/helpers/Object/find'], function(find) {
    *
    *       // В консоль будет выведено число 3
    *       console.log(find([1, 2, 3, 4], function(element) {
    *          return element > 2;
    *       }));
    *
    *       // {name: 'foo', text: 'bar'}
    *       console.log(find({
    *          primary: {name: 'foo', text: 'bar'},
    *          secondary: {name: 'baz', text: 'bax'}
    *       }, function(value) {
    *          return value.name === 'foo';
    *       }));
    *    });
    * </pre>
    *
    * @class Core/helpers/Object/find
    * @public
    * @author Мальцев А.А.
    */
   return function find(obj, predicate, context, defaultResult) {
      if (Array.isArray(obj)) {
         var index = findIndex(obj, predicate, context);
         return index === -1 ? defaultResult : obj[index];
      } else {
         var key = findKey(obj, predicate, context);
         return key === undefined ? defaultResult : obj[key];
      }
   };
});
