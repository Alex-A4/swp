define("Transport/RPC/ErrorCreator", ["require", "exports", "Transport/RPC/Error", "Core/constants", "Transport/Errors"], function (require, exports, RPCError, constants, Errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fromRPC = function (config, methodName, url) {
        return new RPCError({
            httpError: config.httpError !== 'undefined' ? config.httpError : '',
            code: config.code,
            methodName: methodName,
            details: config.details,
            url: url || constants.defaultServiceUrl,
            message: config.message,
            classid: config.data && config.data.classid,
            errType: config.type,
            addinfo: config.data && config.data.addinfo,
            error_code: config.data && config.data.error_code
        });
    };
    exports.fromHTTP = function (error, method) {
        if (!(error instanceof Errors_1.HTTP)) {
            return error;
        }
        var config = {
            message: error.message,
            httpError: error.httpError,
            code: 0
        };
        var payload;
        try {
            payload = JSON.parse(error.payload);
        }
        catch (_a) {
            payload = {};
        }
        var payloadError = payload.error;
        Object.assign(config, payloadError);
        return exports.fromRPC(config, method, error.url);
    };
});
