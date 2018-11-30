/// <amd-module name="Lib/ServerEvent/worker-connect/Constants" />

module WorkerConnectConstants {
    export enum SW_MESSAGES {
        CONNECT = 'connect',
        ERROR = 'error',
        READY = 'ready',
        MESSAGE = 'message',
        CLOSE = 'close',
        HANDSHAKE = 'handshake',
        WEBSOCKET_CLOSE = 'websocket.close'
    }
}

export = WorkerConnectConstants;