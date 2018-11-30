/**
 * Created by kraynovdo on 16.11.2017.
 */
define('Controls/List/ListViewModel',
   ['Controls/List/ItemsViewModel', 'WS.Data/Entity/VersionableMixin', 'Controls/List/resources/utils/ItemsUtil'],
   function(ItemsViewModel, VersionableMixin, ItemsUtil) {
      /**
       *
       * @author Авраменко А.С.
       * @public
       */

      var _private = {
         updateIndexes: function(self) {
            self._startIndex = 0;
            self._stopIndex = self.getCount();
         }
      };

      var ListViewModel = ItemsViewModel.extend([VersionableMixin], {
         _markedItem: null,
         _dragItems: null,
         _dragTargetItem: null,
         _draggingItemData: null,
         _dragTargetPosition: null,
         _actions: null,
         _selectedKeys: null,
         _markedKey: null,

         constructor: function(cfg) {
            var self = this;
            this._actions = [];
            ListViewModel.superclass.constructor.apply(this, arguments);

            if (cfg.markedKey !== undefined) {
               this._markedKey = cfg.markedKey;
               this._markedItem = this.getItemById(cfg.markedKey, cfg.keyProperty);
            }

            this._selectedKeys = cfg.selectedKeys || [];

            // TODO надо ли?
            _private.updateIndexes(self);
         },

         getItemDataByItem: function() {
            var
               itemsModelCurrent = ListViewModel.superclass.getItemDataByItem.apply(this, arguments),
               drawedActions;
            itemsModelCurrent.isSelected = itemsModelCurrent.dispItem === this._markedItem;
            itemsModelCurrent.itemActions = this._actions[this.getCurrentIndex()];
            itemsModelCurrent.isActive = this._activeItem && itemsModelCurrent.dispItem.getContents() === this._activeItem.item;
            itemsModelCurrent.showActions = !this._editingItemData && (!this._activeItem || (!this._activeItem.contextEvent && itemsModelCurrent.isActive));
            itemsModelCurrent.isSwiped = this._swipeItem && itemsModelCurrent.dispItem.getContents() === this._swipeItem.item;
            itemsModelCurrent.multiSelectStatus = this._selectedKeys.indexOf(itemsModelCurrent.key) !== -1;
            itemsModelCurrent.multiSelectVisibility = this._options.multiSelectVisibility === 'visible' || this._options.multiSelectVisibility === 'onhover';
            if (itemsModelCurrent.itemActions) {
               if (itemsModelCurrent.itemActions.showed && itemsModelCurrent.itemActions.showed.length) {
                  drawedActions = itemsModelCurrent.itemActions.showed;
               } else {
                  drawedActions = itemsModelCurrent.itemActions.showedFirst;
               }
            }
            itemsModelCurrent.drawActions = drawedActions && drawedActions.length;
            if (itemsModelCurrent.drawActions) {
               itemsModelCurrent.hasShowedItemActionWithIcon = false;
               for (var i = 0; i < drawedActions.length; i++) {
                  if (drawedActions[i].icon) {
                     itemsModelCurrent.hasShowedItemActionWithIcon = true;
                     break;
                  }
               }
            }
            if (this._editingItemData && itemsModelCurrent.index === this._editingItemData.index) {
               itemsModelCurrent.isEditing = true;
               itemsModelCurrent.item = this._editingItemData.item;
            }
            if (this._draggingItemData) {
               if (this._draggingItemData.key === itemsModelCurrent.key) {
                  itemsModelCurrent.isDragging = true;
               }
               if (this._dragItems.indexOf(itemsModelCurrent.key) !== -1) {
                  itemsModelCurrent.isVisible = this._draggingItemData.key === itemsModelCurrent.key ? !this._dragTargetItem : false;
               }
               if (this._dragTargetPosition && this._dragTargetPosition.index === itemsModelCurrent.index) {
                  itemsModelCurrent.dragTargetPosition = this._dragTargetPosition.position;
                  itemsModelCurrent.draggingItemData = this._draggingItemData;
               }
            }
            return itemsModelCurrent;
         },

         setMarkedKey: function(key) {
            if (key === this._markedKey) {
               return;
            }
            this._markedKey = key;
            this._markedItem = this.getItemById(key, this._options.keyProperty);
            this._nextVersion();
            this._notify('onListChange');
            this._notify('onMarkedKeyChanged', key);
         },

         getSwipeItem: function() {
            return this._swipeItem.item;
         },

         setActiveItem: function(itemData) {
            this._activeItem = itemData;
            this._nextVersion();
         },

         setDragItems: function(items, itemDragData) {
            if (this._dragItems !== items) {
               this._dragItems = items;
               this._draggingItemData = itemDragData || (items ? this.getItemDataByItem(this.getItemById(items[0], this._options.keyProperty)) : null);
               if (this._draggingItemData) {
                  this._draggingItemData.isDragging = true;
               }
               this._nextVersion();
               this._notify('onListChange');
            }
         },

         getDragTargetItem: function() {
            return this._dragTargetItem;
         },

         setDragTargetItem: function(itemData) {
            if (this._draggingItemData && (!itemData || this._draggingItemData.key !== itemData.key)) {
               this._dragTargetItem = itemData;
               this._updateDragTargetPosition(itemData);
               this._nextVersion();
               this._notify('onListChange');
            }
         },

         getDragTargetPosition: function() {
            return this._dragTargetPosition;
         },

         _updateDragTargetPosition: function(targetData) {
            var
               position,
               prevIndex;

            if (targetData) {
               prevIndex = this._dragTargetPosition ? this._dragTargetPosition.index : this._draggingItemData.index;
               if (targetData.index > prevIndex) {
                  position = 'after';
               } else if (targetData.index < prevIndex) {
                  position = 'before';
               } else {
                  position = this._dragTargetPosition.position === 'after' ? 'before' : 'after';
               }
               this._dragTargetPosition = {
                  index: targetData.index,
                  position: position
               };
            } else {
               this._dragTargetPosition = null;
            }
         },

         setSwipeItem: function(itemData) {
            this._swipeItem = itemData;
            this._nextVersion();
         },

         updateIndexes: function(startIndex, stopIndex) {
            if ((this._startIndex !== startIndex) || (this._stopIndex !== stopIndex)) {
               this._startIndex = startIndex;
               this._stopIndex = stopIndex;
               this._nextVersion();
               this._notify('onListChange');
            }
         },

         setItems: function(items) {
            ListViewModel.superclass.setItems.apply(this, arguments);
            if (this._markedKey !== undefined) {
               this._markedItem = this.getItemById(this._markedKey, this._options.keyProperty);
            }
            if (!this._markedItem && this._options.markerVisibility === 'always') {
               this._markedKey = this._items.at(0).getId();
               this._markedItem = this.getItemById(this._markedKey, this._options.keyProperty);
            }
            this._nextVersion();
            _private.updateIndexes(this);
         },

         _setEditingItemData: function(itemData) {
            this._editingItemData = itemData;
            if (itemData && itemData.item) {
               this.setMarkedKey(itemData.item.get(this._options.keyProperty));
            } else {
               this._nextVersion();
            }
         },

         setItemActions: function(item, actions) {
            if (item.get) {
               var itemById = this.getItemById(item.get(this._options.keyProperty));
               var collectionItem = itemById ? itemById.getContents() : item;
               this._actions[this.getIndexBySourceItem(collectionItem)] = actions;
            }
         },
         _prepareDisplayItemForAdd: function(item) {
            return ItemsUtil.getDefaultDisplayItem(this._display, item);
         },

         getItemActions: function(item) {
            var itemById = this.getItemById(item.getId());
            var collectionItem = itemById ? itemById.getContents() : item;
            return this._actions[this.getIndexBySourceItem(collectionItem)];
         },

         updateSelection: function(selectedKeys) {
            this._selectedKeys = selectedKeys || [];
            this._nextVersion();
            this._notify('onListChange');
         },

         getActiveItem: function() {
            return this._activeItem;
         },

         setMultiSelectVisibility: function(multiSelectVisibility) {
            this._options.multiSelectVisibility = multiSelectVisibility;
            this._nextVersion();
            this._notify('onListChange');
         },

         getMultiSelectVisibility: function() {
            return this._options.multiSelectVisibility;
         },

         __calcSelectedItem: function(display, selKey, keyProperty) {

            // TODO надо вычислить индекс
            /* if(!this._markedItem) {
             if (!this._selectedIndex) {
             this._selectedIndex = 0;//переводим на первый элемент
             }
             else {
             this._selectedIndex++;//условно ищем ближайший элемент, рядом с удаленным
             }
             this._markedItem = this._display.at(this._selectedIndex);
             } */
         }
      });

      return ListViewModel;
   });
