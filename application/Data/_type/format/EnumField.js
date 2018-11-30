/// <amd-module name="Data/_type/format/EnumField" />
/**
 * Формат перечисляемого поля.
 *
 * Создадим поле c типом "Перечисляемое":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'enum',
 *       dictionary: ['one', 'two', 'three']
 *    };
 * </pre>
 * @class WS.Data/Format/EnumField
 * @extends WS.Data/Format/DictionaryField
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/EnumField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/DictionaryField'
], function (require, exports, tslib_1, DictionaryField_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var EnumField = /** @class */
    function (_super) {
        tslib_1.__extends(EnumField, _super);    /** @lends WS.Data/Format/EnumField.prototype */
        /** @lends WS.Data/Format/EnumField.prototype */
        function EnumField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return EnumField;
    }(DictionaryField_1.default    /** @lends WS.Data/Format/EnumField.prototype */);
    /** @lends WS.Data/Format/EnumField.prototype */
    exports.default = EnumField;
    EnumField.prototype['[Data/_type/format/EnumField]'] = true;
    EnumField.prototype._moduleName = 'Data/type:format.EnumField';
    EnumField.prototype._typeName = 'Enum';
});