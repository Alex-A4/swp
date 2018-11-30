/// <amd-module name="Lib/ServerEvent/_class/deliver/Browser" />
import TabMessage = require('Lib/Tab/Message');
import { SEB } from "../../interfaces";
import { Notifier } from 'Lib/ServerEvent/_class/Notifier';

export class Browser implements SEB.IEventDeliver {
    private static ON_MESSAGE = 'servereventbus_onmessage';
    private taber: TabMessage;

    constructor(private notifier: Notifier) {
        this.onmessageHandler = this.onmessageHandler.bind(this);
        this.taber = new TabMessage();
        this.taber.subscribe(Browser.ON_MESSAGE, this.onmessageHandler);
    }

    private onmessageHandler(event, data: { channelName: string, eventName: string, rawData: any }) {
        this.notifier.fire(data.channelName, data.eventName, data.rawData);
    }

    deliver(channelName: string, eventName: string, rawData?: string) {
        this.notifier.fire(channelName, eventName, rawData);
        this.taber.notify(Browser.ON_MESSAGE, {
            channelName,
            eventName,
            rawData
        });
    }

    destroy() {
        this.taber.unsubscribe(Browser.ON_MESSAGE, this.onmessageHandler)
    }
}
