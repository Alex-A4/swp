define('Controls/List/TileView/TileViewModel', [
   'Controls/List/ListViewModel',
   'Core/core-merge'
], function(ListViewModel, cMerge) {

   'use strict';

   var
      DEFAULT_ITEM_WIDTH = 250,
      DEFAULT_ITEM_HEIGHT = 200,
      ITEM_COMPRESSION_COEFFICIENT = 0.7;

   var TileViewModel = ListViewModel.extend({
      constructor: function() {
         TileViewModel.superclass.constructor.apply(this, arguments);
         this._tileMode = this._options.tileMode;
         this._itemsHeight = this._options.itemsHeight || DEFAULT_ITEM_HEIGHT;
      },

      getCurrent: function() {
         var current = TileViewModel.superclass.getCurrent.apply(this, arguments);
         current = cMerge(current, this.getTileItemData());
         return current;
      },

      getTileItemData: function() {
         return {
            tileMode: this._tileMode,
            itemsHeight: this._itemsHeight,
            imageProperty: this._options.imageProperty,
            defaultItemWidth: DEFAULT_ITEM_WIDTH,
            itemCompressionCoefficient: ITEM_COMPRESSION_COEFFICIENT
         };
      },

      setTileMode: function(tileMode) {
         this._tileMode = tileMode;
         this._nextVersion();
         this._notify('onListChange');
      },

      getTileMode: function() {
         return this._tileMode;
      },

      setItemsHeight: function(itemsHeight) {
         this._itemsHeight = itemsHeight;
         this._nextVersion();
         this._notify('onListChange');
      },

      getItemsHeight: function() {
         return this._itemsHeight;
      },

      setHoveredItem: function(hoveredItem) {
         if (this._hoveredItem !== hoveredItem) {
            this._hoveredItem = hoveredItem;
            this._nextVersion();
            this._notify('onListChange');
         }
      },

      getHoveredItem: function() {
         return this._hoveredItem;
      },

      setActiveItem: function(activeItem) {
         if (!activeItem) {
            this.setHoveredItem(null);
         }
         TileViewModel.superclass.setActiveItem.apply(this, arguments);
      }
   });

   return TileViewModel;
});
