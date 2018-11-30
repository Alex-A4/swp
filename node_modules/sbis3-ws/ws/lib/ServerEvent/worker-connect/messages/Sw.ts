/// <amd-module name="Lib/ServerEvent/worker-connect/messages/Sw" />

declare class SwMessage {
    public type: "connect" | "error" | "message" | "close" | "ready" | "handshake" | 'websocket.close'
    public message: any;
    public headers: any;
    public command: any;
}

export = SwMessage;