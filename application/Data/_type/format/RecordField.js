/// <amd-module name="Data/_type/format/RecordField" />
/**
 * Формат поля для записи.
 *
 * Создадим поле c типом "Запись":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'record'
 *    };
 * </pre>
 * @class WS.Data/Format/RecordField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/RecordField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var RecordField = /** @class */
    function (_super) {
        tslib_1.__extends(RecordField, _super);    /** @lends WS.Data/Format/RecordField.prototype */
        /** @lends WS.Data/Format/RecordField.prototype */
        function RecordField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RecordField;
    }(Field_1.default    /** @lends WS.Data/Format/RecordField.prototype */);
    /** @lends WS.Data/Format/RecordField.prototype */
    exports.default = RecordField;
    RecordField.prototype['[Data/_type/format/RecordField]'] = true;
    RecordField.prototype._moduleName = 'Data/type:format.RecordField';
    RecordField.prototype._typeName = 'Record';
});