(function() {

   'use strict';
   var global = (function(){ return this || (0,eval)('this'); }()),
       define = global.define || (global.requirejs && global.requirejs.define) || (requirejsVars && requirejsVars.define);

   define('datasource', ['Core/pathResolver', 'Core/IoC', 'text'], function(pathResolver) {
      return {
         load: function(name, require, onLoad) {
            try {
               var path = pathResolver(name, 'dpack');
               require(['text!' + path], function(json) {
                  var parsedData = {};
                  try {
                     parsedData = JSON.parse(json);
                     onLoad(parsedData);
                  } catch (err) {
                     onLoad.error(err);
                  }
               }, function(err) {
                  onLoad.error(err);
               });
            }
            catch (err) {
               onLoad.error(err);
            }
         }
      }
   });
})();