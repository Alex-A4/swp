define('Controls-demo/DragNDrop/Container', [
   'Core/Control',
   'wml!Controls-demo/DragNDrop/Container/Container',
   'css!Controls-demo/DragNDrop/Container/Container'
], function(BaseControl, template) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,
      _hasList: true,
      _hasGrid: false,
      _hasTree: false,
      _hasNotes: false,
      _selectedKeys: []
   });
   return ModuleClass;
});
