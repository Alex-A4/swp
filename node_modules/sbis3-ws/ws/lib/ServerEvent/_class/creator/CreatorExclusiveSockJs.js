define("Lib/ServerEvent/_class/creator/CreatorExclusiveSockJs", ["require", "exports", "tslib", "Lib/ServerEvent/_class/creator/CreatorExclusive", "Lib/ServerEvent/_class/creator/TransportConnect"], function (require, exports, tslib_1, CreatorExclusive_1, TransportConnect_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CreatorExclusiveSockJs = /** @class */ (function (_super) {
        tslib_1.__extends(CreatorExclusiveSockJs, _super);
        function CreatorExclusiveSockJs(connectOptions) {
            var _this = this;
            var USE_SOCK_JS = true;
            _this = _super.call(this, connectOptions, new TransportConnect_1.TransportConnect(USE_SOCK_JS)) || this;
            return _this;
        }
        return CreatorExclusiveSockJs;
    }(CreatorExclusive_1.CreatorExclusive));
    exports.CreatorExclusiveSockJs = CreatorExclusiveSockJs;
});
