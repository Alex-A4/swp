define('View/Builder/Tmpl/modules/data/function',
   [
      'View/Builder/Tmpl/modules/data/utils/functionStringCreator',
      'View/Builder/Tmpl/modules/utils/parse'
   ],
   function stringLoader(FSC, parseUtils) {
   'use strict';
   return function functionTag(injected) {
      /*
       Для обработки type="function" в конфигурации компонента
       */
      return FSC.functionTypeHanlder(this._processData.bind(this), injected.children, injected.attribs, parseUtils.parseAttributesForData);
   };
});
