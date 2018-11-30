define('Core/helpers/Object/isValid', [
   'Core/helpers/Object/isEmpty'
], function(isEmptyObject) {
   return function isValid(obj) {
      if (typeof window != 'undefined') {
         console.warn('Deprecated', 'Core/helpers/Object/isValid помечен как deprecated и будет удален в 3.18');// eslint-disable-line no-console
      }
      return obj !== null && !(obj instanceof Date) && typeof(obj) == 'object' && !isEmptyObject(obj);
   };
});
