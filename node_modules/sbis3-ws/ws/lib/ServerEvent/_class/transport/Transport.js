define("Lib/ServerEvent/_class/transport/Transport", ["require", "exports", "Lib/ServerEvent/_class/logger/WatchDogAggregator"], function (require, exports, WatchDogAggregator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Класс транспорта, который работает с доставщиком.
     * TODO нужно что-то придумать с protected методами. Не удачное решение.
     */
    var Transport = /** @class */ (function () {
        function Transport() {
            this.watcher = new WatchDogAggregator_1.WatchDogAggregator();
            this.messageHandler = this.messageHandler.bind(this);
        }
        Transport.prototype.messageHandler = function (message) {
            if (!('event-type' in message.headers)) {
                return;
            }
            var channelName = message.headers["event-type"].toLocaleLowerCase();
            this.watcher.logStomp(message);
            this.delivery && this.delivery.deliver(channelName, 'onmessage', message.body);
        };
        Transport.prototype.destructor = function () {
            this.delivery && this.delivery.destroy();
        };
        Transport.prototype.setDelivery = function (delivery) {
            this.delivery = delivery;
        };
        Transport.prototype.setWatchDog = function (watcher) {
            this.watcher = watcher;
        };
        return Transport;
    }());
    exports.Transport = Transport;
});
