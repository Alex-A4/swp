/// <amd-module name="Data/_type/format/BooleanField" />
/**
 * Формат логического поля.
 *
 * Создадим поле логического типа:
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'boolean'
 *    };
 * </pre>
 * @class WS.Data/Format/BooleanField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/BooleanField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var BooleanField = /** @class */
    function (_super) {
        tslib_1.__extends(BooleanField, _super);    /** @lends WS.Data/Format/BooleanField.prototype */
        /** @lends WS.Data/Format/BooleanField.prototype */
        function BooleanField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return BooleanField;
    }(Field_1.default    /** @lends WS.Data/Format/BooleanField.prototype */);
    /** @lends WS.Data/Format/BooleanField.prototype */
    exports.default = BooleanField;
    BooleanField.prototype['[Data/_type/format/BooleanField]'] = true;
    BooleanField.prototype._moduleName = 'Data/type:format.BooleanField';
    BooleanField.prototype._typeName = 'Boolean';
});