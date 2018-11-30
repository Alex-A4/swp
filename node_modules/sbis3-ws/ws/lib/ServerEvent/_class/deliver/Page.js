define("Lib/ServerEvent/_class/deliver/Page", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Доставщик событий только по текущей странице
     */
    var Page = /** @class */ (function () {
        function Page(notifier) {
            this.notifier = notifier;
        }
        Page.prototype.deliver = function (channelName, eventName, rawData) {
            this.notifier.fire(channelName, eventName, rawData);
        };
        Page.prototype.destroy = function () {
        };
        return Page;
    }());
    exports.Page = Page;
});
