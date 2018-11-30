/**
 * Created by dv.zuev on 26.12.2017.
 */
define('ControlsSandbox/TestApp/Page',
   [
      'Core/Control',
      'tmpl!ControlsSandbox/TestApp/Page',
      'css!ControlsSandbox/TestApp/Page',
      'Controls/Application'
   ],
   function(Control, template) {

      'use strict';

      var Header = Control.extend({
         _template: template,
         count: 0,
         _myClickAction: function(){
            this.count++;
         }
      });

      return Header;
   }
);