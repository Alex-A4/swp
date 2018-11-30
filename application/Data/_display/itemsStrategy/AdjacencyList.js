/// <amd-module name="Data/_display/itemsStrategy/AdjacencyList" />
/**
 * Стратегия-декоратор получения элементов проекции по списку смежных вершин
 * @class WS.Data/Display/ItemsStrategy/AdjacencyList
 * @extends WS.Data/Entity/Abstract
 * @implements WS.Data/Display/IItemsStrategy
 * @mixes WS.Data/Entity/SerializableMixin
 * @author Мальцев А.А.
 */
define('Data/_display/itemsStrategy/AdjacencyList', [
    'require',
    'exports',
    'tslib',
    'Data/_display/GroupItem',
    'Data/type',
    'Data/util',
    'Data/shim',
    'Core/helpers/Function/throttle'
], function (require, exports, tslib_1, GroupItem_1, type_1, util_1, shim_1, throttle) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Свойство, хранящее признак, что список элементов проинициализирован
     * @const {Symbol}
     */
    /**
     * Свойство, хранящее признак, что список элементов проинициализирован
     * @const {Symbol}
     */
    var $initialized = util_1.protect('initialized');    /**
     * Выводит предупреждения не чаще, чем раз в 300мс
     */
    /**
     * Выводит предупреждения не чаще, чем раз в 300мс
     */
    var warning = throttle(util_1.logger.info, 300);    /**
     * Нормализует значение идентификатора
     */
    /**
     * Нормализует значение идентификатора
     */
    function normalizeId(id) {
        if (typeof id === 'number') {
            id = String(id);
        }
        return id;
    }    /**
     * Создает список "родитель - дети".
     * @param sourceItems Массив элементов декорируемой стратегии
     * @param parentProperty Имя свойства, в котором хранится идентификатор родительского узла
     * @return Идентификатор узла -> Индексы детей в исходной коллекции
     */
    /**
     * Создает список "родитель - дети".
     * @param sourceItems Массив элементов декорируемой стратегии
     * @param parentProperty Имя свойства, в котором хранится идентификатор родительского узла
     * @return Идентификатор узла -> Индексы детей в исходной коллекции
     */
    function buildChildrenMap(sourceItems, parentProperty) {
        var parentToChildren = new shim_1.Map();    //Map<Array<Number>>: parentId => [childIndex, childIndex, ...]
        //Map<Array<Number>>: parentId => [childIndex, childIndex, ...]
        var count = sourceItems.length;
        var item;
        var itemContents;
        var children;
        var parentId;
        for (var position = 0; position < count; position++) {
            item = sourceItems[position];
            itemContents = item.getContents();    //Skip groups
            //Skip groups
            if (item instanceof GroupItem_1.default) {
                continue;
            }    //TODO: work with parentId === Object|Array
            //TODO: work with parentId === Object|Array
            parentId = normalizeId(util_1.object.getPropertyValue(itemContents, parentProperty));
            if (parentToChildren.has(parentId)) {
                children = parentToChildren.get(parentId);
            } else {
                children = [];
            }
            children.push(position);
            parentToChildren.set(parentId, children);
        }
        return parentToChildren;
    }    /**
     * Создает список "элемент - индекс группы".
     * @param {Array.<WS.Data/Display/CollectionItem>} sourceItems Массив элементов декорируемой стратегии
     * @return {Map.<WS.Data/Display/CollectionItem, Number>} Элемент -> индекс группы в sourceItems
     * @static
     */
    /**
     * Создает список "элемент - индекс группы".
     * @param {Array.<WS.Data/Display/CollectionItem>} sourceItems Массив элементов декорируемой стратегии
     * @return {Map.<WS.Data/Display/CollectionItem, Number>} Элемент -> индекс группы в sourceItems
     * @static
     */
    function buildGroupsMap(sourceItems) {
        var itemToGroup = new shim_1.Map();
        var currentGroup;
        sourceItems.forEach(function (item, index) {
            if (item instanceof GroupItem_1.default) {
                currentGroup = index;
            } else {
                itemToGroup.set(item, currentGroup);
            }
        });
        return itemToGroup;
    }    /**
     * Создает индекс следования элементов исходной коллекции в древовидной структуре.
     * @param {Object} options Опции
     * @param {Array.<WS.Data/Display/CollectionItem>} options.sourceItems Массив элементов декорируемой стратегии
     * @param {Map.<Number>} options.childrenMap Cписок "родитель - дети".
     * @param {Array.<WS.Data/Display/CollectionItem, Number>} options.groupsMap Cписок "элемент - индекс группы"
     * @param {Array.<Number>} options.parentsMap Cписок "ребенок - родитель" (заполняется динамически).
     * @param {Array.<String>} options.path Путь до текущиего узла в дереве (заполняется динамически).
     * @param {String} options.idProperty Имя свойства, в котором хранится идентификатор элемента.
     * @param {Number} [parentIndex] Индекс текущего родителя
     * @return {Array.<Number>} Индекс в дереве -> индекс в исходной коллекции
     * @static
     */
    /**
     * Создает индекс следования элементов исходной коллекции в древовидной структуре.
     * @param {Object} options Опции
     * @param {Array.<WS.Data/Display/CollectionItem>} options.sourceItems Массив элементов декорируемой стратегии
     * @param {Map.<Number>} options.childrenMap Cписок "родитель - дети".
     * @param {Array.<WS.Data/Display/CollectionItem, Number>} options.groupsMap Cписок "элемент - индекс группы"
     * @param {Array.<Number>} options.parentsMap Cписок "ребенок - родитель" (заполняется динамически).
     * @param {Array.<String>} options.path Путь до текущиего узла в дереве (заполняется динамически).
     * @param {String} options.idProperty Имя свойства, в котором хранится идентификатор элемента.
     * @param {Number} [parentIndex] Индекс текущего родителя
     * @return {Array.<Number>} Индекс в дереве -> индекс в исходной коллекции
     * @static
     */
    function buildTreeIndex(options, parentIndex) {
        var result = [];
        var sourceItems = options.sourceItems;
        var childrenMap = options.childrenMap;
        var parentsMap = options.parentsMap;
        var groupsMap = options.groupsMap;
        var lastGroup = options.lastGroup;
        var path = options.path;
        var idProperty = options.idProperty;
        var parentId = path[path.length - 1];    //Check if that parentId is already behind
        //Check if that parentId is already behind
        if (path.indexOf(parentId) > -1 && path.indexOf(parentId) < path.length - 1) {
            util_1.logger.error('Data/display:itemsStrategy.AdjacencyList', 'Wrong data hierarchy relation: recursive traversal detected: parent with id "' + parentId + '" is already in progress. Path: ' + path.join(' -> ') + '.');
            return result;
        }
        var children = childrenMap.has(parentId) ? childrenMap.get(parentId) : [];
        var childrenCount = children.length;
        var child;
        var childIndex;
        var childContents;
        var childGroup;
        var groupReverted;
        for (var i = 0; i < childrenCount; i++) {
            childIndex = children[i];
            child = sourceItems[childIndex];
            childContents = child.getContents();
            childGroup = groupsMap.get(child);    //Add group if it has been changed
            //Add group if it has been changed
            if (childGroup !== lastGroup) {
                //Reject reverted group. Otherwise we'll have empty reverted group.
                if (groupReverted) {
                    result.pop();
                    parentsMap.pop();
                }
                result.push(childGroup);
                parentsMap.push(parentIndex);
                lastGroup = options.lastGroup = childGroup;
            }
            result.push(childIndex);
            parentsMap.push(parentIndex);
            if (groupReverted) {
                groupReverted = false;    //Reset revert flag if group has any members
            }
            //Reset revert flag if group has any members
            if (childContents && idProperty) {
                var childId = normalizeId(util_1.object.getPropertyValue(childContents, idProperty));
                path.push(childId);    //Lookup for children
                //Lookup for children
                var itemsToPush = buildTreeIndex(options, parentsMap.length - 1);
                result.push.apply(result, itemsToPush);    //Revert parent's group if any child joins another group if there is not the last member in the root
                //Revert parent's group if any child joins another group if there is not the last member in the root
                if (childGroup !== options.lastGroup && (parentIndex !== undefined || i < childrenCount - 1)) {
                    result.push(childGroup);
                    parentsMap.push(parentIndex);
                    lastGroup = options.lastGroup = childGroup;
                    groupReverted = true;
                }
                path.pop();
            }
        }
        return result;
    }
    var AdjacencyList = /** @class */
    function (_super) {
        tslib_1.__extends(AdjacencyList, _super);    /**
         * Конструктор
         * @param {Options} options Опции
         */
        /**
         * Конструктор
         * @param {Options} options Опции
         */
        function AdjacencyList(options) {
            var _this = _super.call(this) || this;    //region IItemsStrategy
            //region IItemsStrategy
            _this['[Data/_display/IItemsStrategy]'] = true;
            _this._options = options;
            if (!options.idProperty) {
                warning(_this._moduleName + '::constructor(): option "idProperty" is not defined. Only root elements will be presented');
            }
            return _this;
        }
        Object.defineProperty(AdjacencyList.prototype, 'options', {
            get: function () {
                return this.source.options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AdjacencyList.prototype, 'source', {
            get: function () {
                return this._options.source;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AdjacencyList.prototype, 'count', {
            get: function () {
                var itemsOrder = this._getItemsOrder();
                return itemsOrder.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AdjacencyList.prototype, 'items', {
            get: function () {
                //Force create every item
                var items = this._getItems();
                if (!items[$initialized]) {
                    var count = items.length;
                    for (var i = 0; i < count; i++) {
                        if (items[i] === undefined) {
                            this.at(i);
                        }
                    }
                    items[$initialized] = true;
                }
                return items;
            },
            enumerable: true,
            configurable: true
        });
        AdjacencyList.prototype.at = function (index) {
            var items = this._getItems();
            if (items[index]) {
                return items[index];
            }
            var itemsOrder = this._getItemsOrder();
            var collectionIndex = itemsOrder[index];
            var sourceItem = this._getSourceItems()[collectionIndex];
            var item;
            if (sourceItem === undefined) {
                throw new ReferenceError('Collection index ' + index + ' is out of bounds.');
            }
            if (sourceItem instanceof GroupItem_1.default) {
                item = sourceItem;
            } else {
                item = this.options.display.createItem({
                    contents: sourceItem.getContents(),
                    parent: this._getParent(index)
                });
            }
            return items[index] = item;
        };
        AdjacencyList.prototype.splice = function (start, deleteCount, added) {
            added = added || [];
            var shiftTail = function (start, offset) {
                return function (value) {
                    return value >= start ? value + offset : value;
                };
            };
            var source = this.source;
            var deletedInSource = [];    //deleted indices in this.source.items
            //deleted indices in this.source.items
            for (var i = start; i < start + deleteCount; i++) {
                deletedInSource.push(source.getDisplayIndex(i));
            }
            source.splice(start, deleteCount, added);
            var items = this._getItems();
            var itemsOrder = this._getItemsOrder();
            var sourceItems = this._getSourceItems();    //There is the one and only case to move items with two in turn splices
            //There is the one and only case to move items with two in turn splices
            if (added.hasBeenRemoved) {
                added.forEach(function (item, index) {
                    var startInSource = source.getDisplayIndex(start + index - deleteCount);    //Actual index of added items in source
                    //Actual index of added items in source
                    var startInInner = itemsOrder.indexOf(startInSource);    //Actual index of added items in itemsOrder
                                                                             //If no actual index in itemsOrder bring it to the end
                    //Actual index of added items in itemsOrder
                    //If no actual index in itemsOrder bring it to the end
                    if (startInInner === -1) {
                        startInInner = itemsOrder.length;
                    }
                    sourceItems.splice(startInSource, 0, item);    //insert in sourceItems
                    //insert in sourceItems
                    itemsOrder = itemsOrder.map(shiftTail(startInSource, 1));    //shift itemsOrder values by +1 from startInSource
                    //shift itemsOrder values by +1 from startInSource
                    itemsOrder.splice(startInInner, 0, startInSource);    //insert in itemsOrder
                    //insert in itemsOrder
                    items.splice(startInInner, 0, item);    //insert in items
                });
            }
            //insert in items
            var removed = [];
            if (deleteCount > 0) {
                //Remove deleted in _itemsOrder, _items and _sourceItems
                var removeDeleted = function (deleted) {
                    return function (outer, inner) {
                        var isRemoved = deleted.indexOf(outer) > -1;
                        if (isRemoved) {
                            removed.push(items.splice(inner, 1)[0]);
                            sourceItems.splice(outer, 1);
                        }
                        return !isRemoved;
                    };
                };    //Remove deleted from itemsOrder
                //Remove deleted from itemsOrder
                itemsOrder = itemsOrder.filter(removeDeleted(deletedInSource));    //Shift indices from deleted in itemsOrder from higher to lower
                //Shift indices from deleted in itemsOrder from higher to lower
                deletedInSource.sort().reverse().forEach(function (outer) {
                    itemsOrder = itemsOrder.map(shiftTail(outer, -1));
                });    //Set removed flag to use in possible move operation
                //Set removed flag to use in possible move operation
                removed.hasBeenRemoved = true;
            }
            this._itemsOrder = itemsOrder;
            this._syncItemsOrder();
            return removed;
        };
        AdjacencyList.prototype.reset = function () {
            this._items = null;
            this._sourceItems = null;
            this._itemsOrder = null;
            this.source.reset();
        };
        AdjacencyList.prototype.invalidate = function () {
            this.source.invalidate();
            this._syncItemsOrder();
        };
        AdjacencyList.prototype.getDisplayIndex = function (index) {
            var sourceIndex = this.source.getDisplayIndex(index);
            var itemsOrder = this._getItemsOrder();
            var itemIndex = itemsOrder.indexOf(sourceIndex);
            return itemIndex === -1 ? itemsOrder.length : itemIndex;
        };
        AdjacencyList.prototype.getCollectionIndex = function (index) {
            var sourceIndex = this.source.getCollectionIndex(index);
            var itemsOrder = this._getItemsOrder();
            var collectionIndex = itemsOrder[sourceIndex];
            return collectionIndex === undefined ? -1 : collectionIndex;
        };    //endregion
              //region SerializableMixin
        //endregion
        //region SerializableMixin
        AdjacencyList.prototype._getSerializableState = function (state) {
            state = type_1.SerializableMixin._getSerializableState.call(this, state);
            state.$options = this._options;
            state._items = this._items;
            state._itemsOrder = this._itemsOrder;
            state._parentsMap = this._parentsMap;
            return state;
        };
        AdjacencyList.prototype._setSerializableState = function (state) {
            var fromSerializableMixin = type_1.SerializableMixin._setSerializableState(state);
            return function () {
                fromSerializableMixin.call(this);
                this._items = state._items;
                this._itemsOrder = state._itemsOrder;
                this._parentsMap = state._parentsMap;
            };
        };    //endregion
              //region Protected
              /**
         * Возвращает элементы проекции
         * @return Array.<WS.Data/Display/CollectionItem>
         * @protected
         */
        //endregion
        //region Protected
        /**
         * Возвращает элементы проекции
         * @return Array.<WS.Data/Display/CollectionItem>
         * @protected
         */
        AdjacencyList.prototype._getItems = function () {
            if (!this._items) {
                this._initItems();
            }
            return this._items;
        };    /**
         * Инициализирует элементы проекции
         * @protected
         */
        /**
         * Инициализирует элементы проекции
         * @protected
         */
        AdjacencyList.prototype._initItems = function () {
            this._items = [];
            this._items.length = this._getItemsOrder().length;
        };    /**
         * Возвращает соответствие индексов в стратегии оригинальным индексам
         * @protected
         * @return {Array.<Number>}
         */
        /**
         * Возвращает соответствие индексов в стратегии оригинальным индексам
         * @protected
         * @return {Array.<Number>}
         */
        AdjacencyList.prototype._getItemsOrder = function () {
            if (!this._itemsOrder) {
                this._itemsOrder = this._createItemsOrder();
            }
            return this._itemsOrder;
        };
        AdjacencyList.prototype._syncItemsOrder = function () {
            var _this = this;
            if (!this._itemsOrder) {
                return;
            }
            var oldOrder = this._itemsOrder;
            var oldItems = this._getItems();
            var oldSourceItems = this._getSourceItems();
            var newOrder = this._createItemsOrder();
            var newSourceItems = this._sourceItems;
            var sourceToInner = new shim_1.Map();
            oldOrder.forEach(function (sourceIndex, innerIndex) {
                sourceToInner.set(oldSourceItems[sourceIndex], oldItems[innerIndex]);
            });
            var newItems = new Array(newOrder.length);
            var innerItem;
            var sourceItem;
            var sourceIndex;
            for (var newIndex = 0; newIndex < newOrder.length; newIndex++) {
                sourceIndex = newOrder[newIndex];
                sourceItem = newSourceItems[sourceIndex];
                innerItem = sourceToInner.get(sourceItem);
                if (innerItem && innerItem.getContents() === sourceItem.getContents()) {
                    newItems[newIndex] = innerItem;
                    sourceToInner.delete(sourceItem);    //To skip duplicates
                }
            }
            //To skip duplicates
            this._itemsOrder = newOrder;
            this._items = newItems;    //Every item leaved the tree should lost their parent
            //Every item leaved the tree should lost their parent
            oldItems.forEach(function (item) {
                if (item.setParent) {
                    item.setParent(undefined);
                }
            });    //Every item stayed in the tree should renew their parent
            //Every item stayed in the tree should renew their parent
            newItems.forEach(function (item, index) {
                if (item.setParent) {
                    item.setParent(_this._getParent(index));
                }
            });
        };
        AdjacencyList.prototype._getSourceItems = function () {
            if (!this._sourceItems) {
                this._sourceItems = this.source.items;
            }
            return this._sourceItems;
        };
        AdjacencyList.prototype._createItemsOrder = function () {
            this._sourceItems = null;
            this._parentsMap = [];
            var options = this._options;
            var sourceItems = this._getSourceItems();
            var root = this.options.display.getRoot();
            root = root && root.getContents ? root.getContents() : root;
            if (root && root instanceof Object) {
                root = root.valueOf();
            }
            root = normalizeId(root && typeof root === 'object' ? util_1.object.getPropertyValue(root, options.idProperty) : root);
            var childrenMap = buildChildrenMap(sourceItems, options.parentProperty);
            var groupsMap = buildGroupsMap(sourceItems);    //FIXME: backward compatibility with controls logic: 1st level items may don\'t have parentProperty
            //FIXME: backward compatibility with controls logic: 1st level items may don\'t have parentProperty
            if (root === null && !childrenMap.has(root) && childrenMap.has(undefined)) {
                root = undefined;
            }
            return buildTreeIndex({
                idProperty: options.idProperty,
                sourceItems: sourceItems,
                childrenMap: childrenMap,
                groupsMap: groupsMap,
                parentsMap: this._parentsMap,
                path: [root]
            });
        };    /**
         * Возращает родителя элемента проекции.
         * @param {Number} index Индекс элемента
         * @return {WS.Data/Display/CollectionItem} Родитель
         */
        /**
         * Возращает родителя элемента проекции.
         * @param {Number} index Индекс элемента
         * @return {WS.Data/Display/CollectionItem} Родитель
         */
        AdjacencyList.prototype._getParent = function (index) {
            var parentsMap = this._parentsMap;
            var parentIndex = parentsMap[index];
            if (parentIndex === -1) {
                return undefined;
            }
            return parentIndex === undefined ? this.options.display.getRoot() : this.at(parentIndex);
        };
        return AdjacencyList;
    }(util_1.mixin(type_1.Abstract, type_1.SerializableMixin));
    exports.default = AdjacencyList;
    AdjacencyList.prototype._moduleName = 'Data/display:itemsStrategy.AdjacencyList';
    AdjacencyList.prototype['[Data/_display/itemsStrategy/AdjacencyList]'] = true;    // @ts-ignore
    // @ts-ignore
    AdjacencyList.prototype._options = null;    // @ts-ignore
    // @ts-ignore
    AdjacencyList.prototype._items = null;    // @ts-ignore
    // @ts-ignore
    AdjacencyList.prototype._sourceItems = null;    // @ts-ignore
    // @ts-ignore
    AdjacencyList.prototype._itemsOrder = null;    // @ts-ignore
    // @ts-ignore
    AdjacencyList.prototype._parentsMap = null;
});