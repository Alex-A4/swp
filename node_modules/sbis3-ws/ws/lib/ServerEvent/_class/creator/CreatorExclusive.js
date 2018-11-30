define("Lib/ServerEvent/_class/creator/CreatorExclusive", ["require", "exports", "Core/detection", "Lib/ServerEvent/_class/creator/TransportConnect"], function (require, exports, detection, TransportConnect_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CreatorExclusive = /** @class */ (function () {
        function CreatorExclusive(connectOptions, transportConnect) {
            if (transportConnect === void 0) { transportConnect = new TransportConnect_1.TransportConnect(); }
            this.connectOptions = connectOptions;
            this.transportConnect = transportConnect;
        }
        CreatorExclusive.prototype.isAvailableInEnv = function (isExclusive) {
            return isExclusive || this.connectOptions.isDesktop() || detection.isMobileIOS;
        };
        CreatorExclusive.prototype.build = function (hash) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                require(['Lib/ServerEvent/_class/transport/LocalPageTransport'], function (_a) {
                    var LocalPageTransport = _a.LocalPageTransport;
                    resolve(LocalPageTransport);
                });
            }).then(function (LocalPageTransport) {
                return _this.createTransport(LocalPageTransport, hash);
            });
        };
        CreatorExclusive.prototype.createTransport = function (ctor, hash) {
            var _this = this;
            return this.transportConnect.connect(this.connectOptions, false).then(function (connect) {
                return new ctor(connect, hash, false, _this.connectOptions.exchange);
            });
        };
        return CreatorExclusive;
    }());
    exports.CreatorExclusive = CreatorExclusive;
});
