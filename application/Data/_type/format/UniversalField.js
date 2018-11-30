/// <amd-module name="Data/_type/format/UniversalField" />
/**
 * Универсальное поле.
 * @class WS.Data/Format/UniversalField
 * @author Мальцев А.А.
 */
define('Data/_type/format/UniversalField', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var UniversalField    /** @lends WS.Data/Format/UniversalField.prototype */ = /** @lends WS.Data/Format/UniversalField.prototype */
    /** @class */
    function () {
        function UniversalField() {
        }
        return UniversalField;
    }();
    exports.default = UniversalField;
    UniversalField.prototype['[Data/_type/format/UniversalField]'] = true;    // @ts-ignore
    // @ts-ignore
    UniversalField.prototype._moduleName = 'Data/type:format.UniversalField';
    UniversalField.prototype.type = '';
    UniversalField.prototype.name = '';
    UniversalField.prototype.defaultValue = null;
    UniversalField.prototype.nullable = false;
    UniversalField.prototype.meta = null;
});