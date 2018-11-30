/// <amd-module name="Data/_chain/Mapped" />
/**
 * Преобразующее звено цепочки.
 * @class WS.Data/Chain/Mapped
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Mapped', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract',
    'Data/_chain/MappedEnumerator'
], function (require, exports, tslib_1, Abstract_1, MappedEnumerator_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Mapped = /** @class */
    function (_super) {
        tslib_1.__extends(Mapped, _super);    /** @lends WS.Data/Chain/Mapped.prototype */
                                              /**
         * Конструктор преобразующего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {Function(*, Number): *} callback Функция, возвращающая новый элемент.
         * @param {Object} [callbackContext] Контекст вызова callback
         */
        /** @lends WS.Data/Chain/Mapped.prototype */
        /**
         * Конструктор преобразующего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {Function(*, Number): *} callback Функция, возвращающая новый элемент.
         * @param {Object} [callbackContext] Контекст вызова callback
         */
        function Mapped(source, callback, callbackContext) {
            var _this = _super.call(this, source) || this;
            _this._callback = callback;
            _this._callbackContext = callbackContext;
            return _this;
        }
        Mapped.prototype.destroy = function () {
            this._callback = null;
            this._callbackContext = null;
            _super.prototype.destroy.call(this);
        };    // region Data/_collection/IEnumerable
        // region Data/_collection/IEnumerable
        Mapped.prototype.getEnumerator = function () {
            return new MappedEnumerator_1.default(this._previous, this._callback, this._callbackContext);
        };
        return Mapped;
    }(Abstract_1.default);
    exports.default = Mapped;
    Mapped.prototype['[Data/_chain/Mapped]'] = true;    // @ts-ignore
    // @ts-ignore
    Mapped.prototype._callback = null;    // @ts-ignore
    // @ts-ignore
    Mapped.prototype._callbackContext = null;
});