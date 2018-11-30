define('Data/_chain/ZippedEnumerator', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var ZippedEnumerator = /** @class */
    function () {
        /**
         * Конструктор объединяющего энумератора.
         * @param {WS.Data/Chain/Abstract} previous Предыдущее звено.
         * @param {Array.<Array>|Array.<WS.Data/Collection/IEnumerable>} items Коллекции для объединения.
         * @protected
         */
        function ZippedEnumerator(previous, items) {
            this['[Data/_collection/IEnumerator]'] = true;
            this.previous = previous;
            this.items = items;
            this.reset();
        }
        ZippedEnumerator.prototype.getCurrent = function () {
            return this.current;
        };
        ZippedEnumerator.prototype.getCurrentIndex = function () {
            return this.index;
        };
        ZippedEnumerator.prototype.moveNext = function () {
            this.enumerator = this.enumerator || (this.enumerator = this.previous.getEnumerator());
            var hasNext = this.enumerator.moveNext();
            var current;
            var item;
            var itemEnumerator;
            if (hasNext) {
                this.index++;
                current = [this.enumerator.getCurrent()];
                for (var i = 0; i < this.items.length; i++) {
                    item = this.items[i];
                    if (item instanceof Array) {
                        current.push(item[this.index]);
                    } else if (item && item['[Data/_collection/IEnumerable]']) {
                        itemEnumerator = this.itemsEnumerators[i] || (this.itemsEnumerators[i] = item.getEnumerator());
                        if (itemEnumerator.moveNext()) {
                            current.push(itemEnumerator.getCurrent());
                        } else {
                            current.push(undefined);
                        }
                    } else {
                        throw new TypeError('Collection at argument ' + i + ' should implement Data/collection#IEnumerable');
                    }
                }
                this.current = current;
            }
            return hasNext;
        };
        ZippedEnumerator.prototype.reset = function () {
            this.enumerator = null;
            this.index = -1;
            this.current = undefined;
            this.itemsEnumerators = [];
        };
        return ZippedEnumerator;
    }();
    exports.default = ZippedEnumerator;    // @ts-ignore
    // @ts-ignore
    ZippedEnumerator.prototype.previous = null;    // @ts-ignore
    // @ts-ignore
    ZippedEnumerator.prototype.items = null;    // @ts-ignore
    // @ts-ignore
    ZippedEnumerator.prototype.itemsEnumerators = null;    // @ts-ignore
    // @ts-ignore
    ZippedEnumerator.prototype.enumerator = null;    // @ts-ignore
    // @ts-ignore
    ZippedEnumerator.prototype.index = null;    // @ts-ignore
    // @ts-ignore
    ZippedEnumerator.prototype.current = undefined;
});