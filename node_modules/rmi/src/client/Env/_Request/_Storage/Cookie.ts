/// <amd-module name="Env/_Request/_Storage/Cookie" />
import { IStorage } from "Env/_Request/Interface/IStorage";

const MS_IN_DAY = 24 * 60 * 60 * 1000;
const NAME_REPLACE_REGEXP = /=.*/;

/**
 * Класс, реализующий интерфейс {@link Core/Request/IStorage},
 * предназначенный для работы с cookie в браузере
 * @class
 * @name Env/_Request/_Storage/Cookie
 * @implements Core/Request/IStorage
 * @author Заляев А.В
 */
class Cookie implements IStorage {
    get(key: string) {
        let value = null;
        let cookies = document.cookie.split(';');
        let item;
        for (let i = 0; i < cookies.length; i++) {
            item = String(cookies[i]).trim();
            if (item.substring(0, key.length + 1) === (`${key}=`)) {
                value = decodeURIComponent(item.substring(key.length + 1));
                break;
            }
        }
        return value;
    }
    set(key: string, value: string, options?) {
        let expires = '';
        let path;
        let domain;
        let secure;
        options = options || {};

        if (value === null) {
            value = '';
            options.expires = -1;
        }

        if (options.expires) {
            let date;
            if (typeof options.expires === 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * MS_IN_DAY));
            } else if (options.expires.toUTCString) {
                date = options.expires;
            } else {
                throw new TypeError('Option "expires" should be a Number or Date instance');
            }
            expires = `; expires=${date.toUTCString()}`;
        }

        path = options.path ? `; path=${options.path}` : '';
        domain = options.domain ? `; domain=${options.domain}` : '';
        secure = options.secure ? '; secure' : '';

        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        return true;
    }
    remove(key: string): void {
        this.set(key, null);
    }
    getKeys(): Array<string> {
        return document.cookie.split(';').map((cookie) => {
            return cookie.replace(NAME_REPLACE_REGEXP, '')
        })
    }
    toObject(): HashMap<string> {
        let result = {};
        document.cookie.split(';').forEach((item) => {
            let [key, value] = item.split('=');
            result[key] = decodeURIComponent(value)
        });
        return result;
    }
}
// tslint:disable-next-line
export default Cookie;
