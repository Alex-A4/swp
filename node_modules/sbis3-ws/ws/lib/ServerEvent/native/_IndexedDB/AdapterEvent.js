define("Lib/ServerEvent/native/_IndexedDB/AdapterEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Отладочная утилита. Не нужно долго хранить.
     */
    var HALF_MINUTE = 60000;
    var KEY_TIMESTAMP = 'timestamp';
    var KEY_UNIQ = 'perf';
    var Query = /** @class */ (function () {
        function Query(lastTime) {
            this.keyBound = IDBKeyRange.lowerBound([lastTime], true);
        }
        Query.prototype.getKeyRange = function () {
            return this.keyBound;
        };
        Query.prototype.getFilter = function (channelFilter) {
            return null;
        };
        return Query;
    }());
    ;
    var AdapterEvent = /** @class */ (function () {
        function AdapterEvent(version) {
            if (version === void 0) { version = 1; }
            this.version = version;
        }
        /**
         * Получение ключевых полей
         * @return {string[]}
         */
        AdapterEvent.prototype.getKeyPath = function () {
            return [KEY_TIMESTAMP, KEY_UNIQ];
        };
        /**
         * Подготовка данных к записи
         * @param channelName
         * @param eventName
         * @param body
         */
        AdapterEvent.prototype.prepare = function (channelName, eventName, body) {
            var _a;
            /* На ipad performance.now() не подходит для ключа KEY_UNIQ.
            Слишком часто выдает одинаковые значения, чего быть не должно */
            var data = (_a = {
                    channelName: channelName,
                    eventName: eventName,
                    body: body
                },
                _a[KEY_TIMESTAMP] = Date.now(),
                _a[KEY_UNIQ] = Math.random() * 1000000,
                _a);
            return data;
        };
        AdapterEvent.prototype.query = function (lastTime) {
            return new Query(lastTime);
        };
        AdapterEvent.prototype.getGCLimit = function () {
            return 150;
        };
        AdapterEvent.prototype.getGCKeyBound = function () {
            return IDBKeyRange.upperBound([Date.now() - HALF_MINUTE]);
        };
        AdapterEvent.prototype.getVersion = function () {
            return this.version;
        };
        return AdapterEvent;
    }());
    exports.AdapterEvent = AdapterEvent;
});
