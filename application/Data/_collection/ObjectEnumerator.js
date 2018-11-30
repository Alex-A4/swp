/// <amd-module name="Data/_collection/ObjectEnumerator" />
/**
 * Энумератор для собственных свойств объекта
 * @class WS.Data/Collection/ObjectEnumerator
 * @implements WS.Data/Collection/IEnumerator
 * @public
 * @author Мальцев А.А.
 */
define('Data/_collection/ObjectEnumerator', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var ObjectEnumerator = /** @class */
    function () {
        /**
         * Конструктор
         * @param {Object} items Массив
         */
        function ObjectEnumerator(items) {
            this['[Data/_collection/IEnumerator]'] = true;
            var checkedItems = items;
            if (checkedItems === undefined) {
                checkedItems = {};
            }
            if (!(checkedItems instanceof Object)) {
                throw new Error('Argument items should be an instance of Object');
            }
            this._items = checkedItems;
            this._keys = Object.keys(checkedItems);
        }    // region Data/_collection/IEnumerator
        // region Data/_collection/IEnumerator
        ObjectEnumerator.prototype.getCurrent = function () {
            if (this._index < 0) {
                return undefined;
            }
            return this._items[this._keys[this._index]];
        };
        ObjectEnumerator.prototype.moveNext = function () {
            if (1 + this._index >= this._keys.length) {
                return false;
            }
            this._index++;
            var current = this.getCurrent();
            if (this._filter && !this._filter(current, this.getCurrentIndex())) {
                return this.moveNext();
            }
            return true;
        };
        ObjectEnumerator.prototype.reset = function () {
            this._index = -1;
        };    // endregion Data/_collection/IEnumerator
              // region Public methods
        // endregion Data/_collection/IEnumerator
        // region Public methods
        ObjectEnumerator.prototype.getCurrentIndex = function () {
            return this._keys[this._index];
        };    /**
         * Устанавливает фильтр элементов
         * @param {function(): Boolean} filter Функция обратного вызова, которая должна для каждого элемента вернуть признак,
         * проходит ли он фильтр
         */
        /**
         * Устанавливает фильтр элементов
         * @param {function(): Boolean} filter Функция обратного вызова, которая должна для каждого элемента вернуть признак,
         * проходит ли он фильтр
         */
        ObjectEnumerator.prototype.setFilter = function (filter) {
            this._filter = filter;
        };
        return ObjectEnumerator;
    }();
    exports.default = ObjectEnumerator;
    ObjectEnumerator.prototype['[Data/_collection/ObjectEnumerator]'] = true;    // @ts-ignore
    // @ts-ignore
    ObjectEnumerator.prototype._items = null;    // @ts-ignore
    // @ts-ignore
    ObjectEnumerator.prototype._keys = null;    // @ts-ignore
    // @ts-ignore
    ObjectEnumerator.prototype._index = -1;    // @ts-ignore
    // @ts-ignore
    ObjectEnumerator.prototype._filter = null;
});