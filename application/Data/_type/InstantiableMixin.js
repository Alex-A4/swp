/// <amd-module name="Data/_type/InstantiableMixin" />
/**
 * Миксин, позволяющий генерировать уникальный (в рамках миксина) идентификатор для каждого экземпляра класса.
 * @mixin WS.Data/Entity/InstantiableMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/InstantiableMixin', [
    'require',
    'exports',
    'Core/constants'
], function (require, exports, constants) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var MAX_VALUE = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;
    var counter = 0;
    var InstantiableMixin = /** @lends WS.Data/Entity/InstantiableMixin.prototype */
    {
        '[Data/_type/InstantiableMixin]': true,
        /**
         * @property {String} Префикс значений идентификатора
         */
        _instancePrefix: 'id-',
        /**
         * @property {String} Уникальный идентификатор
         */
        _instanceId: '',
        //region IInstantiable
        getInstanceId: function () {
            if (counter >= MAX_VALUE) {
                counter = 0;
            }
            return this._instanceId || (this._instanceId = (constants.isBrowserPlatform ? 'client-' : 'server-') + this._instancePrefix + counter++);
        }    //endregion IInstantiable
    };    //Deprecated methods
          // @ts-ignore
    //endregion IInstantiable
    //Deprecated methods
    // @ts-ignore
    InstantiableMixin.getHash = InstantiableMixin.getInstanceId;
    exports.default = InstantiableMixin;
});