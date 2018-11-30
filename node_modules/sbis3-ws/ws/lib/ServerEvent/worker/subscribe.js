define("Lib/ServerEvent/worker/subscribe", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Subscribe {
        constructor(eventName, port, portHash, isChanneled = false, person = '') {
            this.eventName = eventName;
            this.port = port;
            this.portHash = portHash;
            this.isChanneled = isChanneled;
            this.person = person;
        }
        getChannelName() {
            return this.eventName;
        }
        hash() {
            return `${this.eventName}::${this.isChanneled ? 'ch' : 'co'}::${this.portHash}::${this.person}`;
        }
    }
    exports.Subscribe = Subscribe;
});
