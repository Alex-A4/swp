define('Router/UrlRewriter', [
    'require',
    'exports'
], function (require, exports) {
    /// <amd-module name="Router/UrlRewriter" />
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var mapUrls = [];
    var rewriter = {
        push: function (maskFrom, maskTo) {
            mapUrls.push([
                maskFrom,
                maskTo
            ]);
        },
        getPrettyUrl: function (URL) {
            var finded = mapUrls.find(function (value) {
                return !!URL.match(value[0]) || URL === value[0];
            }) || [];
            return finded[1] || URL;
        }
    };
    exports.default = rewriter;
});