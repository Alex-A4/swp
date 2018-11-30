define('Core/Util/_Array/Flatten', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Модуль, в котором описана функция <b>flatten(arr)</b>.
     *
     * "Выравнивает" вложенные массивы (любого уровня вложенности), склеивая в одноуровневый массив.
     *
     *
     *
     * @param {Array} arr
     * @returns {Array}
     * @example
     * <pre>
     * flatten([1, [2], [3, [[4]]]]) => [1, 2, 3, 4]
     * </pre>
     */
    /**
     * Модуль, в котором описана функция <b>flatten(arr)</b>.
     *
     * "Выравнивает" вложенные массивы (любого уровня вложенности), склеивая в одноуровневый массив.
     *
     *
     *
     * @param {Array} arr
     * @returns {Array}
     * @example
     * <pre>
     * flatten([1, [2], [3, [[4]]]]) => [1, 2, 3, 4]
     * </pre>
     */
    function flatten(arr, skipundefined) {
        var result = [], i, ln = arr.length;
        for (i = 0; i !== ln; i++) {
            if (Array.isArray(arr[i])) {
                result = result.concat(flatten(arr[i], skipundefined));
            } else {
                if (skipundefined && arr[i] === undefined) {
                    continue;
                }
                result.push(arr[i]);
            }
        }
        return result;
    }
    exports.default = flatten;
});