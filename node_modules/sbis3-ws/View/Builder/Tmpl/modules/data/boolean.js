define('View/Builder/Tmpl/modules/data/boolean',
   function boolLoader() {
   'use strict';
   return function stringTag(injected, types, scopeData, propertyName) {
      var children, i;
      if (injected.children) {
         children = injected.children;
         for (i = 0; i < children.length; i++) {
            if (children[i].type === "text") {
               return this._processData(children[i].data, scopeData, { isControl: injected.isControl, rootConfig: injected.rootConfig, propertyName: propertyName });
            }
         }
      }
   };
});
