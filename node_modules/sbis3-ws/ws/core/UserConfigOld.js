define('Core/UserConfigOld', [
   'Core/AbstractConfigOld',
   'Core/Deferred',
   'Core/constants'
], function(AbstractConfig, Deferred, _const) {
   /**
    * Класс для взаимодействия с параметрами пользовательской конфигурации.
    * В качестве основного хранилища выступает бизнес-логика, т.е. в отличие от класса {@link Core/MicroSession}
    * пользовательские настройки сохраняются не только в рамках одной сессии, а для конкретного пользователя в базе данных.
    * Для работы с методами данного класса нужна авторизация.
    * Все операции отражаются на глобальном контексте.
    * Для использования в VDOM необходимо переходить на {@link ParametersWebAPI/Scope} и/или {@link ParametersWebAPI/Loader}
    *
    * @deprecated
    * @author Бегунов А.В.
    * @class Core/UserConfig
    * @extends Core/AbstractConfig
    * @public
    * @singleton
    * @remark
    * Класс не рекомендуется использовать в VDOM. Лучше использовать сервис параметров.
    */
   var UserConfig = AbstractConfig.extend(/** @lends Core/UserConfig.prototype */ {
      /**
       * Возвращает имя объекта, ответственного за хранение параметров
       * @return {String}
       * @protected
       * @override
       */
      _getObjectName: function() {
         return 'ПользовательскиеПараметры';
      },

      /**
       * Есть ли поддержка конфига на странице
       * @return {Boolean}
       * @override
       * @protected
       */
      _isConfigSupport: function() {
         return _const.isNodePlatform || _const.userConfigSupport;
      },

      /**
       * Возвращает список значений параметра
       * Список значений возвращается в виде массива строк
       * @param {String} key - Название параметра.
       * @param {String} ctx - Контекст параметра.
       * @return {Core/Deferred}
       */
      getParamValues: function(key, ctx) {
         return this._getParam('ПолучитьСписокЗначений', key, ctx).addCallback(function (res) {
            return res || [];
         });
      },

      /**
       * Вставляет новое значение параметра
       * @param {String} key Название параметра.
       * @param {String} value Значение параметра.
       * @param {Number} [maxCount] Максимальное количество значений параметра. По умолчанию 10.
       * @param {String} ctx - Контекст параметра.
       * @return {Core/Deferred<Boolean>}
       */
      setParamValue: function(key, value, maxCount, ctx) {
         var _value = this._processingParam('read', key);
         if (_value) {
            if (typeof _value == 'string') {
               _value = [_value];
            }
            if (_value.length >= (maxCount || 10)) {
               _value.pop();
            }
            _value.unshift(value);
         }

         this._processingParam('update', key, _value || [value]);
         if (!this._isConfigSupport()) {
            return new Deferred().callback(true);
         }
         var params = this._prepareParam(key, ctx);
         params['Значение'] = value;
         params['МаксимальноеКоличество'] = maxCount || 10;
         return this._callMethod('ДобавитьЗначение', params).addCallback(function (res) {
            return res && res.getScalar();
         });
      }
   });

   var userConfig = new UserConfig();

   return userConfig;
});