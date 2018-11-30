/// <amd-module name="Data/_chain/ReversedEnumerator" />
/**
 * Реверсивный энумератор
 * @author Мальцев А.А.
 */
define('Data/_chain/ReversedEnumerator', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/IndexedEnumerator'
], function (require, exports, tslib_1, IndexedEnumerator_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var ReversedEnumerator = /** @class */
    function (_super) {
        tslib_1.__extends(ReversedEnumerator, _super);
        function ReversedEnumerator() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ReversedEnumerator.prototype._getItems = function () {
            if (!this._items) {
                _super.prototype._getItems.call(this);
                this._items.reverse();    // Build natural order indices if necessary
                // Build natural order indices if necessary
                if (!this.previous.shouldSaveIndices) {
                    this._items = this._items.map(function (item, index) {
                        return [
                            index,
                            item[1]
                        ];
                    }, this);
                }
            }
            return this._items;
        };
        return ReversedEnumerator;
    }(IndexedEnumerator_1.default);
    exports.default = ReversedEnumerator;
});