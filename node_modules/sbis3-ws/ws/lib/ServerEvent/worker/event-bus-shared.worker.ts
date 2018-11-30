/**
 * Относительные пути, потому что ws может лежать в поддиректории
 */
importScripts(
    "./define.worker.js",
    "./event-bus.worker.js"
);

type Port = {
    onmessage(event): void;
};
interface ConnectEvent extends Event {
    ports: Port[]
}
self["onconnect"] = (event: ConnectEvent) => {
    var port = event.ports[0];
    port.onmessage = self["messageHandler"];
};
