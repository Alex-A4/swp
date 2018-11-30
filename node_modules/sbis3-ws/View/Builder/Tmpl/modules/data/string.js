define('View/Builder/Tmpl/modules/data/string', function stringLoader() {
   'use strict';
   return function stringTag(injected, types, scopeData, propertyName) {
      var children, string = '', i;
      if (injected.children) {
         children = injected.children;
         for (i = 0; i < children.length; i++) {
            if (children[i].type === "text") {
               string += this._processData(children[i].data, scopeData, { isControl: injected.isControl, rootConfig: injected.rootConfig, propertyName: propertyName });
            }
         }
      }
      return string;
   };
});