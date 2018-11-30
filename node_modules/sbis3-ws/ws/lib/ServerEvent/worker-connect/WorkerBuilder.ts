/// <amd-module name="Lib/ServerEvent/worker-connect/WorkerBuilder" />
/**
 * TODO выделить PortMessage в отдельные классы для использования в воркере и в билдере
 */
"use strict";
import Deferred = require('Core/Deferred');
import SwConnect = require('Lib/ServerEvent/worker-connect/SwConnect');
import SwMessage = require('Lib/ServerEvent/worker-connect/messages/Sw');

const VERSION = 318.350;

let global = (function () {
    return this || (void(0), eval)('this');
}());

let WS_ROOT = '/ws/';
if (window && window["wsConfig"] && window["wsConfig"]["wsRoot"]) {
    WS_ROOT = window["wsConfig"]["wsRoot"];
    WS_ROOT = WS_ROOT[WS_ROOT.length - 1] == '/' ? WS_ROOT : WS_ROOT + '/';
}
const WORKERS_PATH = `${WS_ROOT}lib/ServerEvent/worker/`;
const SHARED_WORKER_PATH = `${WORKERS_PATH}event-bus-shared.worker.js?v=${VERSION}`;
const WEB_WORKER_PATH = `${WORKERS_PATH}event-bus-web.worker.js`;

declare interface MyMessage {
    type: string
    message: any
}
declare class SharedWorker extends Worker {
    port: MessagePort;
}
type Workers = SharedWorker | Worker;
class WorkerContainer {
    constructor(private worker: Workers) {
        if (worker instanceof SharedWorker) {
            this.postMessage = this._postSharedWorker;
        }
    }
    postMessage(message: any, transfer?: any[]): void {
        return this.worker.postMessage(message, transfer);
    }
    _postSharedWorker(message: any, transfer?: any[]): void {
        return (this.worker as SharedWorker).port.postMessage(message, transfer);
    }
    terminate(): void {
        return this.worker.terminate();
    }
}

///region Client messages
type ClientCommands = 'handshake' | 'debug.on' | 'debug.off' | 'version';
class ClientMessage {
    constructor(public command: ClientCommands) {
    }
}
class ClientMessageHandshake extends ClientMessage {
    constructor(public port: MessagePort, public debug?: boolean) {
        super('handshake');
    }
}
///endregion

class SwHandeshake {
    private channel;

    constructor(private sw: WorkerContainer) {
        this.channel = new MessageChannel();
    }

    shake(): Promise<MessageChannel> {
        return new Promise((resolve, reject) => {
            this.channel.port1.onmessage = (event: MessageEvent) => {
                let data: SwMessage = event.data;
                this.channel.port1.onmessage = undefined;
                if (data.type == 'handshake') {
                    resolve(this.channel);
                }
            };
            let isDebugSw;
            if (SwServerEventBus.IsDebugPort) {
                isDebugSw = true;
            }
            this.sw.postMessage(new ClientMessageHandshake(this.channel.port2, isDebugSw), [this.channel.port2]);
        });
    }
}

class SwInstaller {
    static TIMEOUT = 5000;
    static STATE_INSTALLING = 'installing';
    static STATE_INSTALLINED = 'installed';
    static STATE_ACTIVATING = 'activating';
    static STATE_ACTIVATED = 'activated';
    static STATE_REDUNDANT = 'redundant';

    static WORKER = 'worker';
    static SHARED_WORKER = 'SharedWorker';
    static SERVICE_WORKER = 'ServiceWorker';

    static getWorkerContainer(workerType): Promise<WorkerContainer> {
        let workerGetter;
        switch (workerType) {
            case SwInstaller.SHARED_WORKER:
                workerGetter = SwInstaller.getSharedWorker;
                break;
            /*case SwInstaller.SERVICE_WORKER:
                workerGetter = SwInstaller.getServiceWorker;
                break;*/
            case SwInstaller.WORKER:
            default:
                workerGetter = SwInstaller.getWorker;
        }
        return workerGetter().then((worker: Workers) => {
            return new WorkerContainer(worker);
        });
    }

    private static getSharedWorker(): Promise<SharedWorker> {
        let path = SHARED_WORKER_PATH;
        if (!('SharedWorker' in global)) {
            return Promise.reject(new ReferenceError("SharedWorker is not support."));
        }
        let sharedWorker = new SharedWorker(path);
        sharedWorker.port.start();
        return Promise.resolve(sharedWorker)
    }
    private static getWorker(): Promise<Worker> {
        let path = WEB_WORKER_PATH;
        if (!('Worker' in global)) {
            return Promise.reject(new ReferenceError("Worker is not support."));
        }
        return Promise.resolve(new Worker(path));
    }
}

/**
 * TODO избавиться. Сделать агрегацию.
 * Нужно разделить объект, на синхронный ответственный за работу с событиями
 * и асинхронный за работу с ServiceWorker
 */
class SwServerEventBus {
    /**
     * Ввожу глобальные флаги, потому что не хочу использовать декораторы
     * @type {boolean}
     */
    static IsDebugPort = false;
    static IsDebugEB = false;

    /**
     * Инициализатор нужен для запуска ServiceWorker и возврата Promise
     * Promise вернуть из конструктора невозможно
     * @return {Promise}
     */
    static createConnection(workerType: string, url: string, exchangeName: string,
        sid, hash, isPersist, isAck): Deferred<SwConnect.Connect> {
        let def = new Deferred<SwConnect.Connect>();
        SwInstaller.getWorkerContainer(workerType).then((sw: WorkerContainer) => {
            let shaker = new SwHandeshake(sw);
            return shaker.shake().then((channel: MessageChannel) => {
                return channel;
            });
        }).then((channel: MessageChannel) => {
            let connector = new SwConnect.Connector(channel);
            return connector.connect(url, exchangeName, sid, hash, isPersist, isAck);
        }).then((connect: SwConnect.Connect) => {
            def.callback(connect);
        }).catch((message: string) => {
            def.errback(message);
        });

        return def;
    }
}

export = SwServerEventBus;
