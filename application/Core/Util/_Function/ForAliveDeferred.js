define('Core/Util/_Function/ForAliveDeferred', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Оборачивает указанную функцию в функцию, проверяющую, удалён ли указанный в аргументе control контрол.
     * Функция совместима с синтаксисиом обработчиков Deferred.
     * Если control не задан, то используется обычный this (предполагается, что функция будет вызываться на этом контроле).
     * Если контрол удалён (его метод isDestroyed() возвращает true), то функция func вызываться не будет. Вместо нее вернется результат, полученный из Deferred.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>func</b> {Function} - функция, которая будет работать только на живом контроле.</li>
     *     <li><b>[control]</b> {Lib/Control/Control} - ссылка на контрол. Если не указана, то используется this (такой вариант удобно использовать для оборачивания методов контрола).</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * {Function} Результирующая функция.
     *
     * @class Core/helpers/Function/forAliveDeferred
     * @public
     * @author Мальцев А.А.
     */
    /**
     * Оборачивает указанную функцию в функцию, проверяющую, удалён ли указанный в аргументе control контрол.
     * Функция совместима с синтаксисиом обработчиков Deferred.
     * Если control не задан, то используется обычный this (предполагается, что функция будет вызываться на этом контроле).
     * Если контрол удалён (его метод isDestroyed() возвращает true), то функция func вызываться не будет. Вместо нее вернется результат, полученный из Deferred.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>func</b> {Function} - функция, которая будет работать только на живом контроле.</li>
     *     <li><b>[control]</b> {Lib/Control/Control} - ссылка на контрол. Если не указана, то используется this (такой вариант удобно использовать для оборачивания методов контрола).</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * {Function} Результирующая функция.
     *
     * @class Core/helpers/Function/forAliveDeferred
     * @public
     * @author Мальцев А.А.
     */
    function default_1(func, control) {
        var result = function () {
            var self = control || this;
            if (self.isDestroyed()) {
                return arguments[0];
            }
            return func.apply(self, arguments);
        };
        result.wrappedFunction = func;
        return result;
    }
    exports.default = default_1;
});