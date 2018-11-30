define('Controls-demo/DragNDrop/Basket', [
   'Core/Control',
   'Core/core-instance',
   'wml!Controls-demo/DragNDrop/Basket/Basket',
   'css!Controls-demo/DragNDrop/Basket/Basket'
], function(BaseControl, cInstance, template) {
   'use strict';

   var Basket = BaseControl.extend({
      _template: template,
      _canDrop: false,
      _isDragEnter: false,
      _items: [],

      _documentDragStart: function(event, dragObject) {
         if (dragObject.entity.getItems) {
            this._canDrop = true;
         }
      },

      _dragEnter: function() {
         if (this._canDrop) {
            this._isDragEnter = true;
         }
      },

      _dragLeave: function() {
         this._isDragEnter = false;
      },

      _dragEnd: function(event, dragObject) {
         if (this._canDrop) {
            dragObject.entity.getItems().forEach(function(id) {
               if (this._items.indexOf(id) === -1) {
                  this._items.push(id);
               }
            }, this);
         }
      },

      _documentDragEnd: function() {
         this._canDrop = false;
         this._isDragEnter = false;
      }
   });

   return Basket;
});
