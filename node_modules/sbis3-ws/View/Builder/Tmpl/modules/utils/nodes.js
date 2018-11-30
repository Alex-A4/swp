define('View/Builder/Tmpl/modules/utils/nodes',
   function () {
   return {
      /**
       * Создаем контрол ноду во время парсинга, для последующей генерации
       * @param fn
       * @param key
       * @param cnstr
       * @returns {{type: string, key: *, fn: *, constructor: *}}
       */
      createControlNode: function createControlNode(fn, key, cnstr, optional) {
         return {
            type: 'control',
            key: key,
            fn: fn,
            constructor: cnstr,
            optional: optional
         }
      },
      createTemplateNode: function createTemplateNode(fn, key, optional) {
         return {
            type: 'template',
            key: key,
            fn: fn,
            optional: optional
         }
      },
      createModuleNode: function createModuleNode(libPath, key, cnstr) {
         return {
            type: 'module',
            key: key,
            library: libPath.library,
            module: libPath.module,
            constructor: cnstr
         };
      }
   }
});
