define('Core/Util/_Array/Uniq', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Модуль, в котором описана функция <b>uniq(array)</b>.
     *
     * Функция корректно работает только со значениями, не являющимися объектами. При сравнении значений используется нестрогий алгоритм (==).
     * Возвращает уникальный массив.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *   <li><b>array</b> {Array} - исходный массив.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * Возвращает массив, содержащий уникальные элементы из исходного массива. Порядок элементов при этом сохраняется.
     *
     * <h2>Пример использования</h2>
     * <pre>
     *    require(['Core/helpers/Array/uniq'], function(uniqArray) {
     *       // [1, 2, 3, 4, 5]
     *       console.log(uniqArray([1, 2, 3, 4, 3, 2, 5, 1]));
     *    });
     * </pre>
     *
     * @class Core/helpers/Array/uniq
     * @public
     * @author Мальцев А.А.
     */
    /**
     * Модуль, в котором описана функция <b>uniq(array)</b>.
     *
     * Функция корректно работает только со значениями, не являющимися объектами. При сравнении значений используется нестрогий алгоритм (==).
     * Возвращает уникальный массив.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *   <li><b>array</b> {Array} - исходный массив.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * Возвращает массив, содержащий уникальные элементы из исходного массива. Порядок элементов при этом сохраняется.
     *
     * <h2>Пример использования</h2>
     * <pre>
     *    require(['Core/helpers/Array/uniq'], function(uniqArray) {
     *       // [1, 2, 3, 4, 5]
     *       console.log(uniqArray([1, 2, 3, 4, 3, 2, 5, 1]));
     *    });
     * </pre>
     *
     * @class Core/helpers/Array/uniq
     * @public
     * @author Мальцев А.А.
     */
    function uniq(array) {
        if (!Array.isArray(array)) {
            throw new TypeError('Invalid type of the first argument. Array expected.');
        }
        var cache = {};
        return array.reduce(function (prev, curr) {
            if (!cache.hasOwnProperty(curr)) {
                cache[curr] = true;
                prev.push(curr);
            }
            return prev;
        }, []);
    }
    exports.default = uniq;
});