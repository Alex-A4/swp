define("Lib/Storage/NativeGetter", ["require", "exports", "Core/EventBus", "Core/LocalStorageNative", "Lib/Storage/utils/prefix", "Core/detection", "Lib/Storage/utils/item"], function (require, exports, EventBus, localStorageNative, prefixUtil, detection, itemUtil) {
    "use strict";
    var GLOBAL = (function () { return this || (0, eval)('this'); })();
    // Директория системных данных модуля
    var SYSTEM_STORAGE_NAME = "__storage";
    // Канал для передачи всех событий хранилища
    var channel = function () { return EventBus.channel("local_storage"); };
    // Ключ по которому хранится список полей, которые необходимо сохранить в хранилище при смене пользователя
    var WS_STORE_ALWAYS_KEYS = "ws-store-always-keys";
    var WS_STORAGE_KEYS = "ws-local-keys";
    // Имя записи, содержащее последнее изменённое поле хранилища для IE.
    var FIX_EVENT_KEY = prefixUtil.add("ie-fix-event", SYSTEM_STORAGE_NAME);
    // Хэш-данные по последнему пойманному события хранилища для IE
    var fixEventsData = [];
    /**
     *
     * @param {String} value
     * @return {Boolean}
     */
    function isNeedFixEvent(value) {
        return value.length >= 2143;
    }
    // заглушка событий на той же вкладке
    var IE_ITEM_PREFIX_REGEXP = /\$ie-fix\{(\d+)\}/i;
    var WINDOW_ID = Math.random().toString().substr(2);
    /**
     * Добавляет id вкладки к значению
     * необходимо для заглушки событый, возникших на вкладке-инициаторе
     * @param {String} item
     * @return {String}
     */
    var addWindowId = function (item) { return "$ie-fix{" + WINDOW_ID + "}" + item; };
    /**
     * Удаляет оверхэд с id вкладки и возвразает чистое значение
     * @param {String} item
     * @return {String}
     */
    var removeWindowId = function (item) { return (item && item.replace(IE_ITEM_PREFIX_REGEXP, "") || item); };
    ///region EventBus
    var lastEvent;
    /**
     * Глобальный обработчик события onstorage
     * @param {StorageEvent} event
     */
    function storageGlobalHandler(event) {
        event = event || GLOBAL.event;
        if (!event) {
            return;
        }
        var key = event.key, newValue = event.newValue, oldValue = event.oldValue;
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
        var date = Date.now();
        if (lastEvent && (lastEvent.key === key) && (lastEvent.newValue === newValue) &&
            (lastEvent.oldValue === oldValue) && (date - lastEvent.date <= 2 * 1000)) {
            return;
        }
        lastEvent = { key: key, newValue: newValue, oldValue: oldValue, date: date };
        var id, needNewEvent;
        if (newValue) {
            var match = newValue.match(IE_ITEM_PREFIX_REGEXP);
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
                key: key,
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
        var eventKey = prefixUtil.remove(key, SYSTEM_STORAGE_NAME);
        var systemItem = value;
        if (eventKey === FIX_EVENT_KEY) {
            /*
             * Посылаем асинхронно т.к. поулчении данных для восстановления события
             * размером ~~5kb и больше мы получем null
             * т.к. фактическая запись в хранилище происходит одновреммено с вызовом событий
             */
            setTimeout(function () {
                var value = localStorage.getItem(systemItem);
                var ieFixData = fixEventsData.filter(function (data) {
                    return (data.key === systemItem) && (data.length === value.length);
                });
                // Если нету в списке значений, которые прошли условие фикс события,
                // то значит событие по этому ключу не пришло
                if (!ieFixData) {
                    channel().notify('onChange', systemItem, itemUtil.deserialize(value));
                }
                // убираем из списка обработанных событий
                fixEventsData = fixEventsData.filter(function (data) {
                    return data !== ieFixData;
                });
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
    var localStorage = {
        /**
         * Возвращает значение из localStorage по ключу.
         * @param {String} key - ключ
         * @returns {String || null} Значение localStorage по key
         */
        getItem: function (key) {
            return removeWindowId(localStorageNative.getItem(key));
        },
        /**
         * Устанавливает значение в localStorage по ключу.
         * @param {String} key - ключ
         * @param {String} item - Значение
         * @return {Boolean} Флаг успешности записи
         */
        setItem: function (key, item) {
            // поля для внутренних механизмов оставим как есть
            if (key === WS_STORE_ALWAYS_KEYS || key === WS_STORAGE_KEYS) {
                return localStorageNative.setItem(key, item);
            }
            // Докидываем оверхед в виде строки с id вкладки, чтобы в дальнейшем по нему заглушить события
            item = addWindowId(item);
            var res = localStorageNative.setItem(key, item);
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
    ["getLength", "getKeys", "removeItem", "clear"].forEach(function (f) {
        localStorage[f] = localStorageNative[f].bind(localStorage);
    });
    return function () {
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
});
