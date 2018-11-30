define("Lib/ServerEvent/_class/logger/ConsoleWatchDog", ["require", "exports"], function (require, exports) {
    /// <amd-module name="Lib/ServerEvent/_class/logger/ConsoleWatchDog" />
    /**
     * @author Санников К.А.
     */
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ConsoleWatchDog = /** @class */ (function () {
        function ConsoleWatchDog() {
        }
        ConsoleWatchDog.prototype.logStomp = function (message) {
            console.log('[STOMP]', message); // eslint-disable-line no-console
        };
        ConsoleWatchDog.prototype.logEvent = function (channelName, eventName, data) {
            console.log("[ServerEvent][" + channelName + "][" + eventName + "]", data); //eslint-disable-line no-console
        };
        return ConsoleWatchDog;
    }());
    exports.ConsoleWatchDog = ConsoleWatchDog;
});
