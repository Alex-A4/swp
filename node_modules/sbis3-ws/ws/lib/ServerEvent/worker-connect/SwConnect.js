/// <amd-module name="Lib/ServerEvent/worker-connect/SwConnect" />
define("Lib/ServerEvent/worker-connect/SwConnect", ["require", "exports", "Lib/ServerEvent/worker-connect/Constants", "Lib/ServerEvent/worker-connect/messages/Page"], function (require, exports, CONST, PageMessage) {
    "use strict";
    var SwConnect;
    (function (SwConnect) {
        /**
         * TODO нужно разобраться с onready/ondisconnect для канализированных событий
         * @class Lib/ServerEvent/Connect
         */
        var Connect = /** @class */ (function () {
            function Connect(channel) {
                this._onmessage = function () {
                };
                this._onready = function () {
                };
                this._ondisconnect = function () {
                };
                this._onwebsocketclose = function () {
                };
                this._connect = channel;
                this._connect.port1.onmessage = this.messageHandler.bind(this);
            }
            Connect.prototype.subscribe = function (channelName) {
                this._connect.port1.postMessage(new PageMessage.PmSubscribe(channelName));
            };
            Connect.prototype.subscribeChanneled = function (channelName, target) {
                this._connect.port1.postMessage(new PageMessage.PmSubChanneled(channelName, target));
            };
            Connect.prototype.unsubscribeChanneled = function (channelName, target) {
                this._connect.port1.postMessage(new PageMessage.PmUnsubChanneled(channelName, target));
            };
            Object.defineProperty(Connect.prototype, "onmessage", {
                set: function (value) {
                    if (!(value instanceof Function)) {
                        this._onmessage = function () {
                        };
                        return;
                    }
                    this._onmessage = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Connect.prototype, "onready", {
                set: function (value) {
                    if (!(value instanceof Function)) {
                        this._onready = function () {
                        };
                        return;
                    }
                    this._onready = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Connect.prototype, "ondisconnect", {
                set: function (value) {
                    if (!(value instanceof Function)) {
                        this._ondisconnect = function () {
                        };
                        return;
                    }
                    this._ondisconnect = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Connect.prototype, "onwebsocketclose", {
                set: function (value) {
                    if (!(value instanceof Function)) {
                        this._onwebsocketclose = function () {
                        };
                        return;
                    }
                    this._onwebsocketclose = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Connect.prototype, "connect", {
                get: function () {
                    return this._connect;
                },
                enumerable: true,
                configurable: true
            });
            Connect.prototype.messageHandler = function (event) {
                /*SwServerEventBus.IsDebugPort && console.log('[ServerEventBus][port] message', event.data);*/
                if (!(event && event.data && event.data.type)) {
                    return;
                }
                if (event.data.type == CONST.SW_MESSAGES.WEBSOCKET_CLOSE) {
                    return this._onwebsocketclose();
                }
                if (!(event && event.data && event.data.headers && event.data.headers["event-type"])) {
                    return;
                }
                var eventName = event.data.headers["event-type"].toLocaleLowerCase();
                if (event.data.type == CONST.SW_MESSAGES.CLOSE) {
                    return this._ondisconnect(eventName);
                }
                if (event.data.type == CONST.SW_MESSAGES.READY) {
                    return this._onready(eventName);
                }
                if (event.data.type != CONST.SW_MESSAGES.MESSAGE) {
                    return;
                }
                this._onmessage(event.data.message);
            };
            Connect.prototype.closePort = function () {
                this._connect.port1.postMessage(new PageMessage.PmDisconnect());
                this._connect.port1.close();
            };
            Connect.prototype.destructor = function () {
                this.closePort();
                this._connect = undefined;
            };
            return Connect;
        }());
        SwConnect.Connect = Connect;
        var Connector = /** @class */ (function () {
            function Connector(channel) {
                this.channel = channel;
            }
            /**
             * @param url
             * @param exchangeName
             * @param sid
             * @param hash
             * @param isPersist постоянное ли подключение
             * @return {Promise<Connect>}
             */
            Connector.prototype.connect = function (url, exchangeName, sid, hash, isPersist, isAck) {
                var _this = this;
                return new Promise(function (resolve, reject) {
                    _this.channel.port1.onmessage = function (event) {
                        var data = event.data;
                        if (data.type == 'error') {
                            return reject(event.data.message);
                        }
                        _this.channel.port1.onmessage = undefined;
                        if (data.type == 'connect') {
                            resolve(_this.channel);
                        }
                    };
                    _this.channel.port1.postMessage(new PageMessage.PmConnect(url, exchangeName, sid, hash, isPersist, isAck));
                }).then(function (channel) {
                    return new Connect(channel);
                });
            };
            return Connector;
        }());
        SwConnect.Connector = Connector;
    })(SwConnect || (SwConnect = {}));
    return SwConnect;
});
