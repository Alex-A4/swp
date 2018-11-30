/// <amd-module name="Transport/RPC/ErrorCreator" />
import RPCError = require('Transport/RPC/Error');
import constants = require('Core/constants');
import {HTTP as HTTPError} from 'Transport/Errors';

type RPCErrorConfig = {
    message: string;
    httpError?;
    code: number | string;
    method;
    details;
    url: string;
    data?: {
        classid;
        addinfo;
        error_code;
    }
    type: string;
}

export let fromRPC = (config: Partial<RPCErrorConfig>, methodName: string, url?: string): RPCError => {
    return new RPCError({
        httpError: config.httpError !== 'undefined'? config.httpError: '',
        code: config.code,
        methodName,
        details: config.details,
        url: url || constants.defaultServiceUrl,
        message: config.message,
        classid: config.data && config.data.classid,
        errType: config.type,
        addinfo: config.data && config.data.addinfo,
        error_code: config.data && config.data.error_code
    });
};
export let fromHTTP = (error: Error | HTTPError, method: string): RPCError | Error => {
    if (!(error instanceof HTTPError)) {
        return error;
    }
    let config = {
        message: error.message,
        httpError: error.httpError,
        code: 0
    };
    
    let payload;
    try {
        payload = JSON.parse(error.payload);
    } catch {
        payload = {};
    }
    let payloadError = payload.error;
    
    Object.assign(config, payloadError);
    
    return fromRPC(config, method, error.url);
};
