define('View/_Request/_Storage/Native', [
    'require',
    'exports',
    'tslib'
], function (require, exports, tslib_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var GLOBAL = function () {
        return this || (0, eval)('this');
    }();
    var StorageType;
    (function (StorageType) {
        StorageType['local'] = 'localStorage';
        StorageType['session'] = 'sessionStorage';
    }(StorageType = exports.StorageType || (exports.StorageType = {})));    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStorage},
     * предназначенный для работы с localStorage и SessionStorage
     * @class
     * @name View/_Request/_Storage/Native
     * @implements Core/Request/IStorage
     * @author Заляев А.В
     */
    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStorage},
     * предназначенный для работы с localStorage и SessionStorage
     * @class
     * @name View/_Request/_Storage/Native
     * @implements Core/Request/IStorage
     * @author Заляев А.В
     */
    var NativeStorage = /** @class */
    function () {
        function NativeStorage(storageType) {
            var storage = GLOBAL && GLOBAL[storageType];
            if (!storage) {
                throw new Error('"' + storageType + '" not supported');
            }
            this.__storage = storage;
        }
        NativeStorage.prototype.get = function (key) {
            try {
                return this.__storage.getItem(key);
            } catch (err) {
            }
        };
        NativeStorage.prototype.set = function (key, data) {
            try {
                this.__storage.setItem(key, data);
                return true;
            } catch (err) {
                // ignore
                return false;
            }
        };
        NativeStorage.prototype.remove = function (key) {
            try {
                this.__storage.removeItem(key);
            } catch (err) {
            }
        };
        NativeStorage.prototype.getKeys = function () {
            try {
                return Object.keys(this.__storage);
            } catch (err) {
                return [];
            }
        };
        NativeStorage.prototype.toObject = function () {
            try {
                return tslib_1.__assign({}, this.__storage);
            } catch (err) {
                return {};
            }
        };
        return NativeStorage;
    }();
    exports.default = NativeStorage;
});