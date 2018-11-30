/// <amd-module name="Lib/TabMessage/TabMessage" />
import TabMessage = require("Lib/Tab/Message");
import IoC = require("Core/IoC");

IoC.resolve('ILogger').log("Lib/TabMessage/TabMessage", 'module has been moved to "Lib/Tab/Message"');

export = TabMessage;

