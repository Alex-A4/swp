/**
 * Follow {@link https://developers.google.com/web/updates/2017/09/abortable-fetch} for details.
 */

/* eslint-disable */
(function (global) {
    function extend(Child, Parent) {
        var F = function() {};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
    }

    function Emitter() {
        this.listeners = {};
    }
    Emitter.prototype.addEventListener = function(type, callback) {
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    };
    Emitter.prototype.removeEventListener = function(type, callback) {
        if (!(type in this.listeners)) {
            return;
        }
        var stack = this.listeners[type];
        for (var i = 0, l = stack.length; i < l; i++) {
            if (stack[i] === callback) {
                stack.splice(i, 1);
                return;
            }
        }
    };
    Emitter.prototype.dispatchEvent = function(event) {
        if (!(event.type in this.listeners)) {
            return;
        }
        var _this = this;
        var debounce = function(callback) {
            setTimeout(function() {
                callback.call(_this, event);
            });
        };
        var stack = this.listeners[event.type];
        for (var i = 0, l = stack.length; i < l; i++) {
            debounce(stack[i]);
        }
        return !event.defaultPrevented;
    };

    function AbortSignal() {
        var _this = Emitter.call(this) || this;
        _this.aborted = false;
        _this.onabort = null;
    }
    AbortController.prototype.dispatchEvent = function(event) {
        if (event.type === 'abort') {
            this.aborted = true;
            if (typeof this.onabort === 'function') {
                this.onabort.call(this, event);
            }
        }

        Emitter.prototype.dispatchEvent.call(this, event);
    };
    AbortController.prototype.toString = function() {
        return '[object AbortSignal]';
    };
    extend(AbortSignal, Emitter);

    function AbortController() {
        this.signal = new AbortSignal();
    }
    AbortController.prototype.abort = function() {
        var event;
        try {
            event = new Event('abort');
        } catch (e) {
            if (typeof document !== 'undefined') {
                // For Internet Explorer 11:
                event = document.createEvent('Event');
                event.initEvent('abort', false, false);
            } else {
                // Fallback where document isn't available:
                event = {
                    type: 'abort',
                    bubbles: false,
                    cancelable: false
                };
            }
        }
        this.signal.dispatchEvent(event);
    };
    AbortController.prototype.toString = function() {
        return '[object AbortController]';
    };

    if (!global.AbortController) {
        global.AbortController = AbortController;
        global.AbortSignal = AbortSignal;
    }
})(this || (0, eval)('this'));
