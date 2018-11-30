/// <amd-module name="Data/_display/Ladder" />
/**
 * Лесенка - позволяет отслеживать повторяющиеся значения в колонках таблицы.
 * @class WS.Data/Display/Ladder
 * @extends WS.Data/Entity/Abstract
 * @mixes WS.Data/Entity/SerializableMixin
 * @public
 * @author Мальцев А.А. Александрович
 */
define('Data/_display/Ladder', [
    'require',
    'exports',
    'tslib',
    'Data/_display/Collection',
    'Data/type',
    'Data/collection',
    'Data/util',
    'Data/shim'
], function (require, exports, tslib_1, Collection_1, type_1, collection_1, util_1, shim_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Возвращает уникальный идентификатор объекта
     * item Объект
     * @return {*}
     */
    /**
     * Возвращает уникальный идентификатор объекта
     * item Объект
     * @return {*}
     */
    function getObjectId(item) {
        if (item.getInstanceId instanceof Function) {
            return item.getInstanceId();
        } else if (item.getId instanceof Function) {
            return item.getId();
        } else if (item.get instanceof Function) {
            return item.get('id');
        }
        return item && item.id;
    }    /**
     * Возвращает уникальный содержимого элемента коллекции
     * @param item Элемент коллекции
     * @return {*}
     */
    /**
     * Возвращает уникальный содержимого элемента коллекции
     * @param item Элемент коллекции
     * @return {*}
     */
    function getCollectionItemId(item) {
        return getObjectId(item.getContents());
    }
    var Ladder = /** @class */
    function (_super) {
        tslib_1.__extends(Ladder, _super);    /** @lends WS.Data/Display/Ladder.prototype */
                                              /**
         * Конструктор лесенки.
         * @param {WS.Data/Display/Collection} collection Проекция, по которой строится лесенка.
         */
        /** @lends WS.Data/Display/Ladder.prototype */
        /**
         * Конструктор лесенки.
         * @param {WS.Data/Display/Collection} collection Проекция, по которой строится лесенка.
         */
        function Ladder(collection) {
            var _this = _super.call(this) || this;    /**
             * Проекция, по которой строится лесенка
             */
            /**
             * Проекция, по которой строится лесенка
             */
            _this._collection = null;    /**
             * Элементы проекции
             */
            /**
             * Элементы проекции
             */
            _this._collectionItems = null;    /**
             * Позиция в коллекции, с которой начинает строиться лесенка
             */
            /**
             * Позиция в коллекции, с которой начинает строиться лесенка
             */
            _this._offset = 0;    /**
             * Конвертеры значений
             */
            /**
             * Конвертеры значений
             */
            _this._converters = null;    /**
             * Названия колонок, входящих в лесенку
             */
            /**
             * Названия колонок, входящих в лесенку
             */
            _this._columnNames = [];    /**
             * Лесенка по ключу элементов для каждого поля
             */
            /**
             * Лесенка по ключу элементов для каждого поля
             */
            _this._column2primaryId = null;    /**
             * Обработчик события изменения проекции
             */
            /**
             * Обработчик события изменения проекции
             */
            _this._onCollectionChangeHandler = null;    /**
             * Обработчик события после изменения проекции
             */
            /**
             * Обработчик события после изменения проекции
             */
            _this._onAfterCollectionChangeHandler = null;    /**
             * Обработчик события изменения режима генерации событий
             */
            /**
             * Обработчик события изменения режима генерации событий
             */
            _this._onEventRaisingChangeHandler = null;
            type_1.SerializableMixin.constructor.call(_this);
            _this._onCollectionChangeHandler = _this._onCollectionChange.bind(_this);
            _this._onAfterCollectionChangeHandler = _this._onAfterCollectionChange.bind(_this);
            _this._onEventRaisingChangeHandler = _this._onEventRaisingChange.bind(_this);
            if (collection) {
                _this.setCollection(collection);
            } else {
                _this.reset();
            }
            return _this;
        }
        Ladder.prototype.destroy = function () {
            this.setCollection(null);
            _super.prototype.destroy.call(this);
        };    //region SerializableMixin
        //region SerializableMixin
        Ladder.prototype._getSerializableState = function (state) {
            state = type_1.SerializableMixin._getSerializableState.call(this, state);
            if (this._collection) {
                state.$options = this._collection;
            } else {
                delete state.$options;
            }
            if (this._offset) {
                state._offset = this._offset;
            }
            if (this._columnNames.length) {
                state._columnNames = this._columnNames;
            }    //FIXME: what about _converters?
            //FIXME: what about _converters?
            return state;
        };
        Ladder.prototype._setSerializableState = function (state) {
            var fromSerializableMixin = type_1.SerializableMixin._setSerializableState(state);
            return function () {
                fromSerializableMixin.call(this);
                if (state._offset) {
                    this._offset = state._offset;
                }
                if (state._columnNames) {
                    this._columnNames = state._columnNames;    //Restore _column2primaryId on wake up
                    //Restore _column2primaryId on wake up
                    if (this._collection) {
                        this._checkRange(0, this._collectionItems.length);
                    }
                }
            };
        };    //endregion
              //region Public methods
              /**
         * Возвращает проекцию коллекции, по которой строится лесенка.
         * @return {WS.Data/Display/Collection|null}
         */
        //endregion
        //region Public methods
        /**
         * Возвращает проекцию коллекции, по которой строится лесенка.
         * @return {WS.Data/Display/Collection|null}
         */
        Ladder.prototype.getCollection = function () {
            return this._collection;
        };    /**
         * Устанавливает проекцию коллекции, по которой строится лесенка.
         * @param {WS.Data/Display/Collection|null} collection Проекция, по которой строится лесенка.
         */
        /**
         * Устанавливает проекцию коллекции, по которой строится лесенка.
         * @param {WS.Data/Display/Collection|null} collection Проекция, по которой строится лесенка.
         */
        Ladder.prototype.setCollection = function (collection) {
            if (collection !== null && !(collection instanceof Collection_1.default)) {
                throw new TypeError('Argument "collection" should be an instance of WS.Data/Display/Collection');
            }    //Reset for  the new collection
            //Reset for  the new collection
            var reset = collection !== this._collection;    //For the same collection just move event handler to the end (unsubscribe and then subscribe)
            //For the same collection just move event handler to the end (unsubscribe and then subscribe)
            if (this._collection && !this._collection.destroyed) {
                this._collection.unsubscribe('onCollectionChange', this._onCollectionChangeHandler);
                this._collection.unsubscribe('onAfterCollectionChange', this._onAfterCollectionChangeHandler);
                this._collection.unsubscribe('onEventRaisingChange', this._onEventRaisingChangeHandler);
            }
            if (collection && !collection.destroyed) {
                collection.subscribe('onCollectionChange', this._onCollectionChangeHandler);
                collection.subscribe('onAfterCollectionChange', this._onAfterCollectionChangeHandler);
                collection.subscribe('onEventRaisingChange', this._onEventRaisingChangeHandler);
            }
            this._collection = collection;
            if (reset) {
                this._applyCollection();
                this._columnNames = [];
                this.reset();
            }
        };    /**
         * Устанавливает позицию в коллекции, с которой начинает строиться лесенка
         * @param {Number} offset Позиция.
         */
        /**
         * Устанавливает позицию в коллекции, с которой начинает строиться лесенка
         * @param {Number} offset Позиция.
         */
        Ladder.prototype.setOffset = function (offset) {
            // @ts-ignore
            offset = parseInt(offset, 10);
            var prev = this._offset;
            this._offset = offset;
            var result = this._checkRange(this._offset, 2);
            this._notifyPrimaryChanges(result);
            if (Math.abs(prev - offset) > 1) {
                result = this._checkRange(prev, 1);
                this._notifyPrimaryChanges(result);
            }
        };
        Ladder.prototype.reset = function () {
            this._column2primaryId = new shim_1.Map();
        };    /**
         * Устанавливает конвертер значения поля
         * @param {String} columnName Название поля
         * @param {Function(*): String} converter Конвертер значения поля
         * @return {*}
         */
        /**
         * Устанавливает конвертер значения поля
         * @param {String} columnName Название поля
         * @param {Function(*): String} converter Конвертер значения поля
         * @return {*}
         */
        Ladder.prototype.setConverter = function (columnName, converter) {
            this._converters = this._converters || {};
            this._converters[columnName] = converter;
        };    /**
         * Возвращает значение поля с учетом лесенки
         * @param {*} item Элемент коллекции, для котрой построена проекция
         * @param {String} columnName Название поля
         * @return {String}
         */
        /**
         * Возвращает значение поля с учетом лесенки
         * @param {*} item Элемент коллекции, для котрой построена проекция
         * @param {String} columnName Название поля
         * @return {String}
         */
        Ladder.prototype.get = function (item, columnName) {
            return this.isPrimary(item, columnName) ? util_1.object.getPropertyValue(item, columnName) : '';
        };    /**
         * Возвращает признак, что значение является основным (отображается)
         * @param {*} item Элемент коллекции, для котрой построена проекция
         * @param {String} columnName Название поля
         * @return {Boolean}
         */
        /**
         * Возвращает признак, что значение является основным (отображается)
         * @param {*} item Элемент коллекции, для котрой построена проекция
         * @param {String} columnName Название поля
         * @return {Boolean}
         */
        Ladder.prototype.isPrimary = function (item, columnName) {
            if (!this._collection) {
                return true;
            }
            this._applyColumn(columnName);
            var id = getObjectId(item);
            var columnData = this._getColumnData(columnName);
            var hasData = columnData.has(id);
            var data = hasData ? columnData.get(id) : undefined;
            var idx = this._collection.getIndexBySourceItem(item);
            if (!hasData || data[1] !== idx) {
                this._checkRange(idx, 1, true);
                hasData = columnData.has(id);
                data = hasData ? columnData.get(id) : undefined;
            }
            return hasData ? !!data[0] : true;
        };    /**
         * Проверяет, что колонка входит в лесенку
         * @param {String} columnName Название поля
         * @return {Boolean}
         */
        /**
         * Проверяет, что колонка входит в лесенку
         * @param {String} columnName Название поля
         * @return {Boolean}
         */
        Ladder.prototype.isLadderColumn = function (columnName) {
            return this._column2primaryId.has(columnName);
        };    //endregion
              //region Protected methods
        //endregion
        //region Protected methods
        Ladder.prototype._applyCollection = function () {
            if (!this._collection) {
                this._collectionItems = null;
                return;
            }
            var items = this._collectionItems = [];
            this._collection.each(function (item) {
                items.push(item);
            });
        };
        Ladder.prototype._spliceCollection = function (at, deleteCount, added) {
            var _a;
            if (!this._collectionItems) {
                return;
            }
            (_a = this._collectionItems).splice.apply(_a, [
                at,
                deleteCount
            ].concat(added));
        };
        Ladder.prototype._applyColumn = function (columnName) {
            var columnNames = this._columnNames;
            if (columnNames.indexOf(columnName) > -1) {
                return;
            }
            columnNames.push(columnName);
        };
        Ladder.prototype._getColumnData = function (columnName) {
            var map = this._column2primaryId;
            if (map.has(columnName)) {
                return map.get(columnName);
            }
            var data = new shim_1.Map();
            map.set(columnName, data);
            return data;
        };
        Ladder.prototype._onCollectionChange = function (event, action, newItems, newItemsIndex, oldItems, oldItemsIndex) {
            var _this = this;
            var push = Array.prototype.push;
            var result = [];
            var removeData = function (oldItems, newItems) {
                if (oldItems.length) {
                    var columnNames = _this._columnNames;
                    var newItemsId_1 = new shim_1.Set();
                    var columnIndex = void 0;
                    var columnData = void 0;
                    var delta = void 0;
                    var itemId = void 0;
                    newItems.forEach(function (item) {
                        newItemsId_1.add(getCollectionItemId(item));
                    });
                    for (columnIndex = 0; columnIndex < columnNames.length; columnIndex++) {
                        columnData = _this._getColumnData(columnNames[columnIndex]);
                        for (delta = 0; delta < oldItems.length; ++delta) {
                            itemId = getCollectionItemId(oldItems[delta]);
                            if (!newItemsId_1.has(itemId)) {
                                columnData.delete(itemId);
                            }
                        }
                    }
                }
            };
            var checkItems = function (items, count, startIdx) {
                return count > 0 ? _this._checkRange(startIdx - 1, items.length + 2) : [];
            };
            switch (action) {
            case collection_1.IBind.ACTION_ADD:
                this._spliceCollection(newItemsIndex, 0, newItems);
                push.apply(result, checkItems(newItems, newItems.length, newItemsIndex));
                break;
            case collection_1.IBind.ACTION_REMOVE:
                this._spliceCollection(oldItemsIndex, oldItems.length, []);
                removeData(oldItems, newItems);
                push.apply(result, checkItems([], oldItems.length, oldItemsIndex));
                break;
            case collection_1.IBind.ACTION_CHANGE:
                result = this._checkRange(newItemsIndex - 1, 3);
                break;
            case collection_1.IBind.ACTION_MOVE:
                this._spliceCollection(oldItemsIndex, oldItems.length, []);
                this._spliceCollection(newItemsIndex, 0, newItems);    //если запись перемещают наверх, то индекс сдвинется
                //если запись перемещают наверх, то индекс сдвинется
                var startIndex = newItemsIndex > oldItemsIndex ? oldItemsIndex : oldItemsIndex + newItems.length;
                push.apply(result, checkItems([], oldItems.length, startIndex));
                push.apply(result, checkItems(newItems, newItems.length, newItemsIndex));
                break;
            default:
                //Translate collection items to the _collectionItems
                this._applyCollection();    //FIXME: Check for desynchronization. It's possible if someone affects this._collection during event handler called before this handler
                //FIXME: Check for desynchronization. It's possible if someone affects this._collection during event handler called before this handler
                if (action === collection_1.IBind.ACTION_RESET && this._collectionItems && this._collectionItems.length !== newItems.length) {
                    newItems = this._collectionItems;
                }    //Remove rejected ladder data
                //Remove rejected ladder data
                removeData(oldItems, newItems);    //Check updated ladder data in newItems
                //Check updated ladder data in newItems
                push.apply(result, checkItems(newItems, newItems.length, newItemsIndex));
            }
            this._notifyPrimaryChanges(result);
        };
        Ladder.prototype._onEventRaisingChange = function (event, enabled, analyze) {
            if (enabled && !analyze) {
                this._applyCollection();
            }
        };
        Ladder.prototype._onAfterCollectionChange = function () {
            if (this._collectionItems && this._collection.getCount() !== this._collectionItems.length) {
                this._applyCollection();
            }
        };
        Ladder.prototype._notifyPrimaryChanges = function (changesArray) {
            var _this = this;
            var collection = this._collection;
            var collectionItems = this._collectionItems;
            var idx;
            var columnName;
            var item;
            var optimized = changesArray.reduce(function (prev, curr) {
                if (curr !== null) {
                    idx = curr[0];
                    columnName = curr[1];
                    item = collectionItems[idx];
                    prev[idx] = prev[idx] || {};
                    prev[idx][columnName] = _this.get(item.getContents(), columnName);
                }
                return prev;
            }, {});
            for (idx in optimized) {
                if (optimized.hasOwnProperty(idx)) {
                    collection.notifyItemChange(collectionItems[idx], { contents: optimized[idx] });
                }
            }
        };
        Ladder.prototype._checkRange = function (startIdx, length, byOriginal) {
            var result = [];
            var collection = this._collection;
            var collectionItems = this._collectionItems;
            var columnNames = this._columnNames;
            var columnIndex;
            var idx;
            var adjusted;
            var finishIdx = Math.min(startIdx + length, byOriginal ? collection.getCount() : collectionItems.length);
            startIdx = Math.max(0, startIdx);
            for (columnIndex = 0; columnIndex < columnNames.length; columnIndex++) {
                for (idx = startIdx; idx < finishIdx; ++idx) {
                    adjusted = this._adjustPrimary(idx, byOriginal ? collection.at(idx) : collectionItems[idx], columnNames[columnIndex], byOriginal);
                    if (adjusted !== null) {
                        result.push(adjusted);
                    }
                }
            }
            return result;
        };
        Ladder.prototype._adjustPrimary = function (idx, item, columnName, byOriginal) {
            if (!item) {
                return null;
            }
            var id = getCollectionItemId(item);
            var data;
            var nowIsPrimary;
            var thenIsPrimary;
            if (id !== undefined) {
                data = this._getColumnData(columnName);
                nowIsPrimary = this._isPrimaryIndex(idx, columnName, byOriginal);
                thenIsPrimary = data.get(id);
                thenIsPrimary = thenIsPrimary ? thenIsPrimary[0] : thenIsPrimary;
                if (nowIsPrimary !== thenIsPrimary) {
                    data.set(id, [
                        nowIsPrimary,
                        idx
                    ]);
                    return [
                        idx,
                        columnName
                    ];
                }
            }
            return null;
        };
        Ladder.prototype._isPrimaryIndex = function (idx, columnName, byOriginal) {
            if (idx === 0 || idx === this._offset) {
                return true;
            }
            var collection = this._collection;
            var collectionItems = this._collectionItems;
            var prev = (byOriginal ? collection.at(idx - 1) : collectionItems[idx - 1]).getContents();
            var curr = (byOriginal ? collection.at(idx) : collectionItems[idx]).getContents();
            var prevVal = util_1.object.getPropertyValue(prev, columnName);
            var currVal = util_1.object.getPropertyValue(curr, columnName);
            if (this._converters && this._converters.hasOwnProperty(columnName)) {
                prevVal = this._converters[columnName](prevVal, prev);
                currVal = this._converters[columnName](currVal, curr);
            }
            if (prevVal instanceof Object && currVal instanceof Object) {
                prevVal = prevVal.valueOf();
                currVal = currVal.valueOf();
            }
            return prevVal !== currVal;
        };
        return Ladder;
    }(util_1.mixin(type_1.Abstract, type_1.SerializableMixin)    /** @lends WS.Data/Display/Ladder.prototype */);
    /** @lends WS.Data/Display/Ladder.prototype */
    exports.default = Ladder;
    Ladder.prototype._moduleName = 'Data/display:Ladder';
    Ladder.prototype['[Data/_display/Ladder]'] = true;
});