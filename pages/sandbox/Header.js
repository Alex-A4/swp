define('ControlsSandbox/Header',
   [
      'Core/Control',
      'tmpl!ControlsSandbox/Header/Header',
      'css!ControlsSandbox/Header/Header'
   ],
   function(Control, template) {

      'use strict';

      var Header = Control.extend({
         _template: template
      });

      return Header;
   }
);