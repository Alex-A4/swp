/// <amd-module name="Data/_chain/MappedEnumerator" />
/**
 * Преобразующующий энумератор
 * @author Мальцев А.А.
 */
define('Data/_chain/MappedEnumerator', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var MappedEnumerator = /** @class */
    function () {
        /**
         * Конструктор преобразующего энумератора.
         * @param {WS.Data/Chain/Abstract} previous Предыдущее звено.
         * @param {Function(*, Number): *} callback Функция, возвращающая новый элемент.
         * @param {Object} [callbackContext] Контекст вызова callback
         */
        function MappedEnumerator(previous, callback, callbackContext) {
            this['[Data/_collection/IEnumerator]'] = true;
            this.previous = previous;
            this.callback = callback;
            this.callbackContext = callbackContext;
            this.reset();
        }
        MappedEnumerator.prototype.getCurrent = function () {
            return this.current;
        };
        MappedEnumerator.prototype.getCurrentIndex = function () {
            return this.enumerator.getCurrentIndex();
        };
        MappedEnumerator.prototype.moveNext = function () {
            if (this.enumerator.moveNext()) {
                this.current = this.callback.call(this.callbackContext, this.enumerator.getCurrent(), this.enumerator.getCurrentIndex());
                return true;
            }
            return false;
        };
        MappedEnumerator.prototype.reset = function () {
            this.enumerator = this.previous.getEnumerator();
            this.current = undefined;
        };
        return MappedEnumerator;
    }();
    exports.default = MappedEnumerator;    // @ts-ignore
    // @ts-ignore
    MappedEnumerator.prototype.previous = null;    // @ts-ignore
    // @ts-ignore
    MappedEnumerator.prototype.callback = null;    // @ts-ignore
    // @ts-ignore
    MappedEnumerator.prototype.callbackContext = null;    // @ts-ignore
    // @ts-ignore
    MappedEnumerator.prototype.enumerator = null;    // @ts-ignore
    // @ts-ignore
    MappedEnumerator.prototype.current = null;
});