/// <amd-module name="Data/_type/format/RealField" />
/**
 * Формат вещественного поля.
 *
 * Создадим поле вещественного типа:
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'real',
 *       precision: 4
 *    };
 * </pre>
 * @class WS.Data/Format/RealField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/RealField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var RealField = /** @class */
    function (_super) {
        tslib_1.__extends(RealField, _super);    /** @lends WS.Data/Format/RealField.prototype */
        /** @lends WS.Data/Format/RealField.prototype */
        function RealField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }    //region Public methods
             /**
         * Возвращает максимальное количество знаков в дробной части
         * @return {Number}
         * @see precision
         * @see setPrecision
         */
        //region Public methods
        /**
         * Возвращает максимальное количество знаков в дробной части
         * @return {Number}
         * @see precision
         * @see setPrecision
         */
        RealField.prototype.getPrecision = function () {
            return this._$precision;
        };    /**
         * Устанавливает максимальное количество знаков в дробной части
         * @param {Number} value
         * @see precision
         * @see getPrecision
         */
        /**
         * Устанавливает максимальное количество знаков в дробной части
         * @param {Number} value
         * @see precision
         * @see getPrecision
         */
        RealField.prototype.setPrecision = function (value) {
            this._$precision = value;
        };
        return RealField;
    }(Field_1.default    /** @lends WS.Data/Format/RealField.prototype */);
    /** @lends WS.Data/Format/RealField.prototype */
    exports.default = RealField;
    RealField.prototype['[Data/_type/format/RealField]'] = true;
    RealField.prototype._moduleName = 'Data/type:format.RealField';
    RealField.prototype._typeName = 'Real';
    RealField.prototype._$defaultValue = 0;
    RealField.prototype._$precision = 16;
});