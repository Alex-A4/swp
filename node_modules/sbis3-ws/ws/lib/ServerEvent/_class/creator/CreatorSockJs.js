define("Lib/ServerEvent/_class/creator/CreatorSockJs", ["require", "exports", "tslib", "Lib/ServerEvent/_class/creator/CreatorWebSocket", "Lib/ServerEvent/_class/creator/TransportConnect"], function (require, exports, tslib_1, CreatorWebSocket_1, TransportConnect_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CreatorSockJs = /** @class */ (function (_super) {
        tslib_1.__extends(CreatorSockJs, _super);
        function CreatorSockJs(connectOptions) {
            var _this = this;
            var USE_SOCK_JS = true;
            _this = _super.call(this, connectOptions, new TransportConnect_1.TransportConnect(USE_SOCK_JS)) || this;
            return _this;
        }
        return CreatorSockJs;
    }(CreatorWebSocket_1.CreatorWebSocket));
    exports.CreatorSockJs = CreatorSockJs;
});
