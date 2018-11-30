/// <amd-module name="Data/_chain/Sliced" />
/**
 * Вырезающее звено цепочки.
 * @class WS.Data/Chain/Sliced
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Sliced', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract',
    'Data/_chain/SlicedEnumerator'
], function (require, exports, tslib_1, Abstract_1, SlicedEnumerator_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Sliced = /** @class */
    function (_super) {
        tslib_1.__extends(Sliced, _super);    /** @lends WS.Data/Chain/Sliced.prototype */
                                              /**
         * Конструктор вырезающего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {Number} begin Индекс, по которому начинать извлечение
         * @param {Number} end Индекс, по которому заканчивать извлечение (будут извлечены элементы с индексом меньше end)
         */
        /** @lends WS.Data/Chain/Sliced.prototype */
        /**
         * Конструктор вырезающего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {Number} begin Индекс, по которому начинать извлечение
         * @param {Number} end Индекс, по которому заканчивать извлечение (будут извлечены элементы с индексом меньше end)
         */
        function Sliced(source, begin, end) {
            var _this = _super.call(this, source) || this;
            _this._begin = begin;
            _this._end = end;
            return _this;
        }    // region Data/_collection/IEnumerable
        // region Data/_collection/IEnumerable
        Sliced.prototype.getEnumerator = function () {
            return new SlicedEnumerator_1.default(this._previous, this._begin, this._end);
        };
        return Sliced;
    }(Abstract_1.default);
    exports.default = Sliced;
    Sliced.prototype['[Data/_chain/Sliced]'] = true;    // @ts-ignore
    // @ts-ignore
    Sliced.prototype._begin = 0;    // @ts-ignore
    // @ts-ignore
    Sliced.prototype._end = 0;
});