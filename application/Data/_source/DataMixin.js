/// <amd-module name="Data/_source/DataMixin" />
/**
 * Миксин, позволяющий реализовать интерфейс {@link WS.Data/Source/IData}.
 * @mixin WS.Data/Source/DataMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/DataMixin', [
    'require',
    'exports',
    'Data/type',
    'Data/util'
], function (require, exports, type_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var DataMixin = /** @lends WS.Data/Source/DataMixin.prototype */
    {
        '[Data/_source/DataMixin]': true,
        /**
         * @cfg {String|WS.Data/Adapter/IAdapter} Адаптер для работы с форматом данных, выдаваемых источником. По умолчанию {@link WS.Data/Adapter/Json}.
         * @name WS.Data/Source/DataMixin#adapter
         * @see getAdapter
         * @see WS.Data/Adapter/IAdapter
         * @see WS.Data/Di
         * @example
         * Адаптер для данных в формате БЛ СБИС, внедренный в виде готового экземпляра:
         * <pre>
         *    require([
         *       'WS.Data/Source/Provider/SbisBusinessLogic',
         *       'WS.Data/Source/Memory',
         *       'WS.Data/Adapter/Sbis'
         *    ], function (Provider, MemorySource, SbisAdapter) {
         *       new Provider({
         *          address: '/service/',
         *          contract: 'Employee'
         *       })
         *       .call('getList', {department: 'Management'})
         *       .addCallbacks(function(data) {
         *          var dataSource = new MemorySource({
         *             adapter: new SbisAdapter(),
         *             data: data
         *          });
         *       }, function(error) {
         *          console.error('Can\'t call "Employee::getList"', error);
         *       });
         *    });
         * </pre>
         * Адаптер для данных в формате БЛ СБИС, внедренный в виде названия зарегистрированной зависимости:
         * <pre>
         *    require([
         *       'WS.Data/Source/Provider/SbisBusinessLogic',
         *       'WS.Data/Source/Memory',
         *       'WS.Data/Adapter/Sbis'
         *    ], function (Provider, MemorySource) {
         *       new Provider({
         *          address: '/service/',
         *          contract: 'Employee'
         *       })
         *       .call('getList', {department: 'Management'})
         *       .addCallbacks(function(data) {
         *          var dataSource = new MemorySource({
         *             adapter: 'Data/type:adapter.Sbis',
         *             data: data
         *          });
         *       }, function(error) {
         *          console.error('Can\'t call "Employee::getList"', error);
         *       });
         *    });
         * </pre>
         */
        _$adapter: 'Data/type:adapter.Json',
        /**
         * @cfg {String|Function} Конструктор записей, порождаемых источником данных. По умолчанию {@link WS.Data/Entity/Model}.
         * @name WS.Data/Source/DataMixin#model
         * @see getModel
         * @see WS.Data/Entity/Model
         * @see WS.Data/Di
         * @example
         * Конструктор пользовательской модели, внедренный в виде класса:
         * <pre>
         *    var User = Model.extend({
         *       identify: function(login, password) {
         *       }
         *    });
         *    //...
         *    var dataSource = new MemorySource({
         *       model: User
         *    });
         * </pre>
         * Конструктор пользовательской модели, внедренный в виде названия зарегистрированной зависимости:
         * <pre>
         *    var User = Model.extend({
         *       identify: function(login, password) {
         *       }
         *    });
         *    Di.register('app.model.user', User);
         *    //...
         *    var dataSource = new MemorySource({
         *       model: 'app.model.user'
         *    });
         * </pre>
         */
        _$model: 'Data/type:Model',
        /**
         * @cfg {String|Function} Конструктор рекордсетов, порождаемых источником данных. По умолчанию {@link WS.Data/Collection/RecordSet}.
         * @name WS.Data/Source/DataMixin#listModule
         * @see getListModule
         * @see WS.Data/Collection/RecordSet
         * @see WS.Data/Di
         * @example
         * Конструктор рекордсета, внедренный в виде класса:
         * <pre>
         *    var Users = RecordSet.extend({
         *       getAdministrators: function() {
         *       }
         *    });
         *    //...
         *    var dataSource = new MemorySource({
         *       listModule: Users
         *    });
         * </pre>
         * Конструктор рекордсета, внедренный в виде названия зарегистрированной зависимости:
         * <pre>
         *    var Users = RecordSet.extend({
         *       getAdministrators: function() {
         *       }
         *    });
         *    Di.register('app.collections.users', Users);
         *    //...
         *    var dataSource = new MemorySource({
         *       listModule: 'app.collections.users'
         *    });
         * </pre>
         */
        _$listModule: 'Data/collection:RecordSet',
        /**
         * @cfg {String} Название свойства записи, содержащего первичный ключ.
         * @name WS.Data/Source/DataMixin#idProperty
         * @see getIdProperty
         * @see WS.Data/Entity/Model#idProperty
         * @example
         * Установим свойство 'primaryId' в качестве первичного ключа:
         * <pre>
         *    var dataSource = new MemorySource({
         *       idProperty: 'primaryId'
         *    });
         * </pre>
         */
        _$idProperty: '',
        /**
         * @member {String|Function} Конструктор модуля, реализующего DataSet
         */
        _dataSetModule: 'Data/source:DataSet',
        /**
         * @member {String} Свойство данных, в котором лежит основная выборка
         */
        _dataSetItemsProperty: '',
        /**
         * @member {String} Свойство данных, в котором лежит общее кол-во строк, выбранных запросом
         */
        _dataSetMetaProperty: '',
        _writable: type_1.ReadWriteMixin.writable,
        constructor: function (options) {
            options = options || {};
            if (options.dataSetMetaProperty) {
                this._dataSetMetaProperty = options.dataSetMetaProperty;
            }
        },
        //region Public methods
        getAdapter: function () {
            if (typeof this._$adapter === 'string') {
                this._$adapter = util_1.di.create(this._$adapter);
            }
            return this._$adapter;
        },
        setAdapter: function () {
            throw new Error(this._moduleName + '::setAdapter() - method has been removed in 3.17.300 as deprecated. You should inject adapter into constructor use "adapter" option.');
        },
        getModel: function () {
            return this._$model;
        },
        setModel: function (model) {
            this._$model = model;
        },
        getListModule: function () {
            return this._$listModule;
        },
        setListModule: function (listModule) {
            this._$listModule = listModule;
        },
        getIdProperty: function () {
            return this._$idProperty;
        },
        setIdProperty: function (name) {
            this._$idProperty = name;
        },
        //endregion Public methods
        //region Protected methods
        /**
         * Определяет название свойства с первичным ключом по данным
         * @param {*} data Сырые данные
         * @return {String}
         * @protected
         */
        _getIdPropertyByData: function (data) {
            return this.getAdapter().getKeyField(data) || '';
        },
        /**
         * Создает новый экземпляр модели
         * @param {*} data Данные модели
         * @return {WS.Data/Entity/Model}
         * @protected
         */
        _getModelInstance: function (data) {
            return util_1.di.create(this._$model, {
                writable: this._writable,
                rawData: data,
                adapter: this.getAdapter(),
                idProperty: this.getIdProperty()
            });
        },
        /**
         * Создает новый экземпляр DataSet
         * @param {Object} cfg Опции конструктора
         * @return {WS.Data/Source/DataSet}
         * @protected
         */
        _getDataSetInstance: function (cfg) {
            return util_1.di.create(// eslint-disable-line new-cap
            this._dataSetModule, Object.assign({
                writable: this._writable,
                adapter: this.getAdapter(),
                model: this.getModel(),
                listModule: this.getListModule(),
                idProperty: this.getIdProperty() || this._getIdPropertyByData(cfg.rawData || null)
            }, cfg));
        },
        /**
         * Оборачивает данные в DataSet
         * @param {Object} data Данные
         * @return {WS.Data/Source/DataSet}
         * @protected
         */
        _wrapToDataSet: function (data) {
            return this._getDataSetInstance({
                rawData: data,
                itemsProperty: this._dataSetItemsProperty,
                metaProperty: this._dataSetMetaProperty
            });
        },
        /**
         * Перебирает все записи выборки
         * @param {*} data Выборка
         * @param {Function} callback Ф-я обратного вызова для каждой записи
         * @param {Object} context Конекст
         * @protected
         */
        _each: function (data, callback, context) {
            var tableAdapter = this.getAdapter().forTable(data);
            for (var index = 0, count = tableAdapter.getCount(); index < count; index++) {
                callback.call(context || this, tableAdapter.at(index), index);
            }
        },
        //endregion Protected methods
        //region Statics
        /**
         * Проверяет, что это экземпляр модели
         * @param {*} instance Экземпляр модели
         * @return {Boolean}
         * @static
         */
        isModelInstance: function (instance) {
            return instance && instance['[Data/_type/IObject]'] && instance['[Data/_type/FormattableMixin]'];
        },
        /**
         * Проверяет, что это экземпляр списка
         * @param {*} instance Экземпляр списка
         * @return {Boolean}
         * @static
         */
        isListInstance: function (instance) {
            return instance && instance['[Data/_collection/IList]'] && instance['[Data/_type/FormattableMixin]'];
        }    //endregion Statics
    };
    //endregion Statics
    exports.default = DataMixin;
});