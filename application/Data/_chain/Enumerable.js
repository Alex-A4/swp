/// <amd-module name="Data/_chain/Enumerable" />
/**
 * Цепочка по IEnumerable.
 * @class WS.Data/Chain/Enumerable
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Enumerable', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract'
], function (require, exports, tslib_1, Abstract_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Enumerable = /** @class */
    function (_super) {
        tslib_1.__extends(Enumerable, _super);    /** @lends WS.Data/Chain/Enumerable.prototype */
        /** @lends WS.Data/Chain/Enumerable.prototype */
        function Enumerable(source) {
            var _this = this;
            if (!source || !source['[Data/_collection/IEnumerable]']) {
                throw new TypeError('Source must implement Data/collection:IEnumerable');
            }
            _this = _super.call(this, source) || this;
            return _this;
        }    // region Data/_collection/IEnumerable
        // region Data/_collection/IEnumerable
        Enumerable.prototype.getEnumerator = function () {
            return this._source.getEnumerator();
        };
        Enumerable.prototype.each = function (callback, context) {
            return this._source.each(callback, context);
        };    // endregion Data/_collection/IEnumerable
              // region Data/_chain/Abstract
        // endregion Data/_collection/IEnumerable
        // region Data/_chain/Abstract
        Enumerable.prototype.toObject = function () {
            if (this._source['[Data/_type/IObject]']) {
                var result_1 = {};
                this.each(function (key, value) {
                    result_1[key] = value;
                });
                return result_1;
            }
            return _super.prototype.toObject.call(this);
        };
        return Enumerable;
    }(Abstract_1.default);
    exports.default = Enumerable;
    Enumerable.prototype['[Data/_chain/Enumerable]'] = true;
});