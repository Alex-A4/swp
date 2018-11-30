/// <amd-module name="Lib/ServerEvent/_class/logger/WatchDogAggregator" />
/**
 * @author Санников К.А.
 */
"use strict";
import {SEB} from "../../interfaces";

export class WatchDogAggregator implements SEB.IWatchDogSystem {
    constructor(private container = []) {

    }

    reg(watcher: SEB.IWatchDog|SEB.IWatchDogSystem) {
        this.container.push(watcher);
    }

    logStomp(message: SEB.StompMessageData) {
        for (let watcher of this.container) {
            try {
                watcher.logStomp(message);
            } catch (e) {
                // let name = "name" in watcher.constructor ? watcher.constructor["name"] : '';
                // console.error(`Error logStomp in watcher ${name}:`, e.message);
            }
        }
    }

    logEvent(channelName: string, eventName: string, data: any) {
        for (let watcher of this.container) {
            try {
                watcher.logEvent(channelName, eventName, data);
            } catch (e) {
                // let name = "name" in watcher.constructor ? watcher.constructor["name"] : '';
                // console.error(`Error logEvent in watcher ${name}:`, e.message);
            }
        }
    }

    logConnect(data) {
        for (let watcher of this.container) {
            try {
                if (!watcher["logConnect"]) {
                    continue;
                }

                watcher.logConnect(data);
            } catch (e) {
                // let name = "name" in watcher.constructor ? watcher.constructor["name"] : '';
                // console.error(`Error logConnect in watcher ${name}:`, e.message);
            }
        }
    }

    logDisconnect(e) {
        for (let watcher of this.container) {
            try {
                if (!watcher["logDisconnect"]) {
                    continue;
                }

                watcher.logDisconnect(e);
            } catch (e) {
                // let name = "name" in watcher.constructor ? watcher.constructor["name"] : '';
                // console.error(`Error logDisconnect in watcher ${name}:`, e.message);
            }
        }
    }
}