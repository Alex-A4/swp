define('Controls-demo/Example/Input/Area',
   [
      'Core/Control',
      'wml!Controls-demo/Example/Input/Area/Area',

      'Controls/Input/Area',
      'css!Controls-demo/Example/resource/Base',
      'Controls-demo/Example/resource/BaseDemoInput'
   ],
   function(Control, template) {

      'use strict';

      return Control.extend({
         _template: template
      });
   }
);
