define('View/_Request/_Storage/Cookie', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var MS_IN_DAY = 24 * 60 * 60 * 1000;
    var NAME_REPLACE_REGEXP = /=.*/;    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStorage},
     * предназначенный для работы с cookie в браузере
     * @class
     * @name View/_Request/_Storage/Cookie
     * @implements Core/Request/IStorage
     * @author Заляев А.В
     */
    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStorage},
     * предназначенный для работы с cookie в браузере
     * @class
     * @name View/_Request/_Storage/Cookie
     * @implements Core/Request/IStorage
     * @author Заляев А.В
     */
    var Cookie = /** @class */
    function () {
        function Cookie() {
        }
        Cookie.prototype.get = function (key) {
            var value = null;
            var cookies = document.cookie.split(';'), item;
            for (var i = 0; i < cookies.length; i++) {
                item = String(cookies[i]).trim();
                if (item.substring(0, key.length + 1) === key + '=') {
                    value = decodeURIComponent(item.substring(key.length + 1));
                    break;
                }
            }
            return value;
        };
        Cookie.prototype.set = function (key, value, options) {
            var expires = '', path, domain, secure;
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            if (options.expires) {
                var date = void 0;
                if (typeof options.expires === 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + options.expires * MS_IN_DAY);
                } else if (options.expires.toUTCString) {
                    date = options.expires;
                } else {
                    throw new TypeError('Option "expires" should be a Number or Date instance');
                }
                expires = '; expires=' + date.toUTCString();
            }
            path = options.path ? '; path=' + options.path : '';
            domain = options.domain ? '; domain=' + options.domain : '';
            secure = options.secure ? '; secure' : '';
            document.cookie = [
                name,
                '=',
                encodeURIComponent(value),
                expires,
                path,
                domain,
                secure
            ].join('');
            return true;
        };
        Cookie.prototype.remove = function (key) {
            this.set(key, null);
        };
        Cookie.prototype.getKeys = function () {
            return document.cookie.split(';').map(function (cookie) {
                return cookie.replace(NAME_REPLACE_REGEXP, '');
            });
        };
        Cookie.prototype.toObject = function () {
            var result = {};
            document.cookie.split(';').forEach(function (item) {
                var _a = item.split('='), key = _a[0], value = _a[1];
                result[key] = decodeURIComponent(value);
            });
            return result;
        };
        return Cookie;
    }();
    exports.default = Cookie;
});