define("Lib/ServerEvent/worker/stomp-connect.worker", ["require", "exports", "Lib/ServerEvent/native/AckSender", "Lib/ServerEvent/worker/web-socket-connect.worker"], function (require, exports, AckSender_1, WebSocketConnect) {
    "use strict";
    /// <amd-module name="Lib/ServerEvent/worker/stomp-connect.worker" />
    /// <reference path="../resources/stomp.d.ts" />
    /**
     * Вызовет падение в stomp. Использование не объявленной переменой.
     * @link https://github.com/jmesnil/stomp-websocket/blob/master/lib/stomp.js#L497
     */
    importScripts("../resources/stomp.js");
    const ERROR_STOMP_CONNECT = 'STOMP connect is not started';
    /**
     * Stomp не знает про Worker и его setInterval/clearInterval
     * @link https://github.com/jmesnil/stomp-websocket/blob/master/lib/stomp.js#L489
     */
    Stomp.setInterval = function (interval, f) {
        return setInterval(f, interval);
    };
    Stomp.clearInterval = function (id) {
        return clearInterval(id);
    };
    /**
     * @class Lib/ServerEvent/worker/StompHeaders
     * @memberOf module:ServerEvent.worker
     */
    class StompHeaders {
        /*
         * @constructor
         * @param receipt - идентификатор подписки. У нас она одна.
         * @param id - идентификатор устройства
         * @param persistent - постоянный обменник
         * @param ack
         */
        constructor(receipt, id, persistent = true, ack = false) {
            this.receipt = receipt;
            this.persistent = persistent;
            this.id = id || this.receipt ? `${id}-${this.receipt}` : '';
            this['auto-delete'] = !persistent;
            if (ack) {
                this['prefetch-count'] = 10;
                this['ack'] = ack;
            }
        }
    }
    class StompChannelHeaders {
        constructor(channel, person, receipt, id, persistent = true, ack = false) {
            this.receipt = receipt;
            this.persistent = persistent;
            this.id = this.receipt ? StompChannelHeaders.createId(channel, id, this.receipt, person) : '';
            this['auto-delete'] = !persistent;
            if (ack) {
                this['prefetch-count'] = 10;
                this['ack'] = ack;
            }
        }
        static createId(channelName, guid, receipt, person) {
            let personPostfix = person ? `-${person}` : '';
            return `${guid}-${receipt}-${channelName}${personPostfix}`;
        }
    }
    /**
     * Класс ответственныйзп откртие STOMP протокола
     * @class Lib/ServerEvent/worker/WorkerStompConnect
     * @memberOf module:ServerEvent.worker
     */
    class WorkerStompConnect {
        constructor(url, exchangeName, hash, persist, isAck = false) {
            this.url = url;
            this.exchangeName = exchangeName;
            this.hash = hash;
            this.persist = persist;
            this.isCommonSubscribe = false;
            this.channeledEvents = [];
            this.isSendAck = false;
            this.onmessage = (message) => {
            };
            this.onclose = () => {
            };
            this.isSendAck = isAck;
            this.ackSender = AckSender_1.AckSender.createAckSender(isAck);
            this.connect = this.connect.bind(this);
            this.messageHandler = this.messageHandler.bind(this);
        }
        static getConnect(url, exchangeName, hash, persist, ack) {
            if (WorkerStompConnect.instance
                && WorkerStompConnect.instance.hash == hash) {
                return Promise.resolve(WorkerStompConnect.instance);
            }
            if (WorkerStompConnect.instance) {
                WorkerStompConnect.instance.close();
            }
            return new WorkerStompConnect(url, exchangeName, hash, persist, ack).connect().then((instance) => {
                return WorkerStompConnect.instance = instance;
            });
        }
        connect() {
            return WebSocketConnect.getInstance(this.url).then((transport) => {
                this.client = Stomp.over(transport);
                this.client.heartbeat.outgoing = WorkerStompConnect.STOMP_HEARTBEAT_OUT_TIME;
                this.client.heartbeat.incoming = WorkerStompConnect.STOMP_HEARTBEAT_IN_TIME;
                this.client.debug = function () {
                    /*false && console.log.apply(console, arguments);*/
                };
                return new Promise((resolve, reject) => {
                    this.client.connect(WorkerStompConnect.LOGIN, WorkerStompConnect.PASSWORD, () => {
                        resolve(transport);
                    }, (data) => {
                        reject(data);
                    });
                });
            }).catch((e) => {
                throw new Error(e || ERROR_STOMP_CONNECT);
            }).then((transport) => {
                this.websocket = transport;
                this.ackSender.start();
                transport.addEventListener('close', () => {
                    transport.close();
                    this.ackSender.stop();
                    this.onclose();
                    WorkerStompConnect.instance = undefined;
                });
                return this;
            });
        }
        stompSubscribe() {
            this.client.subscribe(`/exchange/${this.exchangeName}:${this.hash}`, this.messageHandler, new StompHeaders(this.hash, exports1["getGUID"](), this.persist, this.isSendAck ? 'client' : false));
        }
        stompSubscribeChannel(channel, person = "") {
            let endpoint = person ? `${person}$${channel}` : channel;
            this.client.subscribe(`/exchange/${this.exchangeName}.channel/${endpoint}`, this.messageHandler, new StompChannelHeaders(channel, person, this.hash, exports1["getGUID"](), this.persist, this.isSendAck ? 'client' : false));
        }
        stompUnsubscribeChannel(channel, person = null) {
            this.client.unsubscribe(StompChannelHeaders.createId(channel, exports1["getGUID"](), this.hash, person));
        }
        messageHandler(message) {
            this.ackSender.push(message);
            this.onmessage(message);
        }
        subscribe() {
            if (this.isCommonSubscribe) {
                return;
            }
            this.stompSubscribe();
            this.isCommonSubscribe = true;
        }
        subscribeChanneled(eventName, person = "") {
            let key = `${eventName}|${person}`;
            if (this.channeledEvents.indexOf(key) !== -1) {
                return;
            }
            this.channeledEvents.push(key);
            this.stompSubscribeChannel(eventName, person);
        }
        unsubscribeChanneled(eventName, person = "") {
            let find = `${eventName}|${person}`;
            let founded = false;
            this.channeledEvents = this.channeledEvents.filter((key) => {
                founded = true;
                return find !== key;
            });
            if (!founded) {
                return;
            }
            this.stompUnsubscribeChannel(eventName, person);
        }
        close() {
            this.ackSender.stop();
            WebSocketConnect.close();
        }
    }
    WorkerStompConnect.STOMP_HEARTBEAT_OUT_TIME = 60000;
    WorkerStompConnect.STOMP_HEARTBEAT_IN_TIME = 0;
    WorkerStompConnect.LOGIN = 'stomp_user';
    WorkerStompConnect.PASSWORD = 'stomp_user';
    return WorkerStompConnect;
});
