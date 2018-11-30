define('View/_Request/StateReceiver', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStateReceiver},
     * позволяющий сохранять состояние компонентов
     *
     * @class
     * @name View/_Request/StateReceiver
     * @implements Core/Request/IStateReceiver
     * @author Заляев А.В
     * @private
     */
    /**
     * Класс, реализующий интерфейс {@link Core/Request/IStateReceiver},
     * позволяющий сохранять состояние компонентов
     *
     * @class
     * @name View/_Request/StateReceiver
     * @implements Core/Request/IStateReceiver
     * @author Заляев А.В
     * @private
     */
    var StateReceiver = /** @class */
    function () {
        function StateReceiver(_a) {
            var _b = _a === void 0 ? {} : _a, states = _b.states, console = _b.console;
            this.__states = Object.create(null);
            this.__components = Object.create(null);
            this.__states = states;
            this.__console = console;
        }    /**
         * Получеие сериализованного состояния всех зарегестрированных компонент
         * @return {String}
         * @method
         * @name View/_Request/StateReceiver#serialize
         */
        /**
         * Получеие сериализованного состояния всех зарегестрированных компонент
         * @return {String}
         * @method
         * @name View/_Request/StateReceiver#serialize
         */
        StateReceiver.prototype.serialize = function () {
            var states = Object.create(null);
            for (var uid in this.__components) {
                states[uid] = this.__components[uid].getState();
            }
            return JSON.stringify(states);
        };
        ;    /**
         * Метод, устанавливающий состояние всем зарегестрированным компонентам.
         * @param {String} data
         * @method
         * @name View/_Request/StateReceiver#deserialize
         */
        /**
         * Метод, устанавливающий состояние всем зарегестрированным компонентам.
         * @param {String} data
         * @method
         * @name View/_Request/StateReceiver#deserialize
         */
        StateReceiver.prototype.deserialize = function (data) {
            try {
                this.__states = JSON.parse(data);
                this.__updateState();
            } catch (error) {
                this.__console && this.__console.error(error);
            }
        };
        ;    /**
         * Регистрация компонентов, состояние которыех необходимо сохранить.
         * @param {String} uid идентификатор инстанса, для идентификации сохраненного для него состояния
         * @param {Core/Request/ISerializableState} component Сериализируемый компонент
         * @method
         * @name View/_Request/StateReceiver#register
         */
        /**
         * Регистрация компонентов, состояние которыех необходимо сохранить.
         * @param {String} uid идентификатор инстанса, для идентификации сохраненного для него состояния
         * @param {Core/Request/ISerializableState} component Сериализируемый компонент
         * @method
         * @name View/_Request/StateReceiver#register
         */
        StateReceiver.prototype.register = function (uid, component) {
            /*Нельзя здесь ругаться.. на сборке падаем
            if (this.__components[uid]) {
                throw new Error('exist'); // TODO fix error message
            }*/
            this.__components[uid] = component;
            if (!this.__states) {
                this.__states = {};
            }
            if (this.__states[uid]) {
                this.__setComponentState(uid);
            }
        };
        ;
        StateReceiver.prototype.unregister = function (uid) {
            delete this.__components[uid];
        };
        StateReceiver.prototype.__updateState = function () {
            for (var uid in this.__states) {
                this.__setComponentState(uid);
            }
        };
        StateReceiver.prototype.__setComponentState = function (uid) {
            var serializableState = this.__components[uid];
            if (serializableState || serializableState.setState) {
                serializableState.setState(this.__states[uid]);    // После того как отдали состояние компоненту, чистим дубли в себе
                // После того как отдали состояние компоненту, чистим дубли в себе
                delete this.__states[uid];
            }
        };
        return StateReceiver;
    }();
    exports.default = StateReceiver;
});