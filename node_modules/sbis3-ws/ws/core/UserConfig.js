define('Core/UserConfig', [
    'Core/UserConfigOld',
    'Core/_ConfigMapper',
    'Core/constants',
    'optional!ParametersWebAPI/Scope'
], function (userConfig, ConfigMapper, _const, Scope) {
    var Loader;
    if (Scope && Scope.USER) {
        Loader = Scope.USER;
    }
    
    return ConfigMapper(userConfig, Loader, !_const.userConfigSupport);
});