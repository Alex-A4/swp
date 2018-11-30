define('Controls/List/BaseControl/SelectionController', [
   'Core/Control',
   'Controls/Utils/ArraySimpleValuesUtil',
   'WS.Data/Collection/IBind',
   'Core/helpers/Object/isEqual',
   'Core/Deferred'
], function(
   Control,
   ArraySimpleValuesUtil,
   IBind,
   isEqual,
   Deferred
) {
   'use strict';

   /**
    * @class Controls/List/BaseControl/SelectionController
    * @extends Core/Control
    * @control
    * @author Зайцев А.С.
    * @private
    */

   var _private = {
      notifyAndUpdateSelection: function(self, oldSelectedKeys, oldExcludedKeys) {
         var
            newSelection = self._multiselection.getSelection(),
            selectedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldSelectedKeys, newSelection.selected),
            excludedKeysDiff = ArraySimpleValuesUtil.getArrayDifference(oldExcludedKeys, newSelection.excluded);

         if (selectedKeysDiff.added.length || selectedKeysDiff.removed.length) {
            self._notify('selectedKeysChanged', [newSelection.selected, selectedKeysDiff.added, selectedKeysDiff.removed]);
         }

         if (excludedKeysDiff.added.length || excludedKeysDiff.removed.length) {
            self._notify('excludedKeysChanged', [newSelection.excluded, excludedKeysDiff.added, excludedKeysDiff.removed]);
         }

         self._notify('selectedKeysCountChanged', [self._multiselection.getCount()]);

         self._options.listModel.updateSelection(self._multiselection.getSelectedKeysForRender());
      },

      getItemsKeys: function(items) {
         var keys = [];
         items.forEach(function(item) {
            keys.push(item.getId());
         });
         return keys;
      },

      onCollectionChange: function(event, action, newItems, newItemsIndex, removedItems) {
         if (action === IBind.ACTION_REMOVE) {
            this._multiselection.unselect(_private.getItemsKeys(removedItems));
         }
         _private.notifyAndUpdateSelection(this, this._options.selectedKeys, this._options.excludedKeys);
      },

      selectedTypeChangedHandler: function(typeName) {
         this._multiselection[typeName]();
         _private.notifyAndUpdateSelection(this, this._options.selectedKeys, this._options.excludedKeys);
      },

      getMultiselection: function(options) {
         var def = new Deferred();
         if (options.parentProperty) {
            require(['Controls/Controllers/Multiselect/HierarchySelection'], function(HierarchySelection) {
               def.callback(new HierarchySelection({
                  selectedKeys: options.selectedKeys,
                  excludedKeys: options.excludedKeys,
                  items: options.items,
                  keyProperty: options.keyProperty,
                  parentProperty: options.parentProperty,
                  nodeProperty: options.nodeProperty
               }));
            });
         } else {
            require(['Controls/Controllers/Multiselect/Selection'], function(Selection) {
               def.callback(new Selection({
                  selectedKeys: options.selectedKeys,
                  excludedKeys: options.excludedKeys,
                  items: options.items,
                  keyProperty: options.keyProperty
               }));
            });
         }
         return def;
      }
   };

   var SelectionController = Control.extend(/** @lends Controls/List/BaseControl/SelectionController.prototype */{
      _beforeMount: function(options) {
         var self = this;
         return _private.getMultiselection(options).addCallback(function(multiselectionInstance) {
            self._multiselection = multiselectionInstance;
            options.listModel.updateSelection(self._multiselection.getSelectedKeysForRender());
         });
      },

      _afterMount: function() {
         this._notify('selectedKeysCountChanged', [this._multiselection.getCount()]);
         this._notify('register', ['selectedTypeChanged', this, _private.selectedTypeChangedHandler], { bubbling: true });
         this._onCollectionChangeHandler = _private.onCollectionChange.bind(this);
         this._options.items.subscribe('onCollectionChange', this._onCollectionChangeHandler);
      },

      _beforeUpdate: function(newOptions) {
         var
            oldSelection = this._multiselection.getSelection(),
            selectionChanged = !isEqual(newOptions.selectedKeys, oldSelection.selected) || !isEqual(newOptions.excludedKeys, oldSelection.excluded);

         if (newOptions.items !== this._options.items) {
            this._options.items.unsubscribe('onCollectionChange', this._onCollectionChangeHandler);
            newOptions.items.subscribe('onCollectionChange', this._onCollectionChangeHandler);
            this._multiselection.setItems(newOptions.items);
            this._options.listModel.updateSelection(this._multiselection.getSelectedKeysForRender());
         }

         if (selectionChanged) {
            this._multiselection._selectedKeys = newOptions.selectedKeys;
            this._multiselection._excludedKeys = newOptions.excludedKeys;
            _private.notifyAndUpdateSelection(this, this._options.selectedKeys, this._options.excludedKeys);
         }
      },

      onCheckBoxClick: function(key, status) {
         if (status === true || status === null) {
            this._multiselection.unselect([key]);
         } else {
            this._multiselection.select([key]);
         }
         _private.notifyAndUpdateSelection(this, this._options.selectedKeys, this._options.excludedKeys);
      },

      _beforeUnmount: function() {
         this._multiselection = null;
         this._options.items.unsubscribe('onCollectionChange', this._onCollectionChangeHandler);
         this._onCollectionChangeHandler = null;
         this._notify('unregister', ['selectedTypeChanged', this], { bubbling: true });
      }
   });

   SelectionController._private = _private;

   return SelectionController;
});
