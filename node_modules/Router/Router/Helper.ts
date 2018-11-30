/// <amd-module name="Router/Helper" />
// @ts-ignore
import getUrl = require('Transport/URL/getUrl');
// @ts-ignore
import IoC = require('Core/IoC');

let currentUrl: string = '';

function _validateMask(mask) {
   if (mask.indexOf('/') !== -1 && mask.indexOf('=') !== -1) {
      IoC.resolve('ILogger').error('RouterHelper', 'Wrong mask, check it');
   }
}
function setRelativeUrl(url: string) {
   currentUrl = url;
}

function getRelativeUrl() {
   if (currentUrl) {
      return currentUrl;
   }
   let url = getUrl();
   url = url.replace(/^http[s]?:\/\//, '');
   const indexOfSlash = url.indexOf('/');
   url = url.slice(indexOfSlash);
   return url;
}
function _generateFullmask(mask) {
   let fullMask = mask;
   if (fullMask.indexOf('/') !== -1) {
      if (fullMask[0] === '/') {
         fullMask = '([/]|.*?\\.html/)' + fullMask.slice(1);
      } else {
         fullMask = '(.*?/)' + fullMask;
      }
   } else if (fullMask.indexOf('=') !== -1) {
      fullMask = '(.*?\\?|.*?&)' + fullMask;
   } else {
      fullMask = '(.*?/)' + fullMask;
   }

   if (fullMask.indexOf('=') !== -1) {
      fullMask = fullMask + '(&.+)?';
   } else {
      fullMask = fullMask + '(/.*|\\?.+)?';
   }

   return fullMask;
}

function _matchParams(mask, cb) {
   const re = /:(\w+)/g;
   let paramMatched = re.exec(mask);

   while (paramMatched) {
      cb({
         preffixEnd: paramMatched.index,
         postfixStart: paramMatched.index + paramMatched[0].length,
         name: paramMatched[1]
      });

      paramMatched = re.exec(mask);
   }
}

function _generateFullmaskWithoutParams(mask, foundParamCallback) {
   let fullMask = _generateFullmask(mask);

   const paramIndexes = [];

   _matchParams(fullMask, function(param) {
      paramIndexes.push({
         preffixEnd: param.preffixEnd,
         postfixStart: param.postfixStart
      });
      foundParamCallback && foundParamCallback(param);
   });

   for (let i = paramIndexes.length - 1; i >= 0; i--) {
      fullMask = fullMask.slice(0, paramIndexes[i].preffixEnd) + '([^\\/?&]+)' + fullMask.slice(paramIndexes[i].postfixStart);
   }
   return fullMask;
}

function findIndex(mask, index, newUrl) {
   const fullmask = _generateFullmaskWithoutParams(mask, undefined);
   const url = newUrl || getRelativeUrl();
   const urlCutted = url.slice(index || 0);
   const matched = urlCutted.match(fullmask);
   return matched ? matched[1].length : -1;
}

function _calculateParams(mask, cfg, forUrl, index) {
   const result = [];
   const fullmask = _generateFullmaskWithoutParams(mask, (param) => {
      result.push({
         name: param.name,
         value: cfg[param.name]
      });
   });

   const url = forUrl || getRelativeUrl();
   const urlCutted = url.slice(index || 0);
   const matched = urlCutted.match(fullmask);

   if (matched) {
      for (let j = 2; j < matched.length - 1; j++) { // 0 это вся строка, 1 это префикс; последнее это постфикс
         result[j - 2].urlValue = decodeURIComponent(matched[j]);
      }
   }
   return result;
}

function _resolveMask(mask, params) {
   let paramCount = 0, resolvedCount = 0;
   _matchParams(mask, function(param) {
      paramCount++;
      if (params[param.name] !== undefined) {
         let paramValue = params[param.name];
         if (typeof paramValue !== 'string') {
            paramValue = JSON.stringify(paramValue);
         }
         paramValue = encodeURIComponent(paramValue);
         mask = mask.replace(':' + param.name, paramValue);
         resolvedCount++;
      }
   });

   let result = '';
   if (resolvedCount === paramCount) {
      result = mask;
   } else if (resolvedCount !== 0) {
      IoC.resolve('ILogger').error('RouterHelper', 'wrong resolvedCount, check it');
   }
   return result;
}

function _getCfgParams(params) {
   const res = {};
   params.forEach(function(param) {
      res[param.name] = param.value;
   });
   return res;
}
function _getUrlParams(params) {
   const res = {};
   params.forEach(function(param) {
      res[param.name] = param.urlValue === undefined ? undefined : decodeURIComponent(param.urlValue);
   });
   return res;
}
function calculateUrlParams(mask, forUrl, index) {
   _validateMask(mask);
   return _getUrlParams(_calculateParams(mask, {}, forUrl, index));
}
function calculateCfgParams(mask, cfg, index) {
   _validateMask(mask);
   return _getCfgParams(_calculateParams(mask, cfg, undefined, index));
}

// Adds a forward slash to the end of href if it doesn't end
// with a slash already
function appendSlash(href) {
   if (href[href.length - 1] === '/') {
      return href;
   } else {
      return href + '/';
   }
}

function _resolveHref(href, mask, cfg, index) {
   const params = _calculateParams(mask, cfg, undefined, index);
   const cfgParams = _getCfgParams(params);
   const urlParams = _getUrlParams(params);

   const toFind = _resolveMask(mask, urlParams);
   const toReplace = _resolveMask(mask, cfgParams);

   let result = href;
   if (toReplace && toReplace[0] === '/') {
      result = toReplace;
   } else if (toFind) {
      if (toReplace) {
         result = href.replace(toFind, toReplace);
      } else {
         if (href.indexOf('/' + toFind) !== -1) {
            result = href.replace('/' + toFind, '');
         } else if (href.indexOf('?' + toFind) !== -1) {
            const hasOtherParams = href.indexOf('?' + toFind + '&') !== -1;
            if (hasOtherParams) {
               result = href.replace('?' + toFind + '&', '?');
            } else {
               result = href.replace('?' + toFind, '');
            }
         } else if (href.indexOf('&' + toFind) !== -1) {
            result = href.replace('&' + toFind, '');
         } else {
            result = href.replace(toFind, '');
         }
      }
   } else if (toReplace) {
      const qIndex = href.indexOf('?');
      if (toReplace[0] === '/') {
         result = toReplace;
      } else {
         if (toReplace.indexOf('=') !== -1) {
            if (qIndex !== -1) {
               result += '&' + toReplace;
            } else {
               result += '?' + toReplace;
            }
         } else {
            if (qIndex !== -1) {
               result = appendSlash(href.slice(0, qIndex)) + toReplace + href.slice(qIndex);
            } else {
               result = appendSlash(href) + toReplace;
            }
         }
      }
   }
   return result;
}
function calculateHref(mask, cfg, index) {
   _validateMask(mask);
   cfg = cfg.clear ? {} : cfg;
   const url = getRelativeUrl();
   const result = _resolveHref(url, mask, cfg, index);
   return result;
}
function getFolderNameByUrl(url: string): string {
   let folderName = url.split('/')[1];

   // Folder name for url '/sign_in?return=mainpage' should be 'sign_in'
   if (folderName.indexOf('?') !== -1) {
      folderName = folderName.replace(/\?.*/, '');
   }

   return folderName;
}
function getAppNameByUrl(url: string): string {
   return getFolderNameByUrl(url) + '/Index';
}

export default {
   setRelativeUrl,
   getRelativeUrl,
   calculateUrlParams,
   calculateCfgParams,
   calculateHref,
   findIndex,
   getAppNameByUrl
};
