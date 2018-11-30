define('Data/_chain/IndexedEnumerator', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var IndexedEnumerator = /** @class */
    function () {
        /**
         * Конструктор.
         * @param {WS.Data/Chain/Abstract} previous Предыдущее звено.
         */
        function IndexedEnumerator(previous) {
            this['[Data/_collection/IEnumerator]'] = true;
            this.previous = previous;
            this.reset();
        }
        IndexedEnumerator.prototype.getCurrent = function () {
            var items = this._getItems();
            var current = items[this.index];
            return current ? current[1] : undefined;
        };
        IndexedEnumerator.prototype.getCurrentIndex = function () {
            var items = this._getItems();
            var current = items[this.index];
            return current ? current[0] : -1;
        };
        IndexedEnumerator.prototype.moveNext = function () {
            if (this.index >= this._getItems().length - 1) {
                return false;
            }
            this.index++;
            return true;
        };
        IndexedEnumerator.prototype.reset = function () {
            this._items = null;
            this.index = -1;
        };
        IndexedEnumerator.prototype._getItems = function () {
            if (!this._items) {
                this._items = [];
                var enumerator = this.previous.getEnumerator();
                while (enumerator.moveNext()) {
                    this._items.push([
                        enumerator.getCurrentIndex(),
                        enumerator.getCurrent()
                    ]);
                }
            }
            return this._items;
        };
        return IndexedEnumerator;
    }();
    exports.default = IndexedEnumerator;    // @ts-ignore
    // @ts-ignore
    IndexedEnumerator.prototype.previous = null;    // @ts-ignore
    // @ts-ignore
    IndexedEnumerator.prototype.index = -1;    // @ts-ignore
    // @ts-ignore
    IndexedEnumerator.prototype._items = null;
});