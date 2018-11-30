/// <amd-module name="Lib/ServerEvent/native/SockjsEmulator" />
/**
 * @link https://github.com/sockjs/sockjs-client/blob/master/lib/utils/browser-crypto.js
 */
function randomBytes(length) {
    let bytes = new Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
}

/**
 * @link https://github.com/sockjs/sockjs-client/blob/master/lib/utils/random.js
 * @type {string}
 * @private
 */
let _randomStringChars = 'abcdefghijklmnopqrstuvwxyz012345';
let random = {
    string: function (length) {
        let max = _randomStringChars.length;
        let bytes = randomBytes(length);
        let ret = [];
        for (let i = 0; i < length; i++) {
            ret.push(_randomStringChars.substr(bytes[i] % max, 1));
        }
        return ret.join('');
    },

    number: function (max) {
        return Math.floor(Math.random() * max);
    },

    numberString: function (max) {
        let t = ('' + (max - 1)).length;
        let p = new Array(t + 1).join('0');
        return (p + this.number(max)).slice(-t);
    }
};

/*let onmessage = function (e) {
    self.emit('message', e.data);
};

function emit() {
    var type = arguments[0];
    var listeners = this._listeners[type];
    if (!listeners) {
        return;
    }
    // equivalent of Array.prototype.slice.call(arguments, 1);
    var l = arguments.length;
    var args = new Array(l - 1);
    for (var ai = 1; ai < l; ai++) {
        args[ai - 1] = arguments[ai];
    }
    for (var i = 0; i < listeners.length; i++) {
        listeners[i].apply(this, args);
    }
};*/

/**
 * @link https://github.com/sockjs/sockjs-client/blob/master/lib/main.js#L53
 */
const DEFAULT_SESSION_ID = 8;
/**
 * @link https://tools.ietf.org/html/rfc6455#section-7.4.1
 */
const WEBSOCKET_SERVER_CLOSE_CONNECT = 3000;

class SockJSTransport implements WebSocket {
    /**
    * @lik http://sockjs.github.io/sockjs-protocol/sockjs-protocol-0.3.3.html#section-42
    */
    static FRAME_OPEN = "o";
    static FRAME_HEARTBEAT = "h";
    static FRAME_ARRAY = "a";
    static FRAME_CLOSE = "c";
    static CONTROL_FRAMES = [
       SockJSTransport.FRAME_OPEN,
       SockJSTransport.FRAME_HEARTBEAT,
       SockJSTransport.FRAME_CLOSE
    ];
    /**
     * Default timeout is 25sec.
     * Check 30sec delay
     * @type {number}
     */
    static HEARTBEAT_TIMEOUT = 30000;
    private intervalHeartbeatId;
    private lastHeartbeat;

    private ws: WebSocket;
    /**
     * @link https://github.com/sockjs/sockjs-client/blob/master/lib/main.js#L216
     * @param url
     * @param protocols
     * @param checkHeartbeat нужно ли проверять heartbeat при установке соединения
     */
    constructor(url: string, protocols: string|string[]=[], checkHeartbeat=true) {
        let server = random.numberString(1000);
        let session = random.string(DEFAULT_SESSION_ID);
        let slash =  url[url.length-1] === '/' ? '' : '/';
        this.ws = new WebSocket(`${url}${slash}${server}/${session}/websocket`, protocols);

        this.checkHeartbeat = this.checkHeartbeat.bind(this);
        this.updateHeartbeat = this.updateHeartbeat.bind(this);
        this.lastHeartbeat = new Date().getTime();
        this.ws.onmessage = this.updateHeartbeat;
        if (checkHeartbeat) {
            this.intervalHeartbeatId = setInterval(
                this.checkHeartbeat,
                SockJSTransport.HEARTBEAT_TIMEOUT);
        }
    }

    private checkHeartbeat() {
        if (this.lastHeartbeat + SockJSTransport.HEARTBEAT_TIMEOUT < new Date().getTime()) {
            clearInterval(this.intervalHeartbeatId);
            this.close(WEBSOCKET_SERVER_CLOSE_CONNECT);
        }
    }

    private updateHeartbeat() {
        this.lastHeartbeat = new Date().getTime();
    }

    /**
     * @link https://github.com/bestiejs/json3/blob/master/lib/json3.js#L161
     * @param data
     */
    send(data): void {
        /* eslint-disable no-control-regex */
        let text = data
            .replace(/\u0000/gm, "\\u0000")
            /*.replace(/\b/gm, "\\b")*/
            .replace(/\n/gm, "\\n")
            .replace(/\f/gm, "\\f")
            .replace(/\r/gm, "\\r")
            .replace(/\t/gm, "\\t");
        /* eslint-enable no-control-regex */

        let msg = `["${text}"]`;
        this.ws.send(msg);
    }

    /**
     * Закрыте websocket.
     *  не передаём параметры, т.к. в safari он не понимает их.
     *  https://online.sbis.ru/opendoc.html?guid=660f28c1-d0f9-400b-84cc-9a22e80b6528
     * @param {number} code
     * @param {string} reason
     */
    close(code?: number, reason?: string): void {
        this.ws.close();
    }

    get binaryType() {
        return this.ws.binaryType;
    }
    set binaryType(value) {
        this.ws.binaryType = value;
    }
    get bufferedAmount(): number {
        return this.ws.bufferedAmount;
    }
    get extensions(): string {
        return this.ws.extensions;
    }
    get onclose(): (this: WebSocket, ev: CloseEvent) => any {
        return this.ws.onclose;
    }
    set onclose(value: (this: WebSocket, ev: CloseEvent) => any) {
        this.ws.onclose = value;
    }
    get onerror(): (this: WebSocket, ev: ErrorEvent) => any {
        return this.ws.onerror;
    }
    set onerror(value: (this: WebSocket, ev: ErrorEvent) => any) {
        this.ws.onerror = value;
    }
    get onmessage(): (this: WebSocket, ev: MessageEvent) => any {
        return this.ws.onmessage;
    }
    set onmessage(value: (this: WebSocket, ev: MessageEvent) => any) {
        this.ws.onmessage = (ev) => {
            this.updateHeartbeat();
            if (!ev.data) {
                return;
            }

            if (ev.data[0] === SockJSTransport.FRAME_CLOSE) {
                let data = JSON.parse(ev.data.substr(1));
                if (!data[1]) {
                    return;
                }
                value.call(this, new MessageEvent('websocket', {
                    data: data[1],
                    origin: ev.origin,
                    source: ev.source
                }));
                return this.close();
            }

            if (SockJSTransport.CONTROL_FRAMES.indexOf(ev.data[0]) !== -1) {
                return;
            }

            if (SockJSTransport.FRAME_ARRAY !== ev.data[0]) {
                value.call(this, Object.create(ev, {data: {value: ev.data}}));
            }

            let data = JSON.parse(ev.data.substr(1));
            for (let i = 0; i < data.length; i++) {
                value.call(this, Object.create(ev, {data: {value: data[i]}}));
            }
        };
    }
    get onopen(): (this: WebSocket, ev: Event) => any {
        return this.ws.onopen;
    }
    set onopen(value: (this: WebSocket, ev: Event) => any) {
        this.ws.onopen = value;
    }
    get protocol(): string {
        return this.ws.protocol;
    }
    get readyState(): number {
        return this.ws.readyState;
    }
    get url(): string {
        return this.ws.url;
    }
    get CLOSED(): number {
        return this.ws.CLOSED;
    }
    get CLOSING(): number {
        return this.ws.CLOSING;
    }
    get CONNECTING(): number {
        return this.ws.CONNECTING;
    }
    get OPEN(): number {
        return this.ws.OPEN;
    }

    addEventListener(type: string, listener: (this: this, ev: Event) => any, useCapture: boolean=false): void {
        this.ws.addEventListener(type, listener, useCapture);
    }
    dispatchEvent(evt: Event): boolean {
        return this.ws.dispatchEvent(evt);
    }
    removeEventListener(type: string, listener?: EventListenerOrEventListenerObject, useCapture?: boolean): void {
        this.ws.removeEventListener(type, listener);
    }
}

export = SockJSTransport;
