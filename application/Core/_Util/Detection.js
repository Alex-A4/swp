define('Core/_Util/Detection', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function IEVersion(userAgent) {
        var ua = userAgent.toString().toLowerCase() || '', match = /(msie)\s+([\w.]+)/.exec(ua) || /(trident)(?:.*rv:([\w.]+))?/.exec(ua) || /(edge)\/([\w]+)/.exec(ua);
        return match && parseInt(match[2], 10);
    }
    function IOSVersion(userAgent) {
        var match = /\bCPU\s+(i?)OS\s+(\d+)/.exec(userAgent);
        return match && parseInt(match[2], 10);
    }    /**
     * Get WebKit major version from User Agent string.
     *
     * @param userAgent: string
     * @returns number
     */
    /**
     * Get WebKit major version from User Agent string.
     *
     * @param userAgent: string
     * @returns number
     */
    function getWebkitVersion(userAgent) {
        var match = /(AppleWebKit\/)+([\w.]+)/.exec(userAgent);
        return match && parseInt(match[2], 10);
    }    /**
     * Get Safari major version number from User Agent string.
     *
     * @param userAgent: string
     * @returns number
     */
    /**
     * Get Safari major version number from User Agent string.
     *
     * @param userAgent: string
     * @returns number
     */
    function getSafariVersion(userAgent) {
        var match = /(Safari\/)+([\w.]+)/.exec(userAgent);
        return match && parseInt(match[2], 10);
    }
    function getUserAgent() {
        var agent = '';
        if (typeof process !== 'undefined') {
            // node
            var req = process.domain && process.domain.req;
            agent = req && req.headers && req.headers['user-agent'] ? req.headers['user-agent'] : '';
        } else if (typeof navigator !== 'undefined') {
            // browser
            agent = navigator.userAgent;
        }
        return agent;
    }
    function getTrident(userAgent) {
        var match = userAgent.match(/Trident\/(\d+)/);
        return match && parseInt(match[1], 10);
    }
    function recalcDetection() {
        var userAgent = getUserAgent(), isIOSMobilePlatform = !!/(iPod|iPhone|iPad)/.test(userAgent),
            /**
         * На таблетках нет Mobile в UA
         * @link https://developer.chrome.com/multidevice/user-agent
         */
            ieVersion = IEVersion(userAgent), iosVersion = IOSVersion(userAgent), isAndroidMobilePlatform = !!(/Android/.test(userAgent) && /AppleWebKit/.test(userAgent)),
            // У Microsoft Lumia 550 в user agent может не быть упоминаний Windows Phone, пример в https://online.sbis.ru/opendoc.html?guid=b698ee18-2e51-473c-9537-2793a63e080f
            isWPMobilePlatform = /Windows Phone/i.test(userAgent) || /iemobile/i.test(userAgent) || /WPDesktop/i.test(userAgent) || /Lumia/i.test(userAgent), isMacOSPlatform = !!/\bMac\s+OS\s+X\b/.test(userAgent) && !isIOSMobilePlatform, isChromeIOS = !!(isIOSMobilePlatform && userAgent.match(/\bCriOS\b/)), isChromeDesktop = (!!(typeof window !== 'undefined' && window.chrome) || isChromeIOS) && !ieVersion, isNotFullGridSupport = !!(userAgent.match(/Chrome\/[0-9]*./) !== null && userAgent.match(/Chrome\/[0-9]*./)[0].substr(7, 8) < 65 || userAgent.match(/Version\/[0-9]*.[0-9].[0-9] Safari/) !== null && userAgent.match(/Version\/[0-9]*.[0-9].[0-9] Safari/)[0].substr(11, 1) < 1 && userAgent.match(/Version\/[0-9]*.[0-9].[0-9] Safari/)[0].substr(8, 2) !== '12'), isMobilePlatform = isIOSMobilePlatform || isAndroidMobilePlatform || isWPMobilePlatform, isMobileSafari = isIOSMobilePlatform && !isChromeIOS && /AppleWebKit/.test(userAgent) && /Mobile\//.test(userAgent), isWebkit = !isChromeDesktop && /(webkit)/i.test(userAgent) && !(ieVersion && ieVersion >= 12), isDesktopSafari = isMacOSPlatform && /AppleWebKit/.test(userAgent) && !/Chrome/.test(userAgent), isSafari = isMobileSafari || isDesktopSafari, isOldWebkit = isChromeIOS && iosVersion < 11 || isSafari && getSafariVersion(userAgent) < 604, win = /Windows/i.test(userAgent), win10 = /Windows NT 10\.0/i.test(userAgent), win8 = /Windows NT 6\.[23]/i.test(userAgent), win7 = /Windows NT 6\.1/i.test(userAgent), winVista = /Windows NT 6\.0/i.test(userAgent), winXP = /Windows NT 5\.[12]/i.test(userAgent), unix = /(?:unix|linux)/i.test(userAgent), mac = /Macintosh/i.test(userAgent);
        var safariVersion = isSafari && userAgent.match(/Version\/([0-9\.]*)/);
        safariVersion = safariVersion instanceof Array ? parseInt(safariVersion[1], 10) : safariVersion;
        var detection = {
            userAgent: userAgent,
            isWPMobilePlatform: isWPMobilePlatform,
            /**
             * Мобильный сафари - iPhone, iPod, iPad
             */
            isMobileSafari: isMobileSafari,
            /**
             * Мобильные версии браузеров на андроиде
             */
            isMobileAndroid: isAndroidMobilePlatform,
            /**
             * Мобильные версии браузеров на IOS
             */
            isMobileIOS: isIOSMobilePlatform,
            /**
             * Мобильные версии браузеров
             */
            isMobilePlatform: isMobilePlatform,
            /**
             * internet explorer
             */
            isIE: !!ieVersion,
            /**
             * internet explorer 10+
             */
            isModernIE: ieVersion > 9,
            /**
             * internet explorer 10
             */
            isIE10: ieVersion === 10,
            isRealIE10: ieVersion === 10 && getTrident(userAgent) === 6,
            /**
             * internet explorer 11
             */
            isIE11: ieVersion === 11,
            /**
             * internet explorer 12 (EDGE)
             */
            isIE12: ieVersion >= 12,
            IEVersion: ieVersion,
            IOSVersion: iosVersion,
            isOldWebKit: isOldWebkit,
            /**
             * Firefox
             */
            firefox: userAgent.indexOf('Firefox') > -1,
            /**
             * Chrome
             */
            chrome: isChromeDesktop || isChromeIOS,
            /**
             * Old Chrome and Safari without full grid layout and display:contents support
             */
            isNotFullGridSupport: isNotFullGridSupport || !!ieVersion,
            /**
             * Mac OS
             */
            isMacOSDesktop: isMacOSPlatform && !isIOSMobilePlatform,
            /**
             * Mac OS
             */
            isMacOSMobile: isMacOSPlatform && isIOSMobilePlatform,
            /*
             * Safari
             */
            safari: /^((?!chrome|android).)*safari/i.test(userAgent),
            safari11: isSafari && safariVersion === 11,
            opera: /(opera)/i.test(userAgent),
            operaChrome: /OPR/.test(userAgent),
            /*
             * Yandex
             */
            yandex: /\bYaBrowser\/(\d+)/.test(userAgent),
            // в Edge User-Agent содержит 'AppleWebKit' поэтому он определяется как webkit, хотя не должен
            webkit: isWebkit,
            retailOffline: userAgent.indexOf('sbis') > -1,
            isWin: win,
            isWin10: win10,
            isWin8: win8,
            isWin7: win7,
            isWinVista: winVista,
            isWinXP: winXP,
            isUnix: unix,
            isMac: mac
        };
        return detection;
    }
    var detection;    /**
     * На сервере detection не должен кешиться и каждый запрос к нему должен пересчитываться заново
     * на клиенте эта логика не нужна, поскольку браузер статичен
     */
    /**
     * На сервере detection не должен кешиться и каждый запрос к нему должен пересчитываться заново
     * на клиенте эта логика не нужна, поскольку браузер статичен
     */
    if (typeof window === 'undefined') {
        detection = new Proxy({}, {
            get: function (target, property) {
                return recalcDetection()[property];
            }
        });
    } else {
        detection = recalcDetection();
    }
    exports.default = detection;
});