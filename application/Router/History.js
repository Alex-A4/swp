/// <amd-module name="Router/History" />
define('Router/History', [
    'require',
    'exports',
    'Router/Helper'
], function (require, exports, Helper_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var localHistory = [];
    var currentPosition = 0;    /*
    * Code is relevant only oin browser,
    * because in browser we can navigate through history
    * */
    /*
    * Code is relevant only oin browser,
    * because in browser we can navigate through history
    * */
    if (typeof window !== 'undefined') {
        var state = {
            id: 0,
            url: Helper_1.default.getRelativeUrl(),
            prettyUrl: Helper_1.default.getRelativeUrl()
        };
        localHistory.push(state);
    }
    function getCurrentState() {
        return localHistory[currentPosition];
    }
    function getPrevState() {
        return localHistory[currentPosition - 1];
    }
    function getNextState() {
        return localHistory[currentPosition + 1];
    }
    function back() {
        currentPosition--;
        if (!localHistory[currentPosition]) {
            var state = _getHistoryObject(Helper_1.default.getRelativeUrl(), Helper_1.default.getRelativeUrl());
            currentPosition = 0;
            state.id = 0;
            localHistory.forEach(function (el) {
                el.id++;
            });
            localHistory = [state].concat(localHistory);
        }
        Helper_1.default.setRelativeUrl(localHistory[currentPosition].url);
    }
    function forward() {
        currentPosition++;
        if (!localHistory[currentPosition]) {
            _pushToHistory(Helper_1.default.getRelativeUrl(), Helper_1.default.getRelativeUrl());
        }
        Helper_1.default.setRelativeUrl(localHistory[currentPosition].url);
    }
    function _getHistoryObject(url, prettyUrl) {
        return {
            id: currentPosition,
            url: url,
            prettyUrl: prettyUrl
        };
    }
    function _pushToHistory(url, prettyUrl) {
        localHistory.push(_getHistoryObject(url, prettyUrl));
    }
    function push(newUrl, prettyUrl) {
        currentPosition++;
        localHistory.splice(currentPosition);
        _pushToHistory(newUrl, prettyUrl);
        Helper_1.default.setRelativeUrl(newUrl);
        window.history.pushState(getCurrentState(), prettyUrl, prettyUrl);
    }
    exports.default = {
        getCurrentState: getCurrentState,
        getPrevState: getPrevState,
        getNextState: getNextState,
        back: back,
        forward: forward,
        push: push
    };
});