/// <amd-module name="Lib/ServerEvent/worker-connect/messages/Page" />

module Page {
    export type PortMessageCommands = 'connect' | 'subscribe' | 'subscribe.channel' |
        'unsubscribe' | 'unsubscribe.channel' | 'disconnect';

    export class PortMessage {
        constructor(public command: PortMessageCommands) {
        }
    }

    export class PmDisconnect extends PortMessage {
        constructor() {
            super('disconnect');
        }
    }

    export class PmConnect extends PortMessage {
        url: string;
        exchangeName: string;
        sid: string;
        hash: string;
        persist: boolean;
        ack: boolean;

        constructor(url: string, exchangeName: string, sid: string, hash: string, isPersist: boolean, isAck: boolean = false) {
            super('connect');
            this.url = url;
            this.exchangeName = exchangeName;
            this.sid = sid;
            this.hash = hash;
            this.persist = isPersist;
            this.ack = isAck;
        }
    }

    export class PmSubscribe extends PortMessage {
        eventName: string;

        constructor(eventName: string) {
            super('subscribe');
            this.eventName = eventName;
        }
    }

    export class PmSubChanneled extends PortMessage {
        eventName: string;
        person: string;

        constructor(eventName: string, person?: string) {
            super('subscribe.channel');
            this.eventName = eventName;
            this.person = person;
        }
    }

    export class PmUnsubscribe extends PortMessage {
        constructor(public eventName: string) {
            super('unsubscribe');
        }
    }

    export class PmUnsubChanneled extends PortMessage {
        constructor(public eventName: string, public person?: string) {
            super('unsubscribe.channel');
        }
    }
}

export = Page;