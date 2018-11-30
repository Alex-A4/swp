define('Transport/XHRTransport', [
   'Transport/ITransport',
   'Core/Deferred',
   'Core/EventBus',
   'Core/UserInfo',
   'Core/constants',
   'Transport/Errors',
   'Core/IoC',
   'Core/detection',
   'Transport/ajax-emulator'
], function(ITransport, Deferred, EventBus, UserInfo, _const, Errors, IoC, detection, ajax) {
   var XHRTransport,
      TRANSPORT_CHANNEL = EventBus.channel('Transport'),
      ERROR_CHANNEL = EventBus.channel('errors');

   function handleOfflineError(error, data) {
      if (XHRTransport.isOfflineError(error)) {
         var methodInfo;
          /* TODO
          * нехорошо, когда транспорт общего назначения знает о внутреней структуре отправляеммых пакетов
          * обернул пока в try/catch, дальше надо исправить
           */
         try{
             methodInfo = JSON.parse(data).method.split('.');
             methodInfo.push(error);
         } catch (err) {
             methodInfo = [data, error];
         }
         return !!XHRTransport.notifyOfflineError(methodInfo);
      }
   }

   /**
    * @cfg {Boolean} Указывает на перезагрузку страницы
    * По умолчанию false.
    */
   var isUnloadProcess = false;
   if (typeof window !== 'undefined') {
      if (detection.firefox) {
         window.addEventListener('beforeunload', function () {
            isUnloadProcess = true;
            setTimeout(function () {
               isUnloadProcess = false;
            }, 600);
         });
      } else {
         window.addEventListener('unload', function () {
            isUnloadProcess = true;
         });
      }
   }
   /**
    * Асинхронный XHR Transport через Deferred
    * @class Transport/XHRTransport
    * @extends Transport/ITransport
    * @public
    * @author Бегунов А.В.
    */
   XHRTransport = ITransport.extend(/** @lends Transport/XHRTransport.prototype */{
      $protected: {
         _options: {
            /**
             * @cfg {String} Метод запроса. POST или GET.
             * По умолчанию = GET.
             */
            method: 'GET',
            /**
             * @cfg {'text' |'json'} Тип данных, ожидаемый от сервера.
             * По умолчанию 'text'.
             */
            dataType: 'text',
            /**
             * @cfg {String} contentType Тип данных при отсылке данных на сервер.
             * По умолчанию application/x-www-form-urlencoded.
             */
            contentType: 'application/x-www-form-urlencoded',
            /**
             * @cfg {String} url URL, по которому отправляется запрос.
             */
            url: '',
            /**
             * @cfg {Boolean} Использование асинхронных запросов
             */
            async: true
         },
         _xhr: undefined // Последний запрос
      },
      $constructor: function() {
         if (this._options.url === '') {
            throw new Error("Request with no URL is ambiguous");
         }
      },
      /**
       * @param {String} data Данные для отправки
       * @param {Object} [headers] Заголовки
       * @return {Core/Deferred}
       */
      execute: function(data, headers) {
         var dResult = new Deferred({
               cancelCallback: this.abort.bind(this)
            }),
            self = this;

         /**
          * Проверка куки, если изменилась - кидаем ошибку авторизации
          */
         if (_const.checkSessionCookie && !UserInfo.isValid()) {
            dResult.errback(Errors.ERROR_TEXT[401]);
            ERROR_CHANNEL.notify('onAuthError');
            return dResult;
         }
         var url = this._options.url;
         try {
            this._xhr = ajax({
               type: this._options.method,
               dataType: this._options.dataType,
               contentType: this._options.contentType,
               url: url,
               headers: headers || {},
               data: data,
               async: this._options.async,
                /**
                 * TODO: Вынести обработчики запроса из метода.
                 * 1) Не читабельно
                 * 2) Лишняя работа на оптимизатор браузера
                 * 3) Услажнён дебаг с правками из браузера из-за оптимизатора
                 */
               beforeSend: function(xhr, settings) {
                  return TRANSPORT_CHANNEL.notify('onBeforeSend', xhr, settings);
               },

               success: function(result, statusText, xhr) {
                  if (handleOfflineError(result.error, data)) {
                     dResult.errback(new Errors.Connection(url));
                     return;
                  }

                  var resultDfr = Deferred.success(result);

                  TRANSPORT_CHANNEL.notify('onResponseSuccess', xhr, resultDfr, self._options.url);
                  dResult.dependOn(resultDfr);
                  return result;
               },
               error: function(xhr, textStatus) {
                  if (xhr.responseJSON && handleOfflineError(xhr.responseJSON.error, data)) {
                     dResult.errback(new Errors.Connection(url));
                     return;
                  }
                  if (textStatus === 'abort') {
                     dResult.cancel();
                     return;
                  }

                  var status = xhr.status;
                  var textError = Errors.ERROR_TEXT[status] ||
                      Errors.ERROR_TEXT[textStatus] ||
                      Errors.ERROR_TEXT.unknown || "";

                  if ((status === 0) && (xhr.getAllResponseHeaders() === "")) {
                     var site = (self._options.url.charAt(0) === '/') ?
                         window.location.hostname :
                         self._options.url;
                     textError = Errors.ERROR_TEXT.lossOfConnection + " " + site;
                  }

                  var error = new Errors.HTTP(textError, status, self._options.url, xhr.responseText);

                  // Извещаем о HTTP-ошибке
                  ERROR_CHANNEL.notify('onHTTPError', error);

                  // обрабатываем ситуацию истекшей сессии
                  if (status == "401") {
                     if (ERROR_CHANNEL.notify('onAuthError') === true) {
                        return;
                     }
                  }

                  //Здесь ошибку точно надо отдавать в dResult
                  var resultDfr = new Deferred();
                  TRANSPORT_CHANNEL.notify('onResponseError', self._xhr, resultDfr);

                  resultDfr.addCallback(function(result) {
                     dResult.callback(result);
                  }).addErrback(function(error) {
                     dResult.errback(error);
                  });

                  /**
                   *  На слабых компьютерах события обрыва запроса вызывает
                   *  негативные эффекты (отображение окошек потери связи), при переходе на новую ссылку или обновления страницы.
                   *  Поэтому подавляем ошибки.
                   */
                  if(isUnloadProcess){
                     resultDfr.cancel();
                  } else {
                     resultDfr.errback(error);
                  }
               }
            });
         } catch (e) {
            dResult.errback("JavaScript exception while trying to execute request: " + e.message);
         }

         return dResult;
      },

      /**
       * Заменяет url
       * @param {String} url
       */
      setUrl: function(url) {
         if (typeof url == 'string') {
            this._options.url = url;
         }
      },

      /**
       * Прерывает загрузку
       */
      abort: function() {
         if (this._xhr) {
            this._xhr.abort();
         }
      }
   });
    /**
     * ERRORS_TEXT
     * @static
     */
   XHRTransport.ERRORS_TEXT = Errors.ERROR_TEXT;
    /**
     * isOfflineError
     * @static
     * @param {Error | HTTPError} error
     * @return {Boolean}
     */
   XHRTransport.isOfflineError = function (error) {
      var code;
      code = error && (
          error.data && error.data.error_code ||
          error.httpError ||
          error.code
       );
       return (code == 300 || code == 405);
   };
    /**
     * notifyOfflineError
     * @static
     * @param {Array<*>} args
     * @return {*}
     */
   XHRTransport.notifyOfflineError = function (args) {
       var globalCanel, notifyArgs, result;
       globalCanel = EventBus.globalChannel();
       notifyArgs = ["onOfflineModeError"].concat(args);
       result = globalCanel.notify.apply(globalCanel, notifyArgs);
       if (result) {
           IoC.resolve('ILogger').info('XHRTransport', 'Работа в offline-режиме');
       }
       return result;
   };
    /**
     * Возвращает URL сервиса по имени
     * @param {String} serviceName имя сервиса (как указано на 4 шаге мастера выгрузки).
     * @returns {String} URL сервиса.
     */
   XHRTransport.getServiceByName =  function(serviceName) {
       return _const.services[serviceName] || _const.defaultServiceUrl;
   };


   if (!IoC.has('ITransport')) {
      IoC.bind('ITransport', XHRTransport);
   }

   return XHRTransport;
});
