/// <amd-module name="Lib/ServerEvent/_class/creator/CreatorSockJs" />
import { ConnectOptions } from "Lib/ServerEvent/_class/ConnectOptions";
import { CreatorWebSocket } from "Lib/ServerEvent/_class/creator/CreatorWebSocket";
import { TransportConnect } from "Lib/ServerEvent/_class/creator/TransportConnect";

export class CreatorSockJs extends CreatorWebSocket {
    constructor(connectOptions: ConnectOptions) {
        const USE_SOCK_JS = true;
        super(connectOptions, new TransportConnect(USE_SOCK_JS));
    }
}
