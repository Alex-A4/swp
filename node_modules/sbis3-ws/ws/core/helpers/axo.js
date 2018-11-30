define('Core/helpers/axo', [], function () {

   return (function () {
         var
            n = 'A' + ['ctiv'].concat('bject').join('eXO'),
            w = (function () {return this || (0, eval)('this');}());

         if (w.hasOwnProperty(n)) {
            return function mkAxo(name) {
               return new w[n](name);
            }
         }
      })();

});
