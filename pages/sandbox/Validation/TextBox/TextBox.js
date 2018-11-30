define('ControlsSandbox/Validation/TextBox/TextBox',
   [
      'Core/Control',
      'tmpl!ControlsSandbox/Validation/TextBox/TextBox'
   ],
   function(
      Base,
      template
   ){
      'use strict';

      var Textbox = Base.extend({
         _template: template,

         text: '',

         onTextChange: function(e) {
            this.setText(e.target.value);
         },
         setText: function(text) {
            this.text = text;
            this._notify('textchanged', [this.text]);
         },
         onInput: function () {
            this._notify('valueChanged');
         }
      });
      return Textbox;
   }
);