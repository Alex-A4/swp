define('js!WSTests/unit/tmpl/sync-tests/lifeCycleError', [
   'Core/Control',
   'wml!WSTests/unit/tmpl/sync-tests/lifeCycleError'
], function (Control, tmpl) {
   'use strict';

   var testModule = Control.extend({
      _template: tmpl,
      _moduleName: 'js!WSTests/unit/tmpl/sync-tests/lifeCycleError',
      _beforeMount: function () {
         var i = 123;
         i.boom();
      }
   });

   return testModule;
});