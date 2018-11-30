define('Core/LocalStorageNative', [
    'Core/UserInfo',
    'Core/IoC',
    'Core/constants',
    'Core/helpers/String/format',
    'Core/i18n',
    'Core/_storage',
    'Core/EventBus'
], function (UserInfo, IoC, constants, format, i18n, _storage, EventBus) {
    "use strict";
    ///region const
    var S3SU_KEY = "__s3su";
    var WS_STORAGE_KEYS = "ws-local-keys";
    // Ключ по которому хранится список полей, которые необходимо сохранить в хранилище при смене пользователя
    var WS_STORE_ALWAYS_KEYS = "ws-store-always-keys";
    // Нативный localStorage, либо фейковый объект, если нативный не доступен
    var STORAGE = _storage.getLocal();
    // Максимальный допустимый для записи размер строки
    var MAXIMUM_ITEM_SIZE = 1024 * 512;
    var ERROR_FORMAT = i18n.rk(
        'Превышен максимальный размер записи ($max$d$ kb) в локальное хранилище для ключа \"$key$s$\" ($size$F$2$ kb)'
    );
    ///endregion const
    ///region utils
    /**
     * Логирование сообщения
     * @param {String} message
     * @param {"info" | "error" | "log"} [type] тип сообщения лог/инфо/ошибка
     */
    function log(message, type) {
        type = type || "log";
        IoC.resolve('ILogger')[type]('Core/LocalStorageNative', message);
    }
    /**
     * Возвращает размер строки
     * @private
     * @param {String} str
     * @return {Number}
     */
    function getItemSize(str) {
        var match = encodeURIComponent(str).match(/%[89ABab]/g);
        return str.length + (match ? match.length : 0);
    }
    function checkSize(key, value) {
        /*
         * На СП вместо LocalStorage у нас объект с эмуляцией,
         * поэтому там мы не ограничены 5 МБ на запись и можно не проверять лишний раз размер
         */
        if (!constants.isBrowserPlatform) {
            return true;
        }
        var size = getItemSize(value);
        if (size <= MAXIMUM_ITEM_SIZE) {
            return true;
        }

        log(format({
           max: MAXIMUM_ITEM_SIZE / 1024,
           key: key,
           size: size / 1024
        }, ERROR_FORMAT));
        return false;
    }
    function setUser () {
        STORAGE.setItem(S3SU_KEY, UserInfo.getCurrent());
    }

    /**
     * Метод очистки значений хранилища, которые были установлены через наш модуль
     *
     * Необходимо перевести платформу на работу с хранилищем через модуль
     * Тогда мы можем без угрезений совести очищать всё хранилище через .clear,
     * сохранив при этом и потом записав обратно storage-always поля
     */
    var clearStorage = function () {
        var localKeys = getStorageKeys();
        var alwaysStorageKeys;
        try {
            // [].concat для того чтобы не упало, если кто-то вместо массива в поле запишет одно значение
            alwaysStorageKeys = [].concat(JSON.parse(STORAGE.getItem(WS_STORE_ALWAYS_KEYS)));
        } catch (e) {
            alwaysStorageKeys = [];
        }
        var newKeys = [];
        localKeys.forEach(function (key) {
            if (alwaysStorageKeys.indexOf(key) === -1) {
                return STORAGE.removeItem(key);
            }
            newKeys.push(key);
        });
        STORAGE.setItem(WS_STORAGE_KEYS, JSON.stringify(newKeys));
    };
    /**
     * Возвращает массив из ключей, записанных через наш модуль
     * @return {Array<string>}
     */
    var getStorageKeys = function () {
        try {
            return JSON.parse(STORAGE.getItem(WS_STORAGE_KEYS)) || [];
        } catch (e) {
            return [];
        }
    };
    ///endregion utils
    /// region check user
    // сбросим значения всех параметров, которые мы сохраняли, если сессия поменялась
    function checkSession () {
        var fromStorage = STORAGE.getItem(S3SU_KEY);
        if (!UserInfo.isValid(fromStorage)) {
            clearStorage();
            setUser();
        }
    }

    // если задетектили ошибку где-то в другом месте
    EventBus.channel('errors').subscribe('onAuthError', checkSession);
    // проверка при загрузке страницы
    checkSession();

    /// endregion check user

    /**
     * Обёртка для безопасной работы с локальным хранилищем
     * @class Core/LocalStorageNative
     * @public
     */
    var LocalStorageNative = /** @lends Core/LocalStorageNative.prototype*/{
        /**
         * Возвращает значение из localStorage по ключу.
         * @param {String} key - ключ
         * @returns {String || null} Значение localStorage по key
         */
        getItem: function (key) {
            return STORAGE.getItem(key);
        },
        /**
         * Устанавливает значение в localStorage по ключу.
         * @param {String} key - ключ
         * @param {String} data - Значение
         * @return {Boolean} Флаг успешности записи
         */
        setItem: function (key, data) {
            // Не даём перезаписать пользователя
            if (key === S3SU_KEY) {
                return false;
            }

            var value = "" + data;
            if (!checkSize(key, value)) {
                return false;
            }
            var res = STORAGE.setItem(key, value);
            // Запоминаем ключ
            var localKeys = getStorageKeys();
            if ((localKeys.indexOf(key) === -1)  && (key !== WS_STORE_ALWAYS_KEYS)) {
                localKeys.push(key);
                STORAGE.setItem(WS_STORAGE_KEYS, JSON.stringify(localKeys));
            }
            return res;
        },
        /**
         * Удаляет значение в localStorage по ключу.
         * @param {String} key - ключ
         * @return {void}
         */
        removeItem: function (key) {
            if (key === S3SU_KEY) {
                return;
            }
            STORAGE.removeItem(key);
            var localKeys = getStorageKeys();
            localKeys = localKeys.filter(function(_key) {
                return key !== _key;
            });
            STORAGE.setItem(WS_STORAGE_KEYS, JSON.stringify(localKeys));
            var storeAlwaysKeys;
            try {
                storeAlwaysKeys = JSON.parse(STORAGE.getItem(WS_STORE_ALWAYS_KEYS)) || [];
            } catch (e) {
                storeAlwaysKeys = [];
            }
            if (storeAlwaysKeys.indexOf(key) !== -1) {
                storeAlwaysKeys = storeAlwaysKeys.filter(function(_key) {
                    return key !== _key;
                });
                STORAGE.setItem(WS_STORE_ALWAYS_KEYS, JSON.stringify(storeAlwaysKeys));
            }
        },
        /**
         * Удаляет все значения в localStorage, записанные через данный модуль
         * @return {void}
         */
        clear: function () {
            clearStorage();
            setUser();
        },
        /**
         * Возвращает количество записей хранилища
         * @return {number}
         */
        getLength: function () {
            return getStorageKeys().length;
        },
        /**
         * Возвращает массив ключей, записанных через данный модуль
         * @return {Array<String>}
         */
        getKeys: function () {
            return getStorageKeys();
        }
    };
    return LocalStorageNative;
});
