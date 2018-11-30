/// <amd-module name="Lib/ServerEvent/worker-connect/SwConnect" />

import CONST = require('Lib/ServerEvent/worker-connect/Constants');
import PageMessage = require('Lib/ServerEvent/worker-connect/messages/Page');
import SwMessage = require('Lib/ServerEvent/worker-connect/messages/Sw');
import CONST_CLASS = require('Lib/ServerEvent/_class/Constants');

module SwConnect {
    /**
     * TODO нужно разобраться с onready/ondisconnect для канализированных событий
     * @class Lib/ServerEvent/Connect
     */
    export class Connect {
        private _connect: MessageChannel;
        public _onmessage: (message: Stomp.Message) => any = () => {
        };
        public _onready: (eventName) => any = () => {
        };
        public _ondisconnect: (eventName) => any = () => {
        };
        public _onwebsocketclose: () => any = () => {
        };

        constructor(channel: MessageChannel) {
            this._connect = channel;
            this._connect.port1.onmessage = this.messageHandler.bind(this);
        }

        subscribe(channelName: string): void {
            this._connect.port1.postMessage(new PageMessage.PmSubscribe(channelName));
        }

        subscribeChanneled(channelName: string, target: string): void {
            this._connect.port1.postMessage(new PageMessage.PmSubChanneled(channelName, target));
        }

        unsubscribeChanneled(channelName: string, target: string): void {
            this._connect.port1.postMessage(new PageMessage.PmUnsubChanneled(channelName, target))
        }

        set onmessage(value: (message: Stomp.Message) => any) {
            if (!(value instanceof Function)) {
                this._onmessage = () => {
                };
                return;
            }
            this._onmessage = value;
        }

        set onready(value: (eventName) => any) {
            if (!(value instanceof Function)) {
                this._onready = () => {
                };
                return;
            }
            this._onready = value;
        }

        set ondisconnect(value: (eventName) => any) {
            if (!(value instanceof Function)) {
                this._ondisconnect = () => {
                };
                return;
            }
            this._ondisconnect = value;
        }

        set onwebsocketclose(value: () => any) {
            if (!(value instanceof Function)) {
                this._onwebsocketclose = () => {
                };
                return;
            }
            this._onwebsocketclose = value;
        }

        get connect() {
            return this._connect;
        }

        private messageHandler(event: MessageEvent): void {
            /*SwServerEventBus.IsDebugPort && console.log('[ServerEventBus][port] message', event.data);*/
            if (!(event && event.data && event.data.type)) {
                return;
            }
            if (event.data.type == CONST.SW_MESSAGES.WEBSOCKET_CLOSE) {
                return this._onwebsocketclose();
            }

            if (!(event && event.data && event.data.headers && event.data.headers["event-type"])) {
                return;
            }

            let eventName = event.data.headers["event-type"].toLocaleLowerCase();
            if (event.data.type == CONST.SW_MESSAGES.CLOSE) {
                return this._ondisconnect(eventName);
            }
            if (event.data.type == CONST.SW_MESSAGES.READY) {
                return this._onready(eventName);
            }

            if (event.data.type != CONST.SW_MESSAGES.MESSAGE) {
                return;
            }
            this._onmessage(event.data.message);
        }

        private closePort(): void {
            this._connect.port1.postMessage(new PageMessage.PmDisconnect());
            this._connect.port1.close();
        }

        destructor() {
            this.closePort();
            this._connect = undefined;
        }
    }

    export class Connector {
        constructor(private channel: MessageChannel) {
        }

        /**
         * @param url
         * @param exchangeName
         * @param sid
         * @param hash
         * @param isPersist постоянное ли подключение
         * @return {Promise<Connect>}
         */
        connect(url: string, exchangeName: string, sid: string, hash: string, isPersist: boolean, isAck: boolean): Promise<Connect> {
            return new Promise((resolve, reject) => {
                this.channel.port1.onmessage = (event: MessageEvent) => {
                    let data: SwMessage = event.data;
                    if (data.type == 'error') {
                        return reject(event.data.message);
                    }
                    this.channel.port1.onmessage = undefined;
                    if (data.type == 'connect') {
                        resolve(this.channel);
                    }
                };
                this.channel.port1.postMessage(new PageMessage.PmConnect(url, exchangeName, sid, hash, isPersist, isAck));
            }).then((channel: MessageChannel) => {
                return new Connect(channel);
            });
        }
    }
}
export = SwConnect;