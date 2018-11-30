/// <amd-module name="Lib/ServerEvent/_class/logger/ConfirmLogger" />
/**
 * TODO удалить метка #УдлБ
 * Логгер подтверждения доставки сообщений
 * @class Lib.ServerEventBus.class.logger.ConfirmLogger
 * @memberOf module:ServerEvent.class.logger
 */
export class ConfirmLogger {
    private data: Map<MessagePort, Object>;
    constructor() {
        this.data = new Map();
    }

    send(port: MessagePort, eventName: string) {
        let obj = this.data.get(port);
        obj = obj || {};
        if (!(eventName in obj)) {
            obj[eventName] = {'send': 0, 'confirm': 0};
        }
        obj[eventName]['send']++;
        this.data.set(port, obj);
    }

    confirm(port: MessagePort, eventName: string) {
        let obj = this.data.get(port);
        obj = obj || {};
        if (!(eventName in obj)) {
            obj[eventName] = {'send': 0, 'confirm': 0};
        }
        obj[eventName]['confirm']++;
        this.data.set(port, obj);
    }

    stat() {
        let stat = [];
        this.data.forEach((val) => {
            stat.push(val);
        });
        return stat;
    }
}