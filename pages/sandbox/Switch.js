define('ControlsSandbox/Switch', [
   'Core/Control',
   'tmpl!ControlsSandbox/Switch',
   'WS.Data/Source/Memory',
   'Controls/Toggle/DoubleSwitch'
], function (Control,
             template) {
   'use strict';


   var ModuleClass = Control.extend(
      {
         _template: template,
         _value: false,
         checkEvent: function (e, value) {
            this._value = value;
            console.log('Value changed');
         }
      });
   return ModuleClass;
});