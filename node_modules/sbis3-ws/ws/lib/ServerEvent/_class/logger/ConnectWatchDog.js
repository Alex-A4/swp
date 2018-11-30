define("Lib/ServerEvent/_class/logger/ConnectWatchDog", ["require", "exports"], function (require, exports) {
    /// <amd-module name="Lib/ServerEvent/_class/logger/ConnectWatchDog" />
    /**
     * @author Санников К.А.
     */
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ConnectWatchDog = /** @class */ (function () {
        function ConnectWatchDog() {
        }
        ConnectWatchDog.prototype.logStomp = function (message) {
        };
        ConnectWatchDog.prototype.logEvent = function (channelName, eventName, data) {
        };
        ConnectWatchDog.prototype.logConnect = function (data) {
            var info = data || {};
            var connect = info.connectOptions || {};
            var url = connect.getWebSocketUrl && connect.getWebSocketUrl() || '';
            var transport = info.transport || '';
            console.log("[STOMP][Connect][" + new Date().toLocaleString() + "]", "transport: " + transport + "; url: " + url); // eslint-disable-line no-console
        };
        ConnectWatchDog.prototype.logDisconnect = function (e) {
            console.log("[STOMP][Disconnect][" + new Date().toLocaleString() + "]", e); // eslint-disable-line no-console
        };
        return ConnectWatchDog;
    }());
    exports.ConnectWatchDog = ConnectWatchDog;
});
