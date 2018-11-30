define("Lib/ServerEvent/native/SockjsEmulator", ["require", "exports"], function (require, exports) {
    "use strict";
    /// <amd-module name="Lib/ServerEvent/native/SockjsEmulator" />
    /**
     * @link https://github.com/sockjs/sockjs-client/blob/master/lib/utils/browser-crypto.js
     */
    function randomBytes(length) {
        var bytes = new Array(length);
        for (var i = 0; i < length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
        return bytes;
    }
    /**
     * @link https://github.com/sockjs/sockjs-client/blob/master/lib/utils/random.js
     * @type {string}
     * @private
     */
    var _randomStringChars = 'abcdefghijklmnopqrstuvwxyz012345';
    var random = {
        string: function (length) {
            var max = _randomStringChars.length;
            var bytes = randomBytes(length);
            var ret = [];
            for (var i = 0; i < length; i++) {
                ret.push(_randomStringChars.substr(bytes[i] % max, 1));
            }
            return ret.join('');
        },
        number: function (max) {
            return Math.floor(Math.random() * max);
        },
        numberString: function (max) {
            var t = ('' + (max - 1)).length;
            var p = new Array(t + 1).join('0');
            return (p + this.number(max)).slice(-t);
        }
    };
    /*let onmessage = function (e) {
        self.emit('message', e.data);
    };
    
    function emit() {
        var type = arguments[0];
        var listeners = this._listeners[type];
        if (!listeners) {
            return;
        }
        // equivalent of Array.prototype.slice.call(arguments, 1);
        var l = arguments.length;
        var args = new Array(l - 1);
        for (var ai = 1; ai < l; ai++) {
            args[ai - 1] = arguments[ai];
        }
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].apply(this, args);
        }
    };*/
    /**
     * @link https://github.com/sockjs/sockjs-client/blob/master/lib/main.js#L53
     */
    var DEFAULT_SESSION_ID = 8;
    /**
     * @link https://tools.ietf.org/html/rfc6455#section-7.4.1
     */
    var WEBSOCKET_SERVER_CLOSE_CONNECT = 3000;
    var SockJSTransport = /** @class */ (function () {
        /**
         * @link https://github.com/sockjs/sockjs-client/blob/master/lib/main.js#L216
         * @param url
         * @param protocols
         * @param checkHeartbeat нужно ли проверять heartbeat при установке соединения
         */
        function SockJSTransport(url, protocols, checkHeartbeat) {
            if (protocols === void 0) { protocols = []; }
            if (checkHeartbeat === void 0) { checkHeartbeat = true; }
            var server = random.numberString(1000);
            var session = random.string(DEFAULT_SESSION_ID);
            var slash = url[url.length - 1] === '/' ? '' : '/';
            this.ws = new WebSocket("" + url + slash + server + "/" + session + "/websocket", protocols);
            this.checkHeartbeat = this.checkHeartbeat.bind(this);
            this.updateHeartbeat = this.updateHeartbeat.bind(this);
            this.lastHeartbeat = new Date().getTime();
            this.ws.onmessage = this.updateHeartbeat;
            if (checkHeartbeat) {
                this.intervalHeartbeatId = setInterval(this.checkHeartbeat, SockJSTransport.HEARTBEAT_TIMEOUT);
            }
        }
        SockJSTransport.prototype.checkHeartbeat = function () {
            if (this.lastHeartbeat + SockJSTransport.HEARTBEAT_TIMEOUT < new Date().getTime()) {
                clearInterval(this.intervalHeartbeatId);
                this.close(WEBSOCKET_SERVER_CLOSE_CONNECT);
            }
        };
        SockJSTransport.prototype.updateHeartbeat = function () {
            this.lastHeartbeat = new Date().getTime();
        };
        /**
         * @link https://github.com/bestiejs/json3/blob/master/lib/json3.js#L161
         * @param data
         */
        SockJSTransport.prototype.send = function (data) {
            /* eslint-disable no-control-regex */
            var text = data
                .replace(/\u0000/gm, "\\u0000")
                /*.replace(/\b/gm, "\\b")*/
                .replace(/\n/gm, "\\n")
                .replace(/\f/gm, "\\f")
                .replace(/\r/gm, "\\r")
                .replace(/\t/gm, "\\t");
            /* eslint-enable no-control-regex */
            var msg = "[\"" + text + "\"]";
            this.ws.send(msg);
        };
        /**
         * Закрыте websocket.
         *  не передаём параметры, т.к. в safari он не понимает их.
         *  https://online.sbis.ru/opendoc.html?guid=660f28c1-d0f9-400b-84cc-9a22e80b6528
         * @param {number} code
         * @param {string} reason
         */
        SockJSTransport.prototype.close = function (code, reason) {
            this.ws.close();
        };
        Object.defineProperty(SockJSTransport.prototype, "binaryType", {
            get: function () {
                return this.ws.binaryType;
            },
            set: function (value) {
                this.ws.binaryType = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "bufferedAmount", {
            get: function () {
                return this.ws.bufferedAmount;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "extensions", {
            get: function () {
                return this.ws.extensions;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "onclose", {
            get: function () {
                return this.ws.onclose;
            },
            set: function (value) {
                this.ws.onclose = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "onerror", {
            get: function () {
                return this.ws.onerror;
            },
            set: function (value) {
                this.ws.onerror = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "onmessage", {
            get: function () {
                return this.ws.onmessage;
            },
            set: function (value) {
                var _this = this;
                this.ws.onmessage = function (ev) {
                    _this.updateHeartbeat();
                    if (!ev.data) {
                        return;
                    }
                    if (ev.data[0] === SockJSTransport.FRAME_CLOSE) {
                        var data_1 = JSON.parse(ev.data.substr(1));
                        if (!data_1[1]) {
                            return;
                        }
                        value.call(_this, new MessageEvent('websocket', {
                            data: data_1[1],
                            origin: ev.origin,
                            source: ev.source
                        }));
                        return _this.close();
                    }
                    if (SockJSTransport.CONTROL_FRAMES.indexOf(ev.data[0]) !== -1) {
                        return;
                    }
                    if (SockJSTransport.FRAME_ARRAY !== ev.data[0]) {
                        value.call(_this, Object.create(ev, { data: { value: ev.data } }));
                    }
                    var data = JSON.parse(ev.data.substr(1));
                    for (var i = 0; i < data.length; i++) {
                        value.call(_this, Object.create(ev, { data: { value: data[i] } }));
                    }
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "onopen", {
            get: function () {
                return this.ws.onopen;
            },
            set: function (value) {
                this.ws.onopen = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "protocol", {
            get: function () {
                return this.ws.protocol;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "readyState", {
            get: function () {
                return this.ws.readyState;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "url", {
            get: function () {
                return this.ws.url;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "CLOSED", {
            get: function () {
                return this.ws.CLOSED;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "CLOSING", {
            get: function () {
                return this.ws.CLOSING;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "CONNECTING", {
            get: function () {
                return this.ws.CONNECTING;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SockJSTransport.prototype, "OPEN", {
            get: function () {
                return this.ws.OPEN;
            },
            enumerable: true,
            configurable: true
        });
        SockJSTransport.prototype.addEventListener = function (type, listener, useCapture) {
            if (useCapture === void 0) { useCapture = false; }
            this.ws.addEventListener(type, listener, useCapture);
        };
        SockJSTransport.prototype.dispatchEvent = function (evt) {
            return this.ws.dispatchEvent(evt);
        };
        SockJSTransport.prototype.removeEventListener = function (type, listener, useCapture) {
            this.ws.removeEventListener(type, listener);
        };
        /**
        * @lik http://sockjs.github.io/sockjs-protocol/sockjs-protocol-0.3.3.html#section-42
        */
        SockJSTransport.FRAME_OPEN = "o";
        SockJSTransport.FRAME_HEARTBEAT = "h";
        SockJSTransport.FRAME_ARRAY = "a";
        SockJSTransport.FRAME_CLOSE = "c";
        SockJSTransport.CONTROL_FRAMES = [
            SockJSTransport.FRAME_OPEN,
            SockJSTransport.FRAME_HEARTBEAT,
            SockJSTransport.FRAME_CLOSE
        ];
        /**
         * Default timeout is 25sec.
         * Check 30sec delay
         * @type {number}
         */
        SockJSTransport.HEARTBEAT_TIMEOUT = 30000;
        return SockJSTransport;
    }());
    return SockJSTransport;
});
