define("Lib/ServerEvent/_class/logger/WatchDogAggregator", ["require", "exports"], function (require, exports) {
    /// <amd-module name="Lib/ServerEvent/_class/logger/WatchDogAggregator" />
    /**
     * @author Санников К.А.
     */
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var WatchDogAggregator = /** @class */ (function () {
        function WatchDogAggregator(container) {
            if (container === void 0) { container = []; }
            this.container = container;
        }
        WatchDogAggregator.prototype.reg = function (watcher) {
            this.container.push(watcher);
        };
        WatchDogAggregator.prototype.logStomp = function (message) {
            for (var _i = 0, _a = this.container; _i < _a.length; _i++) {
                var watcher = _a[_i];
                try {
                    watcher.logStomp(message);
                }
                catch (e) {
                    // let name = "name" in watcher.constructor ? watcher.constructor["name"] : '';
                    // console.error(`Error logStomp in watcher ${name}:`, e.message);
                }
            }
        };
        WatchDogAggregator.prototype.logEvent = function (channelName, eventName, data) {
            for (var _i = 0, _a = this.container; _i < _a.length; _i++) {
                var watcher = _a[_i];
                try {
                    watcher.logEvent(channelName, eventName, data);
                }
                catch (e) {
                    // let name = "name" in watcher.constructor ? watcher.constructor["name"] : '';
                    // console.error(`Error logEvent in watcher ${name}:`, e.message);
                }
            }
        };
        WatchDogAggregator.prototype.logConnect = function (data) {
            for (var _i = 0, _a = this.container; _i < _a.length; _i++) {
                var watcher = _a[_i];
                try {
                    if (!watcher["logConnect"]) {
                        continue;
                    }
                    watcher.logConnect(data);
                }
                catch (e) {
                    // let name = "name" in watcher.constructor ? watcher.constructor["name"] : '';
                    // console.error(`Error logConnect in watcher ${name}:`, e.message);
                }
            }
        };
        WatchDogAggregator.prototype.logDisconnect = function (e) {
            for (var _i = 0, _a = this.container; _i < _a.length; _i++) {
                var watcher = _a[_i];
                try {
                    if (!watcher["logDisconnect"]) {
                        continue;
                    }
                    watcher.logDisconnect(e);
                }
                catch (e) {
                    // let name = "name" in watcher.constructor ? watcher.constructor["name"] : '';
                    // console.error(`Error logDisconnect in watcher ${name}:`, e.message);
                }
            }
        };
        return WatchDogAggregator;
    }());
    exports.WatchDogAggregator = WatchDogAggregator;
});
