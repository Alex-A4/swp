define('ControlsSandbox/VDomListViewVirtualScroll', [
   'Core/core-extend',
   'Core/Control',
   'tmpl!ControlsSandbox/VDomListViewVirtualScroll',
   'WS.Data/Collection/RecordSet',
   'WS.Data/Source/Memory'
], function(extend,
            BaseControl,
            template,
            RecordSet,
            MemorySource) {
   'use strict';

   var VDomListViewVirtualScroll = BaseControl.extend(
      {
         _initialItems: 309,
         _addedItems: null,
         _canTop: false,
         _canBottom: true,
         _template: template,

         _dynamicHeight: false,

         constructor: function() {
            VDomListViewVirtualScroll.superclass.constructor.apply(this, arguments);

            this._viewSource = this._getDataSource(this._dynamicHeight);
            this._items = this._getItems(this._dynamicHeight);
         },

         _getDataSource: function(dynamicHeight) {
            this._addedItems = this._initialItems;
            var srcData = [];
            for(var i = 0; i < this._initialItems; i++) {
               srcData.push({
                  id: i,
                  height: this._getRowHeight(dynamicHeight),
                  title: 'Item ' + i
               });
            }

            return new MemorySource({
               idProperty: 'id',
               data: srcData
            });
         },

         _getItems: function(dynamicHeight) {
            var srcData = [];
            for(var i = 0; i < this._initialItems; i++) {
               srcData.push({
                  id: i,
                  height: this._getRowHeight(dynamicHeight),
                  title: 'Item ' + i
               });
            }

            return new RecordSet({
               idProperty: 'id',
               rawData: srcData
            });
         },

         _onMoreClick: function() {
            this._children.list.__loadPage('down');
         },

         _getRowHeight: function(dynamicHeight) {
            var min = 30, max = 70;
            if(dynamicHeight && Math.random() > 0.8) {
               return 250;
            } else {
               return dynamicHeight ? (Math.random() * (max - min) + min) : 25;
            }
         },

         _addItems: function(count, position) {
            var
               dynamicHeight = this._children.isDynamicHeight.checked,
               newData = [];

            for (var i = 0; i < count; i++) {
               newData.push({
                  id: i + this._addedItems,
                  height: this._getRowHeight(dynamicHeight),
                  title: 'Item ' + (i + this._addedItems)
               })
            }
            this._addedItems += count;

            var newItems = new RecordSet({
               rawData: newData,
               idProperty: 'id'
            });
            //this._children.list.updateOnAddingItems(newItems, position);
         },

         _onPrependClick: function() {
            var addCount = Number(this._children.addCountInput.value);
            this._addItems(addCount, 'top');
         },

         _onAppendClick: function() {
            var addCount = Number(this._children.addCountInput.value);
            this._addItems(addCount, 'bottom');
         },

         _onChangeDynamicHeight: function() {
            var isDynamic = this._children.isDynamicHeight.checked;

            this._viewSource = this._getDataSource(isDynamic);
         }
      });

   return VDomListViewVirtualScroll;
});