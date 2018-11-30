define('Core/_Util/Compatibility', [
    'require',
    'exports',
    'Core/_Util/BomDefine'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var div = document && document.createElement('div');
    var divStyle = div && div.style;
    var cssTransformProperty = document && (div.style.transform !== undefined && 'transform' || // new browsers
    div.style.msTransform !== undefined && 'msTransform' || // ie
    div.style.oTransform !== undefined && 'oTransform' || // Opera
    div.style.MozTransform !== undefined && 'MozTransform' || // Firefox
    div.style.webkitTransform !== undefined && 'webkitTransform')    // Chrome
;
    // Chrome
    var isSupportPassive = function () {
        var supportsPassive = false;
        try {
            var opts = Object.defineProperty({}, 'passive', {
                get: function () {
                    supportsPassive = true;
                }
            });
            window.addEventListener('test', null, opts);
        } catch (e) {
        }
        return supportsPassive;
    };
    var input = document && document.createElement('input');
    var style = document && document.createElement('style');
    input && input.setAttribute('type', 'file');
    style && style.setAttribute('type', 'text/css');
    exports.default = {
        dateBug: new Date(2014, 0, 1, 0, 0, 0, 0).getHours() !== 0,
        /**
         * Поддержка placeholder'а на элементах input
         */
        placeholder: document && !!('placeholder' in input),
        /**
         * Поддержка загрузки файлов с использованием стандартного инпута (её может не быть, если, к примеру, у пользователя iPad)
         */
        fileupload: document && !input.disabled,
        /**
         * У старых версий оперы немного другая обработка клавиатурных нажатий. В ней эта константа будет равна false
         */
        correctKeyEvents: window && (!window.opera || parseFloat(window.opera.version()) >= 12.1),
        /**
         * Поддержка css3-анимаций
         */
        cssAnimations: document && (divStyle.transition !== undefined || // Opera, IE 10+, Firefox 16+, Chrome 26+, Safari ?
        divStyle.mozTransition !== undefined || // Firefox 4-15 (?)
        divStyle.webkitTransition !== undefined)    // Chrome ?-25, Safari ? - ?
,
        // Chrome ?-25, Safari ? - ?
        /**
         * Поддержка <b>requestFullscreen</b> и подобных на элементе (позволяет показывать в полноэкранном режиме только некоторые элементы)
         */
        fullScreen: document && (div.requestFullscreen !== undefined || // Opera
        div.mozRequestFullScreen !== undefined || // Firefox
        div.webkitRequestFullscreen !== undefined)    // Chrome
,
        // Chrome
        /**
         * Поддержка события прокрутки колеса мыши. Есть 3 основных варианта:
         * 1) 'wheel'. DOM3 событие, поддержка есть пока только в ие 9+ и файерфоксе (17+)
         * 2) 'mousewheel'. Старое, популярное событие. Имеет большие проблемы из-за разных значений в различных браузерах и даже ос. Аналог в файерфоксе - MozMousePixelScroll или DOMMouseWheel.
         * 3) 'DOMMouseWheel'. Для файерфокса версии 0.9.7+
         */
        wheel: document && (div.onwheel !== undefined || document.documentMode >= 9 ? 'wheel'    // Firefox 17+, IE 9+
 : // Firefox 17+, IE 9+
        div.onmousewheel !== undefined ? 'mousewheel'    // Chrome, Opera, IE 8-
 : // Chrome, Opera, IE 8-
        'DOMMouseScroll')    // older Firefox
,
        // older Firefox
        cssTransformProperty: cssTransformProperty,
        /**
         * Поддержка css-трансформаций. Появились в Chrome (изначально), Firefox (3.5), Internet Explorer (9), Opera (10.5), Safari (3.1)
         */
        cssTransform: !!cssTransformProperty,
        /**
         * Есть ли поддержка прикосновений (touch) у браузера
         */
        touch: document && (navigator.msMaxTouchPoints || navigator.maxTouchPoints || 'ontouchstart' in document.documentElement),
        /**
         * Определение поддержки стандартной работы со стилями
         */
        standartStylesheetProperty: document && !style.styleSheet,
        /**
         * Определяет есть ли поддержка пассивного режима, по
         */
        supportPassive: isSupportPassive()
    };
});