/// <amd-module name="Data/_type/adapter/SbisFieldType" />
/**
 * @class WS.Data/Adapter/SbisFieldType
 * @description Класс используют, чтобы для строкового названия типа данных WS получить соответствующее ему строковое название типа данных, которое применяется в серверном фреймворке.
 * @remark Строковые названия типов данных WS:
 * <ul>
 *     <li>integer. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/IntegerField/ WS.Data/Format/IntegerField};</li>
 *     <li>money. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/MoneyField/ WS.Data/Format/MoneyField};</li>
 *     <li>array. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/ArrayField/ WS.Data/Format/ArrayField};</li>
 *     <li>binary. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/BinaryField/ WS.Data/Format/BinaryField};</li>
 *     <li>boolean. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/BooleanField/ WS.Data/Format/BooleanField};</li>
 *     <li>date. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/MoneyField/ WS.Data/Format/MoneyField};</li>
 *     <li>dateTime. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/DateTimeField/ WS.Data/Format/DateTimeField};</li>
 *     <li>dictionary. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/DictionaryField/ WS.Data/Format/DictionaryField};</li>
 *     <li>enum. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/EnumField/ WS.Data/Format/EnumField};</li>
 *     <li>flags. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/FlagsField/ WS.Data/Format/FlagsField};</li>
 *     <li>identity. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/IdentityField/ WS.Data/Format/IdentityField};</li>
 *     <li>object. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/ObjectField/ WS.Data/Format/ObjectField};</li>
 *     <li>real. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/RealField/ WS.Data/Format/RealField};</li>
 *     <li>record. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/RecordField/ WS.Data/Format/RecordField};</li>
 *     <li>recordset. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/RecordSetField/ WS.Data/Format/RecordSetField};</li>
 *     <li>rpcfile. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/RpcFileField/ WS.Data/Format/RpcFileField};</li>
 *     <li>string. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/StringField/ WS.Data/Format/StringField};</li>
 *     <li>time. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/TimeField/ WS.Data/Format/TimeField};</li>
 *     <li>uuid. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/UuidField/ WS.Data/Format/UuidField};</li>
 *     <li>timeinterval. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/TimeIntervalField/ WS.Data/Format/TimeIntervalField};</li>
 *     <li>xml. Описывается классом {@link https://wi.sbis.ru/docs/js/WS/Data/Format/XmlField/ WS.Data/Format/XmlField}.</li>
 *
 * </pre>
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/adapter/SbisFieldType', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var SbisFieldType = {
        'boolean': 'Логическое',
        integer: 'Число целое',
        real: 'Число вещественное',
        money: 'Деньги',
        string: 'Строка',
        xml: 'XML-файл',
        datetime: 'Дата и время',
        date: 'Дата',
        time: 'Время',
        timeinterval: 'Временной интервал',
        link: 'Связь',
        identity: 'Идентификатор',
        'enum': 'Перечисляемое',
        flags: 'Флаги',
        record: 'Запись',
        recordset: 'Выборка',
        binary: 'Двоичное',
        uuid: 'UUID',
        rpcfile: 'Файл-rpc',
        object: 'JSON-объект',
        array: 'Массив'
    };
    exports.default = SbisFieldType;
});