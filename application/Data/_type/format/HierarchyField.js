/// <amd-module name="Data/_type/format/HierarchyField" />
/**
 * Формат поля иерархии
 *
 * @class WS.Data/Format/HierarchyField
 * @extends WS.Data/Format/Field
 * @author Мальцев А.А.
 */
define('Data/_type/format/HierarchyField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var HierarchyField = /** @class */
    function (_super) {
        tslib_1.__extends(HierarchyField, _super);    /** @lends WS.Data/Format/HierarchyField.prototype */
        /** @lends WS.Data/Format/HierarchyField.prototype */
        function HierarchyField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }    //region Public methods
             /**
         * Возвращает тип элементов
         * @return {String}
         * @see dictionary
         */
        //region Public methods
        /**
         * Возвращает тип элементов
         * @return {String}
         * @see dictionary
         */
        HierarchyField.prototype.getKind = function () {
            return this._$kind;
        };
        HierarchyField.prototype.getDefaultValue = function () {
            if (this._$kind && this._$kind === 'Identity') {
                return [null];
            }
            return null;
        };
        return HierarchyField;
    }(Field_1.default    /** @lends WS.Data/Format/HierarchyField.prototype */);
    /** @lends WS.Data/Format/HierarchyField.prototype */
    exports.default = HierarchyField;
    HierarchyField.prototype['[Data/_type/format/HierarchyField]'] = true;
    HierarchyField.prototype._moduleName = 'Data/type:format.HierarchyField';
    HierarchyField.prototype._typeName = 'Hierarchy';
    HierarchyField.prototype._$kind = '';
});