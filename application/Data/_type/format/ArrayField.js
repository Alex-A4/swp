/// <amd-module name="Data/_type/format/ArrayField" />
/**
 * Формат поля для массива значений.
 *
 * Создадим поле с типом "Массив значений":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'array',
 *       kind: 'integer'
 *    };
 * </pre>
 * @class WS.Data/Format/ArrayField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/ArrayField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var ArrayField = /** @class */
    function (_super) {
        tslib_1.__extends(ArrayField, _super);    /** @lends WS.Data/Format/ArrayField.prototype */
        /** @lends WS.Data/Format/ArrayField.prototype */
        function ArrayField() {
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
        ArrayField.prototype.getKind = function () {
            return this._$kind;
        };
        return ArrayField;
    }(Field_1.default    /** @lends WS.Data/Format/ArrayField.prototype */);
    /** @lends WS.Data/Format/ArrayField.prototype */
    exports.default = ArrayField;
    ArrayField.prototype['[Data/_type/format/ArrayField]'] = true;
    ArrayField.prototype._moduleName = 'Data/type:format.ArrayField';
    ArrayField.prototype._typeName = 'Array';
    ArrayField.prototype._$kind = '';
});