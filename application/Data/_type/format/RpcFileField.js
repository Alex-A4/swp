/// <amd-module name="Data/_type/format/RpcFileField" />
/**
 * Формат поля файл-RPC.
 *
 * Создадим поле c типом "Файл-RPC":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'rpcfile'
 *    };
 * </pre>
 * @class WS.Data/Format/RpcFileField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/RpcFileField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var RpcFileField = /** @class */
    function (_super) {
        tslib_1.__extends(RpcFileField, _super);    /** @lends WS.Data/Format/RpcFileField.prototype */
        /** @lends WS.Data/Format/RpcFileField.prototype */
        function RpcFileField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return RpcFileField;
    }(Field_1.default    /** @lends WS.Data/Format/RpcFileField.prototype */);
    /** @lends WS.Data/Format/RpcFileField.prototype */
    exports.default = RpcFileField;
    RpcFileField.prototype['[Data/_type/format/RpcFileField]'] = true;
    RpcFileField.prototype._moduleName = 'Data/type:format.RpcFileField';
    RpcFileField.prototype._typeName = 'RpcFile';
});