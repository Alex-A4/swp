/// <amd-module name="Data/_type/format/BinaryField" />
/**
 * Формат двоичного поля.
 *
 * Создадим поле двоичного типа:
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'binary'
 *    };
 * </pre>
 * @class WS.Data/Format/BinaryField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/BinaryField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var BinaryField = /** @class */
    function (_super) {
        tslib_1.__extends(BinaryField, _super);    /** @lends WS.Data/Format/BinaryField.prototype */
        /** @lends WS.Data/Format/BinaryField.prototype */
        function BinaryField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return BinaryField;
    }(Field_1.default    /** @lends WS.Data/Format/BinaryField.prototype */);
    /** @lends WS.Data/Format/BinaryField.prototype */
    exports.default = BinaryField;
    BinaryField.prototype['[Data/_type/format/BinaryField]'] = true;
    BinaryField.prototype._moduleName = 'Data/type:format.BinaryField';
    BinaryField.prototype._typeName = 'Binary';
});