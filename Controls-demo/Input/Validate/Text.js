define('Controls-demo/Input/Validate/Text', [
   'Core/Control',
   'wml!Controls-demo/Input//Validate/Text',
   'css!Controls-demo/Input/resources/VdomInputs',
   'Controls/Validate/Validators/IsINN',
   'Controls/Validate/Validators/IsEmail'
], function(Control, template) {
   'use strict';
   var VdomDemoText = Control.extend({
      _template: template,
      _value4: '',
      _placeholder: 'Input text',
   });
   return VdomDemoText;
});
