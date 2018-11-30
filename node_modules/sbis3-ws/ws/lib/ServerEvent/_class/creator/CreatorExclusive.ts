/// <amd-module name="Lib/ServerEvent/_class/creator/CreatorExclusive" />
import {SEB} from "../../interfaces";
import detection = require('Core/detection');
import { ConnectOptions } from "Lib/ServerEvent/_class/ConnectOptions";
import { TransportConnect } from "Lib/ServerEvent/_class/creator/TransportConnect";

export class CreatorExclusive implements SEB.ITransportCreator {

    constructor(
        private connectOptions: ConnectOptions,
        private transportConnect = new TransportConnect()) {
    }

    isAvailableInEnv(isExclusive: boolean) {
        return isExclusive || this.connectOptions.isDesktop() || detection.isMobileIOS;
    }

    build(hash) {
        return new Promise<SEB.ITransportConstructor>((resolve, reject) => {
            require(['Lib/ServerEvent/_class/transport/LocalPageTransport'], ({ LocalPageTransport }) => {
                resolve(LocalPageTransport);
            });
        }).then((LocalPageTransport) => {
            return this.createTransport(LocalPageTransport, hash);
        });
    }

    private createTransport(ctor: SEB.ITransportConstructor, hash): Promise<SEB.ITrackedTransport> {
        return this.transportConnect.connect(this.connectOptions, false).then((connect: Stomp.Client) => {
            return new ctor(
                connect, hash,
                false,
                this.connectOptions.exchange
            );
        });
    }
}
