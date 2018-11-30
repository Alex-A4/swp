define("Lib/ServerEvent/_class/ConnectOptions", ["require", "exports", "Lib/ServerEvent/_class/Constants"], function (require, exports, CONST) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @class Lib/ServerEvent/_class/ConnectOptions
     * @memberOf module:ServerEvent.class
     */
    var ConnectOptions = /** @class */ (function () {
        function ConnectOptions(sid, hash, protocol, domain, stompPath, exchange, cid, uid, __isDesktop) {
            if (cid === void 0) { cid = null; }
            if (uid === void 0) { uid = null; }
            if (__isDesktop === void 0) { __isDesktop = false; }
            this.sid = sid;
            this.hash = hash;
            this.protocol = protocol;
            this.domain = domain;
            this.stompPath = stompPath;
            this.exchange = exchange;
            this.cid = cid;
            this.uid = uid;
            this.__isDesktop = __isDesktop;
        }
        /**
         * Url для подготовка обменника
         * @param {string} sid
         * @return {string}
         */
        ConnectOptions.prototype.getUrl = function () {
            return this.protocol + "//" + this.domain + this.stompPath + "s-" + this.sid + "/info?t=" + new Date().valueOf();
        };
        ConnectOptions.prototype.isDesktop = function () {
            return this.__isDesktop;
        };
        /**
         * Возвращем url для соединения WebSocket
         * @return {string}
         */
        ConnectOptions.prototype.getWebSocketUrl = function () {
            var protocol = this.protocol === 'http:' ? 'ws:' : 'wss:';
            return protocol + "//" + this.domain + this.stompPath + "s-" + this.sid + "/";
        };
        /**
         * Возвращает путь до сервиса stomp от домена
         * @return {string} например: /stomp/
         */
        ConnectOptions.prototype.getStompPath = function () {
            return this.stompPath;
        };
        ConnectOptions.prototype.getUid = function (scope) {
            switch (scope) {
                case CONST.CHANNEL_SCOPE.CLIENT:
                    return this.cid;
                case CONST.CHANNEL_SCOPE.USER:
                    return this.uid;
                case CONST.CHANNEL_SCOPE.GLOBAL:
                default:
                    return null;
            }
        };
        ConnectOptions.createForDesktop = function (sid, hash, url, cid, uid) {
            if (cid === void 0) { cid = null; }
            if (uid === void 0) { uid = null; }
            var protocol = url.indexOf('https://') > -1 ? 'https:' : 'http:';
            var domain = url.replace('https://', '').replace('http://', '');
            return new ConnectOptions(sid, hash, protocol, domain, '/stomp/', domain, cid, uid, true);
        };
        ConnectOptions.createByLocation = function (sid, hash, stompPath, cid, uid) {
            if (cid === void 0) { cid = null; }
            if (uid === void 0) { uid = null; }
            var prefix = 'stomp-';
            if (location.host.split('.').length < 3) {
                prefix = 'stomp.';
            }
            return new ConnectOptions(sid, hash, location.protocol, "" + prefix + location.host, stompPath, location.hostname, cid, uid);
        };
        return ConnectOptions;
    }());
    exports.ConnectOptions = ConnectOptions;
});
