define('Core/core-attach', [
   'Deprecated/core-attach',
   'Core/deprecated'
], function(deprecatedCoreAttach, cDeprecated) {
   var coreAttach = {};

   coreAttach.attachInstance = cDeprecated(deprecatedCoreAttach.attachInstance, {
      name: '$ws.core.attachInstance',
      ver: '3.7.5.100',
      use: '$ws.core.loadControlsDependencies или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.loadAttachInstanceDependencies = cDeprecated(deprecatedCoreAttach.loadAttachInstanceDependencies, {
      name: '$ws.core.loadAttachInstanceDependencies',
      ver: '3.7.5.100',
      use: '$ws.core.loadAttachInstanceDependencies или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.attachSequentally = cDeprecated(deprecatedCoreAttach.attachSequentally, {
      name: '$ws.core.attachSequentally',
      ver: '3.7.5.100',
      use: 'requirejs или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.attachComponent = cDeprecated(deprecatedCoreAttach.attachComponent, {
      name: '$ws.core.attachComponent',
      ver: '3.7.5.100',
      use: 'requirejs или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.attach = cDeprecated(deprecatedCoreAttach.attach, {
      name: '$ws.core.attach',
      ver: '3.7.5.100',
      use: 'requirejs или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.withComponents = cDeprecated(deprecatedCoreAttach.withComponents, {
      name: '$ws.core.withComponents',
      ver: '3.7.5.100',
      use: '$ws.core.ready или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.getHandlerPackage = cDeprecated(deprecatedCoreAttach.getHandlerPackage, {
      name: '$ws.core.getHandlerPackage',
      ver: '3.7.5.100',
      use: 'requirejs или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.getHandlerInfo = cDeprecated(deprecatedCoreAttach.getHandlerInfo, {
      name: '$ws.core.getHandlerInfo',
      ver: '3.7.5.100',
      use: 'requirejs или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.getHandler = cDeprecated(deprecatedCoreAttach.getHandler, {
      name: '$ws.core.getHandler',
      ver: '3.7.5.100',
      use: 'requirejs или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.loadControlsDependencies = cDeprecated(deprecatedCoreAttach.loadControlsDependencies, {
      name: '$ws.core.loadControlsDependencies',
      ver: '3.7.5.100',
      use: 'requirejs или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   coreAttach.loadContents = cDeprecated(deprecatedCoreAttach.loadContents, {
      name: '$ws.core.loadContents',
      ver: '3.7.5.100',
      use: 'requirejs или подключите явно Deprecated/core-attach',
      minimalOnly: true
   });

   return coreAttach;
});
