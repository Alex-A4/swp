/// <amd-module name="Lib/ServerEvent/_class/logger/ConsoleWatchDog" />
/**
 * @author Санников К.А.
 */
"use strict";
import {SEB} from "../../interfaces";

export class ConsoleWatchDog implements SEB.IWatchDog {
    logStomp(message: SEB.StompMessageData) {
      console.log('[STOMP]', message);  // eslint-disable-line no-console
    }

    logEvent(channelName: string, eventName: string, data: any) {
        console.log(`[ServerEvent][${channelName}][${eventName}]`, data);  //eslint-disable-line no-console
    }
}