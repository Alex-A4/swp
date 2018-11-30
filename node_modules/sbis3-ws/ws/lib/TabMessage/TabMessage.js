define("Lib/TabMessage/TabMessage", ["require", "exports", "Lib/Tab/Message", "Core/IoC"], function (require, exports, TabMessage, IoC) {
    "use strict";
    IoC.resolve('ILogger').log("Lib/TabMessage/TabMessage", 'module has been moved to "Lib/Tab/Message"');
    return TabMessage;
});
