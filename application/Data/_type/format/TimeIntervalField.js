/// <amd-module name="Data/_type/format/TimeIntervalField" />
/**
 * Формат поля временной интервал.
 *
 * Создадим поле c типом "Временной интервал":
 * <pre>
 *    var field = {
 *       name: 'foo',
 *       type: 'timeinterval'
 *    };
 * </pre>
 * @class WS.Data/Format/TimeIntervalField
 * @extends WS.Data/Format/Field
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/format/TimeIntervalField', [
    'require',
    'exports',
    'tslib',
    'Data/_type/format/Field'
], function (require, exports, tslib_1, Field_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var TimeIntervalField = /** @class */
    function (_super) {
        tslib_1.__extends(TimeIntervalField, _super);    /** @lends WS.Data/Format/TimeIntervalField.prototype */
        /** @lends WS.Data/Format/TimeIntervalField.prototype */
        function TimeIntervalField() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return TimeIntervalField;
    }(Field_1.default    /** @lends WS.Data/Format/TimeIntervalField.prototype */);
    /** @lends WS.Data/Format/TimeIntervalField.prototype */
    exports.default = TimeIntervalField;
    TimeIntervalField.prototype['[Data/_type/format/TimeIntervalField]'] = true;
    TimeIntervalField.prototype._moduleName = 'Data/type:format.TimeIntervalField';
    TimeIntervalField.prototype._typeName = 'TimeInterval';
    TimeIntervalField.prototype._$defaultValue = 0;
});