define('Core/helpers/Object/findKey', [
], function() {
   var objTag = '[object Object]';

   /**
    * Модуль, в котором описана функция <b>findKey(obj, predicate, context, defaultResult)</b>.
    *
    * Производит поиск ключа элемента объекта, удовлетворяющего заданному условию.
    * Вызывает predicate для каждого элемента (при этом обрабатываются только собственные элементы-свойства объекта, прототипные игнорируются),
    * и возвращает ключ первого элемента, результат predicate для которого положителен.
    * predicate вызывается с аргументами (value, key, obj), где obj - исходный объект.
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *   <li>{Object} obj - исходный объект.</li>
    *   <li>{Function} predicate (необязательный параметр) - функция, вызываемая для каждого элемента. Должна возвращать true или эквивалентное ему значение, которое показывает, что поиск завершен. Может быть не указана, тогда вместо неё используется преобразование текущего элемента в Boolean.</li>
    *   <li>{Object} context (необязательный параметр) - контекст, в котором будет выполняться predicate.</li>
    *   <li>{*} defaultResult (необязательный параметр) - результат, который надо отдавать в том случае, если элемент не найден.</li>
    * </ul>
    *
    * <h2>Возвращает</h2>
    * Функция возвращает ключ элемента {String|undefined}, если он найден.
    *
    * <h2>Пример использования</h2>
    * <pre>
    *    require(['Core/helpers/Object/findKey'], function(findKey) {
    *       console.log(findKey({
    *          primary: {name: 'foo', text: 'bar'},
    *          secondary: {name: 'baz', text: 'bax'}
    *       }, function(value) {
    *          return value.name === 'foo';
    *       }));//'primary'
    *    });
    * </pre>
    *
    * @class Core/helpers/Object/findKey
    * @public
    * @author Мальцев А.А.
    */
   return function findKey(obj, predicate, context, defaultResult) {
      var result = defaultResult;

      if (Object.prototype.toString.call(obj) !== objTag) {
         return result;
      }

      if (!predicate) {
         predicate = function(item) {
            return !!item;
         };
      }

      for (var key in obj) {
         if (obj.hasOwnProperty(key)) {
            if (predicate.call(context, obj[key], key, obj)) {
               result = key;
               break;
            }
         }
      }

      return result;
   };
});
