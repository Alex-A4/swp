/// <amd-module name="Data/_chain/Sorted" />
/**
 * Сортирующее звено цепочки.
 * @class WS.Data/Chain/Sorted
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Sorted', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract',
    'Data/_chain/SortedEnumerator'
], function (require, exports, tslib_1, Abstract_1, SortedEnumerator_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Sorted = /** @class */
    function (_super) {
        tslib_1.__extends(Sorted, _super);    /** @lends WS.Data/Chain/Sorted.prototype */
                                              /**
         * Конструктор сортирующего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {function(*, *): Number} [compareFunction] Функция сравнения
         */
        /** @lends WS.Data/Chain/Sorted.prototype */
        /**
         * Конструктор сортирующего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {function(*, *): Number} [compareFunction] Функция сравнения
         */
        function Sorted(source, compareFunction) {
            var _this = _super.call(this, source) || this;
            _this._compareFunction = compareFunction;
            return _this;
        }
        Sorted.prototype.destroy = function () {
            this._compareFunction = null;
            _super.prototype.destroy.call(this);
        };    // region Data/_collection/IEnumerable
        // region Data/_collection/IEnumerable
        Sorted.prototype.getEnumerator = function () {
            return new SortedEnumerator_1.default(this._previous, this._compareFunction);
        };
        return Sorted;
    }(Abstract_1.default);
    exports.default = Sorted;
    Sorted.prototype['[Data/_chain/Sorted]'] = true;    // @ts-ignore
    // @ts-ignore
    Sorted.prototype._compareFunction = null;
});