define("Lib/ServerEvent/_class/logger/ConfirmLogger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Lib/ServerEvent/_class/logger/ConfirmLogger" />
    /**
     * TODO удалить метка #УдлБ
     * Логгер подтверждения доставки сообщений
     * @class Lib.ServerEventBus.class.logger.ConfirmLogger
     * @memberOf module:ServerEvent.class.logger
     */
    var ConfirmLogger = /** @class */ (function () {
        function ConfirmLogger() {
            this.data = new Map();
        }
        ConfirmLogger.prototype.send = function (port, eventName) {
            var obj = this.data.get(port);
            obj = obj || {};
            if (!(eventName in obj)) {
                obj[eventName] = { 'send': 0, 'confirm': 0 };
            }
            obj[eventName]['send']++;
            this.data.set(port, obj);
        };
        ConfirmLogger.prototype.confirm = function (port, eventName) {
            var obj = this.data.get(port);
            obj = obj || {};
            if (!(eventName in obj)) {
                obj[eventName] = { 'send': 0, 'confirm': 0 };
            }
            obj[eventName]['confirm']++;
            this.data.set(port, obj);
        };
        ConfirmLogger.prototype.stat = function () {
            var stat = [];
            this.data.forEach(function (val) {
                stat.push(val);
            });
            return stat;
        };
        return ConfirmLogger;
    }());
    exports.ConfirmLogger = ConfirmLogger;
});
