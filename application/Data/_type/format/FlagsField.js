/// <amd-module name="Data/_type/format/FlagsField" />
/**
 * Формат поля флагов.
 *
 * Создадим поле c типом "Флаги":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'flags',
 *       dictionary: ['one', 'two', 'three']
 *    };
 * </pre>
 * @class WS.Data/Format/FlagsField
 * @extends WS.Data/Format/DictionaryField
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/FlagsField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/DictionaryField'
], function (require, exports, tslib_1, DictionaryField_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var FlagsField = /** @class */
    function (_super) {
        tslib_1.__extends(FlagsField, _super);    /** @lends WS.Data/Format/FlagsField.prototype */
        /** @lends WS.Data/Format/FlagsField.prototype */
        function FlagsField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return FlagsField;
    }(DictionaryField_1.default    /** @lends WS.Data/Format/FlagsField.prototype */);
    /** @lends WS.Data/Format/FlagsField.prototype */
    exports.default = FlagsField;
    FlagsField.prototype['[Data/_type/format/FlagsField]'] = true;
    FlagsField.prototype._moduleName = 'Data/type:format.FlagsField';
    FlagsField.prototype._typeName = 'Flags';
});