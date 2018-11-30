/// <amd-module name="Lib/ServerEvent/worker-connect/messages/Page" />
define("Lib/ServerEvent/worker-connect/messages/Page", ["require", "exports", "tslib"], function (require, exports, tslib_1) {
    "use strict";
    var Page;
    (function (Page) {
        var PortMessage = /** @class */ (function () {
            function PortMessage(command) {
                this.command = command;
            }
            return PortMessage;
        }());
        Page.PortMessage = PortMessage;
        var PmDisconnect = /** @class */ (function (_super) {
            tslib_1.__extends(PmDisconnect, _super);
            function PmDisconnect() {
                return _super.call(this, 'disconnect') || this;
            }
            return PmDisconnect;
        }(PortMessage));
        Page.PmDisconnect = PmDisconnect;
        var PmConnect = /** @class */ (function (_super) {
            tslib_1.__extends(PmConnect, _super);
            function PmConnect(url, exchangeName, sid, hash, isPersist, isAck) {
                if (isAck === void 0) { isAck = false; }
                var _this = _super.call(this, 'connect') || this;
                _this.url = url;
                _this.exchangeName = exchangeName;
                _this.sid = sid;
                _this.hash = hash;
                _this.persist = isPersist;
                _this.ack = isAck;
                return _this;
            }
            return PmConnect;
        }(PortMessage));
        Page.PmConnect = PmConnect;
        var PmSubscribe = /** @class */ (function (_super) {
            tslib_1.__extends(PmSubscribe, _super);
            function PmSubscribe(eventName) {
                var _this = _super.call(this, 'subscribe') || this;
                _this.eventName = eventName;
                return _this;
            }
            return PmSubscribe;
        }(PortMessage));
        Page.PmSubscribe = PmSubscribe;
        var PmSubChanneled = /** @class */ (function (_super) {
            tslib_1.__extends(PmSubChanneled, _super);
            function PmSubChanneled(eventName, person) {
                var _this = _super.call(this, 'subscribe.channel') || this;
                _this.eventName = eventName;
                _this.person = person;
                return _this;
            }
            return PmSubChanneled;
        }(PortMessage));
        Page.PmSubChanneled = PmSubChanneled;
        var PmUnsubscribe = /** @class */ (function (_super) {
            tslib_1.__extends(PmUnsubscribe, _super);
            function PmUnsubscribe(eventName) {
                var _this = _super.call(this, 'unsubscribe') || this;
                _this.eventName = eventName;
                return _this;
            }
            return PmUnsubscribe;
        }(PortMessage));
        Page.PmUnsubscribe = PmUnsubscribe;
        var PmUnsubChanneled = /** @class */ (function (_super) {
            tslib_1.__extends(PmUnsubChanneled, _super);
            function PmUnsubChanneled(eventName, person) {
                var _this = _super.call(this, 'unsubscribe.channel') || this;
                _this.eventName = eventName;
                _this.person = person;
                return _this;
            }
            return PmUnsubChanneled;
        }(PortMessage));
        Page.PmUnsubChanneled = PmUnsubChanneled;
    })(Page || (Page = {}));
    return Page;
});
