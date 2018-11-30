define('View/_Request/_Storage/Object', [
    'require',
    'exports',
    'tslib'
], function (require, exports, tslib_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStorage}, сохраняющий данные в внутренний объект
     * @class
     * @name View/_Request/_Storage/Object
     * @implements Core/Request/IStorage
     * @author Заляев А.В
     */
    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStorage}, сохраняющий данные в внутренний объект
     * @class
     * @name View/_Request/_Storage/Object
     * @implements Core/Request/IStorage
     * @author Заляев А.В
     */
    var ObjectStorage = /** @class */
    function () {
        function ObjectStorage() {
            this._map = Object.create(null);
        }
        ObjectStorage.prototype.get = function (key) {
            return this._map[key] || null;
        };
        ;
        ObjectStorage.prototype.set = function (key, value) {
            this._map[key] = value;
            return true;
        };
        ;
        ObjectStorage.prototype.remove = function (key) {
            delete this._map[key];
        };
        ;
        ObjectStorage.prototype.getKeys = function () {
            return Object.keys(this._map);
        };
        ;
        ObjectStorage.prototype.toObject = function () {
            return tslib_1.__assign({}, this._map);
        };
        ;
        return ObjectStorage;
    }();
    exports.default = ObjectStorage;
});