define("Lib/Tab/Transport/LocalStorage", ["require", "exports", "Lib/Storage/LocalStorage", "Core/detection"], function (require, exports, LocalStorage, detection) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NAME = 'TabMessage';
    var removeTimers = {};
    var LocalStorageTransport = /** @class */ (function () {
        function LocalStorageTransport(channel) {
            var _this = this;
            this.channel = channel;
            this.storage = new LocalStorage(NAME, undefined, false);
            this.storage.subscribe('onChange', function (event, message, data) {
                _this.channel.notify(message, data);
            });
        }
        LocalStorageTransport.prototype.notify = function (message, data) {
            var _this = this;
            this.storage.setItem(message, data);
            if (!detection.isIE) {
                return this.storage.removeItem(message);
            }
            /**
             * Необходимо почистить хранилище за собой, однако в IE событие onStorage на больших строках не вызывается
             * поэтому внутри он записывает вспомогательное значение. чтобы вызвать фейкоое событие на всех вкладках
             * тут получается проблема, что есть делать set + remove на одной вкладке, вспомогательное событие на другой
             * может отработать позже remove и когда полезет за данными через get их уже не будет там,
             * что в итоге приведёт к двум событиям onremove на вкладках получателях.
             */
            if (removeTimers[message]) {
                clearTimeout(removeTimers[message]);
            }
            removeTimers[message] = setTimeout(function () {
                _this.storage.removeItem(message);
            }, 500);
        };
        LocalStorageTransport.prototype.destroy = function () {
            this.storage.destroy();
        };
        return LocalStorageTransport;
    }());
    exports.LocalStorageTransport = LocalStorageTransport;
});
