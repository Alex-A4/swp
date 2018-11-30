/// <amd-module name="Lib/ServerEvent/worker-connect/Constants" />
define("Lib/ServerEvent/worker-connect/Constants", ["require", "exports"], function (require, exports) {
    "use strict";
    var WorkerConnectConstants;
    (function (WorkerConnectConstants) {
        var SW_MESSAGES;
        (function (SW_MESSAGES) {
            SW_MESSAGES["CONNECT"] = "connect";
            SW_MESSAGES["ERROR"] = "error";
            SW_MESSAGES["READY"] = "ready";
            SW_MESSAGES["MESSAGE"] = "message";
            SW_MESSAGES["CLOSE"] = "close";
            SW_MESSAGES["HANDSHAKE"] = "handshake";
            SW_MESSAGES["WEBSOCKET_CLOSE"] = "websocket.close";
        })(SW_MESSAGES = WorkerConnectConstants.SW_MESSAGES || (WorkerConnectConstants.SW_MESSAGES = {}));
    })(WorkerConnectConstants || (WorkerConnectConstants = {}));
    return WorkerConnectConstants;
});
