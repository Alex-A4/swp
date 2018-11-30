/// <amd-module name="Lib/ServerEvent/worker/subscribe" />
import {SEB} from "../interfaces";

export class Subscribe implements SEB.IHashedSub {
    constructor(public eventName: string,
                public port: MessagePort,
                private portHash: string,
                public isChanneled: boolean = false,
                public person: string = '') {
    }

    getChannelName() {
        return this.eventName;
    }

    hash() {
        return `${this.eventName}::${this.isChanneled ? 'ch' : 'co'}::${this.portHash}::${this.person}`;
    }
}