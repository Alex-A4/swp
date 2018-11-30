/// <amd-module name="Data/_display/itemsStrategy/AbstractStrategy" />
/**
 * Абстрактная стратегия получения элементов проекции
 * @class WS.Data/Display/ItemsStrategy/Abstract
 * @extends WS.Data/Entity/Abstract
 * @implements WS.Data/Display/IItemsStrategy
 * @mixes WS.Data/Entity/SerializableMixin
 * @author Мальцев А.А.
 */
define('Data/_display/itemsStrategy/AbstractStrategy', [
    'require',
    'exports',
    'tslib',
    'Data/type',
    'Data/util'
], function (require, exports, tslib_1, type_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Abstract = /** @class */
    function (_super) {
        tslib_1.__extends(Abstract, _super);    /**
         * Конструктор
         * @param {Options} options Опции
         */
        /**
         * Конструктор
         * @param {Options} options Опции
         */
        function Abstract(options) {
            var _this = _super.call(this) || this;    //region IItemsStrategy
            //region IItemsStrategy
            _this['[Data/_display/IItemsStrategy]'] = true;
            _this._options = options;
            return _this;
        }
        Object.defineProperty(Abstract.prototype, 'options', {
            get: function () {
                return Object.assign({}, this._options);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Abstract.prototype, 'source', {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Abstract.prototype, 'count', {
            get: function () {
                throw new Error('Property must be implemented');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Abstract.prototype, 'items', {
            get: function () {
                return this._getItems();
            },
            enumerable: true,
            configurable: true
        });
        Abstract.prototype.at = function (index) {
            throw new Error('Method must be implemented');
        };
        Abstract.prototype.splice = function (start, deleteCount, added) {
            throw new Error('Method must be implemented');
        };
        Abstract.prototype.reset = function () {
            this._items = null;
            this._sourceItems = null;
        };
        Abstract.prototype.invalidate = function () {
        };
        Abstract.prototype.getDisplayIndex = function (index) {
            return index;
        };
        Abstract.prototype.getCollectionIndex = function (index) {
            return index;
        };    //endregion
              //region SerializableMixin
        //endregion
        //region SerializableMixin
        Abstract.prototype._getSerializableState = function (state) {
            state = type_1.SerializableMixin._getSerializableState.call(this, state);
            state.$options = this._options;
            state._items = this._items;
            return state;
        };
        Abstract.prototype._setSerializableState = function (state) {
            var fromSerializableMixin = type_1.SerializableMixin._setSerializableState(state);
            return function () {
                fromSerializableMixin.call(this);
                this._items = state._items;
            };
        };    //endregion
              //region Protected members
              /**
         * Возвращает исходную коллекцию
         * @return {WS.Data/Collection/IEnumerable}
         * @protected
         */
        //endregion
        //region Protected members
        /**
         * Возвращает исходную коллекцию
         * @return {WS.Data/Collection/IEnumerable}
         * @protected
         */
        Abstract.prototype._getCollection = function () {
            return this._options.display.getCollection();
        };    /**
         * Возвращает энумератор коллекции
         * @return {WS.Data/Collection/IEnumerator}
         * @protected
         */
        /**
         * Возвращает энумератор коллекции
         * @return {WS.Data/Collection/IEnumerator}
         * @protected
         */
        Abstract.prototype._getCollectionEnumerator = function () {
            return this._getCollection().getEnumerator(this._options.localize);
        };    /**
         * Возвращает элементы проекции
         * @return Array.<WS.Data/Display/CollectionItem>
         * @protected
         */
        /**
         * Возвращает элементы проекции
         * @return Array.<WS.Data/Display/CollectionItem>
         * @protected
         */
        Abstract.prototype._getItems = function () {
            if (!this._items) {
                this._initItems();
            }
            return this._items;
        };    /**
         * Инициализирует элементы
         * @protected
         */
        /**
         * Инициализирует элементы
         * @protected
         */
        Abstract.prototype._initItems = function () {
            this._items = this._items || [];
            this._items.length = this._options.display.getCollectionCount();
        };    /**
         * Возвращает элементы исходной коллекции
         * @protected
         */
        /**
         * Возвращает элементы исходной коллекции
         * @protected
         */
        Abstract.prototype._getSourceItems = function () {
            if (this._sourceItems) {
                return this._sourceItems;
            }
            var enumerator = this._getCollectionEnumerator();
            var items = [];
            enumerator.reset();
            while (enumerator.moveNext()) {
                items.push(enumerator.getCurrent());
            }
            return this._sourceItems = items;
        };    /**
         * Создает элемент проекции
         * @return WS.Data/Display/CollectionItem
         * @protected
         */
        /**
         * Создает элемент проекции
         * @return WS.Data/Display/CollectionItem
         * @protected
         */
        Abstract.prototype._createItem = function (contents) {
            return this.options.display.createItem({ contents: contents });
        };
        return Abstract;
    }(util_1.mixin(type_1.Abstract, type_1.SerializableMixin));
    exports.default = Abstract;
    Abstract.prototype._moduleName = 'Data/display:itemsStrategy.Abstract';
    Abstract.prototype['[Data/_display/itemsStrategy/Abstract]'] = true;    // @ts-ignore
    // @ts-ignore
    Abstract.prototype._items = null;    // @ts-ignore
    // @ts-ignore
    Abstract.prototype._sourceItems = null;
});