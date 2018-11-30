/// <amd-module name="Lib/ServerEvent/_class/logger/ConnectWatchDog" />
/**
 * @author Санников К.А.
 */
"use strict";
import {SEB} from "../../interfaces";

export class ConnectWatchDog implements SEB.IWatchDog {
    logStomp(message: SEB.StompMessageData) {
    }

    logEvent(channelName: string, eventName: string, data: any) {
    }

    logConnect(data) {
        let info = data || {};
        let connect = info.connectOptions || {};
        let url = connect.getWebSocketUrl && connect.getWebSocketUrl() || '';
        let transport = info.transport || '';

        console.log(`[STOMP][Connect][${new Date().toLocaleString()}]`,
            `transport: ${transport}; url: ${url}`); // eslint-disable-line no-console
    }

    logDisconnect(e) {
        console.log(`[STOMP][Disconnect][${new Date().toLocaleString()}]`, e); // eslint-disable-line no-console
    }
}
