/// <amd-module name="Lib/ServerEvent/native/_IndexedDB/Reader" />
/// <reference path="../../resources/stomp.d.ts" />
import { IAdapterStorage, IQuery } from "./IAdapterStorage";

/**
 * @class Lib/ServerEvent/native/_IndexedDB/Reader
 */
export class Reader<T=Object>
{
    constructor(private db: IDBDatabase, private storeName: string, private adapter: IAdapterStorage) {
    }

    query(...args): Promise<T[]> {
        let query: IQuery = this.adapter.query.apply(this.adapter.query, [...args]);
        return new Promise<T[]>((resolve, reject) => {
            let request = this.db.transaction(this.storeName, "readonly")
                .objectStore(this.storeName)
                .openCursor(query.getKeyRange());

            let results = [];
            request.onsuccess = function (event) {
                let cursor = request.result;
                if (!cursor) {
                    return resolve(results);
                }
                let value = cursor.value;
                if (value) {
                    results.push(cursor.value);
                }
                cursor.continue();
            };

            request.onerror = reject;
        }).then((data: T[]) => {
            let filter = query.getFilter();
            if (!filter) {
                return data;
            }
            return data.filter(filter);
        });
    }
}