define("Lib/Tab/Transport/Fake", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FakeTransport = /** @class */ (function () {
        function FakeTransport(channel) {
        }
        FakeTransport.prototype.notify = function (message, data) { };
        FakeTransport.prototype.destroy = function () { };
        return FakeTransport;
    }());
    exports.FakeTransport = FakeTransport;
});
