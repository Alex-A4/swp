/// <amd-module name="Data/_type/VersionableMixin" />
/**
 * Миксин, позволяющий получать и измениять номер версии объекта.
 * @mixin WS.Data/Entity/VersionableMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/VersionableMixin', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var VersionableMixin = /** @lends WS.Data/Entity/VersionableMixin.prototype */
    {
        '[Data/_type/VersionableMixin]': true,
        //region IVersionable
        _version: 0,
        getVersion: function () {
            return this._version;
        },
        _nextVersion: function () {
            this._version++;
            if (this['[Data/_type/ManyToManyMixin]']) {
                this._getMediator().belongsTo(this, function (parent) {
                    if (parent && parent['[Data/_type/IVersionable]']) {
                        parent._nextVersion();
                    }
                });
            }
        }    //endregion IVersionable
    };
    //endregion IVersionable
    exports.default = VersionableMixin;
});