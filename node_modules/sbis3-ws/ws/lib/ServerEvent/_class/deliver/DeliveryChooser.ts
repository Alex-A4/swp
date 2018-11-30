/// <amd-module name="Lib/ServerEvent/_class/deliver/DeliveryChooser" />
import Deferred = require('Core/Deferred');
import detection = require('Core/detection');
import { SEB } from "../../interfaces";
import { Notifier } from "Lib/ServerEvent/_class/Notifier";
import { Browser as BrowserDeliver } from "Lib/ServerEvent/_class/deliver/Browser";
import { Page as PageEventDeliver } from "Lib/ServerEvent/_class/deliver/Page";
import { Constructor as IdbCnstr } from "Lib/ServerEvent/_class/deliver/IndexedDB";

/**
 * Создаю один доставщик на страницу.
 * Как бы не менялись транспорты, канал остаётся один.
 * @type {Notifier}
 */
const notifier = new Notifier();
// const DEVELOPER_ID = 7404311; // ka.sannikov
// let isTestIndexedDB: boolean = false;

export class DeliveryChooser {
    constructor(private watcher: SEB.IWatchDog) {
        notifier.setWatcher(watcher);
    }

    choose(transport: SEB.ILazyTransport): Deferred<SEB.IEventDeliver> {
        if (transport.getLocalName() === 'WorkerTransport' || detection.isMobileIOS) {
            return Deferred.success(new PageEventDeliver(notifier));
        }

        let DeliverConstructor: SEB.IEventDeliverConstructor = PageEventDeliver;
        if (transport.getLocalName() !== 'LocalPageTransport') {
            DeliverConstructor = BrowserDeliver;
        }

        // if (isTestIndexedDB) {
        //     return this.tryLazyIndexedDb().addErrback(function (err) {
        //         return new DeliverConstructor(notifier);
        //     });
        // }

        let isIndexedDbDeliver = detection.isMobileAndroid;
        if (isIndexedDbDeliver
            && typeof Promise !== 'undefined'
            && typeof indexedDB !== 'undefined'
            && indexedDB !== null
        ) {
            return this.tryLazyIndexedDb().addErrback(function () {
                return new DeliverConstructor(notifier);
            });
        }

        return Deferred.success(new DeliverConstructor(notifier));
    }

    private tryLazyIndexedDb(): Deferred<SEB.IEventDeliver> {
        var def = new Deferred<SEB.IEventDeliver>();
        /**
         * IndexedDB не надежное. Может просто не ответить.
         */
        var timerIndexDBInit;
        require(['Lib/ServerEvent/_class/deliver/IndexedDB'], (mdl: { IndexedDB: IdbCnstr }) => {
            if (!mdl) {
                return def.errback();
            }
            try {
                timerIndexDBInit = setTimeout(() => {
                    def.errback('Timeout crete indexedDB');
                }, 3000);
                def.dependOn(mdl.IndexedDB.create(notifier));
            } catch (e) {
                def.errback(e)
            }
        })

        def.addCallback((r) => {
            clearTimeout(timerIndexDBInit);
            return r;
        });

        return def;
    }
}
