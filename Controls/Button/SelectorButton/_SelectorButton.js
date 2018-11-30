define('Controls/Button/SelectorButton/_SelectorButton', [
   'Core/Control',
   'wml!Controls/Button/SelectorButton/_SelectorButton',
   'css!Controls/Button/SelectorButton/SelectorButton'
], function(Control, template) {
   'use strict';

   var SelectorButton = Control.extend({
      _template: template,

      _open: function() {
         this._notify('showSelector');
      },

      _reset: function() {
         this._notify('updateItems', [[]]);
      },

      _crossClick: function(event, item) {
         this._notify('removeItem', [item]);
      },

      _itemClickHandler: function(item) {
         if (!this._options.multiSelect) {
            this._open();
         } else {
            this._notify('itemClick', [item]);
         }
      }
   });

   SelectorButton.getDefaultOptions = function() {
      return {
         style: 'info',
         maxVisibleItems: 7
      };
   };

   return SelectorButton;
});
