(function() {
   'use strict';

   var global = (function(){ return this || (0,eval)('this'); }()),
       define = global.define || (global.requirejs && global.requirejs.define) || (requirejsVars && requirejsVars.define);

   define('optional', ['Core/constants', 'Core/IoC'], function(constants, IoC) {
      return {
         load: function (name, require, onLoad) {
            //Skip if module name isn't available in constants.modules
            if (
               constants &&
               constants.buildMode === 'release' &&
               constants.modules
            ) {
               var moduleName = name.split('/')[0],
                  plugins = moduleName.split(/[!?]/);

               moduleName = plugins.pop();
               if (
                  moduleName !== 'WS' &&
                  moduleName !== 'Core' &&
                  moduleName !== 'Lib' &&
                  moduleName !== 'Ext' &&
                  moduleName !== 'Deprecated' &&
                  moduleName !== 'Helpers' &&
                  moduleName !== 'Transport' &&
                  moduleName !== 'Resources' &&
                  plugins.indexOf('js') === -1 &&
                  plugins.indexOf('css') === -1 &&
                  plugins.indexOf('tmpl') === -1 &&
                  plugins.indexOf('xhtml') === -1 &&
                  plugins.indexOf('remote') === -1
               ) {
                  if (!(moduleName in constants.modules)) {
                     onLoad(null);
                     return;
                  }
               }
            }

            require([name], onLoad, function(error) {
               if (error && error.requireType) {
                  if (error.requireType !== 'scripterror') {
                     IoC.resolve('ILogger').error(
                        'optional.js: optional dependency "' + name + '" has not been loaded',
                        error.message,
                        error
                     );
                  }
               }
               onLoad(null);
            });
         }
      }
   });
})();
