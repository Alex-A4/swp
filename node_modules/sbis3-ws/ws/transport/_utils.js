define("Transport/_utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Добавляет к экземпляру Promise метод abort для обрыва запроса
     * @param {Promise.<T>} originPromise
     * @param {AbortController | Transport/AbortPromise} [abortController]
     * @return {Transport/AbortPromise.<T>}
     * @name Transport/_utils#getAbortedPromise
     */
    exports.getAbortedPromise = function (originPromise, abortController) {
        return Object.assign(originPromise, {
            abort: function () {
                if (abortController) {
                    abortController.abort();
                }
            }
        });
    };
    /**
     * Возвращает Promise.<void>, который будет выполнен через заданный промежуток времени
     * @param {Number} time
     * @return {Promise.<void>}
     * @name Transport/_utils#delay
     */
    exports.delay = function (time) { return new Promise(function (res) {
        setTimeout(res, time || 0);
    }); };
});
