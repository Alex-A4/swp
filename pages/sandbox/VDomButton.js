define('ControlsSandbox/VDomButton', [
   'Core/Control',
   'tmpl!ControlsSandbox/VDomButton'
], function(Control, template) {

   'use strict';

   var VDomListView = Control.extend({
      _template: template,

       _onMouseClick: function (event) {
         console.log(event);
       }
   });

   return VDomListView;
});