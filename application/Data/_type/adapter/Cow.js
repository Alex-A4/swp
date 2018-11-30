/// <amd-module name="Data/_type/adapter/Cow" />
/**
 * Адаптер для работы с даными в режиме Copy-on-write.
 * \|/         (__)
 *     `\------(oo)
 *       ||    (__)
 *       ||w--||     \|/
 *   \|/
 * @class WS.Data/Adapter/Cow
 * @extends WS.Data/Entity/Abstract
 * @implements WS.Data/Adapter/IAdapter
 * @implements WS.Data/Adapter/IDecorator
 * @mixes WS.Data/Entity/SerializableMixin
 * @author Мальцев А.А.
 */
define('Data/_type/adapter/Cow', [
    'require',
    'exports',
    'tslib',
    'Data/_type/adapter/Abstract',
    'Data/_type/adapter/CowTable',
    'Data/_type/adapter/CowRecord',
    'Data/_type/SerializableMixin',
    'Data/util'
], function (require, exports, tslib_1, Abstract_1, CowTable_1, CowRecord_1, SerializableMixin_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Cow = /** @class */
    function (_super) {
        tslib_1.__extends(Cow, _super);    /**
         * Конструктор
         * @param {WS.Data/Adapter/IAdapter} original Оригинальный адаптер
         * @param {Function} [writeCallback] Ф-я обратного вызова при событии записи
         */
        /**
         * Конструктор
         * @param {WS.Data/Adapter/IAdapter} original Оригинальный адаптер
         * @param {Function} [writeCallback] Ф-я обратного вызова при событии записи
         */
        function Cow(original, writeCallback) {
            var _this = _super.call(this) || this;
            SerializableMixin_1.default.constructor.call(_this);
            _this._original = original;
            if (writeCallback) {
                _this._writeCallback = writeCallback;
            }
            return _this;
        }    //region IAdapter
        //region IAdapter
        Cow.prototype.forTable = function (data) {
            return new CowTable_1.default(data, this._original, this._writeCallback);
        };
        Cow.prototype.forRecord = function (data) {
            return new CowRecord_1.default(data, this._original, this._writeCallback);
        };
        Cow.prototype.getKeyField = function (data) {
            return this._original.getKeyField(data);
        };
        Cow.prototype.getProperty = function (data, property) {
            return this._original.getProperty(data, property);
        };
        Cow.prototype.setProperty = function (data, property, value) {
            return this._original.setProperty(data, property, value);
        };
        Cow.prototype.serialize = function (data) {
            return this._original.serialize(data);
        };
        Cow.prototype.getOriginal = function () {
            return this._original;
        };    //endregion IDecorator
              //region SerializableMixin
        //endregion IDecorator
        //region SerializableMixin
        Cow.prototype._getSerializableState = function (state) {
            state = SerializableMixin_1.default._getSerializableState.call(this, state);
            state._original = this._original;
            return state;
        };
        Cow.prototype._setSerializableState = function (state) {
            var fromSerializableMixin = SerializableMixin_1.default._setSerializableState(state);
            return function () {
                fromSerializableMixin.call(this);
                this._original = state._original;
            };
        };
        return Cow;
    }(util_1.mixin(Abstract_1.default, SerializableMixin_1.default));
    exports.default = Cow;
    Cow.prototype['[Data/_type/adapter/Cow]'] = true;    // @ts-ignore
    // @ts-ignore
    Cow.prototype['[Data/_type/adapter/IDecorator]'] = true;
    Cow.prototype._moduleName = 'Data/type:adapter.Cow';
    Cow.prototype._original = null;
    Cow.prototype._writeCallback = null;
    util_1.di.register('Data/type:adapter.Cow', Cow, { instantiate: false });
});