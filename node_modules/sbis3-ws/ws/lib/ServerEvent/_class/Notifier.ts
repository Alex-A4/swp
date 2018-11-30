/// <amd-module name="Lib/ServerEvent/_class/Notifier" />
import { SEB } from "../interfaces";
import EventBus = require('Core/EventBus');
import Converter = require('Lib/ServerEvent/ResponseConverter');
import { WatchDogAggregator as Watcher } from "Lib/ServerEvent/_class/logger/WatchDogAggregator";

enum EVENTS_CONNECT {
    READY = "onready",
    DISCONNECT = "ondisconnect"
}

export class Notifier {
    private readyStatuses = {};
    constructor(private watcher?: SEB.IWatchDog) {
        if (!watcher) {
            this.watcher = new Watcher();
        }
    }

    setWatcher(watcher: SEB.IWatchDog) {
        this.watcher = watcher;
    }

    /**
     * Уведомляем о событии
     * @param {string} channelName
     * @param {string} eventName
     * @param {string} rawData
     */
    fire(channelName: string, eventName: string, rawData?: string) {
        if (this.isSkip(channelName, eventName) ) {
            return;
        }
        let data;
        if (rawData) {
            data = Converter(rawData);
        }

        this.watcher.logEvent(channelName, eventName, data);
        EventBus.channel(channelName).notify(eventName, data, rawData);
    }

    /**
     * Событие onready должно по каналу приходить только один раз. Либо после ondisconnect.
     * Транспортами это не возможно в случае с главной вкладкой.
     * @param {string} channelName
     * @param {string} eventName
     * @return {boolean} Нужно ли пропустить текущее событие onready
     */
    private isSkip(channelName: string, eventName: string): boolean {
        if (eventName !== EVENTS_CONNECT.READY && eventName !== EVENTS_CONNECT.DISCONNECT) {
            return false;
        }
        if (eventName === EVENTS_CONNECT.READY && this.readyStatuses[channelName]) {
            return true;
        }
        if (eventName === EVENTS_CONNECT.READY) {
            this.readyStatuses[channelName] = true;
            /**
             * Нужно выстоить длину очереди события onready в 1,
             *  что бы подписки после подключения, получали это соыбтие
             */
            EventBus.channel(channelName).setEventQueueSize(EVENTS_CONNECT.READY, 1);
        }
        if (eventName === EVENTS_CONNECT.DISCONNECT) {
            this.readyStatuses[channelName] = false;
            /**
             * Нужно убрать очередь. Что бы при дисконекте не получили прошлый onready
             */
            EventBus.channel(channelName).setEventQueueSize(EVENTS_CONNECT.READY, 0);
        }
        return false;
    }
}