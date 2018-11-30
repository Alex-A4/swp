/// <amd-module name="Router/ServerRouting" />

import RouterHelper from 'Router/Helper';

function getAppName(request) {
   return RouterHelper.getAppNameByUrl(request.path);
}

function renderApp(request, response, appName) {
   request.compatible = false;
   response.render('wml!Controls/Application/Route', {
      application: appName
   });
}

export = {
   getAppName,
   renderApp
};