define("Lib/ServerEvent/worker/subscribe-controller", ["require", "exports", "Lib/ServerEvent/worker/subscribe", "Lib/ServerEvent/native/HashedCounter"], function (require, exports, subscribe_1, HashedCounter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class PortHasher {
        constructor() {
            this.ports = new Map();
        }
        getHash(port) {
            let hash = this.ports.get(port);
            if (!hash) {
                hash = Math.random().toFixed(10).substr(2);
                this.ports.set(port, hash);
            }
            return hash;
        }
    }
    exports.PortHasher = PortHasher;
    /**
     * Класс по хранению подписок в разрезе портов(страниц)
     * @class Lib/ServerEvent/worker/SubscribeController
     */
    class SubscribeController {
        constructor() {
            this.portHasher = new PortHasher();
            this.common = new HashedCounter_1.HashedCounter(false);
            this.channeled = new HashedCounter_1.HashedCounter();
            /**
             * Храним все порты соединений в одном экземпляре
             * @type {Array}
             */
            this.ports = [];
        }
        register(eventName, port) {
            let subscribe = new subscribe_1.Subscribe(eventName, port, this.portHasher.getHash(port));
            this.common.add(subscribe);
            if (this.ports.indexOf(port) == -1) {
                this.ports.push(port);
            }
        }
        registerChanneled(eventName, port, person) {
            let subscribe = new subscribe_1.Subscribe(eventName, port, this.portHasher.getHash(port), true, person);
            this.channeled.add(subscribe);
            if (this.ports.indexOf(port) == -1) {
                this.ports.push(port);
            }
        }
        unregisterChanneled(eventName, port, person) {
            let subscribe = new subscribe_1.Subscribe(eventName, port, this.portHasher.getHash(port), true, person);
            this.channeled.remove(subscribe);
        }
        get(eventName) {
            return this.common.getByName(eventName).concat(this.channeled.getByName(eventName));
        }
        getPorts() {
            return this.ports;
        }
        hasChanneled(eventName, person) {
            let subscribes = this.channeled.getByName(eventName);
            for (let sub of subscribes) {
                if (sub.person === person) {
                    return true;
                }
            }
            return false;
        }
        removePort(port) {
            let pos = this.ports.indexOf(port);
            if (pos === -1) {
                return;
            }
            this.removeByPort(port, this.common);
            this.removeByPort(port, this.channeled);
            this.ports.splice(pos, 1);
        }
        removeByPort(port, cont) {
            let subs = cont.getSubscribes().filter((item) => {
                return item.port === port;
            });
            for (let item of subs) {
                let count = cont.getCount(item);
                for (let i = 0; i < count; i++) {
                    cont.remove(item);
                }
            }
        }
        /**
         * Очищаем и возвращаем очищенные подписки
         * @return {Subscribe[]}
         */
        clear() {
            let result = [];
            this.channeled.getSubscribes().forEach((item) => {
                for (let i = 0; i < this.common.getCount(item); i++) {
                    result.push(item);
                }
            });
            /* В this.common всегда одна копия */
            result = this.common.getSubscribes().concat(result);
            this.common = new HashedCounter_1.HashedCounter(false);
            this.channeled = new HashedCounter_1.HashedCounter();
            this.ports = [];
            return result;
        }
    }
    exports.SubscribeController = SubscribeController;
});
