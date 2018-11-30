define('View/Builder/Tmpl/decorators', [
   'View/Builder/Tmpl/handlers/error'
], function decoratorsLoader(errorHandling) {
   'use strict';
   /**
    * Decorators used by pipe notation in template expressions. For example: value|trim|toUpperCase
    *
    */
   function splitControlPropName(name, separator, fieldName) {
      var resultArr;
      try { 
         resultArr = name.split(separator);
      } catch (e) {
         errorHandling('There\'s no control property name to use. You should use binding decorator only in control config. Context field name: ' + fieldName);
         throw new Error('Control property name is undefined', e);
      }
      return resultArr;
   }
   function createBindingObject(controlPropName, contextFieldName, way, direction, bindNonExistent) {
             var
            DIR_FROM_CONTEXT = 'fromContext',
            structureSeparator = '/',
            propArr = splitControlPropName(controlPropName, structureSeparator, contextFieldName),
            propName = propArr[0],
            propPath = propArr.slice(1),
            propPathStr = propPath.join(structureSeparator);
            if (direction) {
              direction = '¥"" + ' + (direction) + ' + ""¥';
            }
            return {
               fieldName: '¥"" + ' + (contextFieldName || '\"\"') + ' + ""¥',
               propName: controlPropName,
               propPath: propPath,
               fullPropName: controlPropName,
               propPathStr: propPathStr,
               oneWay: way,
               direction: direction || DIR_FROM_CONTEXT,
               nonExistentValue: undefined,
               bindNonExistent: bindNonExistent
            };
   }
   var decorators = {
      bind: function bindDataDecorator(value, controlPropName, initValue, direction) {
         if (initValue !== undefined) {
            return { value: initValue, binding: createBindingObject(controlPropName, value, true, direction, true) };
         }
         return { binding: createBindingObject(controlPropName, value, true, direction, false) };
      },
      mutable: function bindDataDecorator(value, controlPropName, initValue) {
         if (initValue !== undefined) {
            return { value: initValue, binding: createBindingObject(controlPropName, value, false, undefined, true) };
         }
         return { binding: createBindingObject(controlPropName, value, false, undefined, false) };
      }
   };
   return decorators;
});
