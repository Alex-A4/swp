define("Transport/RPC/fallback", ["require", "exports", "Core/Deferred"], function (require, exports, Deferred) {
    "use strict";
    var FALLBACK_EVENT_NAME = 'system.bl_async_replies';
    var getEventListener = function (context) {
        return function (event, rawData) {
            if (!rawData) {
                return;
            }
            var data;
            if (typeof rawData === 'string') {
                data = JSON.parse(rawData);
            }
            if (data && data.guid === context.guid) {
                clearTimeout(context.timeout);
                context.deferred.callback(data.data);
            }
        };
    };
    /**
     * @cfg {Transport/ITransport} transport Транспорт, по которому будет осуществлён запрос
     */
    /**
     * @cfg {String} data Тело запроса в виде строки.
     */
    /**
     * @cfg {Object} headers Объект с необходимыми заголовками.
     */
    /**
     * @cfg {Number} timeout Время ожидания ответа.
     * Значение устанавливается в мс.
     * При превышении этого времени в качестве результата возвращается errback с сообщение "Timeout".
     */
    /**
     * Отправляет запрос на бизнес-логику без гарантии доставки, ожидающий ответ от сервиса в виде серверного-события
     * Подробнее о назначении вы можете прочитать в разделе
     * {@link http://wi.sbis.ru/doc/platform/developmentapl/cooperationservice/subscription-to-events-in-the-cloud/#fallback}
     * @name Transport/RPC/fallback
     * @private
     * @author Заляев А.В
     */
    var fallback = function (_a) {
        var data = _a.data, headers = _a.headers, transport = _a.transport, timeout = _a.timeout;
        var deferred = new Deferred();
        require(['Lib/ServerEvent/Bus'], function (ServerEventBus) {
            var getChannel = function () { return ServerEventBus.serverChannel(FALLBACK_EVENT_NAME); };
            getChannel().once('onReady', function () {
                var ctx = {
                    deferred: deferred,
                    guid: headers['X-UNIQ-ID']
                };
                var eventListener = getEventListener(ctx);
                ctx.timeout = setTimeout(function () {
                    getChannel().unsubscribe('onMessage', eventListener);
                    deferred.errback('Timeout');
                }, timeout);
                getChannel().subscribe('onMessage', eventListener);
                transport.execute(data, headers);
            });
        }, function (error) {
            deferred.errback(error);
        });
        return deferred;
    };
    return fallback;
});
