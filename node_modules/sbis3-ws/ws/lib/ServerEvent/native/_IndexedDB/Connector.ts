/// <amd-module name="Lib/ServerEvent/native/_IndexedDB/Connector" />
import Deferred = require('Core/Deferred');
import { Writer } from './Writer';
import { Reader } from './Reader';
import { IAdapterStorage } from "./IAdapterStorage";

/**
 * Удаляем старую БД
 */
if (typeof indexedDB !== "undefined" && indexedDB !== null && indexedDB instanceof IDBFactory) {
    try {
        indexedDB.deleteDatabase("sbis.seb");
    } catch (e) {
        /*
            https://online.sbis.ru/opendoc.html?guid=48920add-498e-44c4-ae34-b1d12e712be0
            бывают отказы доступа к indexedDB
            */
    }
}

/**
 * Соединение с indexedDB
 * @class Lib/ServerEvent/native/_IndexedDB/Connector
 */
export class Connector {
    static DB_DEBUG = "sbis.seb.debug";
    static DB_DELIVER = "sbis.seb.deliver";
    static DEBUG_STORE_NAME = "logs";
    static EVENTS_STORE_NAME = "events";

    /**
     * @param {string} storeName имя хранилища для чтения данных
     * @return {Core/Deferred<Connector | Error>}
     */
    public static connect(dbName: string, storeName: string, adapter: IAdapterStorage): Deferred<Connector> {
        let def = new Deferred<Connector>();
        if (typeof indexedDB !== 'object' || indexedDB === null) {
            return Deferred.fail<Connector>('В окружении нет indexedDB');
        }
        let request;
        try {
            request = indexedDB.open(dbName, adapter.getVersion());
        } catch (e) {
            def.errback(e);
            return def;
        }
        request.onupgradeneeded = function (event) {
            let db = this.result;
            db.onerror = (event) => {
            };
            new Writer(db, storeName, adapter).createStore();
        };
        request.onsuccess = function (event) {
            let db = this.result;
            def.callback(new Connector(db, storeName, adapter));
        };
        request.onerror = function (event) {
            def.errback("You haven't rights to use IndexDB.");
            /**
             * https://github.com/localForage/localForage/issues/195#issuecomment-185135074
             */
            return true;
        };

        return def;
    }

    constructor(private db: IDBDatabase, private storeName: string, private adapter: IAdapterStorage) {
    }

    /**
     * @return {Lib/ServerEvent/native/_IndexedDB/Writer}
     */
    createWriter(): Writer {
        return new Writer(this.db, this.storeName, this.adapter);
    }

    /**
     * @return {Lib/ServerEvent/native/_IndexedDB/Reader}
     */
    createReader<T>(): Reader<T> {
        return new Reader<T>(this.db, this.storeName, this.adapter);
    }
}
