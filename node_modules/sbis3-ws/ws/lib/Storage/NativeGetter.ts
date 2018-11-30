/// <amd-module name="Lib/Storage/NativeGetter" />
import EventBus = require("Core/EventBus");
import localStorageNative = require("Core/LocalStorageNative");
import prefixUtil = require("lib/Storage/utils/prefix");
import detection = require("Core/detection");
import itemUtil = require("Lib/Storage/utils/item");

const GLOBAL = (function () { return this || (0, eval)('this'); })();
// Директория системных данных модуля
const SYSTEM_STORAGE_NAME = "__storage";
// Канал для передачи всех событий хранилища
const channel = () => EventBus.channel("local_storage");
// Ключ по которому хранится список полей, которые необходимо сохранить в хранилище при смене пользователя
const WS_STORE_ALWAYS_KEYS = "ws-store-always-keys";
const WS_STORAGE_KEYS = "ws-local-keys";

// Имя записи, содержащее последнее изменённое поле хранилища для IE.
const FIX_EVENT_KEY = prefixUtil.add("ie-fix-event", SYSTEM_STORAGE_NAME);
// Хэш-данные по последнему пойманному события хранилища для IE
let fixEventsData = [];
/**
 *
 * @param {String} value
 * @return {Boolean}
 */
function isNeedFixEvent(value){
    return value.length >= 2143;
}
// заглушка событий на той же вкладке
const IE_ITEM_PREFIX_REGEXP = /\$ie-fix\{(\d+)\}/i;
const WINDOW_ID = Math.random().toString().substr(2);

/**
 * Добавляет id вкладки к значению
 * необходимо для заглушки событый, возникших на вкладке-инициаторе
 * @param {String} item
 * @return {String}
 */
let addWindowId = (item: string) => `$ie-fix{${WINDOW_ID}}${item}`;
/**
 * Удаляет оверхэд с id вкладки и возвразает чистое значение
 * @param {String} item
 * @return {String}
 */
let removeWindowId = (item: string) => (item && item.replace(IE_ITEM_PREFIX_REGEXP, "") || item);

///region EventBus

let lastEvent: {
    key: string;
    newValue: string;
    oldValue: string;
    date: number;
};
/**
 * Глобальный обработчик события onstorage
 * @param {StorageEvent} event
 */
function storageGlobalHandler(event: StorageEvent) {
    event = event || GLOBAL.event;
    if (!event) {
        return;
    }
    let {key, newValue, oldValue} = event;

    if (newValue == oldValue) {
        // отсекаем обработку событий, если данные в хранилище не поменялись
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
    }
    /**
     * В редких версиях IE есть баг, когда в iframe вызывается два события storage вместо одного
     * смотрим когда у нас данные события совпадают с последним событием, и не старше 2 секунд
     * https://connect.microsoft.com/IE/feedback/details/811546/ie11-localstorage-events-fire-twice-or-not-at-all-in-iframes
     */
    let date = Date.now();
    if (lastEvent && (lastEvent.key === key) && (lastEvent.newValue === newValue) &&
        (lastEvent.oldValue === oldValue) && (date - lastEvent.date <= 2 * 1000)
    ) {
        return;
    }
    lastEvent = {key, newValue, oldValue, date};

    let id, needNewEvent;
    if (newValue) {
        let match = newValue.match(IE_ITEM_PREFIX_REGEXP);
        if (match) {
            newValue = newValue.replace(match[0], "");
            id = match[1];
            needNewEvent = true;
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }
    // Если так же вкладка, то завершаем обработку
    if (id === WINDOW_ID) {
        return;
    }
    if (prefixUtil.startsWith(key, SYSTEM_STORAGE_NAME)) {
        return storageSystemHandler(key, newValue, oldValue);
    }
    if (isNeedFixEvent(newValue)) {
        // если пришло событие, которое прошло условие для вызова фикса,
        // то запомним его, чтобы в событии фикса не вызвать его повторно
        fixEventsData.push({
            key,
            length: newValue.length
        });
    }
    /*
     * Если нашли оверхед, но вкладка не инициатор, то надо заглушить текущее событие и вызвать новое, без оверхеда,
     * чтобы дальнейшие обработчики не знали ничего о нём
     */
    if (needNewEvent) {
        channel().notify('onChange', key, itemUtil.deserialize(newValue));
    }
}
/**
 * Обработчик событий, вызванных самим модулем
 * @param {String} key Ключ изменённого поля хранилища
 * @param {String} value Новое значение
 * @param {String} oldValue Предыдущее значение
 */
function storageSystemHandler(key, value, oldValue) {
    let eventKey = prefixUtil.remove(key, SYSTEM_STORAGE_NAME);
    let systemItem = value;
    if (eventKey === FIX_EVENT_KEY) {
        /*
         * Посылаем асинхронно т.к. поулчении данных для восстановления события
         * размером ~~5kb и больше мы получем null
         * т.к. фактическая запись в хранилище происходит одновреммено с вызовом событий
         */
        setTimeout(function(){
            let value = localStorage.getItem(systemItem);
            let ieFixData = fixEventsData.filter((data) => {
                return (data.key === systemItem) && (data.length === value.length)
            });
            // Если нету в списке значений, которые прошли условие фикс события,
            // то значит событие по этому ключу не пришло
            if (!ieFixData){
                channel().notify('onChange', systemItem, itemUtil.deserialize(value));
            }
            // убираем из списка обработанных событий
            fixEventsData = fixEventsData.filter((data) => {
                return data !== ieFixData;
            })
        }, 10);
    }
}
///endregion EventBus

/**
 * Обёртка над Core/LocalStorageNative для выполнения операций событийными хаками
 * 1) Заглушка событий, вознихших на той же вкладке, где были произведены изменения в хранилище
 * 2) Эмуляция не возникщего события, при записи в хранилище полей длинее ~2kb
 *
 * @class Lib/Storage/ie/LocalStorageNative
 */
let localStorage = {
    /**
     * Возвращает значение из localStorage по ключу.
     * @param {String} key - ключ
     * @returns {String || null} Значение localStorage по key
     */
    getItem(key: string) {
        return removeWindowId(localStorageNative.getItem(key));
    },
    /**
     * Устанавливает значение в localStorage по ключу.
     * @param {String} key - ключ
     * @param {String} item - Значение
     * @return {Boolean} Флаг успешности записи
     */
    setItem(key: string, item: string): boolean {
        // поля для внутренних механизмов оставим как есть
        if (key === WS_STORE_ALWAYS_KEYS || key === WS_STORAGE_KEYS) {
            return localStorageNative.setItem(key, item);
        }
        // Докидываем оверхед в виде строки с id вкладки, чтобы в дальнейшем по нему заглушить события
        item = addWindowId(item);
        let res = localStorageNative.setItem(key, item);
        // Фикс для IE, т.к событие onstorage не стрельнет, если длина сообщения больше 2143 символа
        // f3f77e596dd3d19889490fff390b3ef5e4b44d9e
        if (res && isNeedFixEvent(item)) {
            localStorageNative.setItem(FIX_EVENT_KEY, key);
            localStorageNative.removeItem(FIX_EVENT_KEY);
        }
        return res;
    }
};
// Добавим методы, которые не нуждаются в обёртке
["getLength", "getKeys", "removeItem", "clear"].forEach((f) => {
    localStorage[f] = localStorageNative[f].bind(localStorage);
});

/**
 * Функция получение LocalStorageNative или обёртки над ним для IE, содержащий багфиксы событийной модели
 * @function
 * @private
 */
export = () => {
    /*
     * при построении страницы на СП/ПП в detection.isIE приходит значение от браузера
     * и проверка "if (detection.isIE)" проходит, затем падает ошибка на addEventListener, т.к. его там нет
     * поэтому надо удостоверится что мы точно можем подписаться на событие
     */
    if (detection.isIE && GLOBAL.addEventListener) {
        GLOBAL.addEventListener("storage", storageGlobalHandler, false);
        return localStorage;
    }
    return localStorageNative;
};
