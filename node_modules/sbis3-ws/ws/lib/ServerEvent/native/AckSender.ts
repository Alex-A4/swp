/// <amd-module name="Lib/ServerEvent/native/AckSender" />
/// <reference path="../resources/stomp.d.ts" />

export interface IAckSender {
    push(mes: Stomp.Message);
    start();
    stop();
}

class FakeAckSender implements IAckSender {
    push(mes: Stomp.Message) {
    }

    start() {
    }

    stop() {
    }
}

/**
 * Класс который отправляет подтверждение о доставке событий.
 * Подтвержать нужно либо каждые 2 секунды, либо по приходу LIMIT_ACK сообщений по stomp.
 * Если не подтверждать LIMIT_ACK сообщений, то при большом количестве сообщений,
 *  мы будем подтверждать меньшее количество событий, чем будет копиться в очереди.
 *  И в итоге сообщения будут затираться.
 */
export class AckSender implements IAckSender  {
    static LIMIT_ACK = 9;
    static INTERVAL = 2 * 1000;
    private last: Stomp.Message;
    private timer;
    private queueLen: number = 0;

    private constructor() {
        this.send = this.send.bind(this);
    }

    private send() {
        if (!this.last) {
            return;
        }
        this.last.ack();
        this.last = undefined;
        this.queueLen = 0;
    }

    push(mes: Stomp.Message) {
        this.last = mes;
        this.queueLen = this.queueLen + 1;
        if (this.queueLen >= AckSender.LIMIT_ACK) {
            setTimeout(this.send, 0);
        }
    }

    start() {
        this.timer = setInterval(this.send, AckSender.INTERVAL);
    }

    stop() {
        clearInterval(this.timer);
    }

    /**
     * Что бы не использовать везде условные операторы, 
     *  создаем пустышку, для того что бы вызывать их всегда.
     * @param {boolean} isAck какой способ работы Ack должен быть
     */
    static createAckSender(isAck: boolean) {
        if (!isAck) {
            return new FakeAckSender();
        }
        return new AckSender();
    }
}