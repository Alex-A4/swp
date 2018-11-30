/// <amd-module name="Data/_source/DataCrudMixin" />
/**
 * Миксин, совместно с WS.Data/Source/DataMixin дающий возможность обобщить логику вызова CRUD.
 * @mixin WS.Data/Source/DataCrudMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/DataCrudMixin', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var DataCrudMixin = /** @lends WS.Data/Source/DataCrudMixin.prototype */
    {
        '[Data/_source/DataCrudMixin]': true,
        _prepareCreateResult: function (data) {
            return this._getModelInstance(data);
        },
        _prepareReadResult: function (data) {
            return this._getModelInstance(data);
        },
        _prepareUpdateResult: function (data, keys) {
            var idProperty = this.getIdProperty();
            var callback = function (record, key) {
                if (key && idProperty && !record.get(idProperty)) {
                    record.set(idProperty, key);
                }
                record.acceptChanges();
            };
            if (data && data['[Data/_collection/IList]']) {
                data.each(function (record, i) {
                    callback(record, keys ? keys[i] : undefined);
                });
            } else {
                callback(data, keys);
            }
            return keys;
        },
        _prepareQueryResult: function (data) {
            return this._wrapToDataSet(data);
        }
    };
    exports.default = DataCrudMixin;
});