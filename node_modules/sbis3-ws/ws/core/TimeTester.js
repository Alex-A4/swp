/**
 * Created by rn.kondakov on 14.06.2018.
 */
define('Core/TimeTester', [
   'Core/Control',
   'tmpl!Core/TimeTester'
], function(Control,
   template) {
   'use strict';

   return Control.extend({
      _template: template,
      pageName: '',
      RUMEnabled: false,
      _beforeMount: function(options) {
         if (options.pageName) {
            this.pageName = options.pageName;
         }
         this.RUMEnabled = (options.RUMEnabled === 'true' || options.RUMEnabled === true);
      },
      canAcceptFocus: function() {
         return false;
      }
   });
});
