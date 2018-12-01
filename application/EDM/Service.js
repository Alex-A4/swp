define('EDM/Service', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var Service = /** @class */
    function () {
        function Service(serviceURL) {
            this.serviceURL = serviceURL;
        }
        Service.prototype.get = function (methodName, query) {
            var URL = 'http://' + this.serviceURL + '/' + methodName + '?' + this.parseSearchParams(query);
            return new Promise(function (resolve, reject) {
                fetch(URL).then(function (response) {
                    return response.json();
                }).then(function (responseResult) {
                    return resolve(JSON.parse(responseResult));
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };
        Service.prototype.post = function (methodName, query) {
            var URL = 'http://' + this.serviceURL + '/' + methodName + '?' + this.parseSearchParams(query);
            alert(URL);
            return new Promise(function (resolve, reject) {
                fetch(URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }).then(function (response) {
                    return response.status;
                }).catch(function (err) {
                    return reject(err);
                });
            });
        };
        Service.prototype.parseSearchParams = function (searchParams) {
            var queryString = '';
            for (var key in searchParams) {
                queryString += key + '=' + JSON.stringify(searchParams[key]) + '&';
            }
            return queryString.slice(0, queryString.length - 1);
        };
        return Service;
    }();
    exports.default = Service;
});