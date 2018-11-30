define("Lib/ServerEvent/native/_IndexedDB/AdapterStomp", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var MINUTE = 60000;
    var Query = /** @class */ (function () {
        function Query() {
        }
        Query.prototype.getKeyRange = function () {
            return undefined;
        };
        Query.prototype.getFilter = function (channelFilter) {
            return function (value, index, array) {
                var channel;
                if (value["headers"] && value["headers"]["event-type"]) {
                    channel = value["headers"]["event-type"];
                }
                return channel.match(channelFilter);
            };
        };
        return Query;
    }());
    var AdapterStomp = /** @class */ (function () {
        function AdapterStomp() {
        }
        /**
         * Получение ключевых полей
         * @return {string}
         */
        AdapterStomp.prototype.getKeyPath = function () {
            return 'timestamp';
        };
        /**
         * Подготовка данных к записи
         * @param {Stomp.Message} message
         */
        AdapterStomp.prototype.prepare = function (message) {
            var _a;
            var key = Date.now();
            var data = (_a = {
                    headers: message.headers,
                    body: message.body,
                    command: message.command
                },
                _a[this.getKeyPath()] = key,
                _a);
            return data;
        };
        AdapterStomp.prototype.query = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new Query();
        };
        AdapterStomp.prototype.getGCLimit = function () {
            return 150;
        };
        AdapterStomp.prototype.getGCKeyBound = function () {
            return IDBKeyRange.upperBound(Date.now() - MINUTE);
        };
        AdapterStomp.prototype.getVersion = function () {
            return 1;
        };
        return AdapterStomp;
    }());
    exports.AdapterStomp = AdapterStomp;
});
