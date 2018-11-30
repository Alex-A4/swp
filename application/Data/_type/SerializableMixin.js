/// <amd-module name="Data/_type/SerializableMixin" />
/**
 * Миксин, позволяющий сериализовать и десериализовать инастансы различных модулей.
 * Для корректной работы необходимо определить в прототипе каждого модуля свойство _moduleName, в котором прописать
 * имя модуля для requirejs.
 * @example
 * <pre>
 * define('My.SubModule', ['My.SuperModule'], function (SuperModule) {
 *    'use strict';
 *
 *    var SubModule = SuperModule.extend({
 *      _moduleName: 'My.SubModule'
 *    });
 *
 *    return SubModule;
 * });
 * </pre>
 * @mixin WS.Data/Entity/SerializableMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/SerializableMixin', [
    'require',
    'exports',
    'require',
    'Data/util'
], function (require, exports, requirejs, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * @const {Symbol} Свойство, хранящее признак десериализованного экземпляра
     */
    /**
     * @const {Symbol} Свойство, хранящее признак десериализованного экземпляра
     */
    var $unserialized = util_1.protect('unserialized');    /**
     * {Number} Счетчик экземляров
     */
    /**
     * {Number} Счетчик экземляров
     */
    var instanceCounter = 0;    /**
     * {Boolean} Поддерживается ли свойство __proto__ экземпляром Object
     */
                                // @ts-ignore
    /**
     * {Boolean} Поддерживается ли свойство __proto__ экземпляром Object
     */
    // @ts-ignore
    var isProtoSupported = typeof {}.__proto__ === 'object';    /**
     * {Boolean} Поддерживается вывод места определения функции через getFunctionDefinition()
     */
                                                                // @ts-ignore
    /**
     * {Boolean} Поддерживается вывод места определения функции через getFunctionDefinition()
     */
    // @ts-ignore
    var isFunctionDefinitionSupported = typeof getFunctionDefinition === 'function';    /**
     * Возвращает уникальный номер инстанса
     * @return {Number}
     */
    /**
     * Возвращает уникальный номер инстанса
     * @return {Number}
     */
    function getInstanceId() {
        return this._instanceNumber || (this._instanceNumber = ++instanceCounter);
    }    /**
     * Сериализует код модуля, чтобы его можно было идентифицировать.
     * @param {Object} instance Экземпляр модуля
     */
    /**
     * Сериализует код модуля, чтобы его можно было идентифицировать.
     * @param {Object} instance Экземпляр модуля
     */
    function serializeCode(instance) {
        var proto = Object.getPrototypeOf(instance);
        var processed = [];
        return '{' + Object.keys(proto).map(function (name) {
            return [
                name,
                JSON.stringify(proto[name], function (key, value) {
                    if (value && typeof value === 'object') {
                        if (processed.indexOf(value) === -1) {
                            processed.push(value);
                            if (value.$serialized$) {
                                return '{*serialized*}';
                            }
                        } else {
                            return '{*recursion*}';
                        }
                    }
                    if (typeof value === 'function') {
                        // @ts-ignore
                        return isFunctionDefinitionSupported ? getFunctionDefinition(value) : String(value);
                    }
                    return value;
                })
            ];
        }).map(function (pair) {
            return pair[0] + ': ' + pair[1];
        }).join(',') + '}';
    }    /**
     * Создает ошибку сериализации
     * @param {Object} instance Экземпляр объекта
     * @param {Boolean} [critical=false] Выбросить исключение либо предупредить
     * @param {Number} [skip=3] Сколько уровней пропустить при выводе стека вызова метода
     */
    /**
     * Создает ошибку сериализации
     * @param {Object} instance Экземпляр объекта
     * @param {Boolean} [critical=false] Выбросить исключение либо предупредить
     * @param {Number} [skip=3] Сколько уровней пропустить при выводе стека вызова метода
     */
    function createModuleNameError(instance, critical, skip) {
        var text = 'Property "_moduleName" with module name for RequireJS\'s define() is not found in this prototype: "' + serializeCode(instance) + '"';
        if (critical) {
            throw new ReferenceError(text);
        } else {
            util_1.logger.stack(text, skip === undefined ? 3 : skip);
        }
    }
    var SerializableMixin = /** @lends WS.Data/Entity/SerializableMixin.prototype */
    {
        '[Data/_type/SerializableMixin]': true,
        /**
         * @member {Number} Уникальный номер инстанса
         */
        _instanceNumber: 0,
        //region Public methods
        constructor: function () {
        },
        /**
         * Возвращает сериализованный экземпляр класса
         * @return {Object}
         * @example
         * Сериализуем сущность:
         * <pre>
         *    var instance = new Entity(),
         *       data = instance.toJSON();//{$serialized$: 'inst', module: ...}
         * </pre>
         */
        toJSON: function () {
            this._checkModuleName(true);
            return {
                '$serialized$': 'inst',
                module: this._moduleName,
                id: getInstanceId.call(this),
                state: this._getSerializableState({})
            };
        },
        /**
         * Конструирует экземпляр класса из сериализованного состояния
         * @param {Object} data Сериализованное состояние
         * @return {Object}
         * @static
         * @example
         * Сериализуем сущность:
         * <pre>
         *    //data = {$serialized$: 'inst', module: ...}
         *    var instance = Entity.prototype.fromJSON.call(Entity, data);
         *    instance instanceof Entity;//true
         * </pre>
         */
        fromJSON: function (data) {
            var initializer = this.prototype._setSerializableState(data.state);
            var instance = new this(data.state.$options);
            if (initializer) {
                initializer.call(instance);
            }
            return instance;
        },
        //endregion Public methods
        //region Protected methods
        /**
         * Проверяет, что в прототипе указано имя модуля для RequireJS, иначе не будет работать десериализация
         * @param {Boolean} critical Отсутствие имени модуля критично
         * @param {Number} [skip] Сколько уровней пропустить при выводе стека вызова метода
         * @protected
         */
        _checkModuleName: function (critical, skip) {
            var proto = this;
            if (!proto._moduleName) {
                createModuleNameError(this, critical, skip);
                return;
            }    //TODO: refactor to Object.getPrototypeOf(this) after migration to pure prototypes
            //TODO: refactor to Object.getPrototypeOf(this) after migration to pure prototypes
            if (!isProtoSupported) {
                return;
            }
            proto = this.__proto__;
            if (!proto.hasOwnProperty('_moduleName')) {
                createModuleNameError(this, critical, skip);
            }
        },
        /**
         * Возвращает всё, что нужно сложить в состояние объекта при сериализации, чтобы при десериализации вернуть его в это же состояние
         * @param {Object} state Cостояние
         * @return {Object}
         * @protected
         */
        _getSerializableState: function (state) {
            state.$options = this._getOptions ? this._getOptions() : {};
            return state;
        },
        /**
         * Проверяет сериализованное состояние перед созданием инстанса. Возвращает метод, востанавливающий состояние объекта после создания инстанса.
         * @param {Object} state Cостояние
         * @return {Function}
         * @protected
         */
        _setSerializableState: function (state) {
            return function () {
                this[$unserialized] = true;
            };
        }    //endregion Protected methods
    };
    //endregion Protected methods
    if (!requirejs.defined('Core/patchRequireJS')) {
        throw new Error('Module "Core/patchRequireJS" should be required to use serialization.');
    }
    exports.default = SerializableMixin;
});