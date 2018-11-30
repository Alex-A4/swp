/// <reference path="../../resources/stomp.d.ts" />
/// <amd-module name="Lib/ServerEvent/native/_IndexedDB/Writer" />
import { IAdapterStorage } from "./IAdapterStorage";

    /**
     * Класс, который записывает Stomp данные в IndexDB
     * @class Lib/ServerEvent/native/_IndexedDB/Writer
     */
export class Writer
{
    static GC_INTERVAL = 10000;
    static GC_EVENT_LIMIT = 5 * 60 * 1000;

    private gc_work: number;

    /** @constructor */
    constructor(private db: IDBDatabase, private storeName: string, private adapter: IAdapterStorage) {
        this.garbageCollection = this.garbageCollection.bind(this);
        this.gc_work = setInterval(this.garbageCollection, Writer.GC_INTERVAL);
    }

    write(...args) {
        let data = this.adapter.prepare.apply(this.adapter, [...args]);
        try {
            this.db.transaction(this.storeName, "readwrite")
                .objectStore(this.storeName)
                .add(data);
        } catch (e) {
        /* Fx bug: https://bugzilla.mozilla.org/show_bug.cgi?id=781982
            ничего сделать не можем */
            return false;
        }

        return true;
    }

    createStore() {
        try {
            this.db.deleteObjectStore(this.storeName);
        }
        catch (e) {
            // Не смог удалить, ну и бог с ним
        }
        try {
            this.db.createObjectStore(this.storeName, {
                keyPath: this.adapter.getKeyPath(),
                autoIncrement: false
            });
        } catch (e) {
            /* Fx bug: https://bugzilla.mozilla.org/show_bug.cgi?id=781982
            ничего сделать не можем */
            return false;
        }

        return true;
    }

    private garbageCollection() {
        try {
            let store = this.db.transaction(this.storeName, "readwrite")
                .objectStore(this.storeName);
            let request = store.count();
            request.onsuccess = () => {
                if (!this.adapter) { return; }  // может произойти после вызова Writer::destructor
                if (request.result <= this.adapter.getGCLimit()) {
                    return;
                }
                store.delete(this.adapter.getGCKeyBound());
            };
            request.onerror = () => {
            };
        } catch (e) {
            /* Fx bug: https://bugzilla.mozilla.org/show_bug.cgi?id=781982
            ничего сделать не можем */
            return false;
        }
        return true;
    }

    destructor() {
        clearInterval(this.gc_work);
        this.write = () => false;
        this.createStore = () => false;
        this.db = undefined;
        this.adapter = undefined;
    }
}
