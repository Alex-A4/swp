/// <amd-module name="Data/_chain/ConcatenatedEnumerator" />
/**
 * Объединяющий энумератор.
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/ConcatenatedEnumerator', [
    'require',
    'exports',
    'Data/collection'
], function (require, exports, collection_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var ConcatenatedEnumerator = /** @class */
    function () {
        /**
         * Конструктор объединяющего энумератора.
         * @param {WS.Data/Chain/Abstract} previous Предыдущее звено.
         * @param {Array.<Array>|Array.<WS.Data/Collection/IEnumerable>} items Коллекции для объединения.
         */
        function ConcatenatedEnumerator(previous, items) {
            this['[Data/_collection/IEnumerator]'] = true;
            this.previous = previous;
            this.items = items;
            this.reset();
        }
        ConcatenatedEnumerator.prototype.getCurrent = function () {
            return this.current;
        };
        ConcatenatedEnumerator.prototype.getCurrentIndex = function () {
            return this.index;
        };
        ConcatenatedEnumerator.prototype.moveNext = function () {
            this.enumerator = this.enumerator || (this.enumerator = this.previous.getEnumerator());
            var hasNext = this.enumerator.moveNext();
            if (hasNext) {
                this.current = this.enumerator.getCurrent();
                this.index++;
                return hasNext;
            }
            if (this.currentItem) {
                hasNext = this.currentItem.moveNext();
                if (hasNext) {
                    this.current = this.currentItem.getCurrent();
                    this.index++;
                    return hasNext;
                }
            }
            if (this.currentItemIndex < this.items.length - 1) {
                this.currentItemIndex++;
                this.currentItem = this.items[this.currentItemIndex];
                if (this.currentItem instanceof Array) {
                    this.currentItem = new collection_1.ArrayEnumerator(this.currentItem);
                } else if (this.currentItem && this.currentItem['[Data/_collection/IEnumerable]']) {
                    this.currentItem = this.currentItem.getEnumerator();
                } else {
                    throw new TypeError('Collection at argument ' + this.currentItemIndex + ' should implement [Data/collection#IEnumerable]');
                }
                return this.moveNext();
            }
            return false;
        };
        ConcatenatedEnumerator.prototype.reset = function () {
            this.enumerator = null;
            this.index = -1;
            this.current = undefined;
            this.currentItem = null;
            this.currentItemIndex = -1;
        };
        return ConcatenatedEnumerator;
    }();
    exports.default = ConcatenatedEnumerator;    // @ts-ignore
    // @ts-ignore
    ConcatenatedEnumerator.prototype.previous = null;    // @ts-ignore
    // @ts-ignore
    ConcatenatedEnumerator.prototype.items = null;    // @ts-ignore
    // @ts-ignore
    ConcatenatedEnumerator.prototype.enumerator = null;    // @ts-ignore
    // @ts-ignore
    ConcatenatedEnumerator.prototype.index = null;    // @ts-ignore
    // @ts-ignore
    ConcatenatedEnumerator.prototype.current = undefined;    // @ts-ignore
    // @ts-ignore
    ConcatenatedEnumerator.prototype.currentItem = null;    // @ts-ignore
    // @ts-ignore
    ConcatenatedEnumerator.prototype.currentItemIndex = null;
});