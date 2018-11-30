/// <amd-module name="Lib/ServerEvent/_class/ConnectOptions" />
import { SEB } from "../interfaces";
import * as CONST from 'Lib/ServerEvent/_class/Constants';

/**
 * @class Lib/ServerEvent/_class/ConnectOptions
 * @memberOf module:ServerEvent.class
 */
export class ConnectOptions implements SEB.IConnectData {
    constructor(public sid: string, public hash: string,
                public protocol: string, public domain: string,
                private stompPath: string, public exchange: string,
                private cid: string=null, private uid=null,
                private __isDesktop: boolean=false) {
    }

    /**
     * Url для подготовка обменника
     * @param {string} sid
     * @return {string}
     */
    getUrl(): string {
        return `${this.protocol}//${this.domain}${this.stompPath}s-${this.sid}/info?t=${new Date().valueOf()}`;
    }

    isDesktop(): boolean {
        return this.__isDesktop;
    }

    /**
     * Возвращем url для соединения WebSocket
     * @return {string}
     */
    getWebSocketUrl(): string {
        let protocol = this.protocol === 'http:' ? 'ws:' : 'wss:';
        return `${protocol}//${this.domain}${this.stompPath}s-${this.sid}/`;
    }

    /**
     * Возвращает путь до сервиса stomp от домена
     * @return {string} например: /stomp/
     */
    getStompPath(): string {
        return this.stompPath;
    }

    getUid(scope: CONST.CHANNEL_SCOPE): string {
        switch (scope) {
            case CONST.CHANNEL_SCOPE.CLIENT:
                return this.cid;
            case CONST.CHANNEL_SCOPE.USER:
                return this.uid;
            case CONST.CHANNEL_SCOPE.GLOBAL:
            default:
                return null;
        }
    }

    static createForDesktop(sid: string, hash: string, url: string, cid: string=null, uid: string=null): ConnectOptions {
        let protocol = url.indexOf('https://') > -1 ? 'https:' : 'http:';
        let domain = url.replace('https://', '').replace('http://', '');
        return new ConnectOptions(sid, hash, protocol, domain, '/stomp/', domain, cid, uid, true);
    }

    static createByLocation(sid: string, hash: string, stompPath: string, cid=null, uid=null): ConnectOptions {
        let prefix = 'stomp-';
        if (location.host.split('.').length < 3) {
            prefix = 'stomp.';
        }

        return new ConnectOptions(
            sid,
            hash,
            location.protocol,
            `${prefix}${location.host}`,
            stompPath,
            location.hostname,
            cid, uid
        );
    }
}