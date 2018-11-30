/// <amd-module name="Data/_chain/Uniquely" />
/**
 * Звено цепочки, обеспечивающее уникальность.
 * @class WS.Data/Chain/Uniquely
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Uniquely', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract',
    'Data/_chain/UniquelyEnumerator'
], function (require, exports, tslib_1, Abstract_1, UniquelyEnumerator_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Uniquely = /** @class */
    function (_super) {
        tslib_1.__extends(Uniquely, _super);    /** @lends WS.Data/Chain/Uniquely.prototype */
                                                /**
         * Конструктор звена цепочки, обеспечивающего уникальность.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {function(*): String|Number} [idExtractor] Возвращает уникальный идентификатор для каждого элемента.
         */
        /** @lends WS.Data/Chain/Uniquely.prototype */
        /**
         * Конструктор звена цепочки, обеспечивающего уникальность.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {function(*): String|Number} [idExtractor] Возвращает уникальный идентификатор для каждого элемента.
         */
        function Uniquely(source, idExtractor) {
            var _this = _super.call(this, source) || this;
            _this._idExtractor = idExtractor;
            return _this;
        }
        Uniquely.prototype.destroy = function () {
            this._idExtractor = null;
            _super.prototype.destroy.call(this);
        };    // region Data/_collection/IEnumerable
        // region Data/_collection/IEnumerable
        Uniquely.prototype.getEnumerator = function () {
            return new UniquelyEnumerator_1.default(this._previous, this._idExtractor);
        };
        return Uniquely;
    }(Abstract_1.default);
    exports.default = Uniquely;
    Uniquely.prototype['[Data/_chain/Uniquely]'] = true;    // @ts-ignore
    // @ts-ignore
    Uniquely.prototype._idExtractor = null;
});