define('Controls/SelectedCollection/Popup',
   [
      'Core/Control',
      'wml!Controls/SelectedCollection/Popup',
      'css!Controls/Popup/Opener/InfoBox/InfoBox',
      'css!Controls/Popup/Opener/Previewer/PreviewerController'
   ],

   function(Control, template) {
      'use strict';

      var itemHiddenTemplate = Control.extend({
         _template: template,

         _itemClick: function(event, item) {
            this._options.clickCallback('itemClick', item);
         },

         _crossClick: function(event, item) {
            this._options.clickCallback('crossClick', item);
         }
      });

      return itemHiddenTemplate;
   });
