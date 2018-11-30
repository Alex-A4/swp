define('Controls-demo/Buttons/Toggle/ToggleDemo', [
   'Core/Control',
   'WS.Data/Source/Memory',
   'wml!Controls-demo/Buttons/Toggle/ToggleDemo',
   'WS.Data/Collection/RecordSet',
   'css!Controls-demo/Headers/headerDemo',
   'css!Controls-demo/Headers/resetButton'
], function(Control,
   MemorySource,
   template) {
   'use strict';


   var ModuleClass = Control.extend(
      {
         _template: template,
         _selectedStyle: 'buttonLinkMain',
         _styleSource: null,
         _selectedSize: 'm',
         _sizeSource: null,
         _captions: null,
         _selectedCaptions: 'without caption',
         _captionsSource: null,
         _selectedIcons: 'single icon',
         _iconsSource: null,
         _icons: null,
         _iconStyleSource: null,
         _selectedIconStyle: 'default',
         _tooltip: '',
         _eventName: 'no event',
         _beforeMount: function() {
            this._iconStyleSource = new MemorySource({
               idProperty: 'title',
               data: [
                  {
                     title: 'default'
                  },
                  {
                     title: 'done'
                  },
                  {
                     title: 'attention'
                  },
                  {
                     title: 'error'
                  }
               ]
            });
            this._styleSource = new MemorySource({
               idProperty: 'title',
               data: [
                  {
                     title: 'iconButtonBordered'
                  },
                  {
                     title: 'linkMain'
                  },
                  {
                     title: 'buttonLinkMain'
                  },
                  {
                     title: 'buttonLinkAdditional'
                  }
               ]
            });
            this._sizeSource = new MemorySource({
               idProperty: 'title',
               data: [
                  {
                     title: 's'
                  },
                  {
                     title: 'm'
                  },
                  {
                     title: 'l'
                  }
               ]
            });
            this._captionsSource = new MemorySource({
               idProperty: 'title',
               data: [
                  {
                     title: 'save/change',
                     captions: ['save', 'change']
                  },
                  {
                     title: 'on/off',
                     captions: ['on', 'off']
                  },
                  {
                     title: 'without caption',
                     captions: null
                  },
                  {
                     title: 'single caption',
                     captions: ['single caption']
                  }
               ]
            });
            this._iconsSource = new MemorySource({
               idProperty: 'title',
               data: [
                  {
                     title: 'list/tile',
                     icons: ['icon-16 icon-ArrangeList', 'icon-16 icon-ArrangePreview']
                  },
                  {
                     title: 'bottomContent/rightContent',
                     icons: ['icon-16 icon-ArrangeList04', 'icon-16 icon-ArrangeList03']
                  },
                  {
                     title: 'without icons',
                     icons: null
                  },
                  {
                     title: 'single icon',
                     icons: ['icon-16 icon-Send']
                  }
               ]
            });
            this._icons = ['icon-16 icon-Send'];
         },
         clickHandler: function(e) {
            this._eventName = 'click';
         },

         changeIconStyles: function(e, key) {
            this._selectedIconStyle = key;
         },

         changeCaptions: function(e, key) {
            this._selectedCaptions = key;
            var self = this;
            this._captionsSource.read(key).addCallback(function(item) {
               self._captions = item.get('captions');
            });
         },

         changeIcons: function(e, key) {
            this._selectedIcons = key;
            var self = this;
            this._iconsSource.read(key).addCallback(function(item) {
               self._icons = item.get('icons');
            });
         },

         changeStyle: function(e, key) {
            this._selectedStyle = key;
         },

         changeSize: function(e, key) {
            this._selectedSize = key;
         },

         reset: function() {
            this._eventName = 'no event';
         }
      }
   );
   return ModuleClass;
});
