define('View/Builder/Tmpl/modules/data/utils/functionStringCreator', function () {
   'use strict';
   var wrapAround = function wrapAround(string, stick) {
         return stick + string + stick;
      },
      chargeString = function chargeString(string) {
         if (string.innerFunction) {
            string = string.replace(/₪/gi, '');
         }
         return string;
      },
      wrapAroundExec = function wrapAroundYen(string, brackets) {
         if (brackets) {
            string = '(' + string + ')';
         }
         return wrapAround(string, '¥');
      },
      execProcessString = function execProcessString(str) {
         return '\'' + str.replace(/\n/g, ' ') + '\'';
      },
      injectFunctionCall = function injectFunctionCall(functionString, functionArgs) {
         return functionString + '(' + functionArgs.join() + ')';
      },
      prepareStringForExec = function prepareStringForExec(string) {
      return unescape(string).replace(/"¥¥([^¥]*?)¥¥"/g, function(str, p) {
         return p.replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
      }).replace(/"¥([^¥]*?)¥"/g, function(str, p) {
         return p.replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
      }).replace(/¥(.*?)¥/g, function(str, p) {
         return '" + ' + p.replace(/\\"/g, "\"").replace(/\\\\/g, "\\") + ' + "';
      }).replace(/"۩(.*?)۩"/g, function(str, p) {
         return p.replace(/\\"/g, "\"").replace(/\\"/g, "\\'");
      }).replace(/"₪(.*?)₪"/g, function(str, p) {
         return p.replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
      }).replace(/₪(.*?)₪/g, function(str, p) {
         return p.replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
      });
   },
      getStr = function(obj, ignoreVar) {

      var esc = function(obj) {
         if (typeof obj === 'string') {
            return chargeString(obj);
         }
         if (Array.isArray(obj)) {
            obj.forEach(function(value, index) {
               obj[index] = esc(value) || obj[index];
            });
         } else if (typeof obj === 'object') {
            for (var key in obj) {
               if (obj.hasOwnProperty(key)) {

                  if (typeof obj[key] === 'string') {
                     if (key.indexOf('__dirty')>-1){
                        if (obj[key].indexOf('["'+ignoreVar+'"')>-1){
                           obj[key] = undefined;
                        }
                     } else {
                        obj[key] = esc(obj[key]);
                     }
                  }
                  if (typeof obj[key] === 'object') {
                     esc(obj[key]);
                  }
               }
            }
         }
      };
      var res;
      esc(obj);
      if (typeof obj === 'string') {
         res = obj;
      } else {
         res = JSON.stringify(obj);
      }
      return prepareStringForExec(res);
   };

   return {
      getStr: getStr,
      prepareStringForExec: prepareStringForExec,
      wrapAroundObject: function wrapAroundYen(string) {
         return wrapAround(string, '₪');
      },
      wrapAroundEntity: function wrapAroundEntity(string) {
         if (string && string.indexOf('۩')===0) return string;
         return wrapAround(string, '۩');
      },
      wrapAroundQuotes: function wrapAroundQuotes(string) {
         return wrapAround(string, '"');
      },
      wrapAroundExec: wrapAroundExec,
      injectFunctionCall: injectFunctionCall,
      execProcessString: execProcessString,
      functionTypeHanlder: function functionTypeHandler(processData, cleanData, attrs, parseAttributes) {
         var processed = parseAttributes.call(this, {
            attribs: attrs,
            isControl: false,
            configObject: {}
         });

         var processedStr = getStr(processed).replace(/\\("|')/g, '$1').replace(/\' \+ /g, '" + ').replace(/ \+ \'/g, ' + "');
         var res = injectFunctionCall('thelpers.getTypeFunc', [
               execProcessString(processData(cleanData[0].data, null, undefined, true)),
               processedStr
            ]
         );
         // res += '.bind(undefined, ' + processedStr + ')';
         return wrapAroundExec(res);
      }
   };
});
