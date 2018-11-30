define('View/Builder/Tmpl/modules/data/array',
   [
      'View/Builder/Tmpl/handlers/error',
      'View/Builder/Tmpl/modules/utils/parse',
      'View/Builder/Tmpl/modules/utils/functionTemplateGenerator',
      'View/Builder/Tmpl/modules/utils/tag',
      'View/Builder/Tmpl/modules/data/utils/dataTypesCreator'
   ], function arrayLoader(errorHandling, parseUtils, ftg, tagUtils, DTC) {
   'use strict';
   /**
    * Узнаем существует имя тэга в числе модулей или нет?
    * @param nameExists
    * @returns {*|boolean}
    */
   function isEntityUsefulOrHTML(nameExists) {
      // условие с template для описания опции, через синтаксис ws:template внутри тега ws:Component или ws:partial
      return nameExists &&
         (!this._modules.hasOwnProperty(nameExists) || nameExists === 'template') &&
         !tagUtils.isTagRequirableBool.call(this, nameExists, DTC.injectedDataTypes) && !~DTC.injectedDataTypes.indexOf(nameExists);
   }
   function getArrayAttributes(injected, scopeData, propertyName) {
      return parseUtils.parseAttributesForData.call(this, {
         attribs: injected.attribs,
         isControl: injected.isControl,
         configObject: {},
         rootConfig: injected.rootConfig
      }, scopeData, propertyName, false);
   }
   function reduceFunctionsArrayToOneString(prev, next) {
      return prev + next;
   }
   return function arrayTag(injected, types, scopeData, propertyName, falsy) {
      var children,
         array = [],
         nameExists,
         typeFunction,
         i,
         arrayAttributes,
         stringFunctions = false,
         variableInner;
      if (injected.children) {
         arrayAttributes = getArrayAttributes.call(this, injected, scopeData, propertyName);
         if (arrayAttributes && arrayAttributes.type === 'string') {
            stringFunctions = true;
         }
         children = injected.children;
         for (i = 0; i < children.length; i++) {
            nameExists = tagUtils.splitWs(children[i].name);
            if (nameExists) {
               if (children[i].children) {
                  typeFunction = types[nameExists];
                  if (typeFunction) {
                     var res = typeFunction.call(this, {
                        attribs: children[i].attribs,
                        children: children[i].children,
                        isControl: injected.isControl,
                        rootConfig: injected.rootConfig
                     }, types, scopeData, propertyName + '/' + i);
                     if (typeof res === 'string') {
                        variableInner = children && children[0] && children[0].children;
                        res = DTC.createDataRepresentation(nameExists, res, variableInner);
                     }
                     array.push(res);
                  } else {
                     if (
                        tagUtils.isTagRequirableBool.call(this, nameExists, DTC.injectedDataTypes) ||
                        !isEntityUsefulOrHTML.call(this, nameExists)
                     ) {
                        array.push(
                           DTC.createDataRepresentation(
                              nameExists,
                              ftg.generateFunction.call(this, propertyName, [children[i]], stringFunctions, injected)
                           )
                        );
                     } else {
                        errorHandling(children[i].name
                           + ' property can\'t be in the root of ws:array tag', this.filename);
                     }
                  }
               }
            } else {
               array.push(
                  DTC.createDataRepresentation(
                     nameExists,
                     ftg.generateFunction.call(this, propertyName, [children[i]], stringFunctions, injected)
                  )
               );
            }
         }
         if (stringFunctions) {
            return array.reduce(reduceFunctionsArrayToOneString, '');
         }
      }
      // Не будем применять меры контентных опций массивов
      // к обычным массивам
      if (falsy) {
         return DTC.createDataRepresentation.call(
            this,
            'Array',
            array
         );
      }
      return array;
   };
});