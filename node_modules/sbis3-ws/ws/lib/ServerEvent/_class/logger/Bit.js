define("Lib/ServerEvent/_class/logger/Bit", ["require", "exports", "Transport/RPCJSON", "Core/UserInfo"], function (require, exports, RPCJSON, UserInfo) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EVENT_CHANNEL = 'sbis.page.ping';
    var SERVICE = '/test_client_service/service/';
    var METHOD_FAIL = 'ClientEventTest.Record';
    /**
     * Таймаут на повисший коннект у нас ~5 минут
     * @type {number}
     */
    var PING_DETECT_TIMEOUT = 6 * 60 * 1000;
    var Ping = /** @class */ (function () {
        function Ping(num, timestamp) {
            if (timestamp === void 0) { timestamp = Date.now(); }
            this.num = num;
            this.timestamp = timestamp;
        }
        Ping.compare = function (a, b) {
            if (a.num > b.num) {
                return 1;
            }
            if (a.num < b.num) {
                return -1;
            }
            return 0;
        };
        return Ping;
    }());
    /**
     * @namespace Lib/ServerEvent/_class
     * @class Bit
     */
    var Bit = /** @class */ (function () {
        function Bit(seb) {
            var _this = this;
            this.lastPingNum = 0;
            this.pings = [];
            if (!window) {
                return;
            }
            this.tabId = Bit.generateID();
            this.appendPing = this.appendPing.bind(this);
            this.detectAfterReconnect = this.detectAfterReconnect.bind(this);
            seb.serverChannel(EVENT_CHANNEL).subscribe('onready', function () {
                _this.lastConnect = Date.now();
            });
            seb.serverChannel(EVENT_CHANNEL).subscribe('onmessage', this.appendPing);
            seb.serverChannel(EVENT_CHANNEL).subscribe('ondisconnect', function () {
                _this.lastDisconnect = Date.now();
                if (_this.detectMode) {
                    clearTimeout(_this.detectMode);
                }
                _this.detectMode = setTimeout(_this.detectAfterReconnect, PING_DETECT_TIMEOUT);
            });
        }
        Bit.prototype.appendPing = function (event, data) {
            var last = this.lastPingNum;
            this.lastPingNum = data;
            if (this.detectMode) {
                this.pings.push(new Ping(data));
                return;
            }
            if (last + 1 == data || data == 0 || last == 0) {
                return;
            }
            var userId = UserInfo.get('ИдентификаторПользователя');
            var mode = 'skip';
            if (last + 1 > data) {
                mode = 'wrong order';
            }
            var rpc = new RPCJSON({ serviceUrl: SERVICE, asyncInvoke: true });
            rpc.callMethod(METHOD_FAIL, {
                data: {
                    m: mode,
                    userId: userId,
                    tab: this.tabId,
                    last: last,
                    current: data,
                    detected: Date.now(),
                    connect: this.lastConnect,
                    disconnect: this.lastDisconnect
                }
            });
        };
        Bit.prototype.detectAfterReconnect = function () {
            if (this.pings.length === 0) {
                return;
            }
            var userId = UserInfo.get('ИдентификаторПользователя');
            var sequence = this.pings.sort(Ping.compare);
            var last = sequence.shift();
            for (var _i = 0, sequence_1 = sequence; _i < sequence_1.length; _i++) {
                var ping = sequence_1[_i];
                if (last.num + 1 === ping.num) {
                    last = ping;
                    continue;
                }
                var data = {
                    m: 'skip',
                    userId: userId,
                    tab: this.tabId,
                    last: last.num,
                    current: ping.num,
                    detected: ping.timestamp,
                    connect: this.lastConnect,
                    disconnect: this.lastDisconnect
                };
                last = ping;
                try {
                    var rpc = new RPCJSON({ serviceUrl: SERVICE, asyncInvoke: true });
                    rpc.callMethod(METHOD_FAIL, { data: data });
                }
                catch (e) { }
            }
            this.pings = [];
            this.lastPingNum = last.num;
            this.detectMode = undefined;
        };
        Bit.generateID = function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4();
        };
        return Bit;
    }());
    exports.Bit = Bit;
});
