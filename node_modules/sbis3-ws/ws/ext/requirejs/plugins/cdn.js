(function() {

   'use strict';

   var
      global = (function() {return this || (0, eval)('this');}()),
      define = global.define || (global.requirejs && global.requirejs.define) || (requirejsVars && requirejsVars.define);

   function removeLeadingSlash(path) {
      if (path) {
         var head = path.charAt(0);
         if (head == '/' || head == '\\') {
            path = path.substr(1);
         }
      }
      return path;
   }

   define('cdn', ['Core/constants'], function(constants) {
      return {
         load: function(name, require, onLoad) {
            if (typeof window !== 'undefined') {
               var temp = name.split('!'),
                   plugin = temp[1] ? temp[0] + '!' : '',
                   path = temp[1] || temp[0],
                   cdnRoot = constants.cdnRoot || '/cdn/';

               require([plugin + cdnRoot + removeLeadingSlash(path)], onLoad, function(err) {
                  onLoad.error(err);
               });
            } else {
               onLoad('');
            }
         }
      }
   });
})();