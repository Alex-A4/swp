define('ControlsSandbox/Validation/Form2/Form2',
   [
      'Core/Control',
      'tmpl!ControlsSandbox/Validation/Form2/Form2',
      "ControlsSandbox/Validators/IsEmail",
      "ControlsSandbox/Validators/IsRequiredDef"
   ],
   function(
      Base,
      template
   ){
      'use strict';

      var Form1 = Base.extend({
         _template: template,

         setText: function (text) {
            this._children.textBox.setText(text);
         },
         validate: function() {
            return this._children.Form.submit();
         },
         onclick: function(e) {
            this.validate().addCallback(function(res) {
               console.log(res);
            }).addErrback(function(res) {
               console.error('err:', res);
            });
         }
      });
      return Form1;
   }
);