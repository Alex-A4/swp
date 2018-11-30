/**
 * Относительные пути, потому что ws может лежать в поддиректории
 */
importScripts("./define.worker.js", "./event-bus.worker.js");
self["onconnect"] = (event) => {
    var port = event.ports[0];
    port.onmessage = self["messageHandler"];
};
