/// <amd-module name="Lib/ServerEvent/native/_IndexedDB/IAdapterStorage" />

export interface IQuery {
    /**
     * Возвращаем функцию фильтрации
     */
    getFilter(...args): (value, index, array) => any | null;

    /**
     * Возвращаем интервал ключей
     */
    getKeyRange(): IDBKeyRange | undefined
}

export interface IAdapterStorage {
    /**
     * Получение ключевых полей
     */
    getKeyPath(): string  | string[] | undefined;

    /**
     * Подготовка данных к записи
     */
    prepare(...args): any;

    /**
     * Возвращаем фильтр запроса для построения выборки
     */
    query(...args): IQuery;

    /**
     * Возвращаем лимит сообщений, который хранится в хранилище
     * @returns {number} Количество сообщений
     */
    getGCLimit(): number;

    /**
     * Возвращает фильтр ключей для GC
     * @returns {IDBKeyRange}
     */
    getGCKeyBound(): IDBKeyRange;

    /**
     * Получаем версию адаптера
     */
    getVersion(): number;
}
