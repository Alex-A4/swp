/// <amd-module name="Data/_collection/ArrayEnumerator" />
/**
 * Энумератор для массива
 * @class WS.Data/Collection/ArrayEnumerator
 * @implements WS.Data/Collection/IEnumerator
 * @mixes WS.Data/Collection/IndexedEnumeratorMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_collection/ArrayEnumerator', [
    'require',
    'exports',
    'tslib',
    'Data/_collection/IndexedEnumeratorMixin',
    'Data/util'
], function (require, exports, tslib_1, IndexedEnumeratorMixin_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var ArrayEnumerator = /** @class */
    function (_super) {
        tslib_1.__extends(ArrayEnumerator, _super);    /**
         * Конструктор
         * @param {Array} items Массив
         */
        /**
         * Конструктор
         * @param {Array} items Массив
         */
        function ArrayEnumerator(items) {
            var _this = _super.call(this) || this;
            var checkedItems = items;
            if (checkedItems === undefined) {
                checkedItems = [];
            }
            if (!(checkedItems instanceof Array)) {
                throw new Error('Argument items should be an instance of Array');
            }
            _this._items = checkedItems;
            IndexedEnumeratorMixin_1.default.constructor.call(_this);
            return _this;
        }    // region WS.Data/Collection/IEnumerator
        // region WS.Data/Collection/IEnumerator
        ArrayEnumerator.prototype.getCurrent = function () {
            if (this._index < 0) {
                return undefined;
            }
            return this._resolver ? this._resolver(this._index) : this._items[this._index];
        };
        ArrayEnumerator.prototype.getCurrentIndex = function () {
            return this._index;
        };
        ArrayEnumerator.prototype.moveNext = function () {
            if (1 + this._index >= this._items.length) {
                return false;
            }
            this._index++;
            var current = this.getCurrent();
            if (this._filter && !this._filter(current, this._index)) {
                return this.moveNext();
            }
            return true;
        };
        ArrayEnumerator.prototype.reset = function () {
            this._index = -1;
        };    // endregion WS.Data/Collection/IEnumerator
              // region Public methods
              /**
         * Устанавливает резолвер элементов по позиции
         * @param {function(Number): *} resolver Функция обратного вызова, которая должна по позиции вернуть элемент
         */
        // endregion WS.Data/Collection/IEnumerator
        // region Public methods
        /**
         * Устанавливает резолвер элементов по позиции
         * @param {function(Number): *} resolver Функция обратного вызова, которая должна по позиции вернуть элемент
         */
        ArrayEnumerator.prototype.setResolver = function (resolver) {
            this._resolver = resolver;
        };    /**
         * Устанавливает фильтр элементов
         * @param {function(*): Boolean} filter Функция обратного вызова, которая должна для каждого элемента вернуть
         * признак, проходит ли он фильтр
         */
        /**
         * Устанавливает фильтр элементов
         * @param {function(*): Boolean} filter Функция обратного вызова, которая должна для каждого элемента вернуть
         * признак, проходит ли он фильтр
         */
        ArrayEnumerator.prototype.setFilter = function (filter) {
            this._filter = filter;
        };
        return ArrayEnumerator;
    }(util_1.mixin(Object, IndexedEnumeratorMixin_1.default));
    exports.default = ArrayEnumerator;
    ArrayEnumerator.prototype['[Data/_collection/ArrayEnumerator]'] = true;    /**
     * @property {Array} Массив
     */
    /**
     * @property {Array} Массив
     */
    ArrayEnumerator.prototype._items = null;    /**
     * @property {Number} Текущий индекс
     */
    /**
     * @property {Number} Текущий индекс
     */
    ArrayEnumerator.prototype._index = -1;    /**
     * @property {function(Number): *} Резолвер элементов
     */
    /**
     * @property {function(Number): *} Резолвер элементов
     */
    ArrayEnumerator.prototype._resolver = null;    /**
     * @property {function(*): Boolean} Фильтр элементов
     */
    /**
     * @property {function(*): Boolean} Фильтр элементов
     */
    ArrayEnumerator.prototype._filter = null;
    util_1.di.register('Data/collection:ArrayEnumerator', ArrayEnumerator, { instantiate: false });
});