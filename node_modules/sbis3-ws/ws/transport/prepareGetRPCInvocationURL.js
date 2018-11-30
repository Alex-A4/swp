define('Transport/prepareGetRPCInvocationURL', [
   'Transport/getRpcInvocationUrl',
   'Core/IoC'
], function(
   getRpcInvocationUrl,
   IoC
) {
   'use strict';

   var COMPLEX_SEPARATOR = ',';

   var resolvedContext;

   function getContext(context) {
      if (context) {
         return context;
      }

      if (resolvedContext) {
         return resolvedContext;
      }

      try {
         resolvedContext = require('Core/Context').global;
      } catch (e) {
         // If we fail to synchronously require Core/Context, that means we're working in an
         // environment without compatibility layer, so context should be ignored
      }

      return resolvedContext;
   }

   /**
     * Возвращает URL для вызова метода БЛ через HTTP GET.
    *  Часть аргументов вызова разрешается через контекст.
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>object</b> {String} - Имя объекта БЛ.</li>
     *     <li><b>method</b> {String} - Название метода объекта БЛ.</li>
     *     <li><b>args</b> {Object} - Аргументы метода.</li>
     *     <li><b>[context]</b> {Core/Context} - Контекст вызова.</li>
     *     <li><b>[serviceUrl]</b> {String} - Точка входа на БЛ, по умолчанию Core/constants#defaultServiceUrl.</li>
     *     <li><b>[customId]</b> {Number} - Идентификатор запроса JSON-RPC, по умолчанию 0.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * URL вызыва метода.
     * @class Transport/prepareGetRPCInvocationURL
     * @public
     * @author Мальцев А.А.
     */
   return function prepareGetRPCInvocationURL (object, method, args, context, serviceUrl, customId) {
      var filterParams = Object.assign({}, args || {});

      for (var fName in filterParams) {
         if (filterParams.hasOwnProperty(fName)) {
            var param = filterParams[fName];
            if (param !== null && typeof param === 'object' && 'fieldName' in param) {
               var localContext = getContext(context);
               if (localContext) {
                  filterParams[fName] = localContext.getValue(param.fieldName);
               } else {
                  IoC.resolve('ILogger').warn(
                     'Transport/prepareGetRPCInvocationURL',
                     'Using context fields in vdom environment is not supported. Parameter name: "' + fName + '"'
                  );
               }
            }
            if (fName === 'ИдО') {
                var oN = filterParams[fName];
                if (!oN) {
                   return '';
                }
                if (typeof oN === 'string') {
                   var complexKey = String(oN).split(COMPLEX_SEPARATOR);
                   if (complexKey.length === 1) {
                      complexKey = [complexKey[0], ''];
                   }
                   if (complexKey[0]) {
                      filterParams[fName] = complexKey[0];
                   }
                   if (complexKey[1]) {
                      object = complexKey[1];
                   }
                }
            }
         }
      }

      var options = {};
      if (serviceUrl) {
         options.url = serviceUrl;
      }
      if (customId) {
         options.id = customId;
      }

      return getRpcInvocationUrl(
         object,
         method,
         filterParams,
         options
      );
   };
});
