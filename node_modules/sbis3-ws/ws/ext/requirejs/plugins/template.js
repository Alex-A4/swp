(function(){

   "use strict";

   var global = (function(){ return this || (0,eval)('this'); }()),
      define = global.define || (global.requirejs && global.requirejs.define) || (requirejsVars && requirejsVars.define);

   define("template", {
      load: function (name, require, load, conf) {
         load.error(new Error('Plugin "template" not support'));
      }
   });
})();