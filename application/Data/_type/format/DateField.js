/// <amd-module name="Data/_type/format/DateField" />
/**
 * Формат поля для даты.
 *
 * Создадим поле c типом "Дата":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'date'
 *    };
 * </pre>
 * @class WS.Data/Format/DateField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/DateField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field',
    'Core/helpers/Date/toSql'
], function (require, exports, tslib_1, Field_1, toSql) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var DateField = /** @class */
    function (_super) {
        tslib_1.__extends(DateField, _super);    /** @lends WS.Data/Format/DateField.prototype */
        /** @lends WS.Data/Format/DateField.prototype */
        function DateField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }    //region Public methods
        //region Public methods
        DateField.prototype.getDefaultValue = function () {
            if (this._$defaultValue instanceof Date) {
                return toSql(this._$defaultValue, toSql.MODE_DATE);
            }
            return this._$defaultValue;
        };
        return DateField;
    }(Field_1.default    /** @lends WS.Data/Format/DateField.prototype */);
    /** @lends WS.Data/Format/DateField.prototype */
    exports.default = DateField;
    DateField.prototype['[Data/_type/format/DateField]'] = true;
    DateField.prototype._moduleName = 'Data/type:format.DateField';
    DateField.prototype._typeName = 'Date';
});