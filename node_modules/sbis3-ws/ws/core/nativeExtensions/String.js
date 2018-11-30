define('Core/nativeExtensions/String', [
   'Core/nativeExtensions/deprecated',
   'Core/helpers/String/beginsWith',
   'Core/helpers/String/ucFirst',
   'Core/helpers/String/lcFirst',
   'Core/helpers/String/trim'
], function(
   deprecated,
   beginsWith,
   ucFirst,
   lcFirst,
   trim
) {
   String.prototype.beginsWith = deprecated('String.prototype.beginsWith', 'String.prototype.startsWith', beginsWith);
   String.prototype.ucFirst = deprecated('String.prototype.ucFirst', 'Core/helpers/String/ucFirst', ucFirst);
   String.prototype.lcFirst = deprecated('String.prototype.lcFirst', '', lcFirst, '3.7.5.100');
   String.trim = deprecated('String.trim', 'String.prototype.trim', trim, '3.7.5.100');

   return {
      beginsWith: beginsWith,
      ucFirst: ucFirst,
      lcFirst: lcFirst,
      trim: trim
   };
});
