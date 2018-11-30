/// <amd-module name="Data/_collection/factory/recordSet" />
/**
 * Фабрика для получения рекордсета из WS.Data/Collection/IEnumerable.
 * @class WS.Data/Collection/Factory/RecordSet
 * @public
 * @author Мальцев А.А.
 */
define('Data/_collection/factory/recordSet', [
    'require',
    'exports',
    'Data/util'
], function (require, exports, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * @alias WS.Data/Collection/Factory/RecordSet
     * @param {WS.Data/Collection/IEnumerable.<WS.Data/Entity/Record>} items Коллекция записей
     * @param {Object} [options] Опции конструктора рекордсета
     * @return {WS.Data/Collection/RecordSet}
     */
    /**
     * @alias WS.Data/Collection/Factory/RecordSet
     * @param {WS.Data/Collection/IEnumerable.<WS.Data/Entity/Record>} items Коллекция записей
     * @param {Object} [options] Опции конструктора рекордсета
     * @return {WS.Data/Collection/RecordSet}
     */
    function recordSet(items, options) {
        if (!items || !items['[Data/_collection/IEnumerable]']) {
            throw new TypeError('Argument "items" should implement Data/collection:IEnumerable');
        }
        var Factory = util_1.di.resolve(util_1.di.isRegistered('collection.$recordset') ? 'collection.$recordset' : 'Data/collection:RecordSet');
        options = options || {};
        delete options.rawData;
        var result = new Factory(options);
        items.each(function (item) {
            result.add(item);
        });
        return result;
    }
    exports.default = recordSet;
});