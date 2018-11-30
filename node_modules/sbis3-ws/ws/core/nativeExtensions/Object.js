define('Core/nativeExtensions/Object', [
   'Core/nativeExtensions/deprecated',
   'Core/helpers/Object/isPlainObject',
   'Core/helpers/Object/isEmpty',
   'Core/helpers/Object/isValid',
   'Core/helpers/Object/sortedPairs'
], function(
   deprecated,
   isPlainObject,
   isEmpty,
   isValid,
   sortedPairs
) {
   var global = (function() { return this || (0, eval)('this') })();

   global.isPlainObject = deprecated('isPlainObject', 'Core/helpers/Object/isPlainObject', isPlainObject);
   Object.isPlainObject = deprecated('Object.isPlainObject', 'Core/helpers/Object/isPlainObject', isPlainObject);
   Object.isEmpty = deprecated('Object.isEmpty', 'Core/helpers/Object/isEmpty', isEmpty);
   Object.isValid = deprecated('Object.isValid', '', isValid, '3.7.5.100');
   Object.sortedPairs = deprecated('Object.sortedPairs', 'Core/helpers/Object/sortedPairs', sortedPairs);

   return {
      isPlainObject: isPlainObject,
      isEmpty: isEmpty,
      isValid: isValid,
      sortedPairs: sortedPairs
   };
});
