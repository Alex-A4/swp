/// <amd-module name="Data/_chain/Reversed" />
/**
 * Реверсивное звено цепочки.
 * @class WS.Data/Chain/Reversed
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Reversed', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract',
    'Data/_chain/ReversedEnumerator'
], function (require, exports, tslib_1, Abstract_1, ReversedEnumerator_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Reversed = /** @class */
    function (_super) {
        tslib_1.__extends(Reversed, _super);    /** @lends WS.Data/Chain/Reversed.prototype */
        /** @lends WS.Data/Chain/Reversed.prototype */
        function Reversed() {
            return _super !== null && _super.apply(this, arguments) || this;
        }    // region Data/_collection/IEnumerable
        // region Data/_collection/IEnumerable
        Reversed.prototype.getEnumerator = function () {
            return new ReversedEnumerator_1.default(this._previous);
        };
        return Reversed;
    }(Abstract_1.default);
    exports.default = Reversed;
    Reversed.prototype['[Data/_chain/Reversed]'] = true;
});