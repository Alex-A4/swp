/// <amd-module name="Data/_type/adapter/RecordSet" />
/**
 * Адаптер для рекордсета.
 * Работает с данными, представленными в виде рекорда/рекордсета.
 * Примеры можно посмотреть в модулях {@link WS.Data/Adapter/RecordSetRecord} и {@link WS.Data/Adapter/RecordSetTable}.
 * @class WS.Data/Adapter/RecordSet
 * @extends WS.Data/Adapter/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/adapter/RecordSet', [
    'require',
    'exports',
    'tslib',
    'Data/_type/adapter/Abstract',
    'Data/_type/adapter/RecordSetTable',
    'Data/_type/adapter/RecordSetRecord',
    'Data/util'
], function (require, exports, tslib_1, Abstract_1, RecordSetTable_1, RecordSetRecord_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var RecordSet = /** @class */
    function (_super) {
        tslib_1.__extends(RecordSet, _super);    /** @lends WS.Data/Adapter/RecordSet.prototype */
        /** @lends WS.Data/Adapter/RecordSet.prototype */
        function RecordSet() {
            return _super !== null && _super.apply(this, arguments) || this;
        }    /**
         * Возвращает интерфейс доступа к рекордсету в виде таблицы
         * @param {WS.Data/Collection/RecordSet} data Рекордсет
         * @return {WS.Data/Adapter/ITable}
         */
        /**
         * Возвращает интерфейс доступа к рекордсету в виде таблицы
         * @param {WS.Data/Collection/RecordSet} data Рекордсет
         * @return {WS.Data/Adapter/ITable}
         */
        RecordSet.prototype.forTable = function (data) {
            return new RecordSetTable_1.default(data);
        };    /**
         * Возвращает интерфейс доступа к record-у в виде записи
         * @param {WS.Data/Entity/Record} data Запись
         * @param {WS.Data/Collection/RecordSet} [tableData] Таблица
         * @return {WS.Data/Adapter/IRecord}
         */
        /**
         * Возвращает интерфейс доступа к record-у в виде записи
         * @param {WS.Data/Entity/Record} data Запись
         * @param {WS.Data/Collection/RecordSet} [tableData] Таблица
         * @return {WS.Data/Adapter/IRecord}
         */
        RecordSet.prototype.forRecord = function (data, tableData) {
            return new RecordSetRecord_1.default(data, tableData);
        };
        RecordSet.prototype.getProperty = function (data, property) {
            return util_1.object.getPropertyValue(data, property);
        };
        RecordSet.prototype.setProperty = function (data, property, value) {
            return util_1.object.setPropertyValue(data, property, value);
        };
        RecordSet.prototype.getKeyField = function (data) {
            if (data && typeof data.getIdProperty === 'function') {
                return data.getIdProperty();
            }
            return undefined;
        };
        return RecordSet;
    }(Abstract_1.default    /** @lends WS.Data/Adapter/RecordSet.prototype */);
    /** @lends WS.Data/Adapter/RecordSet.prototype */
    exports.default = RecordSet;
    RecordSet.prototype['[Data/_type/adapter/RecordSet]'] = true;
    RecordSet.prototype._moduleName = 'Data/type:adapter.RecordSet';
    util_1.di.register('Data/type:adapter.RecordSet', RecordSet, { instantiate: false });
});