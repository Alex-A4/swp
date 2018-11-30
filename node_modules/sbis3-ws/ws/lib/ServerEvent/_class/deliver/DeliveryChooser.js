define("Lib/ServerEvent/_class/deliver/DeliveryChooser", ["require", "exports", "Core/Deferred", "Core/detection", "Lib/ServerEvent/_class/Notifier", "Lib/ServerEvent/_class/deliver/Browser", "Lib/ServerEvent/_class/deliver/Page"], function (require, exports, Deferred, detection, Notifier_1, Browser_1, Page_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Создаю один доставщик на страницу.
     * Как бы не менялись транспорты, канал остаётся один.
     * @type {Notifier}
     */
    var notifier = new Notifier_1.Notifier();
    // const DEVELOPER_ID = 7404311; // ka.sannikov
    // let isTestIndexedDB: boolean = false;
    var DeliveryChooser = /** @class */ (function () {
        function DeliveryChooser(watcher) {
            this.watcher = watcher;
            notifier.setWatcher(watcher);
        }
        DeliveryChooser.prototype.choose = function (transport) {
            if (transport.getLocalName() === 'WorkerTransport' || detection.isMobileIOS) {
                return Deferred.success(new Page_1.Page(notifier));
            }
            var DeliverConstructor = Page_1.Page;
            if (transport.getLocalName() !== 'LocalPageTransport') {
                DeliverConstructor = Browser_1.Browser;
            }
            // if (isTestIndexedDB) {
            //     return this.tryLazyIndexedDb().addErrback(function (err) {
            //         return new DeliverConstructor(notifier);
            //     });
            // }
            var isIndexedDbDeliver = detection.isMobileAndroid;
            if (isIndexedDbDeliver
                && typeof Promise !== 'undefined'
                && typeof indexedDB !== 'undefined'
                && indexedDB !== null) {
                return this.tryLazyIndexedDb().addErrback(function () {
                    return new DeliverConstructor(notifier);
                });
            }
            return Deferred.success(new DeliverConstructor(notifier));
        };
        DeliveryChooser.prototype.tryLazyIndexedDb = function () {
            var def = new Deferred();
            /**
             * IndexedDB не надежное. Может просто не ответить.
             */
            var timerIndexDBInit;
            require(['Lib/ServerEvent/_class/deliver/IndexedDB'], function (mdl) {
                if (!mdl) {
                    return def.errback();
                }
                try {
                    timerIndexDBInit = setTimeout(function () {
                        def.errback('Timeout crete indexedDB');
                    }, 3000);
                    def.dependOn(mdl.IndexedDB.create(notifier));
                }
                catch (e) {
                    def.errback(e);
                }
            });
            def.addCallback(function (r) {
                clearTimeout(timerIndexDBInit);
                return r;
            });
            return def;
        };
        return DeliveryChooser;
    }());
    exports.DeliveryChooser = DeliveryChooser;
});
