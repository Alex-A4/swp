define('ControlsSandbox/Validation/Validation1/Validation1',
   [
      'Core/Control',
      'tmpl!ControlsSandbox/Validation/Validation1/Validation1',
      "ControlsSandbox/Validators/IsEmail"
   ],
   function(
      Base,
      template
   ){
      'use strict';

      var Validation1 = Base.extend({
         _template: template,

         setText: function (text) {
            this._children.validate.getContainer()[0].controlNodes[0].control.setText(text);
         }
      });
      return Validation1;
   }
);