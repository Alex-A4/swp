define('Transport/RPCJSON', [
   'Core/core-extend',
   'Core/constants',
   'Core/IoC',
   'Transport/RPC/Body',
   'Transport/RPC/Headers',
   'Transport/RPC/request',
   'Transport/RPC/fallback',
   'Transport/RPC/ErrorCreator',
   'Transport/XHRTransport',
    /*
     * В плагине логгер не успевает подтянуться до лога в транспорте и падает IoC.resolve('ILogger')
     * чтобы такого не было добавляем ConsoleLogger в явные зависимости
     * Выпилить вместе с IoC, когда СП поддержит работу с консолью
     * https://online.sbis.ru/opendoc.html?guid=2bec12a1-0428-47d3-9ae3-01527cb46736
     */
    'Core/ConsoleLogger'
], function(
    coreExtend,
    constants,
    IoC,
    RPCBody,
    Headers,
    request,
    fallback,
    ErrorCreator
) {
   var logger = IoC.resolve('ILogger');
   function deprecatedLog(oldName, newName) {
       newName = newName? ', use "' + newName + '"': '';
       logger.log(
           'Transport/RPCJSON',
           'Method "' + oldName + '" is deprecated and will be removed' + newName
       );
   }
   function deprecatedWrapper(oldName, newName, method) {
       return function() {
           deprecatedLog(oldName, newName);
           return method.apply(this, arguments)
       }
   }

    /**
     * @typedef {Object} RPCPacket
     * @property {String} reqBody тело запроса в виде строки.
     * @property {Object} reqHeaders объект с необходимыми заголовками.
     * @property {String} reqUrl строка с параметрами для GET запроса.
     */
    /**
     * @typedef {Object} RequestParam Параметры запроса
     * @property {String} data Тело запроса
     * @property {Transport/RPC/Headers} headers Объект заголовков
     * @property {Transport/ITransport} transport Транспорт, через который будет осуществлён запрос
     * @property {Number} [timeout] Таймаут, после которого запрос будет оборван
     * @property {String} url Адрес сервиса
     * @property {String} method БЛ метод
     */

   function isGetMethod(method) {
      if ((typeof window === 'undefined') || !window.cachedMethods || !window.cachedMethods.length) {
          return false;
      }
      return  window.cachedMethods.indexOf(method) > -1;
   }
   function canUseGetMethod(url) {
       return url.length < 2 * 1024;
   }

   /**
    * Класс для вызова методов бизнес-логики, в том числе и с других сервисов.
    * @example
    * <pre>
    *    var rpcjson = new RPCJSON({
    *          serviceUrl: '/telephony/service/', // Обращение в сервис "Телефония"
    *          fallback: true, // Асинхронный вызов метода без гарантии доставки
    *          timeout: 120000 // Время ожидания ответа - 2 минуты
    *       }),
    *       res = rpcjson.callMethod('Phonebook.ReadNumber', { ... }); // Производим вызов метода БЛ
    *    res.addCallbacks( ... ); // Обработка результата
    * </pre>
    * @class Transport/RPCJSON
    * @author Бегунов А.В.
    * @public
    */
   var RPCJSON = coreExtend({}, /** @lends Transport/RPCJSON.prototype */ {
      $protected: {
         _transports: null,
         _options: {
            /**
             * @cfg {String} Устанавливает виртуальный адрес сервиса БЛ, на который будет произведён запрос.
             * @remark
             * Точка входа в другой сервис (указывается в свойствах приложения), и все методы будут вызваны с указанного сервиса.
             * Все точки входа, заданные в свойствах приложения, попадают в интерфейсном движке WS в массив — $ws._const.services.
             * Если значение не установлено, то будет произведено вызов с сервиса по умолчанию - "/service/".
             */
            serviceUrl: '',

            /**
             * @cfg {Boolean} Устанавливает признак асинхронного вызова метода без гарантии доставки.
             * @remark
             * Подробнее о назначении этого параметра вы можете прочитать в разделе <a href="http://wi.sbis.ru/doc/platform/developmentapl/cooperationservice/subscription-to-events-in-the-cloud/#fallback">Событийные операции с контрактом и fallback</a>.
             * Поведение вызова изменяется в зависимости от значения параметра: если fallback=false, то {@link timeout} не учитывается, и вызов метода {@link callMethod} будет подобен вызову класса {@link Deprecated/BLObject}.
             */
            fallback: false,

            /**
             * @cfg {Number} Устанавливает время ожидания ответа.
             * @remark
             * Значение устанавливается в мс. При превышении этого времени в качестве результата возвращается errback с сообщение "Timeout".
             * Опция актуальна только при использовании совместно с опцией {@link fallback} в значении true.
             */
            timeout: 60000,

             /**
              * @cfg {Boolean} Устанавливать ли заголовок X-ASYNCINVOKE,
              * который отвечает за автоматическое закрытие соединение сервером,
              * не дожидаясь обработки выполнения метода бизнес логики
              */
            asyncInvoke: false,

             /**
              * @cfg {Boolean} Использование асинхронных запросов
              */
            async: true
         }
      },
      $constructor: function() {
         this._transports = {};
      },
       /**
        * Производит вызов метода БЛ.
        * @remark
        * Вызов может производиться в двух режимах, которые устанавливают опцией {@link fallback}.
        * @param {String} method Имя вызываемого метода БЛ. Значение устанавливается в формате "ИмяОбъекта.ИмяМетода".
        * @param {Array|Object} args Аргументы вызова метода. Аргументы платформенных типов методов описаны в разделе <a href="https://wi.sbis.ru/doc/platform/developmentapl/workdata/logicworkapl/objects/blmethods/">Типы методов бизнес-логики</a>.
        * Передаются без изменений со следующими исключениями:
        * <ul>
        *    <li>Deprecated/Record, Deprecated/RecordSet - сериализуется по формату обмена;</li>
        *    <li>Date - сериализуется в строку через Date.toSQL(null).</li>
        * </ul>
        * @param {Boolean} recent Признак, по которому чтение данных будет произведено из master-базы.
        * @returns {Core/Deferred} При использовании опции {@link timeout} в ответ может прийти errback с сообщением "Timeout", если время ожидания ответа превысило допустимое значение.
        * @see abort
        */
       callMethod: function(method, args, recent) {
           var requestParams = this.__getRequestParam(method, args, recent);
           this._transports.current = requestParams.transport; // Необходимо чтобы не сломать abort последнего запроса

           var callFunction = this._options.fallback?
               fallback:
               request;

           return callFunction(requestParams).addErrback(function (error) {
               if (!error.details){
                   var code = error.httpError || 0;
                   error.details = code > 500? rk('Попробуйте заглянуть сюда через 15 минут'): '';
               }
               return error;
           });
       },
       /**
        * Прерывает последний запрос.
        * @see callMethod
        * @void
        */
       abort: function() {
           logger.log(
               'Transport/RPCJSON',
               'Метод "abort" обрывает только последний созданный запрос. Если вам необходима эта логика используйде Core/Deferred#cancel'
           );
           this._transports.current && this._transports.current.abort();
       },
       /// region private
       /**
        * Подготавливает данные для запроса
        * @param {String} method Имя вызываемого метода БЛ. Значение устанавливается в формате "ИмяОбъекта.ИмяМетода".
        * @param {Array|Object} args Аргументы вызова метода.
        * @param {Boolean} recent Признак, по которому чтение данных будет произведено из master-базы.
        * @return {RequestParam}
        * @private
        */
       __getRequestParam: function(method, args, recent) {
           var dataUrl = "";
           var isGet = false;
           var httpMethod = "POST";
           var transport;
           if (isGetMethod(method)) {
               dataUrl = RPCBody.getURL(method, args);
           }
           if (dataUrl && canUseGetMethod(dataUrl)) {
               httpMethod = 'GET';
               transport = this.__getTransport(httpMethod);
               transport.setUrl(this.__getServiceAddress(dataUrl));
               isGet = true;
           }
           return {
              method: method,
              timeout: this._options.timeout,
              headers: new Headers({
                 method: method,
                 httpMethod: httpMethod,
                 fallback: this._options.fallback,
                 asyncInvoke: this._options.asyncInvoke,
                 recent: recent
              }),
              transport: transport || this.__getTransport(),
              data: isGet? '': RPCBody.getBody(method, args),
              url: this.__getServiceAddress()
           };
       },

       /**
        * Возвращает экземпляр ITransport
        * @param {"GET" | "POST"} [method]
        * @return {ITransport}
        * @private
        * TODO выпилить, когда СП внедрит поддержку XMLHttpRequest и от ITransport перейдём на XHRTransport,
        * а тот будет получать метод в параметре запроса
        */
       __getTransport: function(method) {
           method = method || "POST";
           if (!this._transports[method]) {
               this._transports[method] = this.__createTransport(method);
           }
           return this._transports[method];
       },
       /**
        * Создаёт экземпляр ITransport
        * @param {"GET" | "POST"} method
        * @return {ITransport}
        * @private
        */
       __createTransport: function(method) {
           return IoC.resolve('ITransport', {
               url: this.__getServiceAddress(),
               method: method,
               dataType: 'json',
               contentType: 'application/json; charset=utf-8',
               async: this._options.async
           });
       },
       /**
        * @param {String} [params]
        * @return {String}
        * @private
        */
       __getServiceAddress: function(params) {
           var service = this._options.serviceUrl || constants.defaultServiceUrl;
           service += service.indexOf("?") > -1? '&' : '?';

           var xVersion =  'x_version=' + constants.buildnumber;
           var url = service + xVersion;
           if (params) {
               url += params.replace(/^\?/, '&');
           }
           return url;
       },
       /// endregion private
      /// region deprecated private
       /**
        * @param {RPCPacket} req
        * @param {String} httpMethod
        * @param {Boolean} recent
        * @private
        * @deprecated
        */
       _setHeaders: function(req, httpMethod, recent) {
           deprecatedLog('_setHeaders', 'Transport/RPC/Headers');
           Object.assign (req.reqHeaders, new Headers({
               recent: recent,
               httpMethod: httpMethod,
               fallback: this._options.fallback,
               asyncInvoke: this._options.asyncInvoke
           }));
       },
       /**
        * @deprecated
        */
       _fallbackResponse: function(dResult, guid, event, data) {
           deprecatedLog('_fallbackResponse');
       }
      /// endregion deprecated private
   });

   /// region deprecated static
    /**
     * Подготавливает пакет для отправки запроса JSON RPC.
     * @param {String} method Название метода.
     * @param {Object} params Параметры метода.
     * @param {String|Number} [id=1] Идентификатор.
     * @returns {RPCPacket}
     * @name Transport/RPCJSON#jsonRpcPreparePacket
     * @static
     */
   RPCJSON.jsonRpcPreparePacket = function (method, params, id) {
       deprecatedLog('jsonRpcPreparePacket', 'Transport/RPC/Body" or "Transport/RPC/Headers');
       return {
           reqUrl: RPCBody.getURL(method, params, id),
           reqBody: RPCBody.getBody(method, params, id),
           reqHeaders: Headers.getForMethod(method)
       }
   };
    /**
     * @return {{error: {message: string, code: string, details: string}}}
     * @static
     * @deprecated
     */
   RPCJSON.getEmptyRpcResponse = deprecatedWrapper(
       "getEmptyRpcResponse",
       "Transport/RPC/Body#getEmptyResponse",
       RPCBody.getEmptyResponse
   );
    /**
     * @param {Error} error
     * @param {String} method Имя вызываемого метода БЛ.
     * @return {Transport/TransportError | Error}
     * @static
     * @deprecated
     */
   RPCJSON.handleHTTPError = deprecatedWrapper(
       "handleHTTPError",
       "Transport/RPC/ErrorNotifier#HTTP",
       ErrorCreator.fromHTTP
   );
    /**
     * @param {Error | Object} error
     * @param {String} method Имя вызываемого метода БЛ.
     * @param {String} [url]
     * @return {Transport/TransportError}
     * @static
     * @deprecated
     */
   RPCJSON.handleRPCError = deprecatedWrapper(
       "handleRPCError",
       "Transport/RPC/ErrorNotifier#RPC",
       ErrorCreator.fromRPC
   );

    /// endregion deprecated static

   return RPCJSON;
});
