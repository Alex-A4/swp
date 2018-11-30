/// <amd-module name="Data/_display/CollectionEnumerator" />
/**
 * Энумератор для проекции коллекции
 * @class WS.Data/Display/CollectionEnumerator
 * @extends WS.Data/Entity/Abstract
 * @mixes WS.Data/Entity/OptionsMixin
 * @implements WS.Data/Collection/IEnumerator
 * @mixes WS.Data/Collection/IndexedEnumeratorMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_display/CollectionEnumerator', [
    'require',
    'exports',
    'tslib',
    'Data/type',
    'Data/collection',
    'Data/util'
], function (require, exports, tslib_1, type_1, collection_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var CollectionEnumerator = /** @class */
    function (_super) {
        tslib_1.__extends(CollectionEnumerator, _super);
        function CollectionEnumerator(options) {
            var _this = _super.call(this) || this;    /**
             * @cfg {Array.<WS.Data/Display/CollectionItem>|Function} Элементы проекции
             * @name WS.Data/Display/CollectionEnumerator#items
             */
            /**
             * @cfg {Array.<WS.Data/Display/CollectionItem>|Function} Элементы проекции
             * @name WS.Data/Display/CollectionEnumerator#items
             */
            _this._$items = [];    /**
             * @cfg {Array.<Boolean>} Результат применения фильтра
             * @name WS.Data/Display/CollectionEnumerator#filterMap
             */
            /**
             * @cfg {Array.<Boolean>} Результат применения фильтра
             * @name WS.Data/Display/CollectionEnumerator#filterMap
             */
            _this._$filterMap = [];    /**
             * @cfg {Array.<Number>} Результат применения сортировки
             * @name WS.Data/Display/CollectionEnumerator#sortMap
             */
            /**
             * @cfg {Array.<Number>} Результат применения сортировки
             * @name WS.Data/Display/CollectionEnumerator#sortMap
             */
            _this._$sortMap = [];    /**
             * Индекс элемента проекции -> Порядковый индекс
             */
            /**
             * Индекс элемента проекции -> Порядковый индекс
             */
            _this._sourceToInternal = [];    //region IEnumerator
            //region IEnumerator
            _this['[Data/_collection/IEnumerator]'] = true;
            type_1.OptionsMixin.call(_this, options);
            collection_1.IndexedEnumeratorMixin.constructor.call(_this);
            if (!(_this._$items instanceof Array) && !(_this._$items instanceof Function)) {
                throw new TypeError(_this._moduleName + '::constructor(): items should be instance of an Array or Function');
            }
            if (!(_this._$filterMap instanceof Array)) {
                throw new TypeError(_this._moduleName + '::constructor(): filter map should be instance of an Array');
            }
            if (!(_this._$sortMap instanceof Array)) {
                throw new TypeError(_this._moduleName + '::constructor(): sort map should be instance of an Array');
            }
            return _this;
        }
        Object.defineProperty(CollectionEnumerator.prototype, 'items', {
            get: function () {
                if (!this._itemsCache) {
                    this._itemsCache = this._$items instanceof Function ? this._$items() : this._$items;
                }
                return this._itemsCache;
            },
            enumerable: true,
            configurable: true
        });
        CollectionEnumerator.prototype.getCurrent = function () {
            return this._current;
        };
        CollectionEnumerator.prototype.getCurrentIndex = function () {
            return this._position;
        };
        CollectionEnumerator.prototype.reset = function () {
            this._itemsCache = null;
            this._position = -1;
            this._setCurrentByPosition();
        };    //endregion
              //region IndexedEnumeratorMixin
        //endregion
        //region IndexedEnumeratorMixin
        CollectionEnumerator.prototype.reIndex = function (action, start, count) {
            collection_1.IndexedEnumeratorMixin.reIndex.call(this, action, start, count);
            this._itemsCache = null;
            this._internalToSource = null;
            this._sourceToInternal = [];
            this._position = -1;
            if (this._current) {
                this._setPositionByCurrent();
            }
        };
        CollectionEnumerator.prototype._createIndex = function (property) {
            var savedPosition = this._position;
            var savedCurrent = this._current;
            collection_1.IndexedEnumeratorMixin._createIndex.call(this, property);
            this._position = savedPosition;
            this._current = savedCurrent;
        };    //endregion
              //region Public methods
              /**
         * Возвращает элемент по индексу
         * @param {Number} index Индекс
         * @return {WS.Data/Display/CollectionItem}
         * @state mutable
         */
        //endregion
        //region Public methods
        /**
         * Возвращает элемент по индексу
         * @param {Number} index Индекс
         * @return {WS.Data/Display/CollectionItem}
         * @state mutable
         */
        CollectionEnumerator.prototype.at = function (index) {
            return index === undefined ? undefined : this.items[this.getSourceByInternal(index)];
        };    /**
         * Возвращает кол-во элементов
         * @return {Number}
         */
        /**
         * Возвращает кол-во элементов
         * @return {Number}
         */
        CollectionEnumerator.prototype.getCount = function () {
            this._initInternalMap();
            return this._internalToSource.length;
        };    /**
         * Устанавливает текущий элемент
         * @param {WS.Data/Display/CollectionItem} item Текущий элемент
         */
        /**
         * Устанавливает текущий элемент
         * @param {WS.Data/Display/CollectionItem} item Текущий элемент
         */
        CollectionEnumerator.prototype.setCurrent = function (item) {
            this._itemsCache = null;
            this._position = this.getInternalBySource(this.items.indexOf(item));
            this._setCurrentByPosition();
        };    /**
         * Возвращает текущую позицию проекции
         * @return {Number}
         */
        /**
         * Возвращает текущую позицию проекции
         * @return {Number}
         */
        CollectionEnumerator.prototype.getPosition = function () {
            return this._position;
        };    /**
         * Устанавливает текущую позицию
         * @param {Number} position Позиция проекции
         * @return {Boolean}
         */
        /**
         * Устанавливает текущую позицию
         * @param {Number} position Позиция проекции
         * @return {Boolean}
         */
        CollectionEnumerator.prototype.setPosition = function (position) {
            this._itemsCache = null;
            this._checkPosition(position);
            this._position = position;
            this._setCurrentByPosition();
        };    /**
         * Возвращает признак корректности позиции
         * @param {Number} position Позиция
         * @return {Boolean}
         */
        /**
         * Возвращает признак корректности позиции
         * @param {Number} position Позиция
         * @return {Boolean}
         */
        CollectionEnumerator.prototype.isValidPosition = function (position) {
            return position >= -1 && position < this.getCount();
        };    /**
         * Возвращает предыдущий элемент
         * @return {*}
         */
        /**
         * Возвращает предыдущий элемент
         * @return {*}
         */
        CollectionEnumerator.prototype.movePrevious = function () {
            if (this._position < 1) {
                return false;
            }
            this._position--;
            this._setCurrentByPosition();
            return true;
        };
        CollectionEnumerator.prototype.moveNext = function () {
            if (this._position >= this.getCount() - 1) {
                return false;
            }
            this._position++;
            this._setCurrentByPosition();
            return true;
        };    /**
         * Вычисляет позицию в проекции относительно позиции в коллекции
         * @param {Number} source Позиция в коллекции
         * @return {Number}
         */
        /**
         * Вычисляет позицию в проекции относительно позиции в коллекции
         * @param {Number} source Позиция в коллекции
         * @return {Number}
         */
        CollectionEnumerator.prototype.getInternalBySource = function (source) {
            if (source === undefined || source === null || source === -1) {
                return source;
            }
            this._initInternalMap();
            if (this._sourceToInternal[source] === undefined) {
                this._sourceToInternal[source] = this._internalToSource.indexOf(source);
            }
            return this._sourceToInternal[source];
        };    /**
         * Вычисляет позицию в исходной коллекции относительно позиции в проекции
         * @param {Number} internal Позиция в проекции
         * @return {Number}
         * @protected
         */
        /**
         * Вычисляет позицию в исходной коллекции относительно позиции в проекции
         * @param {Number} internal Позиция в проекции
         * @return {Number}
         * @protected
         */
        CollectionEnumerator.prototype.getSourceByInternal = function (internal) {
            if (internal === undefined || internal === null || internal === -1) {
                return internal;
            }
            this._initInternalMap();
            return this._internalToSource[internal];
        };    //endregion
              //region Protected methods
              /**
         * Инициализирует массив соответствия позиций проекции и исходной коллекции
         * @protected
         */
        //endregion
        //region Protected methods
        /**
         * Инициализирует массив соответствия позиций проекции и исходной коллекции
         * @protected
         */
        CollectionEnumerator.prototype._initInternalMap = function () {
            if (this._internalToSource === null) {
                this._internalToSource = CollectionEnumerator.getAssociativeMap(this._$sortMap, this._$filterMap);
            }
        };    /**
         * Проверяет корректность позиции
         * @param {Number} position Позиция
         * @protected
         */
        /**
         * Проверяет корректность позиции
         * @param {Number} position Позиция
         * @protected
         */
        CollectionEnumerator.prototype._checkPosition = function (position) {
            if (!this.isValidPosition(position)) {
                throw new Error(this._moduleName + ': position is out of bounds');
            }
        };    /**
         * Устанавливает текущий элемент исходя из позиции
         * @protected
         */
        /**
         * Устанавливает текущий элемент исходя из позиции
         * @protected
         */
        CollectionEnumerator.prototype._setCurrentByPosition = function () {
            this._current = this._position > -1 ? this.items[this.getSourceByInternal(this._position)] : undefined;
        };    /**
         * Устанавливает позицию исходя из текущего элемента
         * @protected
         */
        /**
         * Устанавливает позицию исходя из текущего элемента
         * @protected
         */
        CollectionEnumerator.prototype._setPositionByCurrent = function () {
            this._position = -1;
            var index = this._current ? this.items.indexOf(this._current) : -1;
            if (index > -1 && this._$filterMap[index]) {
                this._position = this.getInternalBySource(index);
            } else {
                this._current = undefined;
            }
        };    //endregion
              //region Statics
              /**
         * Возвращает массив соответствия порядкового индекса и индекса элемента проекции
         * @param {Array.<Number>} sortMap Индекс после сортировки -> индекс элемента проекции
         * @param {Array.<Boolean>} filterMap Индекс элемента проекции -> прошел фильтр
         * @return {Array.<Number>} Порядковый индекс -> индекс элемента проекции
         * @public
         * @static
         */
        //endregion
        //region Statics
        /**
         * Возвращает массив соответствия порядкового индекса и индекса элемента проекции
         * @param {Array.<Number>} sortMap Индекс после сортировки -> индекс элемента проекции
         * @param {Array.<Boolean>} filterMap Индекс элемента проекции -> прошел фильтр
         * @return {Array.<Number>} Порядковый индекс -> индекс элемента проекции
         * @public
         * @static
         */
        CollectionEnumerator.getAssociativeMap = function (sortMap, filterMap) {
            var result = [];
            var index;
            for (var i = 0; i < sortMap.length; i++) {
                index = sortMap[i];
                if (filterMap[index]) {
                    result.push(index);
                }
            }
            return result;
        };
        return CollectionEnumerator;
    }(util_1.mixin(type_1.Abstract, type_1.OptionsMixin, collection_1.IndexedEnumeratorMixin));
    exports.default = CollectionEnumerator;
    CollectionEnumerator.prototype['[Data/_display/CollectionEnumerator]'] = true;    // @ts-ignore
    // @ts-ignore
    CollectionEnumerator.prototype._$items = null;    // @ts-ignore
    // @ts-ignore
    CollectionEnumerator.prototype._$filterMap = null;    // @ts-ignore
    // @ts-ignore
    CollectionEnumerator.prototype._$sortMap = null;    // @ts-ignore
    // @ts-ignore
    CollectionEnumerator.prototype._itemsCache = null;    // @ts-ignore
    // @ts-ignore
    CollectionEnumerator.prototype._position = -1;    // @ts-ignore
    // @ts-ignore
    CollectionEnumerator.prototype._current = undefined;    // @ts-ignore
    // @ts-ignore
    CollectionEnumerator.prototype._internalToSource = null;    // @ts-ignore
    // @ts-ignore
    CollectionEnumerator.prototype._sourceToInternal = null;
});