/// <amd-module name="Data/_type/format/IntegerField" />
/**
 * Формат целочисленного поля.
 *
 * Создадим поле челочисленного типа:
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'integer'
 *    };
 * </pre>
 * @class WS.Data/Format/IntegerField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/IntegerField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var IntegerField = /** @class */
    function (_super) {
        tslib_1.__extends(IntegerField, _super);    /** @lends WS.Data/Format/IntegerField.prototype */
        /** @lends WS.Data/Format/IntegerField.prototype */
        function IntegerField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return IntegerField;
    }(Field_1.default    /** @lends WS.Data/Format/IntegerField.prototype */);
    /** @lends WS.Data/Format/IntegerField.prototype */
    exports.default = IntegerField;
    IntegerField.prototype['[Data/_type/format/IntegerField]'] = true;
    IntegerField.prototype._moduleName = 'Data/type:format.IntegerField';
    IntegerField.prototype._typeName = 'Integer';
    IntegerField.prototype._$defaultValue = 0;
});