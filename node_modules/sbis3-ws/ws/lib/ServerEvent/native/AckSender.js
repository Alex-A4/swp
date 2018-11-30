/// <amd-module name="Lib/ServerEvent/native/AckSender" />
/// <reference path="../resources/stomp.d.ts" />
define("Lib/ServerEvent/native/AckSender", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FakeAckSender = /** @class */ (function () {
        function FakeAckSender() {
        }
        FakeAckSender.prototype.push = function (mes) {
        };
        FakeAckSender.prototype.start = function () {
        };
        FakeAckSender.prototype.stop = function () {
        };
        return FakeAckSender;
    }());
    /**
     * Класс который отправляет подтверждение о доставке событий.
     * Подтвержать нужно либо каждые 2 секунды, либо по приходу LIMIT_ACK сообщений по stomp.
     * Если не подтверждать LIMIT_ACK сообщений, то при большом количестве сообщений,
     *  мы будем подтверждать меньшее количество событий, чем будет копиться в очереди.
     *  И в итоге сообщения будут затираться.
     */
    var AckSender = /** @class */ (function () {
        function AckSender() {
            this.queueLen = 0;
            this.send = this.send.bind(this);
        }
        AckSender.prototype.send = function () {
            if (!this.last) {
                return;
            }
            this.last.ack();
            this.last = undefined;
            this.queueLen = 0;
        };
        AckSender.prototype.push = function (mes) {
            this.last = mes;
            this.queueLen = this.queueLen + 1;
            if (this.queueLen >= AckSender.LIMIT_ACK) {
                setTimeout(this.send, 0);
            }
        };
        AckSender.prototype.start = function () {
            this.timer = setInterval(this.send, AckSender.INTERVAL);
        };
        AckSender.prototype.stop = function () {
            clearInterval(this.timer);
        };
        /**
         * Что бы не использовать везде условные операторы,
         *  создаем пустышку, для того что бы вызывать их всегда.
         * @param {boolean} isAck какой способ работы Ack должен быть
         */
        AckSender.createAckSender = function (isAck) {
            if (!isAck) {
                return new FakeAckSender();
            }
            return new AckSender();
        };
        AckSender.LIMIT_ACK = 9;
        AckSender.INTERVAL = 2 * 1000;
        return AckSender;
    }());
    exports.AckSender = AckSender;
});
