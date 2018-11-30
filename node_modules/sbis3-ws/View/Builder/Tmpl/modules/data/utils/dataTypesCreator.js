define('View/Builder/Tmpl/modules/data/utils/dataTypesCreator', [
   'View/Builder/Tmpl/modules/data/utils/functionStringCreator'
], function (FSC) {
   'use strict';
   var createStringDataRepresentaion = function createStringDataRepresentaion(str) {
         return FSC.wrapAroundExec('"' + str.replace(/' \+ \(/g, '" + (').replace(/\) \+ '/g, ') + "') + '"');
      },
      /**
       * Если только текст, то обработаем как текст
       * Если только переменная отдами чистое значение
       * @param res
       * @param children
       * @returns {*}
       */
      createCleanDataRepresentation = function createCleanDataRepresentation(res, children) {
         var cArray = [], delimited;
         if (children && children.length) {
            cArray = children[0] && children[0].data;
            if (cArray) {
               if (cArray.reduce) {
                  delimited = cArray.reduce(findDelimiter, false);
               } else {
                  delimited = findDelimiter(false, cArray);
               }
               if (delimited && cArray.length === 1) {
                  return createValueDataRepresentation(res);
               }
            }
         }
         return createStringDataRepresentaion(res);
      },
      /**
       * Отдадим чистое значение
       * @param str
       * @returns {*}
       */
      createArrayDataRepresentation = function createArrayDataRepresentation(str, filename) {
         return FSC.wrapAroundExec(FSC.injectFunctionCall("thelpers.createDataArray", [
            FSC.prepareStringForExec(JSON.stringify(str)),
            FSC.wrapAroundQuotes(filename)
         ]));
      },
      /**
       * Отдадим чистое значение
       * @param str
       * @returns {*}
       */
      createValueDataRepresentation = function createValueDataRepresentation(str) {
         return FSC.wrapAroundExec(str.replace(/^' \+ \(/, '').replace(/\) \+ '$/, ''))
      },
      /**
       * Для обработки типа Number
       * @param res
       * @param children
       * @returns {*}
       */
      createNumberDataRepresentation = function createNumberDataRepresentation(str, children) {
         var cData = children && children[0] && children[0].data;
         if (cData && checkForNull(cData)) {
            return createValueDataRepresentation(str);
         }
         return FSC.wrapAroundExec(FSC.injectFunctionCall("Number", [str.replace(/^' \+ \(/, '').replace(/\) \+ '$/, '')]));
      },
      /**
       * Создаем простую обработку по типу
       * @param dataType
       * @param str
       * @returns {*}
       */
      createTypeDataRepresentation = function createTypeDataRepresentation(dataType, str) {
         return FSC.wrapAroundExec(FSC.injectFunctionCall(dataType, [str.replace(/^' \+ \(/, '').replace(/\) \+ '$/, '')]));
      },
      guardFunctionFromEscaping = function guardFunctionFromEscaping(string) {
         if (string.innerFunction) {
            string = string.replace(/₪/gi, '');
         }
         return string.replace(/^' \+ \(/, '').replace(/\) \+ '$/, '');
      },
      /**
       * Понимаем, что есть одна переменная и в ней null
       * @param data
       * @returns {*|boolean}
       */
      checkForNull = function checkForNull(data) {
         return data && data.length === 1 && data[0] && data[0].value === FSC.wrapAroundExec('(null)');
      },
      findDelimiter = function findDelimiter(prev, next) {
         return prev === false ? next.type === 'var' : true;
      },
      interpretedDataTypes = ['String', 'Number', 'Boolean', 'Value', 'Array'];

   return {
      createDataRepresentation: function createDataRepresentation(dataType, res, children) {
         var stringResult = '';
         if (~interpretedDataTypes.indexOf(dataType)) {
            if (dataType === 'String') {
               if (res.trim() !== '') {
                  stringResult = createStringDataRepresentaion(res);
               }
            } else if (dataType === 'Value') {
               stringResult = createCleanDataRepresentation(res, children);
            } else if (dataType === 'Number') {
               stringResult = createNumberDataRepresentation(res, children);
            } else if (dataType === 'Array') {
               stringResult = createArrayDataRepresentation(res, this.filename || '');
            } else {
               stringResult = createTypeDataRepresentation(dataType, res);
            }
            return stringResult;
         }
         return FSC.wrapAroundExec(guardFunctionFromEscaping(res));
      },
      /**
       * Для создания объекта, возвращаемого функцией шаблонизатора
       * @param html
       * @param data
       * @returns {{html: *, data: *}}
       */
      createHtmlDataObject: function createHtmlDataObject(html, data) {
         return { html: html, data: data };
      },
      injectedDataTypes: ['Array', 'Object', 'String', 'Number', 'Boolean', 'Function', 'Value']
   };
});
