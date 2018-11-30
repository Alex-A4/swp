/// <amd-module name="Lib/Tab/Message" />
import EventBus = require('Core/EventBus');
import EventBusChannel = require('Core/EventBusChannel');
import constants = require('Core/constants');
import createGUID = require('Core/helpers/createGUID');
import {LocalStorageTransport} from 'Lib/Tab/Transport/LocalStorage';
import {BroadCastTransport} from 'Lib/Tab/Transport/BroadCast';
import {FakeTransport} from 'Lib/Tab/Transport/Fake';
import {Transport, TransportConstructor} from './Transport';

const CHANNEL_NAME = "TabMessage";

/**
 * Выбирает каким транспортом можем пользоваться
 * @return {TransportConstructor}
 */
let selectTransportConstructor = (): TransportConstructor => {
    if (!constants.isBrowserPlatform) {
        return FakeTransport;
    }
    if (typeof BroadcastChannel !== 'undefined') {
        return BroadCastTransport;
    }
    return LocalStorageTransport;
};
let CurrentTransportConstructor: TransportConstructor;
/**
 * Получение корректного конструктора транспорта с кешированием
 * @return {TransportConstructor}
 */
let getTransportConstructor = () => {
    if (!CurrentTransportConstructor) {
        CurrentTransportConstructor = selectTransportConstructor();
    }
    return CurrentTransportConstructor;
};

type Handler = (event, data: any) => void;

/**
 * Класс, позволяющий пересылать сообщения между вкладками
 *
 * <pre>
 *     // ...
 *     tabMessage = new TabMessage();
 *     // подписываемся на изменение статуса загрузки
 *     tabMessage.subscribe("upload-status", function (event, data){
 *          switch (data.get('status')) {
 *              case "start": {
 *                  log("start upload", data.get('file'));
 *                  break;
 *              }
 *              case "finish": {
 *                  log("start finish", data.get('file'), data.get('result'));
 *                  break;
 *              }
 *              case "progress": {
 *                  log("start progress", data.get('file'), );
 *                  break;
 *              }
 *          }
 *     });
 *     // ...
 *     // при старте загрузки с одной вкладки отправляем статус на другие вкладки
 *     self.getChildControlByName("uploadBtn").subscribe("onactivated", function (event){
 *          self.upload();
 *          var record = self.getUploadInfo();
 *          tabMessage.notify("upload-status", record);
 *     });
 * </pre>
 * Уведомление об открытом документе
 * <pre>
 *     // Пример кода, который выполняется при открытии документа
 *     require(["Lib/Tab/Message"], function (TabMessage) {
 *         var tabMessage = new TabMessage();
 *         var documentId = 245;
 *         var eventName = "document.open:%id".replace("%id", documentId);
 *         tabMessage.subscribe(eventName, function (event, data) {
 *             if (data.readOnly) {
 *                 return;
 *             }
 *             // Нашалогика. Решаем кто и как будет реагировать. Например, покажем пользователю открытый документ*
 *             console.warn("Документ уже открыт на другой вкладке.");
 *             alert("Вот открытый вами документ.");
 *         });
 *         tabMessage.notify(eventName, {readOnly: true})
 *     ;});
 * </pre>
 *
 * @class Lib/Tab/Message
 * @public
 * @author Заляев А.В.
 */
class TabMessage {
    private readonly _channel: EventBusChannel;
    private _transport: Transport;
    constructor() {
        this._channel = EventBus.channel(`${CHANNEL_NAME}-${createGUID()}`);
        let Transport = getTransportConstructor();
        this._transport = new Transport(this._channel);
    }
    /**
     * Разрушить экземпляр класса.
     * @method
     * @name Lib/Tab/Message#destroy
     */
    destroy() {
        this._transport.destroy();
        this._channel.unsubscribeAll();
        this._channel.destroy();
    }
    /**
     * Добавить обработчик на меж-оконное сообщение.
     * @method
     * @name Lib/Tab/Message#subscribe
     * @param {String} messageName Имя сообщения, на которое следует подписать обработчик.
     * @param {Function} handler Функция-делегат, обработчик сообщения.
     * @return {Lib/Tab/Message} Экземпляр класса.
     * @example
     * <pre>
     *     ...
     *     tabMessage.subscribe("best-button-click", function (e, messageData){
     *          log("my favorite button is click!");
     *     });
     * </pre>
     */
    subscribe(messageName: string, handler: Handler) {
        this._channel.subscribe(messageName, handler, this);
        return this;
    }
    /**
     * Выполнить обработчик меж-оконного сообщения единожды.
     * @method
     * @name Lib/Tab/Message#once
     * @param {String} messageName Имя сообщения, на которое следует подписать обработчик.
     * @param {Function} handler Функция-делегат, обработчик сообщения.
     * @return {Lib/Tab/Message} Экземпляр класса.
     */
    once(messageName: string, handler: Handler) {
        this._channel.once(messageName, handler, this);
        return this;
    }
    /**
     * Снять обработчик с указанного меж-оконного сообщения.
     * @method
     * @name Lib/Tab/Message#unsubscribe
     * @param {String} messageName Имя сообщения, на которое следует подписать обработчик.
     * @param {Function} handler Функция-делегат, обработчик сообщения.
     * @return {Lib/Tab/Message} Экземпляр класса.
     */
    unsubscribe(messageName: string, handler: Handler) {
        this._channel.unsubscribe(messageName, handler);
        return this;
    }
    // dispatchEvent
    /**
     * Отправить меж-оконное сообщение.
     * @method
     * @name Lib/Tab/Message#notify
     * @param {String} messageName Имя сообщения, на которое следует подписать обработчик.
     * @param {*} data Данные сообщения.
     * @example
     * <pre>
     *     ...
     *     bestButtonHeandler: function (event){
     *     ...
     *          tabMessage.notify("best-button-click", {
     *              date:       Date.now(),
     *              property:   "text"
     *          });
     *     }
     * </pre>
     */
    notify(messageName: string, data: any) {
        if (data == undefined) {
            data = "" + data;
        }
        this._transport.notify(messageName, data);
    }
}

export = TabMessage;

