/// <amd-module name="Lib/ServerEvent/native/_IndexedDB/AdapterEvent" />
import { IAdapterStorage, IQuery } from "./IAdapterStorage";

/**
 * Отладочная утилита. Не нужно долго хранить.
 */
const HALF_MINUTE: number = 60000;
const KEY_TIMESTAMP = 'timestamp';
const KEY_UNIQ = 'perf'

class Query implements IQuery {
    private keyBound: IDBKeyRange;

    constructor(lastTime: number) {
        this.keyBound = IDBKeyRange.lowerBound([lastTime], true);
    }

    getKeyRange() {
        return this.keyBound;
    }

    getFilter(channelFilter: string) {
        return null;
    }
}

export interface IMessage {
    channelName: string;
    eventName: string;
    body: string;
};

export class AdapterEvent implements IAdapterStorage {
    constructor(private version=1) {
    }

    /**
     * Получение ключевых полей
     * @return {string[]}
     */
    getKeyPath(): string[] {
        return [KEY_TIMESTAMP, KEY_UNIQ];
    }

    /**
     * Подготовка данных к записи
     * @param channelName
     * @param eventName
     * @param body
     */
    prepare(channelName: string, eventName: string, body: any): IMessage {
        /* На ipad performance.now() не подходит для ключа KEY_UNIQ.
        Слишком часто выдает одинаковые значения, чего быть не должно */
        let data = {
            channelName,
            eventName,
            body,
            [KEY_TIMESTAMP]: Date.now(),
            [KEY_UNIQ]: Math.random() * 1000000
        };
        return data;
    }

    query(lastTime: number) {
        return new Query(lastTime);
    }

    getGCLimit() {
        return 150;
    }

    getGCKeyBound() {
        return IDBKeyRange.upperBound([Date.now() - HALF_MINUTE]);
    }

    getVersion() {
        return this.version;
    }
}
