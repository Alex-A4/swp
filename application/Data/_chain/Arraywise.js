/// <amd-module name="Data/_chain/Arraywise" />
/**
 * Цепочка по массиву.
 * @class WS.Data/Chain/Array
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Arraywise', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract',
    'Data/collection'
], function (require, exports, tslib_1, Abstract_1, collection_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Arraywise = /** @class */
    function (_super) {
        tslib_1.__extends(Arraywise, _super);    /** @lends WS.Data/Chain/Array.prototype */
        /** @lends WS.Data/Chain/Array.prototype */
        function Arraywise(source) {
            var _this = this;
            if (!(source instanceof Array)) {
                throw new TypeError('Source should be an instance of Array');
            }
            _this = _super.call(this, source) || this;
            return _this;
        }    // region Data/_collection/IEnumerable
        // region Data/_collection/IEnumerable
        Arraywise.prototype.getEnumerator = function () {
            return new collection_1.ArrayEnumerator(this._source);
        };
        Arraywise.prototype.each = function (callback, context) {
            for (var i = 0, count = this._source.length; i < count; i++) {
                callback.call(context || this, this._source[i], i);
            }
        };    // endregion Data/_collection/IEnumerable
              // region Data/_chain/Abstract
        // endregion Data/_collection/IEnumerable
        // region Data/_chain/Abstract
        Arraywise.prototype.toArray = function () {
            return this._source.slice();
        };
        return Arraywise;
    }(Abstract_1.default);
    exports.default = Arraywise;
    Arraywise.prototype['[Data/_chain/Arraywise]'] = true;
    Object.defineProperty(Arraywise.prototype, 'shouldSaveIndices', { value: false });
});