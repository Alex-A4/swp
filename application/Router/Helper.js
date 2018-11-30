define('Router/Helper', [
    'require',
    'exports',
    'Transport/URL/getUrl',
    'Core/IoC'
], function (require, exports, getUrl, IoC) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var currentUrl = '';
    function _validateMask(mask) {
        if (mask.indexOf('/') !== -1 && mask.indexOf('=') !== -1) {
            IoC.resolve('ILogger').error('RouterHelper', 'Wrong mask, check it');
        }
    }
    function setRelativeUrl(url) {
        currentUrl = url;
    }
    function getRelativeUrl() {
        if (currentUrl) {
            return currentUrl;
        }
        var url = getUrl();
        url = url.replace(/^http[s]?:\/\//, '');
        var indexOfSlash = url.indexOf('/');
        url = url.slice(indexOfSlash);
        return url;
    }
    function _generateFullmask(mask) {
        var fullMask = mask;
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
        var re = /:(\w+)/g;
        var paramMatched = re.exec(mask);
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
        var fullMask = _generateFullmask(mask);
        var paramIndexes = [];
        _matchParams(fullMask, function (param) {
            paramIndexes.push({
                preffixEnd: param.preffixEnd,
                postfixStart: param.postfixStart
            });
            foundParamCallback && foundParamCallback(param);
        });
        for (var i = paramIndexes.length - 1; i >= 0; i--) {
            fullMask = fullMask.slice(0, paramIndexes[i].preffixEnd) + '([^\\/?&]+)' + fullMask.slice(paramIndexes[i].postfixStart);
        }
        return fullMask;
    }
    function findIndex(mask, index, newUrl) {
        var fullmask = _generateFullmaskWithoutParams(mask, undefined);
        var url = newUrl || getRelativeUrl();
        var urlCutted = url.slice(index || 0);
        var matched = urlCutted.match(fullmask);
        return matched ? matched[1].length : -1;
    }
    function _calculateParams(mask, cfg, forUrl, index) {
        var result = [];
        var fullmask = _generateFullmaskWithoutParams(mask, function (param) {
            result.push({
                name: param.name,
                value: cfg[param.name]
            });
        });
        var url = forUrl || getRelativeUrl();
        var urlCutted = url.slice(index || 0);
        var matched = urlCutted.match(fullmask);
        if (matched) {
            for (var j = 2; j < matched.length - 1; j++) {
                // 0 это вся строка, 1 это префикс; последнее это постфикс
                result[j - 2].urlValue = decodeURIComponent(matched[j]);
            }
        }
        return result;
    }
    function _resolveMask(mask, params) {
        var paramCount = 0, resolvedCount = 0;
        _matchParams(mask, function (param) {
            paramCount++;
            if (params[param.name] !== undefined) {
                var paramValue = params[param.name];
                if (typeof paramValue !== 'string') {
                    paramValue = JSON.stringify(paramValue);
                }
                paramValue = encodeURIComponent(paramValue);
                mask = mask.replace(':' + param.name, paramValue);
                resolvedCount++;
            }
        });
        var result = '';
        if (resolvedCount === paramCount) {
            result = mask;
        } else if (resolvedCount !== 0) {
            IoC.resolve('ILogger').error('RouterHelper', 'wrong resolvedCount, check it');
        }
        return result;
    }
    function _getCfgParams(params) {
        var res = {};
        params.forEach(function (param) {
            res[param.name] = param.value;
        });
        return res;
    }
    function _getUrlParams(params) {
        var res = {};
        params.forEach(function (param) {
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
    }    // Adds a forward slash to the end of href if it doesn't end
         // with a slash already
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
        var params = _calculateParams(mask, cfg, undefined, index);
        var cfgParams = _getCfgParams(params);
        var urlParams = _getUrlParams(params);
        var toFind = _resolveMask(mask, urlParams);
        var toReplace = _resolveMask(mask, cfgParams);
        var result = href;
        if (toReplace && toReplace[0] === '/') {
            result = toReplace;
        } else if (toFind) {
            if (toReplace) {
                result = href.replace(toFind, toReplace);
            } else {
                if (href.indexOf('/' + toFind) !== -1) {
                    result = href.replace('/' + toFind, '');
                } else if (href.indexOf('?' + toFind) !== -1) {
                    var hasOtherParams = href.indexOf('?' + toFind + '&') !== -1;
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
            var qIndex = href.indexOf('?');
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
        var url = getRelativeUrl();
        var result = _resolveHref(url, mask, cfg, index);
        return result;
    }
    function getFolderNameByUrl(url) {
        var folderName = url.split('/')[1];    // Folder name for url '/sign_in?return=mainpage' should be 'sign_in'
        // Folder name for url '/sign_in?return=mainpage' should be 'sign_in'
        if (folderName.indexOf('?') !== -1) {
            folderName = folderName.replace(/\?.*/, '');
        }
        return folderName;
    }
    function getAppNameByUrl(url) {
        return getFolderNameByUrl(url) + '/Index';
    }
    exports.default = {
        setRelativeUrl: setRelativeUrl,
        getRelativeUrl: getRelativeUrl,
        calculateUrlParams: calculateUrlParams,
        calculateCfgParams: calculateCfgParams,
        calculateHref: calculateHref,
        findIndex: findIndex,
        getAppNameByUrl: getAppNameByUrl
    };
});