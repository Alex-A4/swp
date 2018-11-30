define('Core/ClientsGlobalConfig', [
   'Core/ClientsGlobalConfigOld',
   'Core/_ConfigMapper',
   'Core/constants',
   'optional!ParametersWebAPI/Scope'
], function (clientsGlobalConfig, ConfigMapper, _const, Scope) {
   var Loader;
   if (Scope && Scope.ACCOUNT) {
      Loader = Scope.ACCOUNT;
   }
   
   return ConfigMapper(clientsGlobalConfig, Loader, !_const.globalConfigSupport);
});