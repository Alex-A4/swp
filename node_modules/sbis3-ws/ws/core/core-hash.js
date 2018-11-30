define('Core/core-hash', [], function() {
   /**
    * Генерация хэша переданных параметров/объекта.
    */
   return function hash() {
      var
         src = arguments.length > 1 ? Array.prototype.slice.call(arguments) : arguments[0],
         dst = {};
      if (src instanceof Array || src instanceof Object) {
         for (var i in src) {
            if (src.hasOwnProperty(i)) {
               if (typeof src[i] in {"boolean": null, "number": null, "string": null}) {
                  dst["" + src[i]] = i;
               }
            }
         }
      }
      return dst;
   };
});