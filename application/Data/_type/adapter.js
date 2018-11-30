/// <amd-module name="Data/_type/adapter" />
/**
 * Adapters library.
 * @library Data/_type/adapter
 * @includes Abstract Data/_type/adapter/Abstract
 * @includes Cow Data/_type/adapter/Cow
 * @includes CowRecord Data/_type/adapter/CowRecord
 * @includes CowTable Data/_type/adapter/CowTable
 * @includes Json Data/_type/adapter/Json
 * @includes JsonRecord Data/_type/adapter/JsonRecord
 * @includes JsonTable Data/_type/adapter/JsonTable
 * @includes IAdapter Data/_type/adapter/IAdapter
 * @includes IDecorator Data/_type/adapter/IDecorator
 * @includes IMetaData Data/_type/adapter/IMetaData
 * @includes IRecord Data/_type/adapter/IRecord
 * @includes ITable Data/_type/adapter/ITable
 * @includes RecordSet Data/_type/adapter/RecordSet
 * @includes RecordSetRecord Data/_type/adapter/RecordSetRecord
 * @includes RecordSetTable Data/_type/adapter/RecordSetTable
 * @includes Sbis Data/_type/adapter/Sbis
 * @includes SbisFieldType Data/_type/adapter/SbisFieldType
 * @includes SbisRecord Data/_type/adapter/SbisRecord
 * @includes SbisTable Data/_type/adapter/SbisTable
 * @author Мальцев А.А.
 */
define('Data/_type/adapter', [
    'require',
    'exports',
    'Data/_type/adapter/Abstract',
    'Data/_type/adapter/Cow',
    'Data/_type/adapter/GenericFormatMixin',
    'Data/_type/adapter/Json',
    'Data/_type/adapter/IAdapter',
    'Data/_type/adapter/IMetaData',
    'Data/_type/adapter/IRecord',
    'Data/_type/adapter/ITable',
    'Data/_type/adapter/RecordSet',
    'Data/_type/adapter/RecordSetRecord',
    'Data/_type/adapter/RecordSetTable',
    'Data/_type/adapter/Sbis',
    'Data/_type/adapter/SbisFieldType',
    'Data/_type/adapter/SbisRecord',
    'Data/_type/adapter/SbisTable'
], function (require, exports, Abstract_1, Cow_1, GenericFormatMixin_1, Json_1, IAdapter_1, IMetaData_1, IRecord_1, ITable_1, RecordSet_1, RecordSetRecord_1, RecordSetTable_1, Sbis_1, SbisFieldType_1, SbisRecord_1, SbisTable_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Abstract = Abstract_1.default;
    exports.Cow = Cow_1.default;
    exports.GenericFormatMixin = GenericFormatMixin_1.default;
    exports.Json = Json_1.default;
    exports.IAdapter = IAdapter_1.default;
    exports.IMetaData = IMetaData_1.default;
    exports.IRecord = IRecord_1.default;
    exports.ITable = ITable_1.default;
    exports.RecordSet = RecordSet_1.default;
    exports.RecordSetRecord = RecordSetRecord_1.default;
    exports.RecordSetTable = RecordSetTable_1.default;
    exports.Sbis = Sbis_1.default;
    exports.SbisFieldType = SbisFieldType_1.default;
    exports.SbisRecord = SbisRecord_1.default;
    exports.SbisTable = SbisTable_1.default;
});