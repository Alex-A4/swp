/// <amd-module name="Lib/ServerEvent/_class/logger/Bit" />
import RPCJSON = require('Transport/RPCJSON');
import UserInfo = require('Core/UserInfo');

const EVENT_CHANNEL = 'sbis.page.ping';
const SERVICE = '/test_client_service/service/';
const METHOD_FAIL = 'ClientEventTest.Record';
/**
 * Таймаут на повисший коннект у нас ~5 минут
 * @type {number}
 */
const PING_DETECT_TIMEOUT = 6 * 60 * 1000;

class Ping {
    constructor(public num: number, public timestamp = Date.now()) {
    }

    static compare(a, b) {
        if (a.num > b.num) {
            return 1;
        }

        if (a.num < b.num) {
            return -1
        }

        return 0;
    }
}

/**
 * @namespace Lib/ServerEvent/_class
 * @class Bit
 */
export class Bit {
    private lastConnect: number;
    private lastDisconnect;
    private tabId;

    private detectMode;
    private lastPingNum = 0;
    private pings: Ping[] = [];

    constructor(seb) {
        if (!window) {
            return;
        }
        this.tabId = Bit.generateID();

        this.appendPing = this.appendPing.bind(this);
        this.detectAfterReconnect = this.detectAfterReconnect.bind(this);
        seb.serverChannel(EVENT_CHANNEL).subscribe('onready', () => {
           this.lastConnect = Date.now();
        });
        seb.serverChannel(EVENT_CHANNEL).subscribe('onmessage', this.appendPing);
        seb.serverChannel(EVENT_CHANNEL).subscribe('ondisconnect', () => {
            this.lastDisconnect = Date.now();
            if (this.detectMode) {
                clearTimeout(this.detectMode);
            }
            this.detectMode = setTimeout(this.detectAfterReconnect, PING_DETECT_TIMEOUT);
        });
    }

    private appendPing(event, data) {
        let last = this.lastPingNum;
        this.lastPingNum = data;

        if (this.detectMode) {
            this.pings.push(new Ping(data));
            return;
        }

        if (last + 1 == data || data == 0 || last == 0) {
            return;
        }

        let userId = UserInfo.get('ИдентификаторПользователя');
        let mode = 'skip';
        if (last + 1 > data) {
           mode = 'wrong order';
        }
        let rpc = new RPCJSON({serviceUrl: SERVICE, asyncInvoke: true});
        rpc.callMethod(METHOD_FAIL, {
            data: {
                m: mode,
                userId: userId,
                tab: this.tabId,
                last: last,
                current: data,
                detected: Date.now(),
                connect: this.lastConnect,
                disconnect: this.lastDisconnect
            }
        });
    }

    private detectAfterReconnect() {
        if (this.pings.length === 0) {
            return;
        }

        let userId = UserInfo.get('ИдентификаторПользователя');
        let sequence = this.pings.sort(Ping.compare);
        let last = sequence.shift();
        for (let ping of sequence) {
            if (last.num + 1 === ping.num) {
                last = ping;
                continue;
            }

            let data = {
                m: 'skip',
                userId: userId,
                tab: this.tabId,
                last: last.num,
                current: ping.num,
                detected: ping.timestamp,
                connect: this.lastConnect,
                disconnect: this.lastDisconnect
            };
            last = ping;
            try {
                let rpc = new RPCJSON({serviceUrl: SERVICE, asyncInvoke: true});
                rpc.callMethod(METHOD_FAIL, {data});
            } catch (e) {}
        }

        this.pings = [];
        this.lastPingNum = last.num;
        this.detectMode = undefined;
    }

    private static generateID() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4();
    }
}
