/**
 *
 * Модуль, в котором описана функция <b>callBefore(original, decorator)</b>.
 *
 * Метод обертки функции: вызовет перед исходной функцией дополнительную.
 * Если дополнительная функция вернула результат, отличный от undefined, то он будет добавлен последним аргументом при вызове исходной.
 *
 * <h2>Параметры функции</h2>
 * <ul>
 *     <li><b>original</b> {Function} - исходная функция, вызов которой нужно обернуть.</li>
 *     <li><b>decorator</b> {Function} - Дополнительная функция, которая будет вызвана перед исходной.</li>
 *     <li><b>[context]</b> {Object} - Контекст, в котором будет выполняться predicate.</li>
 * </ul>
 *
 * <h2>Возвращает</h2>
 * {Function} Результирующая функция.
 *
 * <h2>Пример использования</h2>
 * <pre>
 *    require(['Core/helpers/Function/callBefore'], function(callBefore) {
 *       var foo = function(bar) {
 *             console.log(`foo: ${bar}`);
 *          },
 *          fooDecorator = callBefore(foo, function(bar) {
 *             console.log(`before foo: ${bar}`);
 *          });
 *
 *       fooDecorator('baz');
 *       //before foo: baz
 *       //foo: baz
 *    });
 * </pre>
 *
 * @class Core/helpers/Function/callBefore
 * @public
 * @author Мальцев А.А.
 */
define('Core/Util/_Function/CallBefore', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function callBefore(original, decorator) {
        if (arguments.length < 2) {
            decorator = original;
            original = this;
        }
        if (decorator) {
            return function () {
                var res = decorator.apply(this, arguments);
                if (res !== undefined) {
                    Array.prototype.push.call(arguments, res);
                }
                return original.apply(this, arguments);
            };
        }
        return original;
    }
    exports.default = callBefore;
});