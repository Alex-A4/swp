define("Lib/ServerEvent/_class/Notifier", ["require", "exports", "Core/EventBus", "Lib/ServerEvent/ResponseConverter", "Lib/ServerEvent/_class/logger/WatchDogAggregator"], function (require, exports, EventBus, Converter, WatchDogAggregator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EVENTS_CONNECT;
    (function (EVENTS_CONNECT) {
        EVENTS_CONNECT["READY"] = "onready";
        EVENTS_CONNECT["DISCONNECT"] = "ondisconnect";
    })(EVENTS_CONNECT || (EVENTS_CONNECT = {}));
    var Notifier = /** @class */ (function () {
        function Notifier(watcher) {
            this.watcher = watcher;
            this.readyStatuses = {};
            if (!watcher) {
                this.watcher = new WatchDogAggregator_1.WatchDogAggregator();
            }
        }
        Notifier.prototype.setWatcher = function (watcher) {
            this.watcher = watcher;
        };
        /**
         * Уведомляем о событии
         * @param {string} channelName
         * @param {string} eventName
         * @param {string} rawData
         */
        Notifier.prototype.fire = function (channelName, eventName, rawData) {
            if (this.isSkip(channelName, eventName)) {
                return;
            }
            var data;
            if (rawData) {
                data = Converter(rawData);
            }
            this.watcher.logEvent(channelName, eventName, data);
            EventBus.channel(channelName).notify(eventName, data, rawData);
        };
        /**
         * Событие onready должно по каналу приходить только один раз. Либо после ondisconnect.
         * Транспортами это не возможно в случае с главной вкладкой.
         * @param {string} channelName
         * @param {string} eventName
         * @return {boolean} Нужно ли пропустить текущее событие onready
         */
        Notifier.prototype.isSkip = function (channelName, eventName) {
            if (eventName !== EVENTS_CONNECT.READY && eventName !== EVENTS_CONNECT.DISCONNECT) {
                return false;
            }
            if (eventName === EVENTS_CONNECT.READY && this.readyStatuses[channelName]) {
                return true;
            }
            if (eventName === EVENTS_CONNECT.READY) {
                this.readyStatuses[channelName] = true;
                /**
                 * Нужно выстоить длину очереди события onready в 1,
                 *  что бы подписки после подключения, получали это соыбтие
                 */
                EventBus.channel(channelName).setEventQueueSize(EVENTS_CONNECT.READY, 1);
            }
            if (eventName === EVENTS_CONNECT.DISCONNECT) {
                this.readyStatuses[channelName] = false;
                /**
                 * Нужно убрать очередь. Что бы при дисконекте не получили прошлый onready
                 */
                EventBus.channel(channelName).setEventQueueSize(EVENTS_CONNECT.READY, 0);
            }
            return false;
        };
        return Notifier;
    }());
    exports.Notifier = Notifier;
});
