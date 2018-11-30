/// <amd-module name="Lib/Tab/Transport/Fake" />
import EventBusChannel = require("Core/EventBusChannel");
import {Transport} from '../Transport';

export class FakeTransport implements Transport {
    constructor(channel: EventBusChannel) {
    
    }
    notify(message: string, data: any) {}
    destroy() {}
}
