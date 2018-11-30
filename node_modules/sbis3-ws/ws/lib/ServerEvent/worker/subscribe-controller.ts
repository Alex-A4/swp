/// <amd-module name="Lib/ServerEvent/worker/subscribe-controller" />
import { Subscribe } from "Lib/ServerEvent/worker/subscribe";
import { HashedCounter } from "Lib/ServerEvent/native/HashedCounter";

export class PortHasher {
    private ports: Map<MessagePort, string> = new Map<MessagePort, string>();

    getHash(port: MessagePort): string {
        let hash = this.ports.get(port);
        if (!hash) {
            hash = Math.random().toFixed(10).substr(2);
            this.ports.set(port, hash);
        }

        return hash;
    }
}

/**
 * Класс по хранению подписок в разрезе портов(страниц)
 * @class Lib/ServerEvent/worker/SubscribeController
 */
export class SubscribeController {
    private portHasher = new PortHasher();
    private common: HashedCounter<Subscribe> = new HashedCounter(false);
    private channeled: HashedCounter<Subscribe> = new HashedCounter();

    /**
     * Храним все порты соединений в одном экземпляре
     * @type {Array}
     */
    public ports: MessagePort[] = [];

    register(eventName: string, port: MessagePort): void {
        let subscribe = new Subscribe(eventName, port, this.portHasher.getHash(port));
        this.common.add(subscribe);

        if (this.ports.indexOf(port) == -1) {
            this.ports.push(port);
        }
    }

    registerChanneled(eventName: string, port: MessagePort, person: string): void {
        let subscribe = new Subscribe(eventName, port, this.portHasher.getHash(port), true, person);
        this.channeled.add(subscribe);

        if (this.ports.indexOf(port) == -1) {
            this.ports.push(port);
        }
    }

    unregisterChanneled(eventName: string, port: MessagePort, person: string): void {
        let subscribe = new Subscribe(eventName, port, this.portHasher.getHash(port), true, person);
        this.channeled.remove(subscribe);
    }

    get(eventName: string): Subscribe[] {
        return this.common.getByName(eventName).concat(this.channeled.getByName(eventName));
    }

    getPorts(): MessagePort[] {
        return this.ports;
    }

    hasChanneled(eventName: string, person: string): boolean {
        let subscribes = this.channeled.getByName(eventName);
        for (let sub of subscribes) {
            if (sub.person === person) {
                return true;
            }
        }
        return false;
    }

    removePort(port: MessagePort) {
        let pos = this.ports.indexOf(port);
        if (pos === -1) {
            return;
        }

        this.removeByPort(port, this.common);
        this.removeByPort(port, this.channeled);
        this.ports.splice(pos, 1);
    }

    private removeByPort(port: MessagePort, cont: HashedCounter<Subscribe>) {
        let subs = cont.getSubscribes().filter((item: Subscribe) => {
            return item.port === port;
        });
        for (let item of subs) {
            let count = cont.getCount(item);
            for (let i=0; i<count; i++) {
                cont.remove(item);
            }
        }
    }

    /**
     * Очищаем и возвращаем очищенные подписки
     * @return {Subscribe[]}
     */
    clear(): Subscribe[] {
        let result = [];
        this.channeled.getSubscribes().forEach((item) => {
           for(let i=0; i<this.common.getCount(item); i++) {
               result.push(item);
           }
        });

        /* В this.common всегда одна копия */
        result = this.common.getSubscribes().concat(result);

        this.common = new HashedCounter(false);
        this.channeled = new HashedCounter();
        this.ports = [];

        return result;
    }
}