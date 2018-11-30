define("Lib/ServerEvent/worker-connect/WorkerBuilder", ["require", "exports", "tslib", "Core/Deferred", "Lib/ServerEvent/worker-connect/SwConnect"], function (require, exports, tslib_1, Deferred, SwConnect) {
    /// <amd-module name="Lib/ServerEvent/worker-connect/WorkerBuilder" />
    /**
     * TODO выделить PortMessage в отдельные классы для использования в воркере и в билдере
     */
    "use strict";
    var VERSION = 318.350;
    var global = (function () {
        return this || (void (0), eval)('this');
    }());
    var WS_ROOT = '/ws/';
    if (window && window["wsConfig"] && window["wsConfig"]["wsRoot"]) {
        WS_ROOT = window["wsConfig"]["wsRoot"];
        WS_ROOT = WS_ROOT[WS_ROOT.length - 1] == '/' ? WS_ROOT : WS_ROOT + '/';
    }
    var WORKERS_PATH = WS_ROOT + "lib/ServerEvent/worker/";
    var SHARED_WORKER_PATH = WORKERS_PATH + "event-bus-shared.worker.js?v=" + VERSION;
    var WEB_WORKER_PATH = WORKERS_PATH + "event-bus-web.worker.js";
    var WorkerContainer = /** @class */ (function () {
        function WorkerContainer(worker) {
            this.worker = worker;
            if (worker instanceof SharedWorker) {
                this.postMessage = this._postSharedWorker;
            }
        }
        WorkerContainer.prototype.postMessage = function (message, transfer) {
            return this.worker.postMessage(message, transfer);
        };
        WorkerContainer.prototype._postSharedWorker = function (message, transfer) {
            return this.worker.port.postMessage(message, transfer);
        };
        WorkerContainer.prototype.terminate = function () {
            return this.worker.terminate();
        };
        return WorkerContainer;
    }());
    var ClientMessage = /** @class */ (function () {
        function ClientMessage(command) {
            this.command = command;
        }
        return ClientMessage;
    }());
    var ClientMessageHandshake = /** @class */ (function (_super) {
        tslib_1.__extends(ClientMessageHandshake, _super);
        function ClientMessageHandshake(port, debug) {
            var _this = _super.call(this, 'handshake') || this;
            _this.port = port;
            _this.debug = debug;
            return _this;
        }
        return ClientMessageHandshake;
    }(ClientMessage));
    ///endregion
    var SwHandeshake = /** @class */ (function () {
        function SwHandeshake(sw) {
            this.sw = sw;
            this.channel = new MessageChannel();
        }
        SwHandeshake.prototype.shake = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.channel.port1.onmessage = function (event) {
                    var data = event.data;
                    _this.channel.port1.onmessage = undefined;
                    if (data.type == 'handshake') {
                        resolve(_this.channel);
                    }
                };
                var isDebugSw;
                if (SwServerEventBus.IsDebugPort) {
                    isDebugSw = true;
                }
                _this.sw.postMessage(new ClientMessageHandshake(_this.channel.port2, isDebugSw), [_this.channel.port2]);
            });
        };
        return SwHandeshake;
    }());
    var SwInstaller = /** @class */ (function () {
        function SwInstaller() {
        }
        SwInstaller.getWorkerContainer = function (workerType) {
            var workerGetter;
            switch (workerType) {
                case SwInstaller.SHARED_WORKER:
                    workerGetter = SwInstaller.getSharedWorker;
                    break;
                /*case SwInstaller.SERVICE_WORKER:
                    workerGetter = SwInstaller.getServiceWorker;
                    break;*/
                case SwInstaller.WORKER:
                default:
                    workerGetter = SwInstaller.getWorker;
            }
            return workerGetter().then(function (worker) {
                return new WorkerContainer(worker);
            });
        };
        SwInstaller.getSharedWorker = function () {
            var path = SHARED_WORKER_PATH;
            if (!('SharedWorker' in global)) {
                return Promise.reject(new ReferenceError("SharedWorker is not support."));
            }
            var sharedWorker = new SharedWorker(path);
            sharedWorker.port.start();
            return Promise.resolve(sharedWorker);
        };
        SwInstaller.getWorker = function () {
            var path = WEB_WORKER_PATH;
            if (!('Worker' in global)) {
                return Promise.reject(new ReferenceError("Worker is not support."));
            }
            return Promise.resolve(new Worker(path));
        };
        SwInstaller.TIMEOUT = 5000;
        SwInstaller.STATE_INSTALLING = 'installing';
        SwInstaller.STATE_INSTALLINED = 'installed';
        SwInstaller.STATE_ACTIVATING = 'activating';
        SwInstaller.STATE_ACTIVATED = 'activated';
        SwInstaller.STATE_REDUNDANT = 'redundant';
        SwInstaller.WORKER = 'worker';
        SwInstaller.SHARED_WORKER = 'SharedWorker';
        SwInstaller.SERVICE_WORKER = 'ServiceWorker';
        return SwInstaller;
    }());
    /**
     * TODO избавиться. Сделать агрегацию.
     * Нужно разделить объект, на синхронный ответственный за работу с событиями
     * и асинхронный за работу с ServiceWorker
     */
    var SwServerEventBus = /** @class */ (function () {
        function SwServerEventBus() {
        }
        /**
         * Инициализатор нужен для запуска ServiceWorker и возврата Promise
         * Promise вернуть из конструктора невозможно
         * @return {Promise}
         */
        SwServerEventBus.createConnection = function (workerType, url, exchangeName, sid, hash, isPersist, isAck) {
            var def = new Deferred();
            SwInstaller.getWorkerContainer(workerType).then(function (sw) {
                var shaker = new SwHandeshake(sw);
                return shaker.shake().then(function (channel) {
                    return channel;
                });
            }).then(function (channel) {
                var connector = new SwConnect.Connector(channel);
                return connector.connect(url, exchangeName, sid, hash, isPersist, isAck);
            }).then(function (connect) {
                def.callback(connect);
            }).catch(function (message) {
                def.errback(message);
            });
            return def;
        };
        /**
         * Ввожу глобальные флаги, потому что не хочу использовать декораторы
         * @type {boolean}
         */
        SwServerEventBus.IsDebugPort = false;
        SwServerEventBus.IsDebugEB = false;
        return SwServerEventBus;
    }());
    return SwServerEventBus;
});
