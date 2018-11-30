/// <amd-module name="Router/ServerRouting" />
define('Router/ServerRouting', [
    'require',
    'exports',
    'Router/Helper'
], function (require, exports, Helper_1) {
    'use strict';
    function getAppName(request) {
        return Helper_1.default.getAppNameByUrl(request.path);
    }
    function renderApp(request, response, appName) {
        request.compatible = false;
        response.render('wml!Controls/Application/Route', { application: appName });
    }
    return {
        getAppName: getAppName,
        renderApp: renderApp
    };
});