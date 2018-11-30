(function() {

   "use strict";

   var global = (function(){ return this || (0,eval)('this'); }()),
       define = global.define || (global.requirejs && global.requirejs.define) || (requirejsVars && requirejsVars.define);

   define('browser', {
      load: function (name, require, onLoad) {
         if (typeof window !== 'undefined') {
            require([name], onLoad, function(err) {
               onLoad.error(err);
            });
         } else {
            onLoad(null);
         }
      }
   });
})();