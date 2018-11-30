/// <amd-module name="Data/_display/itemsStrategy/Search" />
/**
 * Стратегия-декоратор для объединения развернутых узлов в "хлебную крошку"
 * @class WS.Data/Display/ItemsStrategy/Search
 * @extends WS.Data/Entity/Abstract
 * @implements WS.Data/Display/IItemsStrategy
 * @mixes WS.Data/Entity/SerializableMixin
 * @author Мальцев А.А.
 */
define('Data/_display/itemsStrategy/Search', [
    'require',
    'exports',
    'tslib',
    'Data/_display/BreadcrumbsItem',
    'Data/type',
    'Data/util'
], function (require, exports, tslib_1, BreadcrumbsItem_1, type_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Search = /** @class */
    function (_super) {
        tslib_1.__extends(Search, _super);    /**
         * Конструктор
         * @param {Options} options Опции
         */
        /**
         * Конструктор
         * @param {Options} options Опции
         */
        function Search(options) {
            var _this = _super.call(this) || this;    //region IItemsStrategy
            //region IItemsStrategy
            _this['[Data/_display/IItemsStrategy]'] = true;
            _this._options = options;
            return _this;
        }
        Object.defineProperty(Search.prototype, 'options', {
            get: function () {
                return this.source.options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Search.prototype, 'source', {
            get: function () {
                return this._options.source;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Search.prototype, 'count', {
            get: function () {
                return this._getItems().length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Search.prototype, 'items', {
            get: function () {
                return this._getItems();
            },
            enumerable: true,
            configurable: true
        });
        Search.prototype.at = function (index) {
            return this._getItems()[index];
        };
        Search.prototype.splice = function (start, deleteCount, added) {
            return this.source.splice(start, deleteCount, added);
        };
        Search.prototype.reset = function () {
            return this.source.reset();
        };
        Search.prototype.invalidate = function () {
            return this.source.invalidate();
        };
        Search.prototype.getDisplayIndex = function (index) {
            var sourceIndex = this.source.getDisplayIndex(index);
            var sourceItem = this.source.items[sourceIndex];
            var items = this._getItems();
            var itemIndex = items.indexOf(sourceItem);
            return itemIndex === -1 ? items.length : itemIndex;
        };
        Search.prototype.getCollectionIndex = function (index) {
            var items = this._getItems();
            var item = items[index];
            var sourceItems = this.source.items;
            var sourceIndex = sourceItems.indexOf(item);
            return sourceIndex >= 0 ? this.source.getCollectionIndex(sourceIndex) : -1;
        };    //endregion
              //region SerializableMixin
        //endregion
        //region SerializableMixin
        Search.prototype._getSerializableState = function (state) {
            state = type_1.SerializableMixin._getSerializableState.call(this, state);
            state.$options = this._options;
            return state;
        };
        Search.prototype._setSerializableState = function (state) {
            var fromSerializableMixin = type_1.SerializableMixin._setSerializableState(state);
            return function () {
                fromSerializableMixin.call(this);
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
        Search.prototype._getItems = function () {
            return Search.sortItems(this.source.items, { display: this.options.display });
        };    //endregion
              //region Statics
              /**
         * Создает индекс сортировки, объединяющий хлебные крошки в один элемент
         * @param {Array.<WS.Data/Display/CollectionItem>} items Элементы проекции.
         * @param {Object} options Опции
         * @param {WS.Data/Display/Collection} options.display Проекция
         * @return {Array.<WS.Data/Display/CollectionItem>}
         * @static
         */
        //endregion
        //region Statics
        /**
         * Создает индекс сортировки, объединяющий хлебные крошки в один элемент
         * @param {Array.<WS.Data/Display/CollectionItem>} items Элементы проекции.
         * @param {Object} options Опции
         * @param {WS.Data/Display/Collection} options.display Проекция
         * @return {Array.<WS.Data/Display/CollectionItem>}
         * @static
         */
        Search.sortItems = function (items, options) {
            var display = options.display;
            var dump = {};
            var currentBreadcrumbs = null;
            var isNode = function (item) {
                return item && item.isNode ? item.isNode() : false;
            };
            return items.map(function (item, index) {
                var next = items[index + 1];
                var itemIsNode = isNode(item);
                var nextIsNode = isNode(next);
                if (itemIsNode) {
                    var isLastBreadcrumb = nextIsNode ? item.getLevel() >= next.getLevel() : true;
                    if (isLastBreadcrumb) {
                        currentBreadcrumbs = new BreadcrumbsItem_1.default({
                            owner: display,
                            last: item
                        });
                        return currentBreadcrumbs;
                    }
                    currentBreadcrumbs = null;
                    return dump;
                }
                item.setParent(currentBreadcrumbs);
                return item;
            }).filter(function (item) {
                return item !== dump;
            });
        };
        return Search;
    }(util_1.mixin(type_1.Abstract, type_1.SerializableMixin));
    exports.default = Search;
    Search.prototype._moduleName = 'Data/display:itemsStrategy.Search';
    Search.prototype['[Data/_display/itemsStrategy/Search]'] = true;
});