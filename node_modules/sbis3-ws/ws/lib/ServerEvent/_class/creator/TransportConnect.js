define("Lib/ServerEvent/_class/creator/TransportConnect", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TransportConnect = /** @class */ (function () {
        /**
         * @param {boolean} isUseSockjs использовать ли библиотеку SockJS
         */
        function TransportConnect(isUseSockjs) {
            if (isUseSockjs === void 0) { isUseSockjs = false; }
            this.connectWay = !isUseSockjs ? this.byWebSocket : this.bySockjs;
        }
        /**
         * @param {string} url Строка подключения
         * @param {boolean} isHeartbit Првоерять ли heartbit от сервера.
         *  Если не пришел, то рвем соединение.
         */
        TransportConnect.prototype.getWebSocket = function (url, isHeartbit) {
            if (isHeartbit === void 0) { isHeartbit = true; }
            return new Promise(function (resolve, reject) {
                require(["Lib/ServerEvent/native/SockjsEmulator"], function (SockJSTransport) {
                    try {
                        resolve(new SockJSTransport(url, undefined, isHeartbit));
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
        };
        TransportConnect.prototype.getSockjs = function (sockjs, url) {
            return new Promise(function (resolve, reject) {
                try {
                    var connect = new sockjs(url.replace('wss:', 'https:').replace('ws:', 'http:'), null, {
                        transports: ['xhr-streaming'],
                        debug: function () {
                        },
                        stompLogger: function () {
                        }
                    });
                    resolve(connect);
                }
                catch (e) {
                    return reject(e);
                }
            });
        };
        TransportConnect.prototype.requireStomp = function () {
            return new Promise(function (resolve) {
                require(["Lib/ServerEvent/resources/stomp"], function () {
                    resolve();
                });
            });
        };
        /**
         * @return {Promise<SockJS>}
         */
        TransportConnect.prototype.requireSockjs = function () {
            return new Promise(function (resolve, reject) {
                require([
                    "Lib/ServerEvent/resources/stomp",
                    "Lib/ServerEvent/resources/sockjs-1.0.3"
                ], function (_, sockjs) {
                    if (!sockjs) {
                        return reject("Can't load Lib/ServerEvent/resources/sockjs-1.0.3");
                    }
                    resolve(sockjs);
                });
            });
        };
        /**
         * @param {string} url Строка подключения
         * @param {boolean} isHeartbit Првоерять ли heartbit от сервера.
         *  Если не пришел, то рвем соединение.
         */
        TransportConnect.prototype.byWebSocket = function (url, isHeartbit) {
            var _this = this;
            return this.requireStomp().then(function () { return _this.getWebSocket(url, isHeartbit); });
        };
        /**
         * @param {string} url Строка подключения
         * @param {boolean} isHeartbit Првоерять ли heartbit от сервера.
         *  Если не пришел, то рвем соединение.
         */
        TransportConnect.prototype.bySockjs = function (url) {
            var _this = this;
            return this.requireSockjs().then(function (sockjs) {
                return _this.getSockjs(sockjs, url);
            });
        };
        TransportConnect.prototype.initStomp = function (webSocket) {
            return new Promise(function (resolve, reject) {
                var stomp = Stomp.over(webSocket);
                stomp.heartbeat.outgoing = TransportConnect.STOMP_HEARTBEAT_OUT_TIME;
                stomp.heartbeat.incoming = TransportConnect.STOMP_HEARTBEAT_IN_TIME;
                stomp.debug = function () { };
                stomp.connect(TransportConnect.LOGIN, TransportConnect.PASSWORD, function () { resolve(stomp); }, function (data) { reject(data); });
            });
        };
        TransportConnect.prototype.connect = function (connectOptions, isHeartbit) {
            return this.connectWay(connectOptions.getWebSocketUrl(), isHeartbit).then(this.initStomp);
        };
        TransportConnect.STOMP_HEARTBEAT_OUT_TIME = 60000;
        TransportConnect.STOMP_HEARTBEAT_IN_TIME = 0;
        TransportConnect.LOGIN = 'stomp_user';
        TransportConnect.PASSWORD = 'stomp_user';
        return TransportConnect;
    }());
    exports.TransportConnect = TransportConnect;
});
