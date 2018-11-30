define('Core/Util/_Number/ToRoman', [
    'require',
    'exports'
], function (require, exports) {
    /* global define */
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var boundaries = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    };    /**
     * Функция, переводящая арабское число в римское.
     *
     * Параметры:
     * <ul>
     *     <li>{Number} num Арабское число.</li>
     * </ul>
     *
     * @class Core/helpers/Number/toRoman
     * @public
     * @author Мальцев А.А.
     */
    /**
     * Функция, переводящая арабское число в римское.
     *
     * Параметры:
     * <ul>
     *     <li>{Number} num Арабское число.</li>
     * </ul>
     *
     * @class Core/helpers/Number/toRoman
     * @public
     * @author Мальцев А.А.
     */
    function toRoman(num) {
        var result = '';
        for (var key in boundaries) {
            if (boundaries.hasOwnProperty(key)) {
                while (num >= boundaries[key]) {
                    result += key;
                    num -= boundaries[key];
                }
            }
        }
        return result;
    }
    exports.default = toRoman;
});