/// <amd-module name="Data/_type/format/UuidField" />
/**
 * Формат поля UUID.
 *
 * Создадим поле c типом "UUID":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'uuid'
 *    };
 * </pre>
 * @class WS.Data/Format/UuidField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/UuidField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var UuidField = /** @class */
    function (_super) {
        tslib_1.__extends(UuidField, _super);    /** @lends WS.Data/Format/UuidField.prototype */
        /** @lends WS.Data/Format/UuidField.prototype */
        function UuidField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return UuidField;
    }(Field_1.default    /** @lends WS.Data/Format/UuidField.prototype */);
    /** @lends WS.Data/Format/UuidField.prototype */
    exports.default = UuidField;
    UuidField.prototype['[Data/_type/format/UuidField]'] = true;
    UuidField.prototype._moduleName = 'Data/type:format.UuidField';
    UuidField.prototype._typeName = 'Uuid';
});