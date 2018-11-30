/// <amd-module name="Data/_chain/Grouped" />
/**
 * Группирующее звено цепочки.
 * @class WS.Data/Chain/Grouped
 * @extends WS.Data/Chain/Abstract
 * @public
 * @author Мальцев А.А.
 */
define('Data/_chain/Grouped', [
    'require',
    'exports',
    'tslib',
    'Data/_chain/Abstract',
    'Data/collection',
    'Data/shim'
], function (require, exports, tslib_1, Abstract_1, collection_1, shim_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Grouped = /** @class */
    function (_super) {
        tslib_1.__extends(Grouped, _super);    /** @lends WS.Data/Chain/Grouped.prototype */
                                               /**
         * Конструктор группирующего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {String|function(*): String} key Поле группировки или функция группировки для каждого элемента.
         * @param {String|function(*): *} [value] Поле значения или функция, возвращающая значение для каждого элемента.
         */
        /** @lends WS.Data/Chain/Grouped.prototype */
        /**
         * Конструктор группирующего звена цепочки.
         * @param {WS.Data/Chain/Abstract} source Предыдущее звено.
         * @param {String|function(*): String} key Поле группировки или функция группировки для каждого элемента.
         * @param {String|function(*): *} [value] Поле значения или функция, возвращающая значение для каждого элемента.
         */
        function Grouped(source, key, value) {
            var _this = _super.call(this, source) || this;
            _this._key = key;
            _this._value = value;
            return _this;
        }
        Grouped.prototype.destroy = function () {
            this._key = null;
            this._value = null;
            _super.prototype.destroy.call(this);
        };    // region Data/_collection/IEnumerable
        // region Data/_collection/IEnumerable
        Grouped.prototype.getEnumerator = function () {
            var toKey = Abstract_1.default.propertyMapper(this._key);
            var toValue = Abstract_1.default.propertyMapper(this._value);
            return new collection_1.MapEnumerator(this._previous.reduce(function (memo, item, index) {
                var key = toKey(item, index);
                var value = toValue(item, index);
                var group;
                if (memo.has(key)) {
                    group = memo.get(key);
                } else {
                    group = [];
                    memo.set(key, group);
                }
                group.push(value);
                return memo;
            }, new shim_1.Map()));
        };
        return Grouped;
    }(Abstract_1.default);
    exports.default = Grouped;
    Grouped.prototype['[Data/_chain/Grouped]'] = true;    // @ts-ignore
    // @ts-ignore
    Grouped.prototype._key = null;    // @ts-ignore
    // @ts-ignore
    Grouped.prototype._value = null;
});