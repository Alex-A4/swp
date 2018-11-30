define('Core/_Util/Constants', [
    'require',
    'exports',
    'Core/_Util/Compatibility',
    'Core/_Util/Detection'
], function (require, exports, Compatibility_1, Detection_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var now = +new Date();
    var timeShift2014 = +new Date(2014, 9, 26);    /**
     * Список констант WS.
     * Ряд констант не описаны, однако их можно найти в исходном файле классе.
     * @class Core/_Util/Constants
     * @ignoreOptions isNewNav wsRoot debug xmlPackages jsPackages xmlContents hdlBindings hosts services jsCoreModules jsModules operaKeys NON_CTRL
     * @public
     */
    /**
     * Список констант WS.
     * Ряд констант не описаны, однако их можно найти в исходном файле классе.
     * @class Core/_Util/Constants
     * @ignoreOptions isNewNav wsRoot debug xmlPackages jsPackages xmlContents hdlBindings hosts services jsCoreModules jsModules operaKeys NON_CTRL
     * @public
     */
    var constants = /** @lends Core/_Util/constants.prototype */
    {
        /**
         * @cfg {Number} Версия протокола, используемая для вызова методов БЛ через JSON-RPC.
         */
        JSONRPC_PROOTOCOL_VERSION: 5,
        /**
         * @cfg {String} Корневой URL приложения.
         */
        appRoot: '/',
        /**
         * @cfg {String} URL папки ресурсов приложения.
         */
        resourceRoot: '/resources/',
        /**
         * @cfg {String} Корневой URL ядра интерфейсного фреймворка (устарел).
         */
        wsRoot: '/ws/',
        /**
         * @cfg {String} Корневой URL CDN (используется в плагине "cdn!").
         */
        cdnRoot: '/cdn/',
        /**
         * @cfg {String} URL основного сервиса.
         */
        defaultServiceUrl: '/service/',
        /**
         * @cfg {String} Уровень логирования: info - все, warning - предупреждения, error - ошибки.
         */
        logLevel: 'info',
        /**
         * @cfg {String} Номер сборки приложения.
         */
        buildnumber: '',
        /**
         * @cfg {Boolean} Признак, что приложение исполняется в окружении браузера.
         */
        isBrowserPlatform: typeof window !== 'undefined',
        /**
         * @cfg {Boolean} Признак, что приложение исполняется в окружении Node.js или Presentation Service.
         */
        isNodePlatform: typeof process !== 'undefined',
        /**
         * @cfg {Boolean} Признак, что приложение исполняется в окружении сценария бизнес логики.
         */
        isServerScript: typeof window === 'undefined' && typeof process === 'undefined',
        /**
         * @cfg {Boolean} Признак, что идет ли верстка на сервере (при этом он false в юнит тестах под Node.js).
         */
        isBuildOnServer: typeof process !== 'undefined' && process.application,
        /**
         * ??? see Core/helpers/Hcontrol/configStorage
         */
        isNode: typeof process !== 'undefined' && process && process.release && process.release.name === 'node',
        /**
         * @cfg {Boolean} Режим совместимости с устаревшими контролами.
         */
        compat: (typeof window === 'undefined' || window && window.location.href.indexOf('withoutLayout') === -1) && (typeof window === 'undefined' || window.wsConfig.compatible !== false),
        /**
         * @cfg {Boolean} Использовать интернационализацию.
         */
        i18n: false,
        /**
         * @cfg {String} Язык приложения по умолчанию.
         */
        defaultLanguage: '',
        /**
         * @cfg {Object.<String>} Список доступных языков в формате "Код локали -> Название локали".
         */
        availableLanguage: {},
        /**
         * @cfg {Object.<String>} Список доступных словарей для каждого интерфейсного модуля в формате "ИмяМодуля.КодЛокали -> true".
         */
        dictionary: {},
        /**
         * @cfg {String} Имя темы пользовательского интерфейса, используемой в компонентах пространства имен "Lib/Control/*".
         */
        theme: 'wi_scheme',
        /**
         * @cfg {Array.<String>|String} Адрес для автоматической подгрузки шрифтов семейства TensorFont.
         * По умолчанию они лежат в default-теме, но для особых случаев можно задать особый адрес.
         * Если задана пустая строка, то шрифты подгружаться не будут.
         */
        tensorFontsUrl: [
            'Controls-theme/themes/default/fonts/TensorFont.css',
            'Controls-theme/themes/default/fonts/cbus-icons.css',
            'Controls-theme/themes/default/helpers/general.css'
        ],
        /**
         * @cfg {Array.<String>} Хосты, с которых запрашиваются файлы.
         */
        hosts: [],
        /**
         * @cfg {Object.<String>} Список неосновных сервисов в формате "Сервис -> URL сервиса".
         */
        services: {},
        /**
         * @cfg {Object.<String>} Список интерфейсных модулей в формате "Имя модуля -> Папка модуля".
         */
        modules: {},
        /**
         * @cfg {Object.<String>} Список модулей ядра в формате "Имя модуля -> URL модуля".
         */
        jsCoreModules: {},
        /**
         * @cfg {Object.<String>} Список модулей, загружаемых через плагин js! в формате "Имя модуля -> URL модуля" (устарел).
         */
        jsModules: {},
        /**
         * @cfg {Object} Ссылка на константы модуля {@link Core/compatibility}.
         */
        compatibility: Compatibility_1.default,
        /**
         * @cfg {Object} Ссылка на константы модуля {@link Core/detection}.
         */
        browser: Detection_1.default,
        /**
         * @cfg {Number} Смещение московского часового пояса в минутах.
         * Вариативность связана с отказом от перехода на летнее время после 26 ноябля 2014 года.
         */
        moscowTimeOffset: now >= timeShift2014 ? 3 * 60 : 4 * 60,
        /**
         * @cfg {Number} Таймаут для проверки в функции {@link Deprecated/helpers/dom-and-controls-helpers#insertCss}.
         */
        styleLoadTimeout: 4000,
        /**
         * @cfg {String} Разделитель составных частей для значения поля записи типа "Идентификатор".
         */
        IDENTITY_SPLITTER: ',',
        /**
         * @cfg {Boolean} Поддержка пользовательских параметров через модуль {@link Core/UserConfig}.
         */
        userConfigSupport: false,
        /**
         * @cfg {Boolean} Поддержка глобальных параметров через модуль {@link Core/ClientsGlobalConfig}.
         */
        globalConfigSupport: true,
        /**
         * @cfg {Boolean} Режим отладки (устарел).
         */
        debug: false,
        /**
         * @cfg {Boolean} Сохранять последнее состояние в {@link Lib/NavigationController/NavigationController}.
         */
        saveLastState: true,
        /**
         * @cfg {Boolean} Проверять состояние сессии пользователя при вызове методов БЛ.
         */
        checkSessionCookie: true,
        /**
         * @cfg {Array.<String>} Селекторы контентных областей, используемые в {@link Lib/LayoutManager/LayoutManager}.
         */
        layoutConfig: {
            contentArea: [
                '#contentArea',
                '#contentAreaEdit',
                '#ctr'
            ]
        },
        /**
         * @cfg {Boolean} Флаг для data-provider-а навигации, о том, что нужно использовать новый компонент.
         */
        isNewNav: true,
        /**
         * @cfg {Object.<String>} Пакеты XML-файлов в формате "Имя шаблона -> Файл пакета".
         */
        xmlPackages: {},
        /**
         * @cfg {Object.<String>} Пакеты JS-файлов в формате "Оригинальное имя файла -> Файл пакета".
         */
        jsPackages: {},
        /**
         * @cfg {Object.<String>} Сопоставление коротких имен XML-шаблонов полным путям в формате "Имя шаблона -> Файл шаблона".
         */
        xmlContents: {},
        /**
         * @cfg {Object.<String>} Альтернативные имена входного файла.
         */
        htmlNames: {},
        /**
         * @cfg {Object.<Array.<String>>} Декларативная привязка обработчиков на ресурс.
         * Формат: ИмяШаблона: [ ФайлОбработчиков, ФайлОбработчиков, ... ], ...
         */
        hdlBindings: {},
        /**
         * @cfg {Number} Расстояние детекции Drag&Drop при перемещении объекта с зажатой клавишей.
         */
        startDragDistance: 4,
        /**
         * @cfg {Array.<String>} Классы контролов-окон, которые могут быть родителями других окон и всплывающих панелей.
         */
        WINDOW_CLASSES: [
            'Lib/Control/FloatArea/FloatArea',
            'Lib/Control/Window/Window',
            'Deprecated/Controls/FieldEditAtPlace/FieldEditAtPlace'
        ],
        /**
         * @cfg {Object.<Number>} Коды служебных клавиш клавиатуры в формате "Клавиша -> код".
         */
        key: {
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            insert: 45,
            del: 46,
            space: 32,
            backspace: 8,
            minus: 109,
            plus: 107,
            enter: 13,
            esc: 27,
            f1: 112,
            f3: 114,
            f4: 115,
            f5: 116,
            f7: 118,
            f12: 123,
            meta: 157,
            underscore: 95,
            pageUp: 33,
            pageDown: 34,
            end: 35,
            home: 36,
            tab: 9,
            ctrl: 17,
            b: 66,
            h: 72,
            v: 86,
            y: 89,
            q: 81,
            p: 80,
            m: 77,
            n: 78,
            o: 79,
            androidAnyKey: 229
        },
        /**
         * @cfg {Object.<Number>} Коды клавиш-модификаторов в формате "Клавиша -> код".
         */
        modifiers: {
            nothing: 0,
            shift: 2,
            control: 4,
            alt: 8
        },
        /**
         * @cfg {Object.<String>} Трансляция кодов клавиш для браузера Opera.
         */
        operaKeys: {
            43: 'plus',
            45: 'minus'
        },
        /**
         * @cfg {String} CSS-селекор для элементов, не являющихся контролами. Используется в {@link Lib/Control/AreaAbstract/AreaAbstract}.
         */
        NON_CTRL: '.ws-non-control',
        /**
         * ???
         */
        fasttemplate: false,
        /**
         * ???
         */
        nostyle: false,
        /**
         * ????
         */
        javaStartTimeout: 15000,
        /**
         * ???
         */
        resizeDelay: 40,
        /**
         * ???
         */
        classLoaderMappings: {},
        /**
         * ???
         */
        IE_ACTIVEOBJECT_XML_PRINT_TYPE: 'Microsoft.XmlDom'
    };
    var global = function () {
        return this || (0, eval)('this');    //eslint-disable-line
    }();
    //eslint-disable-line
    global.IS_PRODUCTION = constants.isProduction;    // для nativeExtensions
    // для nativeExtensions
    exports.default = constants;
});