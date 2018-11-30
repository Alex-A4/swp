define('Controls/Toolbar', [
   'Core/Control',
   'Controls/Controllers/SourceController',
   'wml!Controls/Toolbar/Toolbar',
   'wml!Controls/Toolbar/ToolbarItemTemplate',
   'WS.Data/Collection/Factory/RecordSet',
   'Controls/Utils/Toolbar',
   'Controls/Button',
   'css!theme?Controls/Toolbar/Toolbar'
], function(Control, SourceController, template, toolbarItemTemplate, recordSetFactory, tUtil) {
   'use strict';

   /**
    * Toolbar.
    *
    * @class Controls/Toolbar
    * @extends Core/Control
    * @mixes Controls/interface/ICaption
    * @mixes Controls/Button/interface/IClick
    * @mixes Controls/Button/interface/IIcon
    * @mixes Controls/interface/ITooltip
    * @mixes Controls/interface/ISource
    * @mixes Controls/interface/IItemTemplate
    * @mixes Controls/List/interface/IHierarchy
    * @control
    * @public
    * @category Toolbar
    * @author Михайловский Д.С.
    * @demo Controls-demo/Toolbar/ToolbarVdom
    */

   /**
    * @name Controls/Button#size
    * @cfg {String} Size of the Toolbar.
    * @variant m Button has medium size.
    */

   var _private = {
      loadItems: function(instance, source) {
         var self = this;

         instance._sourceController = new SourceController({
            source: source
         });
         return instance._sourceController.load().addCallback(function(items) {
            instance._items = items;
            instance._menuItems = self.getMenuItems(instance._items);
            instance._needShowMenu = instance._menuItems && instance._menuItems.getCount();
            return items;
         });
      },

      getMenuItems: function(items) {
         return tUtil.getMenuItems(items).value(recordSetFactory, {
            adapter: items.getAdapter(),
            idProperty: items.getIdProperty(),
            format: items.getFormat()
         });
      },

      setPopupOptions: function(self, newOptions) {
         self._popupOptions = {
            corner: {vertical: 'top', horizontal: 'right'},
            horizontalAlign: {side: 'left'},
            eventHandlers: {
               onResult: self._onResult,
               onClose: self._closeHandler
            },
            opener: self,
            templateOptions: {
               keyProperty: newOptions.keyProperty,
               parentProperty: newOptions.parentProperty,
               nodeProperty: newOptions.nodeProperty,
               iconSize: newOptions.size,
               showClose: true
            }
         };
      },

      getItemClassName: function(item, size) {
         return 'controls-Toolbar_' + item.get('buttonViewMode') + '_' + size;
      }
   };

   var Toolbar = Control.extend({
      showType: tUtil.showType,
      _template: template,
      _defaultItemTemplate: toolbarItemTemplate,
      _needShowMenu: null,
      _menuItems: null,
      _parentProperty: null,
      _nodeProperty: null,
      _items: null,
      _popupOptions: null,

      constructor: function() {
         this._onResult = this._onResult.bind(this);
         this._closeHandler = this._closeHandler.bind(this);
         Toolbar.superclass.constructor.apply(this, arguments);
      },
      _beforeMount: function(options, context, receivedState) {
         this._parentProperty = options.parentProperty;
         this._nodeProperty = options.nodeProperty;

         _private.setPopupOptions(this, options);
         if (receivedState) {
            this._items = receivedState;
            this._menuItems = _private.getMenuItems(this._items);
            this._needShowMenu = this._menuItems && this._menuItems.getCount();
         } else {
            if (options.source) {
               return _private.loadItems(this, options.source);
            }
         }
      },
      _beforeUpdate: function(newOptions) {
         if (newOptions.keyProperty !== this._options.keyProperty ||
            this._options.parentProperty !== newOptions.parentProperty ||
            this._options.nodeProperty !== newOptions.nodeProperty ||
            this._options.size !== newOptions.size) {
            _private.setPopupOptions(this, newOptions);
         }
         if (newOptions.source && newOptions.source !== this._options.source) {
            _private.loadItems(this, newOptions.source).addCallback(function() {
               this._forceUpdate();
            }.bind(this));
         }
         this._nodeProperty = newOptions.nodeProperty;
         this._parentProperty = newOptions.parentProperty;
      },
      _onItemClick: function(event, item) {
         var config;

         if (item.get(this._nodeProperty)) {
            config = {
               corner: {vertical: 'top', horizontal: 'left'},
               horizontalAlign: {side: 'right'},
               className: _private.getItemClassName(item, this._options.size),
               templateOptions: {
                  items: this._items,
                  rootKey: item.get(this._options.keyProperty),
                  showHeader: item.get('showHeader'),
                  iconSize: this._options.size,
                  headConfig: {
                     icon: item.get('icon'),
                     caption: item.get('title'),
                     iconStyle: item.get('iconStyle')
                  }
               },
               target: event.target
            };
            this._children.menuOpener.open(config, this);

            //TODO нотифай событий menuOpened и menuClosed нужен для работы механизма корректного закрытия превьювера переделать
            //TODO по задаче https://online.sbis.ru/opendoc.html?guid=76ed6751-9f8c-43d7-b305-bde84c1e8cd7

            this._notify('menuOpened', [], {bubbling: true});
         }
         event.stopPropagation();
         this._notify('itemClick', [item]);
         item.handler && item.handler(item);
      },

      _showMenu: function() {
         var config = {
            className: 'controls-Toolbar__menu-position',
            templateOptions: {
               items: this._menuItems,
               iconSize: this._options.size
            },
            target: this._children.popupTarget
         };
         this._notify('menuOpened', [], {bubbling: true});
         this._children.menuOpener.open(config, this);
      },

      _onResult: function(result) {
         if (result.action === 'itemClick') {
            var item = result.data[0];
            this._notify('itemClick', [item]);

            // menuOpener may not exist because toolbar can be closed by toolbar parent in item click handler
            if (this._children.menuOpener && !item.get(this._nodeProperty)) {
               this._children.menuOpener.close();
            }
         }
      },

      _closeHandler: function() {
         this._notify('menuClosed', [], {bubbling: true});
      }
   });

   Toolbar.getDefaultOptions = function() {
      return {
         size: 'm'
      };
   };

   Toolbar._private = _private;

   return Toolbar;
});
