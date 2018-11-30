/// <amd-module name="Lib/ServerEvent/_class/creator/CreatorExclusiveSockJs" />
import { ConnectOptions } from "Lib/ServerEvent/_class/ConnectOptions";
import { CreatorExclusive } from "Lib/ServerEvent/_class/creator/CreatorExclusive";
import { TransportConnect } from "Lib/ServerEvent/_class/creator/TransportConnect";

export class CreatorExclusiveSockJs extends CreatorExclusive {
    constructor(connectOptions: ConnectOptions) {
        const USE_SOCK_JS = true;
        super(connectOptions, new TransportConnect(USE_SOCK_JS));
    }
}
