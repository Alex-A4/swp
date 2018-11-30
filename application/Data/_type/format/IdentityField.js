/// <amd-module name="Data/_type/format/IdentityField" />
/**
 * Формат поля для идентификатора.
 *
 * Создадим поле c типом "Идентификатор":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'identity'
 *    };
 * </pre>
 * @class WS.Data/Format/IdentityField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/IdentityField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var IdentityField = /** @class */
    function (_super) {
        tslib_1.__extends(IdentityField, _super);    /** @lends WS.Data/Format/IdentityField.prototype */
        /** @lends WS.Data/Format/IdentityField.prototype */
        function IdentityField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }    //region Public methods
             /**
         * Возвращает разделитель
         * @return {String}
         */
        //region Public methods
        /**
         * Возвращает разделитель
         * @return {String}
         */
        IdentityField.prototype.getSeparator = function () {
            return this._separator;
        };
        return IdentityField;
    }(Field_1.default    /** @lends WS.Data/Format/IdentityField.prototype */);
    /** @lends WS.Data/Format/IdentityField.prototype */
    exports.default = IdentityField;
    IdentityField.prototype['[Data/_type/format/IdentityField]'] = true;
    IdentityField.prototype._moduleName = 'Data/type:format.IdentityField';
    IdentityField.prototype._typeName = 'Identity';
    IdentityField.prototype._separator = ',';
    IdentityField.prototype._$defaultValue = [null];
});