/// <amd-module name="Env/_Request/_Storage/Native" />
import {IStorage} from 'Env/_Request/Interface/IStorage'
const GLOBAL = (function () { return this || (0, eval)('this'); })();

export enum StorageType {
    "local" = "localStorage",
    "session" = "sessionStorage"
}

/**
 * Класс, реализующий интерфейс {@link Core/Request/IStorage},
 * предназначенный для работы с localStorage и SessionStorage
 * @class
 * @name Env/_Request/_Storage/Native
 * @implements Core/Request/IStorage
 * @author Заляев А.В
 */
class NativeStorage implements IStorage {
    private  __storage: Storage;
    constructor(storageType: StorageType) {
        let storage = GLOBAL && GLOBAL[storageType];
        if (!storage) {
            throw new Error(`"${storageType}" not supported`)
        }
        this.__storage = storage;
    }
    get(key: string) {
        try {
            return this.__storage.getItem(key);
        } catch (err) {
            // ignore
        }
    }
    set(key: string, data: string) {
        try {
            this.__storage.setItem(key, data);
            return true;
        } catch (err) {
            // ignore
            return false;
        }
    }
    remove(key: string) {
        try {
            this.__storage.removeItem(key);
        } catch (err) {
            // ignore
        }
    }
    getKeys() {
        try {
            return Object.keys(this.__storage);
        } catch (err) {
            return []
        }
    }
    toObject() {
        try {
            return {
                ...this.__storage
            }
        } catch (err) {
            return {}
        }
    }
}
// tslint:disable-next-line
export default NativeStorage;
