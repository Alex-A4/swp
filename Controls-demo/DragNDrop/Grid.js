define('Controls-demo/DragNDrop/Grid', [
   'Core/Control',
   'Controls-demo/DragNDrop/DemoData',
   'Controls-demo/DragNDrop/ListEntity',
   'wml!Controls-demo/DragNDrop/Grid/Grid',
   'WS.Data/Source/Memory'
], function(BaseControl, DemoData, ListEntity, template, MemorySource) {
   'use strict';

   var ModuleClass = BaseControl.extend({
      _template: template,
      _viewSource: null,
      _gridColumns: null,
      _gridHeader: null,

      _beforeMount: function() {
         this._viewSource = new MemorySource({
            idProperty: 'id',
            data: DemoData
         });
         this._gridColumns = [{
            displayProperty: 'id'
         }, {
            displayProperty: 'title'
         }, {
            displayProperty: 'additional'
         }];
         this._gridHeader = [{
            title: 'ID'
         }, {
            title: 'Title'
         }, {
            title: 'Additional'
         }];
      },
      _dragStart: function(event, items) {
         return new ListEntity({
            items: items
         });
      },
      _dragEnd: function(event, items, target, position) {
         this._children.listMover.moveItems(items, target, position);
      }
   });

   return ModuleClass;
});
