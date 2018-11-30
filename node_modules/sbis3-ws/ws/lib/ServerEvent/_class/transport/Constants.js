define("Lib/ServerEvent/_class/transport/Constants", ["require", "exports"], function (require, exports) {
    "use strict";
    /// <amd-module name="Lib/ServerEvent/_class/transport/Constants" />
    var CONST = {
        LS_PREFIX: 'SEB',
        CHECK_MIN_INTERVAL: 4000,
        RECONNECT_INTERVAL: 10000,
        KEY_ACTUAL_DATE: 'actual-date',
        KEY_TRY_CREATE_MAIN: 'reconnect-main-time',
        KEY_SUBSCRIBE: 'SEB.subscribe',
        KEY_UNSUBSCRIBE: 'SEB.unsubscribe',
        KEY_MAINREADY: 'SEB.iammain',
        KEY_NEW_PAGE: 'SEB.nwepage'
    };
    return CONST;
});
