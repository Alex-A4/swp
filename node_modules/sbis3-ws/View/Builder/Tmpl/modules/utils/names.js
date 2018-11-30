define('View/Builder/Tmpl/modules/utils/names', [
   'View/Builder/Tmpl/modules/utils/common'
], function (common) {
   var isTemplateString = function isTemplateString(str) {
         return /(optional!|^)tmpl!/.test(str) || /(optional!|^)html!/.test(str) || /(optional!|^)wml!/.test(str);
      },
      isControlString = function isControlString(str) {
         return /(optional!|^)js!/.test(str);
      },
      isOptionalString = function isOptionalString(str) {
         return str.indexOf('optional!') === 0;
      },
      /**
       * Для поиска резолвера имен в конфине, если он есть.
       * @param name
       * @param resolvers
       * @returns {*}
       */
      hasResolver = function hasResolver(name, resolvers) {
         for (var resolver in resolvers) {
            if (resolvers.hasOwnProperty(resolver)) {
               return name.indexOf(resolver) === 0 ? resolver : undefined;
            }
         }
      };
   return {
      isStringModules: function isStringModules(str, config) {
         return isOptionalString(str)
            || isTemplateString(str)
            || isControlString(str)
            || common.isSlashedControl(str)
            || hasResolver(str, config && config.resolvers);
      },
      isTemplateString: isTemplateString,
      isControlString: isControlString,
      isOptionalString: isOptionalString,
      /**
       * Для использования найденного резолвера имен для partial
       * @param name
       * @param resolvers
       * @returns {*}
       */
      findResolverInConfig : function findResolverInConfig(name, resolvers) {
         var resolverName = hasResolver(name, resolvers);
         if (resolverName) {
            return resolvers[resolverName];
         }
      },
      isSlashedControl: common.isSlashedControl
   };
});
