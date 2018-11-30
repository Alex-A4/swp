define("Lib/ServerEvent/worker/web-socket-connect.worker", ["require", "exports", "Lib/ServerEvent/native/SockjsEmulator"], function (require, exports, SockJSTransport) {
    "use strict";
    class ConnectError extends Error {
    }
    const ERROR_WEBSOCKET_CONNECT = "Can't create websocket";
    class WebSocketConnect {
        /**
         * Получение объекта WebSocket или создание его с помощью url
         * @param url - url для подключения вебсокета
         * @return Promise<WebSocket>
         */
        static getInstance(url = null) {
            if (WebSocketConnect.websocket && (WebSocketConnect.url == url || url === null) &&
                ([WebSocket.CLOSING, WebSocket.CLOSED].indexOf(WebSocketConnect.websocket.readyState) === -1)) {
                return Promise.resolve(WebSocketConnect.websocket);
            }
            if (WebSocketConnect.websocket) {
                WebSocketConnect.websocket.close();
            }
            try {
                let subProtocols = ['stomp'];
                WebSocketConnect.websocket = new SockJSTransport(url, subProtocols);
                return Promise.resolve(WebSocketConnect.websocket);
            }
            catch (e) {
                // Иногда ff не может корректно создать вебсокет. Подключаемся заново.
                if (e.message.indexOf('NS_ERROR_SOCKET_CREATE_FAILED') > -1) {
                    return Promise.resolve(WebSocketConnect.getInstance(url));
                }
                return Promise.reject(new ConnectError(e.message || ERROR_WEBSOCKET_CONNECT));
            }
        }
        static close() {
            WebSocketConnect.websocket && WebSocketConnect.websocket.close();
        }
    }
    return WebSocketConnect;
});
