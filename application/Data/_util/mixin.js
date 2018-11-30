/// <amd-module name="Data/_util/mixin" />
/**
 * Наследование с использованием миксинов
 * @author Мальцев А.А.
 */
define('Data/_util/mixin', [
    'require',
    'exports',
    'tslib'
], function (require, exports, tslib_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Наследует статические свойства
     * @param {Function} Base Базовый класс.
     * @param {Function} Sub Класс-наследник.
     */
    /**
     * Наследует статические свойства
     * @param {Function} Base Базовый класс.
     * @param {Function} Sub Класс-наследник.
     */
    function inheritStatic(Base, Sub) {
        //Don't inherit from plain object
        if (Base === Object) {
            return;
        }
        Object.getOwnPropertyNames(Base).forEach(function (key) {
            switch (key) {
            case 'arguments':
            case 'caller':
            case 'length':
            case 'name':
            case 'prototype':
                //Skip some valuable keys of type Function
                break;
            default:
                if (!Sub.hasOwnProperty(key)) {
                    Object.defineProperty(Sub, key, Object.getOwnPropertyDescriptor(Base, key));
                }
            }
        });
    }
    function applyMixins(Sub) {
        var mixins = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            mixins[_i - 1] = arguments[_i];
        }    //FIXME: to fix behaviour of Core/core-instance::instanceOfMixin()
        //FIXME: to fix behaviour of Core/core-instance::instanceOfMixin()
        if (mixins.length && !Sub.prototype._mixins) {
            Sub.prototype._mixins = [];
        }
        mixins.forEach(function (mixin) {
            var isClass = typeof mixin === 'function';
            var proto = isClass ? mixin.prototype : mixin;
            if (isClass) {
                inheritStatic(mixin, Sub);
            }
            var inject = function (name) {
                Object.defineProperty(Sub.prototype, name, Object.getOwnPropertyDescriptor(proto, name));
            };
            Object.getOwnPropertyNames(proto).forEach(inject);
            if (Object.getOwnPropertySymbols) {
                Object.getOwnPropertySymbols(proto).forEach(inject);
            }
        });
    }
    exports.applyMixins = applyMixins;    /**
     * Создает наследника с набором миксинов
     * @param Base Базовый класс
     * @param mixins Миксины
     * @return {Function} Наследник с миксинами.
     */
    /**
     * Создает наследника с набором миксинов
     * @param Base Базовый класс
     * @param mixins Миксины
     * @return {Function} Наследник с миксинами.
     */
    function mixin(Base) {
        var mixins = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            mixins[_i - 1] = arguments[_i];
        }
        var Sub = /** @class */
        function (_super) {
            tslib_1.__extends(Sub, _super);
            function Sub() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var _this = this;
                if (Base !== Object) {
                    _this = _super.apply(this, args) || this;
                }
                return _this;
            }
            return Sub;
        }(Base);
        inheritStatic(Base, Sub);
        applyMixins.apply(void 0, [Sub].concat(mixins));
        return Sub;
    }
    exports.mixin = mixin;
});