define('Core/Util/_Function/ShallowClone', [
    'require',
    'exports',
    'Core/Util/Object'
], function (require, exports, Object_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     *
     * Модуль, в котором описана функция <b>shallowClone(hash)</b>.
     *
     * Функция, делающая поверхностное (без клонирования вложенных объектов и массивов) копирование объекта или массива. Сделана на основе <strong>$ws.core.merge</strong>.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>hash</b> {Object|Array} - исходный объект или массив.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * Скопированный объект или массив.
     *
     * @class Core/helpers/Function/shallowClone
     * @public
     * @author Мальцев А.А.
     */
    /**
     *
     * Модуль, в котором описана функция <b>shallowClone(hash)</b>.
     *
     * Функция, делающая поверхностное (без клонирования вложенных объектов и массивов) копирование объекта или массива. Сделана на основе <strong>$ws.core.merge</strong>.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>hash</b> {Object|Array} - исходный объект или массив.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * Скопированный объект или массив.
     *
     * @class Core/helpers/Function/shallowClone
     * @public
     * @author Мальцев А.А.
     */
    function default_1(hash) {
        var result;
        if (Array.isArray(hash)) {
            result = hash.slice(0);
        } else {
            result = Object_1.merge({}, hash, {
                clone: false,
                rec: false
            });
        }
        return result;
    }
    exports.default = default_1;
});