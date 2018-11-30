/// <amd-module name="Data/_chain/Filtered" />
/**
 * Фильтрующее звено цепочки.
 * @class WS.Data/Chain/Filtered
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Filtered', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract',
    'Data/_chain/FilteredEnumerator'
], function (require, exports, tslib_1, Abstract_1, FilteredEnumerator_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Filtered = /** @class */
    function (_super) {
        tslib_1.__extends(Filtered, _super);    /** @lends WS.Data/Chain/Filtered.prototype */
                                                /**
         * Конструктор фильтрующего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {Function(*, Number): Boolean} callback Фильтр
         * @param {Object} [callbackContext] Контекст вызова callback
         */
        /** @lends WS.Data/Chain/Filtered.prototype */
        /**
         * Конструктор фильтрующего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {Function(*, Number): Boolean} callback Фильтр
         * @param {Object} [callbackContext] Контекст вызова callback
         */
        function Filtered(source, callback, callbackContext) {
            var _this = _super.call(this, source) || this;
            _this._callback = callback;
            _this._callbackContext = callbackContext;
            return _this;
        }
        Filtered.prototype.destroy = function () {
            this._callback = null;
            this._callbackContext = null;
            _super.prototype.destroy.call(this);
        };    // region WS.Data/Collection/IEnumerable
        // region WS.Data/Collection/IEnumerable
        Filtered.prototype.getEnumerator = function () {
            return new FilteredEnumerator_1.default(this._previous, this._callback, this._callbackContext);
        };
        return Filtered;
    }(Abstract_1.default);
    exports.default = Filtered;
    Filtered.prototype['[Data/_chain/Filtered]'] = true;
});