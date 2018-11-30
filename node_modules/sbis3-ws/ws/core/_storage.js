define("Core/_storage", [
    "Core/constants",
    'Core/IoC'
], function (constants, IoC) {
    "use strict";
    var GLOBAL = (function () { return this || (0, eval)('this'); })();
    var StorageType = {
        "local": "localStorage",
        "session": "sessionStorage"
    };
    /**
     * Логирование сообщения
     * @param {String} message
     * @param {String} [type]
     */
    function log(message, type) {
        IoC.resolve('ILogger').log(type || 'Core/_storage', message);
    }

    /**
     * Фейковая реализация интерфейса хранилища
     */
    function getFake() {
        var storage = {};
        return {
            setItem: function (key, data) {
                storage[key] = data && data.toString() || ("" + data);
                this.length++;
            },
            removeItem: function (key) {
                delete storage[key];
                this.length--;
            },
            getItem: function (key) {
                return storage[key] || null;
            },
            clear: function () {
                storage = {};
                this.length = 0;
            },
            length: 0
        }
    }

    /**
     * Обёртка хранилища, чтобы не упало во время работы
     * @param {Storage} storage
     * @param {String} type
     * @return {{getItem: getItem, setItem: setItem, removeItem: removeItem, clear: clear}}
     */
    function wrapStorage (storage, type) {
        return {
            getItem: function (key) {
                try {
                    return storage.getItem(key);
                } catch (err) {
                    log(err);
                }
            },
            setItem: function (key, data) {
                try {
                    storage.setItem(key, data);
                    return true;
                } catch (err) {
                    log(err);
                    return false;
                }
            },
            removeItem: function (key) {
                try {
                    storage.removeItem(key);
                } catch (err) {
                    log(err);
                }
            },
            clear: function () {
                try {
                    storage.clear();
                } catch (err) {
                    log(err);
                }
            }
        };
    }

    /**
     * Получение хранилища по типу
     * @param {"local" | "session"} type
     */
    function getStorage (type) {
        var storage = GLOBAL && GLOBAL[type];
        if (!constants.isBrowserPlatform || !storage) {
            return getFake();
        }
        return wrapStorage(storage, type);
    }
    return {
        getLocal: function () {
            return getStorage(StorageType.local);
        },
        getSession: function () {
            return getStorage(StorageType.session);
        }
    };
});
