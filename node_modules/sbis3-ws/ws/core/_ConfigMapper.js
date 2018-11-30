define('Core/_ConfigMapper', [
   'Core/_ConfigMock', 
   'Core/constants'
], function (ConfigMock, _const) {

   /**
    * На сервисе представлений хост не постоянен. 
    */
   function getHost() {
      var hostname;
      if (window && window.location) {
            hostname = window.location.hostname;
      }
      if (!hostname && process && process.domain && process.domain.req) {
            hostname = process.domain.req.hostname;
      }
      return hostname;
   }

   /**
    * Функция, которая создаёт обёртки для объектов конфигурации.
    * @param {Core/AbstractConfig}oldConfig старый объект для работы с параметрами 
    * @param {ParametersWebAPI/Loader | undefined} Loader Лоадер для работы с сервисом параметров 
    * @param {Boolean} useEmptyMock Использовать ли пустую заглушку
    */
   function ConfgiMapper(oldConfig, Loader, useEmptyMock) {
      // Предполагаем, что на сервисе представлений всегда доступен сервис парамтров
      if (_const.isBrowserPlatform && useEmptyMock) {
         return new ConfigMock.EmptyMock();
      }

      var ucDomainList = []; 
      if (void 0 !== Loader) {
         ucDomainList = [/online\.sbis\.ru$/]; 
      }

      var hostname = getHost();
      /**
      * Можем ли мы использовать ParametersWebAPI/Loader * @type {boolean} */
      var canConfigLoader = false; 
      for (var i = 0; i < ucDomainList.length && !canConfigLoader; i++) {
         if (ucDomainList[i].test(hostname)) {
            canConfigLoader = true;
         }
      }

      if (!canConfigLoader) {
         return oldConfig; 
      }

      return new ConfigMock.Mock(Loader); 
   }

   /**
    * Есть сервисы где не нужно получать список параметров, потому что там их точно нет
    * @link https://online.sbis.ru/opendoc.html?guid=72fa4dbd-20d9-48df-87fb-a4d6df173820 
    */
   ConfgiMapper.isPreloadParams = function () {
      if (!_const.userConfigSupport && !_const.globalConfigSupport) {
         return false; 
      }

      var serviceBlackList = ['/reg/', '/person/']; 
      var service; 
      if (window && window.location) {
         service = window.location.pathname; 
      }
      if (!service && process && process.domain && process.domain.req) {
         service = process.domain.req.pathname; 
      }

      if (!service) {
         return true; 
      }

      service = service.match("/.+?/"); 
      if (service === null) {
         return true; 
      }

      service = service[0]; 
      return serviceBlackList.indexOf(service) === -1; 
   }

   /**
    * Нельзя возвращать константные объекты. 
    * Сервис представления может отправлять запросы от разных пользователей.
    */
   return ConfgiMapper; 
}); 
