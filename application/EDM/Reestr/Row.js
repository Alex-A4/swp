define('EDM/Reestr/Row', [
    'require',
    'exports',
    'tslib',
    'Core/Control',
    'wml!EDM/Reestr/Row',
    'css!EDM/Reestr/rowstyle'
], function (require, exports, tslib_1, Control, template) {
    'use strict';
    var Row = /** @class */
    function (_super) {
        tslib_1.__extends(Row, _super);
        function Row() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._template = template;
            return _this;
        }
        Row.prototype.rowClickHandler = function () {
        };
        return Row;
    }(Control);
    return Row;
});