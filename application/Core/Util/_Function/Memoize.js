define('Core/Util/_Function/Memoize', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
      * Возвращает функцию, запоминающую результат первого вызова оборачиваемого метода объекта и возврашающую при повторных вызовах единожды вычисленный результат.
      *
      * <h2>Параметры функции</h2>
      * <ul>
      *     <li><b>func</b> {Function} - Метод, результат вызова которого будет запомнен.</li>
      *     <li><b>cachedFuncName</b> {String} - Имя метода в экземпляре объекта, которому он принадлежит.</li>
      * </ul>
      *
      * <h2>Возвращает</h2>
      * {Function} Результирующая функция.
      *
      * @class Core/helpers/Function/memoize
      * @public
      * @author Мальцев А.А.
      */
    /**
      * Возвращает функцию, запоминающую результат первого вызова оборачиваемого метода объекта и возврашающую при повторных вызовах единожды вычисленный результат.
      *
      * <h2>Параметры функции</h2>
      * <ul>
      *     <li><b>func</b> {Function} - Метод, результат вызова которого будет запомнен.</li>
      *     <li><b>cachedFuncName</b> {String} - Имя метода в экземпляре объекта, которому он принадлежит.</li>
      * </ul>
      *
      * <h2>Возвращает</h2>
      * {Function} Результирующая функция.
      *
      * @class Core/helpers/Function/memoize
      * @public
      * @author Мальцев А.А.
      */
    var memoize = function (func, cachedFuncName) {
        var wrapFn = function memoFirst() {
            var res = func.call(this), cached = function memoCached() {
                    return res;
                };
            cached.reset = function () {
                addToMemoized(this, cachedFuncName, wrapFn);
                res = undefined;
            }.bind(this);
            addToMemoized(this, cachedFuncName, cached);
            return res;
        };
        wrapFn.reset = function () {
        };
        wrapFn.wrappedFunction = func;
        return wrapFn;
    };
    var addToMemoized = function (instance, name, impl) {
        instance[name] = impl;
        var memoizedMethods = instance._memoizedMethods || (instance._memoizedMethods = []);
        if (memoizedMethods.indexOf(name) === -1) {
            memoizedMethods.push(name);
        }
    };
    var clearMemoized = function (instance) {
        if (instance._memoizedMethods) {
            instance._memoizedMethods.forEach(function (name) {
                if (instance[name] && instance[name].reset) {
                    instance[name].reset();
                }
            });
        }
        delete instance._memoizedMethods;
    };
    memoize.clear = clearMemoized;
    exports.default = memoize;
});