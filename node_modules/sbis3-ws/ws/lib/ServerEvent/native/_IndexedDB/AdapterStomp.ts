/// <amd-module name="Lib/ServerEvent/native/_IndexedDB/AdapterStomp" />
import { IAdapterStorage, IQuery } from "./IAdapterStorage";

const MINUTE: number = 60000;

class Query implements IQuery {
    getKeyRange() {
        return undefined;
    }

    getFilter(channelFilter: string) {
        return (value, index, array) => {
            let channel;
            if (value["headers"] && value["headers"]["event-type"]) {
                channel = value["headers"]["event-type"];
            }
            return channel.match(channelFilter);
        };
    }
}

export class AdapterStomp implements IAdapterStorage {
    /**
     * Получение ключевых полей
     * @return {string}
     */
    getKeyPath(): string {
        return 'timestamp';
    }

    /**
     * Подготовка данных к записи
     * @param {Stomp.Message} message
     */
    prepare(message: Stomp.Message): any {
        let key = Date.now();
        let data = {
            headers: message.headers,
            body: message.body,
            command: message.command,
            [this.getKeyPath()]: key
        };

        return data;
    }

    query(...args) {
        return new Query();
    }

    getGCLimit() {
        return 150;
    }

    getGCKeyBound() {
        return IDBKeyRange.upperBound(Date.now() - MINUTE);
    }

    getVersion() {
        return 1;
    }
}

export interface AdapterStompConstructor {
    new();
}
