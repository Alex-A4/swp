define("Lib/ServerEvent/_class/Constants", ["require", "exports"], function (require, exports) {
    "use strict";
    /// <amd-module name="Lib/ServerEvent/_class/Constants" />
    var CONST;
    (function (CONST) {
        var CHANNEL_SCOPE;
        (function (CHANNEL_SCOPE) {
            CHANNEL_SCOPE["GLOBAL"] = "global";
            CHANNEL_SCOPE["CLIENT"] = "client";
            CHANNEL_SCOPE["USER"] = "user";
        })(CHANNEL_SCOPE = CONST.CHANNEL_SCOPE || (CONST.CHANNEL_SCOPE = {}));
        CONST.DELIVERY_COMMON = 'common';
        CONST.DELIVERY_HOST = 'host';
        CONST.DELIVERY_EXCLUSIVE_PAGE = 'page';
        CONST.ERR_MSG_RABBIT_OFF = "Can't create RabbitMQ channel";
        CONST.ERR_MSG_EMPTY_SID = 'sid not found';
        CONST.ERR_MSG_HASH_401 = '!hash not found';
    })(CONST || (CONST = {}));
    return CONST;
});
