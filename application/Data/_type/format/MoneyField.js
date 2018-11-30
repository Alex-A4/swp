/// <amd-module name="Data/_type/format/MoneyField" />
/**
 * Формат денежного поля.
 *
 * Создадим поле c типом "Деньги":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'money'
 *    };
 * </pre>
 * @class WS.Data/Format/MoneyField
 * @extends WS.Data/Format/RealField
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/MoneyField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/RealField'
], function (require, exports, tslib_1, RealField_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var MoneyField = /** @class */
    function (_super) {
        tslib_1.__extends(MoneyField, _super);    /** @lends WS.Data/Format/MoneyField.prototype */
        /** @lends WS.Data/Format/MoneyField.prototype */
        function MoneyField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }    //region Public methods
             /**
         * Возвращает признак "Большие деньги"
         * @return {Boolean}
         * @see large
         */
        //region Public methods
        /**
         * Возвращает признак "Большие деньги"
         * @return {Boolean}
         * @see large
         */
        MoneyField.prototype.isLarge = function () {
            return this._$large;
        };
        return MoneyField;
    }(RealField_1.default    /** @lends WS.Data/Format/MoneyField.prototype */);
    /** @lends WS.Data/Format/MoneyField.prototype */
    exports.default = MoneyField;
    MoneyField.prototype['[Data/_type/format/MoneyField]'] = true;
    MoneyField.prototype._moduleName = 'Data/type:format.MoneyField';
    MoneyField.prototype._typeName = 'Money';
    MoneyField.prototype._$precision = 2;
    MoneyField.prototype._$large = false;
});