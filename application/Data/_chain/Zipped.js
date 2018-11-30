/// <amd-module name="Data/_chain/Zipped" />
/**
 * Объединяющее звено цепочки.
 * @class WS.Data/Chain/Zipped
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Zipped', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract',
    'Data/_chain/ZippedEnumerator'
], function (require, exports, tslib_1, Abstract_1, ZippedEnumerator_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Zipped = /** @class */
    function (_super) {
        tslib_1.__extends(Zipped, _super);    /** @lends WS.Data/Chain/Zipped.prototype */
                                              /**
         * Конструктор объединяющего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {Array.<Array>|Array.<WS.Data/Collection/IEnumerable>} items Коллекции для объединения.
         */
        /** @lends WS.Data/Chain/Zipped.prototype */
        /**
         * Конструктор объединяющего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {Array.<Array>|Array.<WS.Data/Collection/IEnumerable>} items Коллекции для объединения.
         */
        function Zipped(source, items) {
            var _this = _super.call(this, source) || this;
            _this._items = items;
            return _this;
        }
        Zipped.prototype.destroy = function () {
            this._items = null;
            _super.prototype.destroy.call(this);
        };    // region Data/_collection/IEnumerable
        // region Data/_collection/IEnumerable
        Zipped.prototype.getEnumerator = function () {
            return new ZippedEnumerator_1.default(this._previous, this._items);
        };
        return Zipped;
    }(Abstract_1.default);
    exports.default = Zipped;
    Zipped.prototype['[Data/_chain/Zipped]'] = true;    // @ts-ignore
    // @ts-ignore
    Zipped.prototype._items = null;
});