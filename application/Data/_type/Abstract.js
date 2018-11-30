/// <amd-module name="Data/_type/Abstract" />
/**
 * Абстрактная сущность.
 * Явлется прототипом большинства сущностей.
 * Обладает аспектом состояния "экземпляр разрушен".
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class WS.Data/Entity/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/Abstract', [
    'require',
    'exports',
    'Data/util'
], function (require, exports, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var $destroyed = util_1.protect('destroyed');
    function dontTouchDeads() {
        throw new ReferenceError('This class instance is destroyed.');
    }
    var Abstract    /** @lends WS.Data/Entity/Abstract.prototype */ = /** @lends WS.Data/Entity/Abstract.prototype */
    /** @class */
    function () {
        function Abstract() {
        }
        Object.defineProperty(Abstract.prototype, 'destroyed', {
            /**
             * Экземпляр был разрушен
             */
            get: function () {
                return Boolean(this[$destroyed]);
            },
            enumerable: true,
            configurable: true
        });    /**
         * Разрушает экземпляр
         */
        /**
         * Разрушает экземпляр
         */
        Abstract.prototype.destroy = function () {
            this[$destroyed] = true;
            for (var key in this) {
                switch (key) {
                case 'destroy':
                case 'destroyed':
                case 'isDestroyed':
                    break;
                default:
                    if (typeof this[key] === 'function') {
                        this[key] = dontTouchDeads;
                    }
                }
            }
        };    //FIXME: deprecated
        //FIXME: deprecated
        Abstract.prototype.isDestroyed = function () {
            return this.destroyed;
        };
        return Abstract;
    }();
    exports.default = Abstract;
    Abstract.prototype['[Data/_type/Abstract]'] = true;
});