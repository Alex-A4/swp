define('View/Builder/Tmpl/modules/utils/loader', [
   'View/Builder/Tmpl/modules/utils/requireType',
   'View/Builder/Tmpl/handlers/error',
   'Core/Deferred'
], function straightFromFileLoader(requireFile, errorHandling, Deferred) {
   'use strict';
   function checkForRequirableTypes(type) {
      return type !== 'control' && type !== 'template' && type !== 'module';
   }
   return function straightFromFileAMD(name) {
      var def = new Deferred();
      requireFile.call(this, name).addCallbacks(
         function includeTraverse(templateData) {
            if (checkForRequirableTypes(templateData.type)) {
               this.traversingAST(templateData).addCallbacks(
                  function includeTraverseState(modAST) {
                     def.callback(modAST);
                  }.bind(this),
                  function brokenTraverse(reason) {
                     def.errback(reason);
                     errorHandling(reason, this.filename);
                  }.bind(this)
               );
            } else {
               def.callback([templateData]);
           }
         }.bind(this),
         function (reason) {
            def.errback(reason);
            errorHandling(reason, this.filename);
         }.bind(this)
      );
      return def;
   };
});
