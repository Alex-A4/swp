// / <amd-module name="Core/Util/_Function/CallAround" />
define('Core/Util/_Function/CallAround', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     *
     * Модуль, в котором описана функция <b>callAround(original, decorator)</b>.
     *
     * Метод обертки функции: вызовет вместо исходной функции оборачивающую, передав ей первым аргументом исходную, и сдвинув остальные аргументы.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>original</b> {Function}  - исходная функция, вызов которой нужно обернуть..</li>
     *     <li><b>decorator</b> {Function} - Оборачивающая функция. Первым аргументом придет original, затем - все остальные аргументы.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     *
     * {Function} Результирующая функция.
     *
     * <h2>Пример использования</h2>
     *
     * <pre>
     *    require(['Core/helpers/Function/callAround'], function(callAround) {
     *       var foo = function(bar) {
     *             console.log(`foo: ${bar}`);
     *          },
     *          fooDecorator = callAround(foo, function(original, bar) {
     *             console.log(`before foo: ${bar}`);
     *             original.call(this, bar);
     *             console.log(`after foo: ${bar}`);
     *          });
     *
     *       fooDecorator('baz');
     *       //before foo: baz
     *       //foo: baz
     *       //after foo: baz
     *    });
     * </pre>
     *
     * @class Core/helpers/Function/callAround
     * @public
     * @author Мальцев А.А.
     */
    /**
     *
     * Модуль, в котором описана функция <b>callAround(original, decorator)</b>.
     *
     * Метод обертки функции: вызовет вместо исходной функции оборачивающую, передав ей первым аргументом исходную, и сдвинув остальные аргументы.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>original</b> {Function}  - исходная функция, вызов которой нужно обернуть..</li>
     *     <li><b>decorator</b> {Function} - Оборачивающая функция. Первым аргументом придет original, затем - все остальные аргументы.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     *
     * {Function} Результирующая функция.
     *
     * <h2>Пример использования</h2>
     *
     * <pre>
     *    require(['Core/helpers/Function/callAround'], function(callAround) {
     *       var foo = function(bar) {
     *             console.log(`foo: ${bar}`);
     *          },
     *          fooDecorator = callAround(foo, function(original, bar) {
     *             console.log(`before foo: ${bar}`);
     *             original.call(this, bar);
     *             console.log(`after foo: ${bar}`);
     *          });
     *
     *       fooDecorator('baz');
     *       //before foo: baz
     *       //foo: baz
     *       //after foo: baz
     *    });
     * </pre>
     *
     * @class Core/helpers/Function/callAround
     * @public
     * @author Мальцев А.А.
     */
    function callAround(original, decorator) {
        if (arguments.length < 2) {
            decorator = original;
            original = this;
        }
        if (decorator) {
            return function () {
                Array.prototype.unshift.call(arguments, original);
                return decorator.apply(this, arguments);
            };
        }
        return original;
    }
    exports.default = callAround;
});