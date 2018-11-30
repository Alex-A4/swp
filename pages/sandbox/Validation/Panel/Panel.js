define('ControlsSandbox/Validation/Panel/Panel',
   [
      'Core/Control',
      'tmpl!ControlsSandbox/Validation/Panel/Panel'
   ],
   function(
      Base,
      template
   ){
      'use strict';

      var Panel = Base.extend({
         _template: template
      });
      return Panel;
   }
);