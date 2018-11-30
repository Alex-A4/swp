/// <amd-module name="Lib/ServerEvent/_class/deliver/IndexedDB" />
import Deferred = require('Core/Deferred');
import { Notifier } from 'Lib/ServerEvent/_class/Notifier';
import { SEB } from "../../interfaces";
import { Connector, Reader, Writer, AdapterEvent, IMessage } from 'Lib/ServerEvent/native/_IndexedDB';

const SECONDS_5 = 5000;
/**
 * Класс доставки событий через indexedDB.
 * Доставка на вкладку осуществляется через периодический опрос indexedDB.
 * При запросе на доставку, сообщение помещается в indexedDB.
 */
export class IndexedDB implements SEB.IEventDeliver {
    static INIT_TIMEOUT = 4000;
    private timer: number;
    private lastReaded: number;
    private readonly reader: Reader<IMessage>;
    private writer: Writer;

    private constructor(private notifier: Notifier, private connect: Connector) {
        this.lastReaded = Date.now() - IndexedDB.INIT_TIMEOUT;
        this.tick = this.tick.bind(this);
        this.timer = setInterval(this.tick, SECONDS_5);
        this.reader = this.connect.createReader<IMessage>();
    }

    deliver(channelName: string, eventName: string, rawData?: string) {
        if (!this.writer) {
            this.writer = this.connect.createWriter();
        }
        this.writer.write(channelName, eventName, rawData);
    }

    /**
     * Функция доставки событий до вкладки
     */
    private tick() {
        /*
            Из-за длительного запроса на мобильных браузерах,
            мы должны запомнить время запроса сразу, а не в результате ответа.
        */
        var last = this.lastReaded;
        this.lastReaded = Date.now();
        this.reader.query(last)
            .then((events: IMessage[]) => {
                for (let {channelName, eventName, body} of events) {
                    this.notifier.fire(channelName, eventName, body);
                }
            });
    }

    destroy() {
        this.destroy = () => {
        }
        this.connect = null;
        clearInterval(this.timer);
        if (this.writer) {
            this.writer.destructor();
        }
    }

    static create(notifier: Notifier): Deferred<IndexedDB> {
        return Connector.connect(
            Connector.DB_DELIVER,
            Connector.EVENTS_STORE_NAME,
            new AdapterEvent(2)
        ).addCallback<IndexedDB>((connect: Connector) => {
            return new IndexedDB(notifier, connect);
        });
    }
}

export interface Constructor {
    create(notifier: Notifier): Deferred<IndexedDB>;
}
