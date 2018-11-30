/// <amd-module name="Data/_chain/SortedEnumerator" />
/**
 * Сортирующий энумератор
 * @author Мальцев А.А.
 */
define('Data/_chain/SortedEnumerator', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/IndexedEnumerator',
    'Data/_chain/SortWrapper'
], function (require, exports, tslib_1, IndexedEnumerator_1, SortWrapper_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var SortedEnumerator = /** @class */
    function (_super) {
        tslib_1.__extends(SortedEnumerator, _super);    /**
         * Конструктор сортирующего энумератора.
         * @param {WS.Data/Chain/Abstract} previous Предыдущее звено.
         * @param {function(*, Number): *} [compareFunction] Функция сравнения.
         * @protected
         */
        /**
         * Конструктор сортирующего энумератора.
         * @param {WS.Data/Chain/Abstract} previous Предыдущее звено.
         * @param {function(*, Number): *} [compareFunction] Функция сравнения.
         * @protected
         */
        function SortedEnumerator(previous, compareFunction) {
            var _this = _super.call(this, previous) || this;
            _this.compareFunction = compareFunction || SortedEnumerator.defaultCompare;
            return _this;
        }
        SortedEnumerator.prototype._getItems = function () {
            if (!this._items) {
                var shouldSaveIndices_1 = this.previous.shouldSaveIndices;
                this._items = _super.prototype._getItems.call(this).map(function (_a) {
                    var index = _a[0], item = _a[1];
                    return new SortWrapper_1.default(item, index);
                }).sort(this.compareFunction).map(function (item, index) {
                    var result = [
                        shouldSaveIndices_1 ? SortWrapper_1.default.indexOf(item) : index,
                        SortWrapper_1.default.valueOf(item)
                    ];
                    SortWrapper_1.default.clear(item);
                    return result;
                });
            }
            return this._items;
        };
        SortedEnumerator.defaultCompare = function (a, b) {
            return a === b ? 0 : a > b ? 1 : -1;
        };
        return SortedEnumerator;
    }(IndexedEnumerator_1.default);
    exports.default = SortedEnumerator;    // @ts-ignore
    // @ts-ignore
    SortedEnumerator.prototype.compareFunction = null;
});