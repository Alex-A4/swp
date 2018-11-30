define('Core/nativeExtensions/Array', [
   'Core/nativeExtensions/deprecated',
   'Core/helpers/Array/isPlainArray',
   'Core/helpers/Array/clone',
   'Core/helpers/Array/indexOf',
   'Core/helpers/Array/lastIndexOf',
   'Core/helpers/Array/remove',
   'Core/helpers/Array/insert'
], function(
   deprecated,
   isPlainArray,
   clone,
   indexOf,
   lastIndexOf,
   remove,
   insert
) {
   var global = (function() { return this || (0, eval)('this') })();

   global.isPlainArray = deprecated('isPlainArray', 'Array.isArray', isPlainArray);
   Array.clone = deprecated('Array.clone', 'Core/helpers/Array/clone', clone);
   Array.indexOf = deprecated('Array.indexOf', 'Array.prototype.indexOf', indexOf);
   Array.lastIndexOf = deprecated('Array.lastIndexOf', 'Array.prototype.lastIndexOf', lastIndexOf, '3.7.5.100');
   Array.remove = deprecated('Array.remove', 'Array.prototype.splice', remove);
   Array.insert = deprecated('Array.insert', 'Array.prototype.splice', insert, '3.7.5.100');

   return {
      isPlainArray: isPlainArray,
      clone: clone,
      indexOf: indexOf,
      lastIndexOf: lastIndexOf,
      remove: remove,
      insert: insert
   };
});
