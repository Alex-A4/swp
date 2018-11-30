/// <amd-module name="Lib/ServerEvent/worker/event-bus.worker" />
/// <reference path="../resources/stomp.d.ts" />
/// <reference path="messages.d.ts" />
const VERSION = 318.350;

import * as Page from '../worker-connect/messages/Page';
import { Subscribe } from 'Lib/ServerEvent/worker/subscribe';
import { SubscribeController } from 'Lib/ServerEvent/worker/subscribe-controller';
import WorkerStompConnect = require('Lib/ServerEvent/worker/stomp-connect.worker');
import { Connector } from 'Lib/ServerEvent/native/_IndexedDB/Connector';
import { Writer } from 'Lib/ServerEvent/native/_IndexedDB/Writer';

//region WorkerMessage
interface LikeStompMessage {
    headers: any
    body: any
    command: any
}

interface MyMessage {
    type: string
    headers: any
    message: any
}

type MessageType = 'handshake' | 'connect' | 'error' | 'message' | 'close' |
    'ready' | 'version' | 'websocket.close';

class WorkerMessage implements MyMessage {
    constructor(public type: MessageType,
                public message: any = "",
                public headers: any = "",
                public command: any = "") {
    }
}

class WorkerMessEvent implements MyMessage {
    public type = 'message';
    public headers: object;

    constructor(public message: LikeStompMessage) {
        this.headers = message.headers;
    }
}

class WorkerMessReady extends WorkerMessage {
    constructor(eventName: string) {
        super('ready', "", {"event-type": eventName});
    }
}

class WorkerMessClose extends WorkerMessage {
    constructor(eventName: string) {
        super('close', '', {'event-type': eventName});
    }
}

class WorkerMessError extends WorkerMessage {
    constructor(message: string) {
        super('error', message);
    }
}

class WorkerMessDisconnect extends WorkerMessage {
    constructor() {
        super('websocket.close');
    }
}

///endregion

self["messageHandler"] = (event: ExtendableMessageEvent) => {
    /**
     * @type {ClientMessage}
     */
    let message = event.data;
    if (message == 'ping') {
        return; // не будем спамить пингом
    }
    if (!message || !message.command) {
        return;
    }
    if (message.command == 'handshake' && event.ports.length != 0) {
        Context.handeshake(event.ports[0]);
        if (message.debug !== undefined) {
            Context.debug = message.debug;
        }
    }
    if (message.command == 'debug.on') {
        Context.debug = true;
    }
    if (message.command == 'debug.off') {
        Context.debug = false;
    }
    if (message.command == 'version') {
        event.ports[0].postMessage(new WorkerMessage('version', VERSION));
    }
};

const ERROR_SUBSCRIBE = "Can't subscribe";
const ERROR_SUBSCRIBE_CHANNEL = "Can't subscribe channeled";
const ERROR_UNSUBSCRIBE_CHANNEL = "Can't unsubscribe channeled";
const ERROR_HASH = "Hash is not defined";

class Context {
    private static GUID: string;

    private static sid: string;
    private static hash: string;
    private static subscribes = new SubscribeController();

    public static debug: boolean = false;

    static handeshake(port: MessagePort) {
        port.onmessage = Context.portHandler;
        port.postMessage(new WorkerMessage('handshake'));
    }

    /**
     * @param event
     * event.target - это ChannelMessage::port2
     */
    static portHandler(event: MessageEvent) {
        if (!event.data) {
            return;
        }
        let message = event.data;
        let port2 = event.target as MessagePort;
        if (!port2) {
            return;
        }
        if (message.command == 'connect') {
            let url = (message as Page.PmConnect).url;
            let exchangeName = (message as Page.PmConnect).exchangeName;
            let sid = (message as Page.PmConnect).sid;
            let hash = (message as Page.PmConnect).hash;
            let persist = (message as Page.PmConnect).persist;
            let ack = (message as Page.PmConnect).ack;
            WorkerEventBus.getInstance(
                url,
                exchangeName,
                hash,
                persist,
                ack,
                Context.subscribes
            ).then((connect: WorkerEventBus) => {
                Context.sid = sid;
                Context.hash = hash;
                port2.postMessage(new WorkerMessage("connect"));
                return connect;
            }).catch((e) => {
                port2.postMessage(new WorkerMessError(e.toString()));
            });
            return;
        }

        if (message.command == 'subscribe') {
            let eventName = (message as Page.PmSubscribe).eventName;
            WorkerEventBus.getInstance().then((connect: WorkerEventBus) => {
                connect.subscribePort(eventName, port2);
            }).catch((e) => {
                port2.postMessage(new WorkerMessError(ERROR_SUBSCRIBE));
            });
            return;
        }

        if (message.command == 'subscribe.channel') {
            let eventName = (message as Page.PmSubChanneled).eventName;
            WorkerEventBus.getInstance().then((connect: WorkerEventBus) => {
                connect.subscribeChannelPort(eventName, port2, message.person);
            }).catch((e) => {
                port2.postMessage(new WorkerMessError(ERROR_SUBSCRIBE_CHANNEL));
            });
            return;
        }

        if (message.command == 'unsubscribe.channel') {
            let eventName = (message as Page.PmUnsubChanneled).eventName;
            let person = (message as Page.PmUnsubChanneled).person;
            WorkerEventBus.getInstance().then((connect: WorkerEventBus) => {
                connect.unsubscribeChannelPort(eventName, port2, person);
            }).catch((e) => {
                port2.postMessage(new WorkerMessError(ERROR_UNSUBSCRIBE_CHANNEL));
            });
            return;
        }

        if (message.command == 'disconnect') {
            Context.subscribes.removePort(port2);
            return;
        }
    }

    static getGUID() {
        return exports1["getGUID"]();
    }
}

/**
 * Класс для поднятия соединения с сервером в разрезе клиента/устройства
 * @class Lib/ServerEvent/worker/WorkerEventBus
 * @memberOf module:ServerEvent.worker
 */
class WorkerEventBus {
    private static initPromise: Promise<WorkerEventBus>;
    private static instance: WorkerEventBus;

    private stompConnect: WorkerStompConnect;
    private subscribes: SubscribeController;
    private eventStore: Promise<Writer>;

    private constructor(private hash: string,
                        stompConnect: WorkerStompConnect, subController: SubscribeController) {
        if (!subController) {
            throw Error('Subscribes is empty!');
        }
        this.subscribes = subController;
        this.stompConnect = stompConnect;
        this.stompConnect.onclose = this.closeStompHandler.bind(this);
        this.stompConnect.onmessage = this.messageHandler.bind(this);
        this.eventStore = Connector.connect(
            Connector.DB_DEBUG,
            Connector.DEBUG_STORE_NAME
        ).then((connect: Connector) => {
            return connect.createWriter();
        });
    }

    /**
     * Получаем экземпляр Серверной шины событий на SW.
     * NB! hash идентифицирует пользователя
     * @param url - url подключения
     * @param exchangeName - имя обменника
     * @param hash - идентификатор пользователя
     * @param persist
     * @param ack - подтверждать ли сообщения
     * @param subscribes
     * @return {Promise<WorkerEventBus>}
     */
    static getInstance(url?: string, exchangeName?: string,
                        hash?: string,
                        persist: boolean = true, ack: boolean = false,
                        subscribes?: SubscribeController): Promise<WorkerEventBus> {
        if (WorkerEventBus.instance && !hash) {
            return Promise.resolve(WorkerEventBus.instance);
        }
        if (!hash) {
            return Promise.reject(ERROR_HASH);
        }
        if (WorkerEventBus.instance && WorkerEventBus.instance.hash == hash) {
            return Promise.resolve(WorkerEventBus.instance);
        }

        if (WorkerEventBus.initPromise) {
            return WorkerEventBus.initPromise;
        }

        return WorkerEventBus.initPromise = WorkerStompConnect.getConnect(url, exchangeName,
            hash, persist, ack).then((stomp: WorkerStompConnect) => {
            WorkerEventBus.initPromise = undefined;
            return WorkerEventBus.instance = new WorkerEventBus(hash, stomp, subscribes);
        });
    }

    private closeStompHandler() {
        let ports = this.subscribes.getPorts();
        this.subscribes.clear().forEach((s: Subscribe) => {
            try {
                s.port.postMessage(new WorkerMessClose(s.eventName));
            } catch (e) {
                Context.debug && console.error(e); // eslint-disable-line no-console
            }
        });
        ports.forEach((port: MessagePort) => {
            port.postMessage(new WorkerMessDisconnect());
        });
        WorkerEventBus.instance = undefined;
    }

    private static sendMessageByPort(subscribe: Subscribe, message: Stomp.Message) {
        try {
            subscribe.port.postMessage(new WorkerMessEvent({
                headers: message.headers,
                body: message.body,
                command: message.command
            }));
        } catch (e) {
            /**
             * Если не удалось отправить сообщение, то просто отсылаем в ошибку
             */
            Context.debug && console.error(e); // eslint-disable-line no-console
        }
    }

    private messageHandler(message: Stomp.Message) {
        let eventName = message.headers["event-type"].toLocaleLowerCase();
        this.eventStore.then((writer: Writer) => {
            writer.write(message);
        });
        this.subscribes.get(eventName).forEach((s: Subscribe) => {
            WorkerEventBus.sendMessageByPort(s, message);
        });
    }

    subscribePort(eventName: string, port: MessagePort) {
        this.subscribes.register(eventName, port);
        this.stompConnect.subscribe();
        port.postMessage(new WorkerMessReady(eventName));
    }

    subscribeChannelPort(eventName: string, port: MessagePort, person: string = '') {
        if (!this.subscribes.hasChanneled(eventName, person)) {
            this.stompConnect.subscribeChanneled(eventName, person);
        }
        this.subscribes.registerChanneled(eventName, port, person);
        port.postMessage(new WorkerMessReady(eventName));
    }

    unsubscribeChannelPort(eventName: string, port: MessagePort, person: string = '') {
        this.subscribes.unregisterChanneled(eventName, port, person);
        if (!this.subscribes.hasChanneled(eventName, person)) {
            this.stompConnect.unsubscribeChanneled(eventName, person);
        }
    }
}
