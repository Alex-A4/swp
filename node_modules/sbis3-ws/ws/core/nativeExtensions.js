define('Core/nativeExtensions', [
   'Core/Date',
   'Core/nativeExtensions/Function',
   'Core/nativeExtensions/Object',
   'Core/nativeExtensions/Array',
   'Core/nativeExtensions/String',
   'Core/polyfill'
], function nativeExtensions(
   Date,
   Function,
   Object,
   Array,
   String
) {
   return {
      Date: Date,
      Function: Function,
      Object: Object,
      Array: Array,
      String: String
   }
});