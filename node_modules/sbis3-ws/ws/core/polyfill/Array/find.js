if (!Array.prototype.find) {
   (function() {
      function polyfill(predicate) {
         if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
         }
         if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
         }
         var list = Object(this),
            length = list.length >>> 0,
            thisArg = arguments[1],
            value;

         for (var i = 0; i < length; i++) {
            value = list[i];
            if (predicate.call(thisArg, value, i, list)) {
               return value;
            }
         }
         return undefined;
      }

      if (Object.defineProperty) {
         Object.defineProperty(Array.prototype, 'find', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: polyfill
         });
      } else {
         Array.prototype.find = polyfill;
      }
   })();
}
