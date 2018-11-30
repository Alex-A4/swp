/// <amd-module name="Lib/ServerEvent/_class/creator/TransportConnect" />
import { ConnectOptions } from "Lib/ServerEvent/_class/ConnectOptions";

export class TransportConnect {
    private static STOMP_HEARTBEAT_OUT_TIME = 60000;
    private static STOMP_HEARTBEAT_IN_TIME = 0;
    private static LOGIN = 'stomp_user';
    private static PASSWORD = 'stomp_user';

    private connectWay: (url: string, isHeartbit: boolean) => Promise<WebSocket>;

    /**
     * @param {boolean} isUseSockjs использовать ли библиотеку SockJS
     */
    constructor(isUseSockjs = false) {
        this.connectWay = !isUseSockjs ? this.byWebSocket : this.bySockjs;
    }

    /**
     * @param {string} url Строка подключения
     * @param {boolean} isHeartbit Првоерять ли heartbit от сервера.
     *  Если не пришел, то рвем соединение.
     */
    private getWebSocket(url, isHeartbit = true): Promise<WebSocket> {
        return new Promise<WebSocket>((resolve, reject) => {
            require(["Lib/ServerEvent/native/SockjsEmulator"], (SockJSTransport) => {
                try {
                    resolve(new SockJSTransport(url, undefined, isHeartbit));
                } catch (e) {
                    reject(e);
                }
            });
        });
    }

    private getSockjs(sockjs, url: string): Promise<WebSocket> {
        return new Promise<WebSocket>((resolve, reject) => {
            try {
                let connect = new sockjs(
                    url.replace('wss:', 'https:').replace('ws:', 'http:'),
                    null,
                    {
                        transports: ['xhr-streaming'],
                        debug: () => {
                        },
                        stompLogger: () => {
                        }
                    });
                resolve(connect);
            } catch (e) {
                return reject(e);
            }
        });
    }

    private requireStomp(): Promise<undefined> {
        return new Promise((resolve) => {
            require(["Lib/ServerEvent/resources/stomp"], () => {
                resolve();
            });
        });
    }

    /**
     * @return {Promise<SockJS>}
     */
    private requireSockjs(): Promise<any> {
        return new Promise((resolve, reject) => {
            require([
                "Lib/ServerEvent/resources/stomp",
                "Lib/ServerEvent/resources/sockjs-1.0.3"
            ], (_, sockjs) => {
                if (!sockjs) {
                    return reject("Can't load Lib/ServerEvent/resources/sockjs-1.0.3");
                }
                resolve(sockjs)
            });
        })
    }

    /**
     * @param {string} url Строка подключения
     * @param {boolean} isHeartbit Првоерять ли heartbit от сервера.
     *  Если не пришел, то рвем соединение.
     */
    private byWebSocket(url, isHeartbit): Promise<WebSocket> {
        return this.requireStomp().then(() => { return this.getWebSocket(url, isHeartbit); });
    }

    /**
     * @param {string} url Строка подключения
     * @param {boolean} isHeartbit Првоерять ли heartbit от сервера.
     *  Если не пришел, то рвем соединение.
     */
    private bySockjs(url): Promise<WebSocket> {
        return this.requireSockjs().then((sockjs) => {
            return this.getSockjs(sockjs, url);
        });
    }

    private initStomp(webSocket): Promise<Stomp.Client> {
        return new Promise((resolve, reject) => {
            let stomp = Stomp.over(webSocket);
            stomp.heartbeat.outgoing = TransportConnect.STOMP_HEARTBEAT_OUT_TIME;
            stomp.heartbeat.incoming = TransportConnect.STOMP_HEARTBEAT_IN_TIME;
            stomp.debug = function () { };
            stomp.connect(
                TransportConnect.LOGIN,
                TransportConnect.PASSWORD,
                () => { resolve(stomp); },
                (data) => { reject(data); }
            );
        });
    }

    connect(connectOptions: ConnectOptions, isHeartbit): Promise<Stomp.Client> {
        return this.connectWay(connectOptions.getWebSocketUrl(), isHeartbit).then(this.initStomp);
    }
}
