/// <amd-module name="Data/_type/adapter/JsonRecord" />
/**
 * Адаптер для записи таблицы данных в формате JSON
 * Работает с данными, представленными в виде объекта (Object).
 *
 * Создадим адаптер для записи:
 * <pre>
 *    var adapter = new JsonRecord({
 *       id: 1,
 *       title: 'Test'
 *    });
 *    adapter.get('title');//'Test'
 * </pre>
 * @class WS.Data/Adapter/JsonRecord
 * @extends WS.Data/Entity/Abstract
 * @implements WS.Data/Adapter/IRecord
 * @mixes WS.Data/Adapter/GenericFormatMixin
 * @mixes WS.Data/Adapter/JsonFormatMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/adapter/JsonRecord', [
    'require',
    'exports',
    'tslib',
    'Data/_type/Abstract',
    'Data/_type/adapter/GenericFormatMixin',
    'Data/_type/adapter/JsonFormatMixin',
    'Data/_type/format',
    'Data/util'
], function (require, exports, tslib_1, Abstract_1, GenericFormatMixin_1, JsonFormatMixin_1, format_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var JsonRecord = /** @class */
    function (_super) {
        tslib_1.__extends(JsonRecord, _super);    /**
         * Конструктор
         * @param {*} data Сырые данные
         */
        /**
         * Конструктор
         * @param {*} data Сырые данные
         */
        function JsonRecord(data) {
            var _this = _super.call(this, data) || this;
            GenericFormatMixin_1.default.constructor.call(_this, data);
            JsonFormatMixin_1.default.constructor.call(_this, data);
            return _this;
        }    //endregion IRecord
             //region WS.Data/Adapter/JsonFormatMixin
        //endregion IRecord
        //region WS.Data/Adapter/JsonFormatMixin
        JsonRecord.prototype.addField = function (format, at) {
            if (!format || !(format instanceof format_1.Field)) {
                throw new TypeError(this._moduleName + '::addField(): argument "format" should be an instance of Data/type:format.Field');
            }
            var name = format.getName();
            if (this.has(name)) {
                throw new Error(this._moduleName + '::addField(): field "' + name + '" already exists');
            }
            JsonFormatMixin_1.default.addField.call(this, format, at);
            this.set(name, format.getDefaultValue());
        };
        JsonRecord.prototype.removeField = function (name) {
            JsonFormatMixin_1.default.removeField.call(this, name);
            delete this._data[name];
        };    //endregion WS.Data/Adapter/JsonFormatMixin
              //region Public methods
        //endregion WS.Data/Adapter/JsonFormatMixin
        //region Public methods
        JsonRecord.prototype.has = function (name) {
            return this._isValidData() ? this._data.hasOwnProperty(name) : false;
        };
        JsonRecord.prototype.get = function (name) {
            return this._isValidData() ? this._data[name] : undefined;
        };
        JsonRecord.prototype.set = function (name, value) {
            if (!name) {
                throw new ReferenceError(this._moduleName + '::set(): field name is not defined');
            }
            this._touchData();
            this._data[name] = value;
        };
        JsonRecord.prototype.clear = function () {
            this._touchData();
            var keys = Object.keys(this._data);
            var count = keys.length;
            for (var i = 0; i < count; i++) {
                delete this._data[keys[i]];
            }
        };
        JsonRecord.prototype.getFields = function () {
            return this._isValidData() ? Object.keys(this._data) : [];
        };
        JsonRecord.prototype.getKeyField = function () {
            return undefined;
        };    //endregion Public methods
              //region Protected methods
        //endregion Public methods
        //region Protected methods
        JsonRecord.prototype._has = function (name) {
            return this.has(name);
        };
        return JsonRecord;
    }(util_1.mixin(Abstract_1.default, GenericFormatMixin_1.default, JsonFormatMixin_1.default));
    exports.default = JsonRecord;
    JsonRecord.prototype['[Data/_type/adapter/JsonRecord]'] = true;    // @ts-ignore
    // @ts-ignore
    JsonRecord.prototype['[Data/_type/adapter/IRecord]'] = true;
    JsonRecord.prototype._data = null;
});