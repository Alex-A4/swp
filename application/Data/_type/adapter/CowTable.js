/// <amd-module name="Data/_type/adapter/CowTable" />
/**
 * Адаптер таблицы для работы в режиме Copy-on-write.
 * @class WS.Data/Adapter/CowTable
 * @extends WS.Data/Entity/Abstract
 * @implements WS.Data/Adapter/ITable
 * @implements WS.Data/Adapter/IDecorator
 * @author Мальцев А.А.
 */
define('Data/_type/adapter/CowTable', [
    'require',
    'exports',
    'tslib',
    'Data/_type/Abstract',
    'Data/util'
], function (require, exports, tslib_1, Abstract_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var CowTable = /** @class */
    function (_super) {
        tslib_1.__extends(CowTable, _super);    /**
         * Конструктор
         * @param {*} data Сырые данные
         * @param {WS.Data/Adapter/IAdapter} original Оригинальный адаптер
         * @param {Function} [writeCallback] Ф-я обратного вызова при событии записи
         */
        /**
         * Конструктор
         * @param {*} data Сырые данные
         * @param {WS.Data/Adapter/IAdapter} original Оригинальный адаптер
         * @param {Function} [writeCallback] Ф-я обратного вызова при событии записи
         */
        function CowTable(data, original, writeCallback) {
            var _this = _super.call(this) || this;
            _this._original = original;
            _this._originalTable = original.forTable(data);
            if (writeCallback) {
                _this._writeCallback = writeCallback;
            }
            return _this;
        }
        CowTable.prototype.getFields = function () {
            return this._originalTable.getFields();
        };
        CowTable.prototype.getCount = function () {
            return this._originalTable.getCount();
        };
        CowTable.prototype.getData = function () {
            return this._originalTable.getData();
        };
        CowTable.prototype.add = function (record, at) {
            this._copy();
            return this._originalTable.add(record, at);
        };
        CowTable.prototype.at = function (index) {
            return this._originalTable.at(index);
        };
        CowTable.prototype.remove = function (at) {
            this._copy();
            return this._originalTable.remove(at);
        };
        CowTable.prototype.replace = function (record, at) {
            this._copy();
            return this._originalTable.replace(record, at);
        };
        CowTable.prototype.move = function (source, target) {
            this._copy();
            return this._originalTable.move(source, target);
        };
        CowTable.prototype.merge = function (acceptor, donor, idProperty) {
            this._copy();
            return this._originalTable.merge(acceptor, donor, idProperty);
        };
        CowTable.prototype.copy = function (index) {
            this._copy();
            return this._originalTable.copy(index);
        };
        CowTable.prototype.clear = function () {
            this._copy();
            return this._originalTable.clear();
        };
        CowTable.prototype.getFormat = function (name) {
            return this._originalTable.getFormat(name);
        };
        CowTable.prototype.getSharedFormat = function (name) {
            return this._originalTable.getSharedFormat(name);
        };
        CowTable.prototype.addField = function (format, at) {
            this._copy();
            return this._originalTable.addField(format, at);
        };
        CowTable.prototype.removeField = function (name) {
            this._copy();
            return this._originalTable.removeField(name);
        };
        CowTable.prototype.removeFieldAt = function (index) {
            this._copy();
            return this._originalTable.removeFieldAt(index);
        };
        CowTable.prototype.getOriginal = function () {
            return this._originalTable;
        };    //endregion WS.Data/Adapter/IDecorator
              //region Protected methods
        //endregion WS.Data/Adapter/IDecorator
        //region Protected methods
        CowTable.prototype._copy = function () {
            if (!this._copied) {
                if (this._originalTable['[Data/_type/ICloneable]']) {
                    // @ts-ignore
                    this._originalTable = this._originalTable.clone();
                } else {
                    this._originalTable = this._original.forTable(util_1.object.clonePlain(this._originalTable.getData()));
                }
                this._copied = true;
                if (this._writeCallback) {
                    this._writeCallback();
                    this._writeCallback = null;
                }
            }
        };
        return CowTable;
    }(Abstract_1.default);
    exports.default = CowTable;
    CowTable.prototype['[Data/_type/adapter/CowTable]'] = true;    // @ts-ignore
    // @ts-ignore
    CowTable.prototype['[Data/_type/adapter/ITable]'] = true;    // @ts-ignore
    // @ts-ignore
    CowTable.prototype['[Data/_type/adapter/IDecorator]'] = true;
    CowTable.prototype._original = null;
    CowTable.prototype._originalTable = null;
    CowTable.prototype._writeCallback = null;
    CowTable.prototype._copied = false;
});