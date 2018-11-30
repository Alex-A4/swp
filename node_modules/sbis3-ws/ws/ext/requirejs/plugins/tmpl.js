(function(){
   'use strict';

   var global = (function(){ return this || (0,eval)('this'); }()),
      define = global.define || (global.requirejs && global.requirejs.define) || requirejsVars.define,
      isServerSide = typeof window === 'undefined' && !(process && process.versions);

   /**
    * Плагин для подключения шаблонов в виде функций.
    */
   define('tmpl', [
      'View/config',
      'Core/pathResolver',
      'Core/IoC',
      'Core/constants',
      'View/Runner',
      'wml'
   ], function(
      config,
      pathResolver,
      IoC,
      constants,
      runner,
      wml
   ) {
      var tclosure = runner.Run;

      function resolverControls(path) {
         return 'tmpl!' + path;
      }

      function setToJsonForFunction(func, moduleName, path) {
         func.toJSON = function() {
            var serialized = {
               $serialized$: 'func',
               module: moduleName
            };
            if (path) {
               serialized.path = path;
            }
            return serialized;
         };
      }

      function createTemplate(name, html, tmpl, conf, load) {
         try {
            tmpl.template(html, resolverControls, conf).handle(function (traversed) {
               try {
                  var templateFunction = tmpl.func(traversed, conf);
                  Object.keys(templateFunction.includedFunctions).forEach(function(elem) {
                     setToJsonForFunction(templateFunction.includedFunctions[elem], 'tmpl!' + name, 'includedFunctions.' + elem);
                  });
                  // Чтобы отличать функции старого шаблонизатора от нового
                  templateFunction.stable = true;
                  var closured = function () {
                     return templateFunction.apply(this, tmpl.addArgument(tclosure, arguments));
                  };
                  closured.stable = true;
                  closured.includedFunctions = templateFunction.includedFunctions;
                  setToJsonForFunction(closured, 'tmpl!' + name);
                  load(closured);
                  load = undefined;
               } catch (err) {
                  err.message = 'Error while traversing template "' + name + '": ' + err.message;
                  load(wml.createLostFunction(err, 'tmpl'));
                  load = undefined;
               }
            }, function (err) {
               err.message = 'Error while creating template "' + name + '": ' + err.message;
               load(wml.createLostFunction(err,' tmpl'));
               load = undefined;
            });
         } catch (err) {
            err.message = 'Error while parsing template "' + name + '": ' + err.message;
            load(wml.createLostFunction(err, 'tmpl'));
            load = undefined;
         }
      }

      return {
         load: function (name, require, load) {
            wml.loadBase(name, require, load, 'tmpl', [
               'View/Builder',
               'is!compatibleLayer?Lib/Control/Control.compatible',
               'is!compatibleLayer?Lib/Control/AreaAbstract/AreaAbstract.compatible'
            ], createTemplate);
         }
      };
   });
})();
