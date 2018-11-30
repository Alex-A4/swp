define('Core/Util/_Function/RunDelayed', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Модуль, в котором описана функция <b>runDelayed(fn)</b>.
     *
     * Метод Вызывает функцию асинхронно, через requestAnimationFrame, или на крайний случай setTimeout
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>fn</b> {Function} - исходная функция, вызов которой нужно асинхронно.</li>
     * </ul>
     *
     * @class Core/helpers/Function/runDelayed
     * @public
     * @author Мальцев А.А.
     */
    /**
     * Модуль, в котором описана функция <b>runDelayed(fn)</b>.
     *
     * Метод Вызывает функцию асинхронно, через requestAnimationFrame, или на крайний случай setTimeout
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>fn</b> {Function} - исходная функция, вызов которой нужно асинхронно.</li>
     * </ul>
     *
     * @class Core/helpers/Function/runDelayed
     * @public
     * @author Мальцев А.А.
     */
    function runDelayed(fn) {
        var win = typeof window !== 'undefined' ? window : null;
        if (win && win.requestAnimationFrame) {
            win.requestAnimationFrame(fn);
        } else {
            setTimeout(fn, 0);
        }
    }
    exports.default = runDelayed;
});