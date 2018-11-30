define('Core/tmpl/tmplstr', [
      'View/Builder/Tmpl',
      'View/Runner',
      'View/config'
   ],
   function (tmpl, runner, config) {
      'use strict';

      return {
         template: tmpl.template,
         func: tmpl.func,
         getComponents: tmpl.getComponents,
         addArgument: tmpl.addArgument,
         addArgumentsConfig: function addArgumentsConfig() {
            return tmpl.addArgumentsConfig(runner.Run, arguments);
         },
         getFunction: function getFunction(html) {
            return tmpl.getFunction(html, config, runner.Run);
         }
      };
   });