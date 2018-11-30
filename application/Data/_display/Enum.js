/// <amd-module name="Data/_display/Enum" />
/**
 * Проекция типа "Перечисляемое".
 * @class WS.Data/Display/Enum
 * @extends WS.Data/Display/Collection
 * @public
 * @author Ганшнин Ярослав
 */
define('Data/_display/Enum', [
    'require',
    'exports',
    'tslib',
    'Data/_display/Collection',
    'Data/util'
], function (require, exports, tslib_1, Collection_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function onSourceChange(event, index) {
        this.setCurrentPosition(this.getIndexBySourceIndex(index));
    }
    var Enum = /** @class */
    function (_super) {
        tslib_1.__extends(Enum, _super);    /** @lends WS.Data/Display/Enum.prototype */
        /** @lends WS.Data/Display/Enum.prototype */
        function Enum(options) {
            var _this = _super.call(this, options) || this;
            if (!_this._$collection['[Data/_collection/IEnum]']) {
                throw new TypeError(_this._moduleName + ': source collection should implement WS.Data/Type/IEnum');
            }
            _this._getCursorEnumerator().setPosition(_this.getIndexBySourceIndex(_this._$collection.get()));
            if (_this._$collection['[Data/_type/ObservableMixin]']) {
                _this._$collection.subscribe('onChange', _this._onSourceChange);
            }
            return _this;
        }
        Enum.prototype.destroy = function () {
            if (this._$collection['[Data/_type/Abstract]'] && this._$collection['[Data/_type/ObservableMixin]'] && !this._$collection.destroyed) {
                this._$collection.unsubscribe('onChange', this._onSourceChange);
            }
            _super.prototype.destroy.call(this);
        };
        Enum.prototype._bindHandlers = function () {
            _super.prototype._bindHandlers.call(this);
            this._onSourceChange = onSourceChange.bind(this);
        };
        Enum.prototype._notifyCurrentChange = function (newCurrent, oldCurrent, newPosition, oldPosition) {
            var value = null;
            if (newPosition > -1) {
                value = this.getSourceIndexByIndex(newPosition);
            }
            this._$collection.set(value);
            _super.prototype._notifyCurrentChange.call(this, newCurrent, oldCurrent, newPosition, oldPosition);
        };
        Enum.prototype._getSourceIndex = function (index) {
            var enumerator = this._$collection.getEnumerator();
            var i = 0;
            if (index > -1) {
                while (enumerator.moveNext()) {
                    if (i === index) {
                        return enumerator.getCurrentIndex();
                    }
                    i++;
                }
            }
            return -1;
        };
        Enum.prototype._getItemIndex = function (index) {
            var enumerator = this._$collection.getEnumerator();
            var i = 0;
            while (enumerator.moveNext()) {
                if (enumerator.getCurrentIndex() == index) {
                    return i;
                }
                i++;
            }
            return -1;
        };
        return Enum;
    }(Collection_1.default    /** @lends WS.Data/Display/Enum.prototype */);
    /** @lends WS.Data/Display/Enum.prototype */
    exports.default = Enum;
    Enum.prototype._moduleName = 'Data/display:Enum';
    Enum.prototype['[Data/_display/Enum]'] = true;    // @ts-ignore
    // @ts-ignore
    Enum.prototype._localize = true;    // @ts-ignore
    // @ts-ignore
    Enum.prototype._onSourceChange = null;
    util_1.di.register('Data/display:Enum', Enum);
});