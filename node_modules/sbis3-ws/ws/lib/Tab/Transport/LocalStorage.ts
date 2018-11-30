/// <amd-module name="Lib/Tab/Transport/LocalStorage" />
import LocalStorage = require("Lib/Storage/LocalStorage");
import EventBusChannel = require("Core/EventBusChannel");
import detection = require("Core/detection");
import {Transport} from '../Transport';

const NAME = 'TabMessage';
let removeTimers = {};

export class LocalStorageTransport implements Transport {
    private storage: LocalStorage;
    constructor(private channel: EventBusChannel) {
        this.storage = new LocalStorage(NAME, undefined, false);
        this.storage.subscribe('onChange', (event, message, data) => {
            this.channel.notify(message, data);
        });
    }
    notify(message: string, data: any) {
        this.storage.setItem(message, data);
        if (!detection.isIE) {
            return this.storage.removeItem(message);
        }
        /**
         * Необходимо почистить хранилище за собой, однако в IE событие onStorage на больших строках не вызывается
         * поэтому внутри он записывает вспомогательное значение. чтобы вызвать фейкоое событие на всех вкладках
         * тут получается проблема, что есть делать set + remove на одной вкладке, вспомогательное событие на другой
         * может отработать позже remove и когда полезет за данными через get их уже не будет там,
         * что в итоге приведёт к двум событиям onremove на вкладках получателях.
         */
        if (removeTimers[message]) {
            clearTimeout(removeTimers[message]);
        }
        removeTimers[message] = setTimeout(() => {
            this.storage.removeItem(message);
        }, 500);
    }
    destroy() {
        this.storage.destroy();
    }
}
