define("Lib/ServerEvent/_class/transport/ExclusiveProxy", ["require", "exports", "Core/Deferred", "Core/LocalStorageNative", "Lib/ServerEvent/_class/Constants", "Lib/ServerEvent/_class/DeviceEnv", "Lib/ServerEvent/_class/transport/TransportChooser", "Lib/ServerEvent/_class/Subscribe", "Lib/ServerEvent/DebugUtils"], function (require, exports, Deferred, LocalStorageNative, CONST, DeviceEnv_1, TransportChooser_1, Subscribe_1, DebugUtils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SubscribeExclusiveError = /** @class */ (function () {
        function SubscribeExclusiveError() {
            this.message = 'Need subscribe connect to subscribe';
            this.name = 'SubscribeExclusiveError';
        }
        return SubscribeExclusiveError;
    }());
    /**
     * @private
     * @class ExclusiveProxy
     * Класс, который оборачивает стандартные транспорты, для решения задач:
     *  <li>для идентификации смены эксклюзивности подписок</li>
     *  <li>для cоздания подписок с полным набором данных</li>
     */
    var ExclusiveProxy = /** @class */ (function () {
        function ExclusiveProxy(transport, isExclusive, options) {
            this.transport = transport;
            this.isExclusive = isExclusive;
            this.options = options;
        }
        ExclusiveProxy.init = function (isExclusive, onCloseHandler, watcher) {
            if (isExclusive === void 0) { isExclusive = false; }
            var def = new Deferred();
            var connectOptions;
            DeviceEnv_1.DeviceEnv.getOptions().addCallback(function (options) {
                connectOptions = options;
                return new TransportChooser_1.TransportChooser(options, onCloseHandler, isExclusive, watcher).choose();
            }).addCallback(function (transport) {
                try {
                    DebugUtils.attachDebugFn();
                    watcher.logConnect({
                        connectOptions: connectOptions,
                        transport: transport.constructor.getLocalName()
                    });
                    if (window && LocalStorageNative.getItem('shared-bus-debug') === 'true') {
                        window["sharedBusWatch"]();
                    }
                }
                catch (e) {
                    // игнорируем проблемы отладочных утилит
                }
                def.callback(new ExclusiveProxy(transport, isExclusive, connectOptions));
            }).addErrback(function (err) {
                def.errback(err);
                return err;
            });
            return def;
        };
        ExclusiveProxy.prototype.subscribe = function (subscribe) {
            if (subscribe.getDeliveryType() !== CONST.DELIVERY_COMMON
                && !this.isExclusive) {
                throw new SubscribeExclusiveError();
            }
            if (subscribe instanceof Subscribe_1.RawChanneledSubscribe) {
                this.transport.subscribe(Subscribe_1.Subscribe.create(subscribe.getChannelName(), subscribe.isChanneled(), this.isExclusive, this.options.getUid(subscribe.getScope())));
                return;
            }
            this.transport.subscribe(subscribe);
        };
        ExclusiveProxy.prototype.unsubscribe = function (subscribe) {
            if (subscribe instanceof Subscribe_1.RawChanneledSubscribe) {
                this.transport.unsubscribe(Subscribe_1.Subscribe.create(subscribe.getChannelName(), subscribe.isChanneled(), this.isExclusive, this.options.getUid(subscribe.getScope())));
                return;
            }
            this.transport.unsubscribe(subscribe);
        };
        ExclusiveProxy.prototype.setDelivery = function (delivery) {
            this.transport.setDelivery(delivery);
        };
        ExclusiveProxy.prototype.close = function () {
            this.transport.close();
            this.transport = undefined;
        };
        ExclusiveProxy.prototype.setWatchDog = function (watcher) {
            this.transport.setWatchDog(watcher);
        };
        return ExclusiveProxy;
    }());
    exports.ExclusiveProxy = ExclusiveProxy;
});
