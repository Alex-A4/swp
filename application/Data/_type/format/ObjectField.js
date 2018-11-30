/// <amd-module name="Data/_type/format/ObjectField" />
/**
 * Формат поля для JSON-объекта.
 *
 * Создадим поле c типом "JSON-объект":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'object'
 *    };
 * </pre>
 * @class WS.Data/Format/ObjectField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/ObjectField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var ObjectField = /** @class */
    function (_super) {
        tslib_1.__extends(ObjectField, _super);    /** @lends WS.Data/Format/ObjectField.prototype */
        /** @lends WS.Data/Format/ObjectField.prototype */
        function ObjectField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return ObjectField;
    }(Field_1.default    /** @lends WS.Data/Format/ObjectField.prototype */);
    /** @lends WS.Data/Format/ObjectField.prototype */
    exports.default = ObjectField;
    ObjectField.prototype['[Data/_type/format/ObjectField]'] = true;
    ObjectField.prototype._moduleName = 'Data/type:format.ObjectField';
    ObjectField.prototype._typeName = 'Object';
});