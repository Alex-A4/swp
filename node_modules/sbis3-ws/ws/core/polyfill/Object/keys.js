/**
 * Возвращает ключи объекта.
 * @author Мальцев А.А.
 */
if (!Object.keys) {
   Object.keys = function(obj) {
      var rv = [],
         hasOwnProperty = !!obj.hasOwnProperty;
      for (var k in obj) {
         if (hasOwnProperty && obj.hasOwnProperty(k)) {
            rv.push(k);
         } else if (!hasOwnProperty) {
            rv.push(k);
         }
      }
      return rv;
   }
}
