define("Lib/ServerEvent/worker/event-bus.worker", ["require", "exports", "Lib/ServerEvent/worker/subscribe-controller", "Lib/ServerEvent/worker/stomp-connect.worker", "Lib/ServerEvent/native/_IndexedDB/Connector"], function (require, exports, subscribe_controller_1, WorkerStompConnect, Connector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /// <amd-module name="Lib/ServerEvent/worker/event-bus.worker" />
    /// <reference path="../resources/stomp.d.ts" />
    /// <reference path="messages.d.ts" />
    const VERSION = 318.350;
    class WorkerMessage {
        constructor(type, message = "", headers = "", command = "") {
            this.type = type;
            this.message = message;
            this.headers = headers;
            this.command = command;
        }
    }
    class WorkerMessEvent {
        constructor(message) {
            this.message = message;
            this.type = 'message';
            this.headers = message.headers;
        }
    }
    class WorkerMessReady extends WorkerMessage {
        constructor(eventName) {
            super('ready', "", { "event-type": eventName });
        }
    }
    class WorkerMessClose extends WorkerMessage {
        constructor(eventName) {
            super('close', '', { 'event-type': eventName });
        }
    }
    class WorkerMessError extends WorkerMessage {
        constructor(message) {
            super('error', message);
        }
    }
    class WorkerMessDisconnect extends WorkerMessage {
        constructor() {
            super('websocket.close');
        }
    }
    ///endregion
    self["messageHandler"] = (event) => {
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
        static handeshake(port) {
            port.onmessage = Context.portHandler;
            port.postMessage(new WorkerMessage('handshake'));
        }
        /**
         * @param event
         * event.target - это ChannelMessage::port2
         */
        static portHandler(event) {
            if (!event.data) {
                return;
            }
            let message = event.data;
            let port2 = event.target;
            if (!port2) {
                return;
            }
            if (message.command == 'connect') {
                let url = message.url;
                let exchangeName = message.exchangeName;
                let sid = message.sid;
                let hash = message.hash;
                let persist = message.persist;
                let ack = message.ack;
                WorkerEventBus.getInstance(url, exchangeName, hash, persist, ack, Context.subscribes).then((connect) => {
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
                let eventName = message.eventName;
                WorkerEventBus.getInstance().then((connect) => {
                    connect.subscribePort(eventName, port2);
                }).catch((e) => {
                    port2.postMessage(new WorkerMessError(ERROR_SUBSCRIBE));
                });
                return;
            }
            if (message.command == 'subscribe.channel') {
                let eventName = message.eventName;
                WorkerEventBus.getInstance().then((connect) => {
                    connect.subscribeChannelPort(eventName, port2, message.person);
                }).catch((e) => {
                    port2.postMessage(new WorkerMessError(ERROR_SUBSCRIBE_CHANNEL));
                });
                return;
            }
            if (message.command == 'unsubscribe.channel') {
                let eventName = message.eventName;
                let person = message.person;
                WorkerEventBus.getInstance().then((connect) => {
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
    Context.subscribes = new subscribe_controller_1.SubscribeController();
    Context.debug = false;
    /**
     * Класс для поднятия соединения с сервером в разрезе клиента/устройства
     * @class Lib/ServerEvent/worker/WorkerEventBus
     * @memberOf module:ServerEvent.worker
     */
    class WorkerEventBus {
        constructor(hash, stompConnect, subController) {
            this.hash = hash;
            if (!subController) {
                throw Error('Subscribes is empty!');
            }
            this.subscribes = subController;
            this.stompConnect = stompConnect;
            this.stompConnect.onclose = this.closeStompHandler.bind(this);
            this.stompConnect.onmessage = this.messageHandler.bind(this);
            this.eventStore = Connector_1.Connector.connect(Connector_1.Connector.DB_DEBUG, Connector_1.Connector.DEBUG_STORE_NAME).then((connect) => {
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
        static getInstance(url, exchangeName, hash, persist = true, ack = false, subscribes) {
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
            return WorkerEventBus.initPromise = WorkerStompConnect.getConnect(url, exchangeName, hash, persist, ack).then((stomp) => {
                WorkerEventBus.initPromise = undefined;
                return WorkerEventBus.instance = new WorkerEventBus(hash, stomp, subscribes);
            });
        }
        closeStompHandler() {
            let ports = this.subscribes.getPorts();
            this.subscribes.clear().forEach((s) => {
                try {
                    s.port.postMessage(new WorkerMessClose(s.eventName));
                }
                catch (e) {
                    Context.debug && console.error(e); // eslint-disable-line no-console
                }
            });
            ports.forEach((port) => {
                port.postMessage(new WorkerMessDisconnect());
            });
            WorkerEventBus.instance = undefined;
        }
        static sendMessageByPort(subscribe, message) {
            try {
                subscribe.port.postMessage(new WorkerMessEvent({
                    headers: message.headers,
                    body: message.body,
                    command: message.command
                }));
            }
            catch (e) {
                /**
                 * Если не удалось отправить сообщение, то просто отсылаем в ошибку
                 */
                Context.debug && console.error(e); // eslint-disable-line no-console
            }
        }
        messageHandler(message) {
            let eventName = message.headers["event-type"].toLocaleLowerCase();
            this.eventStore.then((writer) => {
                writer.write(message);
            });
            this.subscribes.get(eventName).forEach((s) => {
                WorkerEventBus.sendMessageByPort(s, message);
            });
        }
        subscribePort(eventName, port) {
            this.subscribes.register(eventName, port);
            this.stompConnect.subscribe();
            port.postMessage(new WorkerMessReady(eventName));
        }
        subscribeChannelPort(eventName, port, person = '') {
            if (!this.subscribes.hasChanneled(eventName, person)) {
                this.stompConnect.subscribeChanneled(eventName, person);
            }
            this.subscribes.registerChanneled(eventName, port, person);
            port.postMessage(new WorkerMessReady(eventName));
        }
        unsubscribeChannelPort(eventName, port, person = '') {
            this.subscribes.unregisterChanneled(eventName, port, person);
            if (!this.subscribes.hasChanneled(eventName, person)) {
                this.stompConnect.unsubscribeChanneled(eventName, person);
            }
        }
    }
});
