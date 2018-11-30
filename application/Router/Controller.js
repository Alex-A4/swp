/// <amd-module name="Router/Controller" />
define('Router/Controller', [
    'require',
    'exports',
    'tslib',
    'Core/Control',
    'wml!Router/Controller',
    'Controls/Event/Registrar',
    'Router/UrlRewriter',
    'Router/History',
    'Router/Helper'
], function (require, exports, tslib_1, Control, template, registrar, UrlRewriter_1, History_1, Helper_1) {
    'use strict';
    function getStateForNavigate(localState, historyState, currentUrl) {
        if (!localState) {
            if (historyState && historyState.url && historyState.prettyUrl) {
                return historyState;
            } else {
                return {
                    url: currentUrl,
                    prettyUrl: currentUrl
                };
            }
        }
        return localState;
    }
    var Controller = /** @class */
    function (_super) {
        tslib_1.__extends(Controller, _super);
        function Controller(cfg) {
            var _this = _super.call(this, cfg) || this;
            _this._registrar = null;
            _this._registrarLink = null;
            _this._registrarUpdate = null;
            _this._registrarReserving = null;
            _this._navigateProcessed = false;
            _this._index = 0;
            _this._template = template;
            _this._currentRoute = 0;    /*Controller doesn't work on server*/
            /*Controller doesn't work on server*/
            if (typeof window !== 'undefined') {
                _this._registrar = new registrar();
                _this._registrarUpdate = new registrar();
                _this._registrarLink = new registrar();
                _this._registrarReserving = new registrar();
                var skipped_1 = false;
                window.onpopstate = function (event) {
                    if (skipped_1) {
                        skipped_1 = false;
                        return;
                    }
                    var currentState = History_1.default.getCurrentState();
                    if (!event.state || event.state.id < currentState.id) {
                        //back
                        var prevState = History_1.default.getPrevState();
                        var stateForNavigate = getStateForNavigate(prevState, event.state, Helper_1.default.getRelativeUrl());
                        _this.navigate(event, stateForNavigate.url, stateForNavigate.prettyUrl, function () {
                            History_1.default.back();
                        }, function () {
                            skipped_1 = true;
                            history.forward();
                        });
                    } else {
                        //forward
                        var nextState = History_1.default.getNextState();
                        var stateForNavigate = getStateForNavigate(nextState, event.state, Helper_1.default.getRelativeUrl());
                        _this.navigate(event, stateForNavigate.url, stateForNavigate.prettyUrl, function () {
                            History_1.default.forward();
                        }, function () {
                            skipped_1 = true;
                            history.back();
                        });
                    }
                };
            }
            return _this;
        }
        Controller.prototype.applyUrl = function () {
            this._registrarUpdate.startAsync();
            this._registrarLink.startAsync();
        };
        Controller.prototype.startAsyncUpdate = function (newUrl, newPrettyUrl) {
            var state = History_1.default.getCurrentState();
            return this._registrar.startAsync({
                url: newUrl,
                prettyUrl: newPrettyUrl
            }, {
                url: state.url,
                prettyUrl: state.prettyUrl
            }).then(function (values) {
                return values.find(function (value) {
                    return value === false;
                }) !== false;
            });
        };
        Controller.prototype.beforeApplyUrl = function (newUrl, newPrettyUrl) {
            var _this = this;
            var state = History_1.default.getCurrentState();
            var newApp = Helper_1.default.getAppNameByUrl(newUrl);
            var currentApp = Helper_1.default.getAppNameByUrl(state.url);
            return this.startAsyncUpdate(newUrl, newPrettyUrl).then(function (result) {
                if (newApp === currentApp) {
                    return result;
                } else {
                    return new Promise(function (resolve) {
                        require([newApp], function () {
                            var changed = _this._notify('changeApplication', [newApp], { bubbling: true });
                            if (!changed) {
                                _this.startAsyncUpdate(newUrl, newPrettyUrl).then(function (ret) {
                                    resolve(ret);
                                });
                            }
                            resolve(true);
                        });
                    });
                }
            });
        };    //co.navigate({}, '(.*)asda=:cmp([^&]*)(&)?(.*)?', {cmp:'asdasdasd123'})
              //co.navigate({}, '(.*)/edo/:idDoc([^/?]*)(.*)?', {idDoc:'8985'})
              //co.navigate({}, '/app/:razd/:idDoc([^/?]*)(.*)?', {razd: 'sda', idDoc:'12315'})
        //co.navigate({}, '(.*)asda=:cmp([^&]*)(&)?(.*)?', {cmp:'asdasdasd123'})
        //co.navigate({}, '(.*)/edo/:idDoc([^/?]*)(.*)?', {idDoc:'8985'})
        //co.navigate({}, '/app/:razd/:idDoc([^/?]*)(.*)?', {razd: 'sda', idDoc:'12315'})
        Controller.prototype.navigate = function (event, newUrl, newPrettyUrl, callback, errback) {
            var _this = this;
            var prettyUrl = newPrettyUrl || UrlRewriter_1.default.getPrettyUrl(newUrl);
            var currentState = History_1.default.getCurrentState();
            if (currentState.url === newUrl || this._navigateProcessed) {
                return;
            }
            this._navigateProcessed = true;    //this.startReserving();
            //this.startReserving();
            this.beforeApplyUrl(newUrl, prettyUrl).then(function (accept) {
                if (accept) {
                    if (callback) {
                        callback();
                    } else {
                        History_1.default.push(newUrl, prettyUrl);
                    }
                    _this.applyUrl();
                } else {
                    errback();
                }
                _this._navigateProcessed = false;
            });
        };
        Controller.prototype.routerCreated = function (event, inst) {
            var _this = this;
            this._registrar.register(event, inst, function (newUrl, oldUrl) {
                return inst.beforeApplyUrl(newUrl, oldUrl);
            });
            this._registrarUpdate.register(event, inst, function (newUrl, oldUrl) {
                return inst.applyNewUrl();
            });
            this._registrarReserving.register(event, inst, function (newUrl) {
                var res = inst._reserve(_this._index, newUrl);
                if (res !== -1) {
                    _this._index = res;
                }
            });    //this.startReserving();
        };    /*public startReserving() {
           this._index = 0;
           // this._registrarReserving.start(newUrl); //todo запуск резервирования кусков url роутами
        }*/
        //this.startReserving();
        /*public startReserving() {
           this._index = 0;
           // this._registrarReserving.start(newUrl); //todo запуск резервирования кусков url роутами
        }*/
        Controller.prototype.routerDestroyed = function (event, inst, mask) {
            this._registrar.unregister(event, inst);
            this._registrarUpdate.unregister(event, inst);
            this._registrarReserving.unregister(event, inst);    //this.startReserving();
        };
        //this.startReserving();
        Controller.prototype.linkCreated = function (event, inst) {
            this._registrarLink.register(event, inst, function () {
                return inst.recalcHref();
            });
        };
        Controller.prototype.linkDestroyed = function (event, inst) {
            this._registrarLink.unregister(event, inst);
        };
        return Controller;
    }(Control);
    return Controller;
});