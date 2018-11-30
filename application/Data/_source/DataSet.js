/// <amd-module name="Data/_source/DataSet" />
/**
 * Набор данных, полученный из источника.
 * Представляет собой набор {@link WS.Data/Collection/RecordSet выборок}, {@link WS.Data/Entity/Model записей}, а также скалярных значений, которые можно получить по имени свойства (или пути из имен).
 * Использование таких комплексных наборов позволяет за один вызов {@link WS.Data/Source/ICrud#query списочного} либо {@link WS.Data/Source/IRpc#call произвольного} метода источника данных получать сразу все требующиеся для отображения какого-либо сложного интерфейса данные.
 * {@link rawData Исходные данные} могут быть предоставлены источником в разных форматах (JSON, XML). По умолчанию используется формат JSON.
 * Для чтения каждого формата должен быть указан соответствующий адаптер. По умолчанию используется адаптер {@link WS.Data/Adapter/Json}.
 * В общем случае не требуется создавать экземпляры DataSet самостоятельно - это за вас будет делать источник. Но для наглядности ниже приведены несколько примеров чтения частей из набора данных.
 *
 * Создадим комплексный набор в формате JSON из двух выборок "Заказы" и "Покупатели", одной записи "Итого" и даты выполнения запроса:
 * <pre>
 *    require(['WS.Data/Source/DataSet'], function (DataSet) {
 *       var data = new DataSet({
 *          rawData: {
 *             orders: [
 *                {id: 1, buyer_id: 1, date: '2016-06-02 14:12:45', amount: 96},
 *                {id: 2, buyer_id: 2, date: '2016-06-02 17:01:12', amount: 174},
 *                {id: 3, buyer_id: 1, date: '2016-06-03 10:24:28', amount: 475}
 *             ],
 *             buyers: [
 *                {id: 1, email: 'tony@stark-industries.com', phone: '555-111-222'},
 *                {id: 2, email: 'steve-rogers@avengers.us', phone: '555-222-333'}
 *             ],
 *             total: {
 *                date_from: '2016-06-01 00:00:00',
 *                date_to: '2016-07-01 00:00:00',
 *                amount: 745,
 *                deals: 3,
 *                completed: 2,
 *                paid: 2,
 *                awaited: 1,
 *                rejected: 0
 *             },
 *             executeDate: '2016-06-27 11:34:57'
 *          },
 *          itemsProperty: 'orders',
 *          idProperty: 'id'
 *       });
 *
 *       var orders = data.getAll();//Here use itemsProperty option value
 *       console.log(orders.getCount());//3
 *       console.log(orders.at(0).get('amount'));//96
 *
 *       var buyers = data.getAll('buyers');//Here use argument 'property'
 *       console.log(buyers.getCount());//2
 *       console.log(buyers.at(0).get('email'));//'tony@stark-industries.com'
 *
 *       var total = data.getRow('total');
 *       console.log(total.get('amount'));//745
 *
 *       console.log(data.getScalar('executeDate'));//'2016-06-27 11:34:57'
 *    });
 * </pre>
 * Создадим комплексный набор в формате XML из двух выборок "Заказы" и "Покупатели", записи "Итого" и даты выполнения запроса:
 * <pre>
 *    require(['WS.Data/Source/DataSet', 'WS.Data/Adapter/Xml'], function (DataSet) {
 *       var data = new DataSet({
 *          adapter: 'adapter.xml',
 *          rawData: '<?xml version="1.0"?>' +
 *             '<response>' +
 *             '   <orders>' +
 *             '      <order>' +
 *             '         <id>1</id><buyer_id>1</buyer_id><date>2016-06-02 14:12:45</date><amount>96</amount>' +
 *             '      </order>' +
 *             '      <order>' +
 *             '         <id>2</id><buyer_id>2</buyer_id><date>2016-06-02 17:01:12</date><amount>174</amount>' +
 *             '      </order>' +
 *             '      <order>' +
 *             '         <id>3</id><buyer_id>1</buyer_id><date>2016-06-03 10:24:28</date><amount>475</amount>' +
 *             '      </order>' +
 *             '   </orders>' +
 *             '   <buyers>' +
 *             '      <buyer>' +
 *             '         <id>1</id><email>tony@stark-industries.com</email><phone>555-111-222</phone>' +
 *             '      </buyer>' +
 *             '      <buyer>' +
 *             '         <id>2</id><email>steve-rogers@avengers.us</email><phone>555-222-333</phone>' +
 *             '      </buyer>' +
 *             '   </buyers>' +
 *             '   <total>' +
 *             '      <date_from>2016-06-01 00:00:00</date_from>' +
 *             '      <date_to>2016-07-01 00:00:00</date_to>' +
 *             '      <amount>475</amount>' +
 *             '      <deals>3</deals>' +
 *             '      <completed>2</completed>' +
 *             '      <paid>2</paid>' +
 *             '      <awaited>1</awaited>' +
 *             '      <rejected>0</rejected>' +
 *             '   </total>' +
 *             '   <executeDate>2016-06-27 11:34:57</executeDate>' +
 *             '</response>',
 *          itemsProperty: 'orders/order',//XPath syntax
 *          idProperty: 'id'
 *       });
 *
 *       var orders = data.getAll();
 *       console.log(orders.getCount());//3
 *       console.log(orders.at(0).get('amount'));//96
 *
 *       var buyers = data.getAll('buyers/buyer');//XPath syntax
 *       console.log(buyers.getCount());//2
 *       console.log(buyers.at(0).get('email'));//'tony@stark-industries.com'
 *
 *       var total = data.getRow('total');
 *       console.log(total.get('amount'));//745
 *
 *       console.log(data.getScalar('executeDate'));//'2016-06-27 11:34:57'
 *    });
 * </pre>
 * @class WS.Data/Source/DataSet
 * @extends WS.Data/Entity/Abstract
 * @mixes WS.Data/Entity/OptionsMixin
 * @mixes WS.Data/Entity/SerializableMixin
 * @ignoreOptions totalProperty writable
 * @ignoreMethods getTotal getTotalProperty setTotalProperty
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/DataSet', [
    'require',
    'exports',
    'tslib',
    'Data/type',
    'Data/util'
], function (require, exports, tslib_1, type_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var DataSet = /** @class */
    function (_super) {
        tslib_1.__extends(DataSet, _super);    /** @lends WS.Data/Source/DataSet.prototype */
        /** @lends WS.Data/Source/DataSet.prototype */
        function DataSet(options) {
            var _this = _super.call(this) || this;
            type_1.OptionsMixin.call(_this, options);
            type_1.SerializableMixin.constructor.call(_this);
            return _this;
        }
        Object.defineProperty(DataSet.prototype, 'writable', {
            /**
             * Get instance can be changed
             */
            get: function () {
                return this._$writable;
            },
            /**
             * Set instance can be changed
             */
            set: function (value) {
                this._$writable = !!value;
            },
            enumerable: true,
            configurable: true
        });    //region Public methods
               /**
         * Возвращает адаптер для работы с данными
         * @return {WS.Data/Adapter/IAdapter}
         * @see adapter
         * @see WS.Data/Adapter/IAdapter
         * @example
         * Получим адаптер набора данных, используемый по умолчанию:
         * <pre>
         *    require(['WS.Data/Source/DataSet', 'WS.Data/Adapter/Json'], function (DataSet, JsonAdapter) {
         *       var data = new DataSet();
         *       console.log(data.getAdapter() instanceof JsonAdapter);//true
         *    });
         * </pre>
         */
        //region Public methods
        /**
         * Возвращает адаптер для работы с данными
         * @return {WS.Data/Adapter/IAdapter}
         * @see adapter
         * @see WS.Data/Adapter/IAdapter
         * @example
         * Получим адаптер набора данных, используемый по умолчанию:
         * <pre>
         *    require(['WS.Data/Source/DataSet', 'WS.Data/Adapter/Json'], function (DataSet, JsonAdapter) {
         *       var data = new DataSet();
         *       console.log(data.getAdapter() instanceof JsonAdapter);//true
         *    });
         * </pre>
         */
        DataSet.prototype.getAdapter = function () {
            if (typeof this._$adapter === 'string') {
                this._$adapter = util_1.di.create(this._$adapter);
            }
            return this._$adapter;
        };    /**
         * Возвращает конструктор записей, порождаемых набором данных.
         * @return {String|Function}
         * @see model
         * @see WS.Data/Entity/Model
         * @see WS.Data/Di
         * @example
         * Получим конструктор записей, используемый по умолчанию:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *       console.log(data.getModel());//'Data/type:Model'
         *    });
         * </pre>
         */
        /**
         * Возвращает конструктор записей, порождаемых набором данных.
         * @return {String|Function}
         * @see model
         * @see WS.Data/Entity/Model
         * @see WS.Data/Di
         * @example
         * Получим конструктор записей, используемый по умолчанию:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *       console.log(data.getModel());//'Data/type:Model'
         *    });
         * </pre>
         */
        DataSet.prototype.getModel = function () {
            return this._$model;
        };    /**
         * Устанавливает конструктор записей, порождаемых набором данных.
         * @param {String|Function} model
         * @see model
         * @see getModel
         * @see WS.Data/Entity/Model
         * @see WS.Data/Di
         * @example
         * Установим конструктор пользовательской модели:
         * <pre>
         *    require(['WS.Data/Source/DataSet', 'Application/Models/User'], function (DataSet, UserModel) {
         *       var data = new DataSet();
         *       data.setModel(UserModel);
         *    });
         * </pre>
         */
        /**
         * Устанавливает конструктор записей, порождаемых набором данных.
         * @param {String|Function} model
         * @see model
         * @see getModel
         * @see WS.Data/Entity/Model
         * @see WS.Data/Di
         * @example
         * Установим конструктор пользовательской модели:
         * <pre>
         *    require(['WS.Data/Source/DataSet', 'Application/Models/User'], function (DataSet, UserModel) {
         *       var data = new DataSet();
         *       data.setModel(UserModel);
         *    });
         * </pre>
         */
        DataSet.prototype.setModel = function (model) {
            this._$model = model;
        };    /**
         * Возвращает конструктор списка моделей
         * @return {String|Function}
         * @see listModule
         * @see WS.Data/Di
         * @example
         * Получим конструктор рекордсетов, используемый по умолчанию:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *       console.log(data.getListModule());//'Data/collection:RecordSet'
         *    });
         * </pre>
         */
        /**
         * Возвращает конструктор списка моделей
         * @return {String|Function}
         * @see listModule
         * @see WS.Data/Di
         * @example
         * Получим конструктор рекордсетов, используемый по умолчанию:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *       console.log(data.getListModule());//'Data/collection:RecordSet'
         *    });
         * </pre>
         */
        DataSet.prototype.getListModule = function () {
            return this._$listModule;
        };    /**
         * Устанавливает конструктор списка моделей
         * @param {String|Function} listModule
         * @see getListModule
         * @see listModule
         * @see WS.Data/Di
         * @example
         * Установим конструктор рекордсетов:
         * <pre>
         *    require(['WS.Data/Source/DataSet', 'Application/Collection/Users'], function (DataSet, UsersCollection) {
         *       var data = new DataSet();
         *       data.setListModule(UsersCollection);
         *    });
         * </pre>
         */
        /**
         * Устанавливает конструктор списка моделей
         * @param {String|Function} listModule
         * @see getListModule
         * @see listModule
         * @see WS.Data/Di
         * @example
         * Установим конструктор рекордсетов:
         * <pre>
         *    require(['WS.Data/Source/DataSet', 'Application/Collection/Users'], function (DataSet, UsersCollection) {
         *       var data = new DataSet();
         *       data.setListModule(UsersCollection);
         *    });
         * </pre>
         */
        DataSet.prototype.setListModule = function (listModule) {
            this._$listModule = listModule;
        };    /**
         * Возвращает название свойства модели, содержащего первичный ключ
         * @return {String}
         * @see idProperty
         * @see WS.Data/Entity/Model#idProperty
         * @example
         * Получим название свойства модели, содержащего первичный ключ:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          idProperty: 'id'
         *       });
         *       console.log(data.getIdProperty());//'id'
         *    });
         * </pre>
         */
        /**
         * Возвращает название свойства модели, содержащего первичный ключ
         * @return {String}
         * @see idProperty
         * @see WS.Data/Entity/Model#idProperty
         * @example
         * Получим название свойства модели, содержащего первичный ключ:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          idProperty: 'id'
         *       });
         *       console.log(data.getIdProperty());//'id'
         *    });
         * </pre>
         */
        DataSet.prototype.getIdProperty = function () {
            return this._$idProperty;
        };    /**
         * Устанавливает название свойства модели, содержащего первичный ключ
         * @param {String} name
         * @see getIdProperty
         * @see idProperty
         * @see WS.Data/Entity/Model#idProperty
         * @example
         * Установим название свойства модели, содержащего первичный ключ:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *       data.setIdProperty('id');
         *    });
         * </pre>
         */
        /**
         * Устанавливает название свойства модели, содержащего первичный ключ
         * @param {String} name
         * @see getIdProperty
         * @see idProperty
         * @see WS.Data/Entity/Model#idProperty
         * @example
         * Установим название свойства модели, содержащего первичный ключ:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *       data.setIdProperty('id');
         *    });
         * </pre>
         */
        DataSet.prototype.setIdProperty = function (name) {
            this._$idProperty = name;
        };    /**
         * Возвращает название свойства сырых данных, в котором находится основная выборка
         * @return {String}
         * @see setItemsProperty
         * @see itemsProperty
         * @example
         * Получим название свойства, в котором находится основная выборка:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          itemsProperty: 'items'
         *       });
         *       console.log(data.getItemsProperty());//'items'
         *    });
         * </pre>
         */
        /**
         * Возвращает название свойства сырых данных, в котором находится основная выборка
         * @return {String}
         * @see setItemsProperty
         * @see itemsProperty
         * @example
         * Получим название свойства, в котором находится основная выборка:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          itemsProperty: 'items'
         *       });
         *       console.log(data.getItemsProperty());//'items'
         *    });
         * </pre>
         */
        DataSet.prototype.getItemsProperty = function () {
            return this._$itemsProperty;
        };    /**
         * Устанавливает название свойства сырых данных, в котором находится основная выборка
         * @param {String} name
         * @see getItemsProperty
         * @see itemsProperty
         * @example
         * Установим название свойства, в котором находится основная выборка:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *       data.setItemsProperty('items');
         *    });
         * </pre>
         */
        /**
         * Устанавливает название свойства сырых данных, в котором находится основная выборка
         * @param {String} name
         * @see getItemsProperty
         * @see itemsProperty
         * @example
         * Установим название свойства, в котором находится основная выборка:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *       data.setItemsProperty('items');
         *    });
         * </pre>
         */
        DataSet.prototype.setItemsProperty = function (name) {
            this._$itemsProperty = name;
        };    /**
         * Возвращает выборку
         * @param {String} [property] Свойство данных, в которых находятся элементы выборки. Если не указывать, вернется основная выборка.
         * @return {WS.Data/Collection/RecordSet}
         * @see itemsProperty
         * @example
         * Получим основную выборку из набора данных, представляющего выборку:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *             rawData: [
         *                {id: 1, title: 'How to build a Home'},
         *                {id: 2, title: 'How to plant a Tree'},
         *                {id: 3, title: 'How to grow up a Son'}
         *             ]
         *          }),
         *          mansGuide = data.getAll();
         *
         *       console.log(mansGuide.at(0).get('title'));//'How to build a Home'
         *    });
         * </pre>
         * @example
         * Получим основную и дополнительную выборки из набора данных, представляющего несколько выборок:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *             rawData: {
         *                articles: [{
         *                   id: 1,
         *                   topicId: 1,
         *                   title: 'Captain America'
         *                }, {
         *                   id: 2,
         *                   topicId: 1,
         *                   title: 'Iron Man'
         *                }, {
         *                   id: 3,
         *                   topicId: 2,
         *                   title: 'Batman'
         *                }],
         *                topics: [{
         *                   id: 1,
         *                   title: 'Marvel Comics'
         *                }, {
         *                   id: 2,
         *                   title: 'DC Comics'
         *                }]
         *             },
         *             itemsProperty: 'articles'
         *          }),
         *          articles = data.getAll(),
         *          topics = data.getAll('topics');
         *
         *       console.log(articles.at(0).get('title'));//'Captain America'
         *       console.log(topics.at(0).get('title'));//'Marvel Comics'
         *    });
         * </pre>
         */
        /**
         * Возвращает выборку
         * @param {String} [property] Свойство данных, в которых находятся элементы выборки. Если не указывать, вернется основная выборка.
         * @return {WS.Data/Collection/RecordSet}
         * @see itemsProperty
         * @example
         * Получим основную выборку из набора данных, представляющего выборку:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *             rawData: [
         *                {id: 1, title: 'How to build a Home'},
         *                {id: 2, title: 'How to plant a Tree'},
         *                {id: 3, title: 'How to grow up a Son'}
         *             ]
         *          }),
         *          mansGuide = data.getAll();
         *
         *       console.log(mansGuide.at(0).get('title'));//'How to build a Home'
         *    });
         * </pre>
         * @example
         * Получим основную и дополнительную выборки из набора данных, представляющего несколько выборок:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *             rawData: {
         *                articles: [{
         *                   id: 1,
         *                   topicId: 1,
         *                   title: 'Captain America'
         *                }, {
         *                   id: 2,
         *                   topicId: 1,
         *                   title: 'Iron Man'
         *                }, {
         *                   id: 3,
         *                   topicId: 2,
         *                   title: 'Batman'
         *                }],
         *                topics: [{
         *                   id: 1,
         *                   title: 'Marvel Comics'
         *                }, {
         *                   id: 2,
         *                   title: 'DC Comics'
         *                }]
         *             },
         *             itemsProperty: 'articles'
         *          }),
         *          articles = data.getAll(),
         *          topics = data.getAll('topics');
         *
         *       console.log(articles.at(0).get('title'));//'Captain America'
         *       console.log(topics.at(0).get('title'));//'Marvel Comics'
         *    });
         * </pre>
         */
        DataSet.prototype.getAll = function (property) {
            this._checkAdapter();
            if (property === undefined) {
                property = this._$itemsProperty;
            }
            var items = this._getListInstance(this._getDataProperty(property));
            if (this._$metaProperty && items.getMetaData instanceof Function) {
                var itemsMetaData = items.getMetaData();
                var metaData = this.getMetaData();
                var someInMetaData = Object.keys(metaData).length > 0;    // FIXME: don't use deprecated 'total' property from raw data
                // FIXME: don't use deprecated 'total' property from raw data
                if (!someInMetaData && this._$rawData && this._$rawData.total) {
                    metaData = { total: this._$rawData.total };
                    someInMetaData = true;
                }
                if (someInMetaData) {
                    itemsMetaData = Object.assign(itemsMetaData || {}, metaData);    // FIXME: don't use 'more' anymore
                    // FIXME: don't use 'more' anymore
                    if (!itemsMetaData.hasOwnProperty('more') && metaData.hasOwnProperty('total')) {
                        itemsMetaData.more = metaData.total;
                    }
                    items.setMetaData(itemsMetaData);
                }
            }
            return items;
        };    /**
         * Возвращает запись
         * @param {String} [property] Свойство данных, в которых находится модель
         * @return {WS.Data/Entity/Model|undefined}
         * @see itemsProperty
         * @example
         * Получим запись из набора данных, который содержит только ее:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *             rawData: {
         *                id: 1,
         *                title: 'C++ Beginners Tutorial'
         *             }
         *          }),
         *          article = data.getRow();
         *
         *       console.log(article.get('title'));//'C++ Beginners Tutorial'
         *    });
         * </pre>
         * @example
         * Получим записи статьи и темы из набора данных, который содержит несколько записей:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *             rawData: {
         *                article: {
         *                   id: 2,
         *                   topicId: 1,
         *                   title: 'Iron Man'
         *                },
         *                topic: {
         *                   id: 1,
         *                   title: 'Marvel Comics'
         *                }
         *             }
         *          }),
         *          article = data.getRow('article'),
         *          topic = data.getRow('topic');
         *
         *       console.log(article.get('title'));//'Iron Man'
         *       console.log(topic.get('title'));//'Marvel Comics'
         *    });
         * </pre>
         */
        /**
         * Возвращает запись
         * @param {String} [property] Свойство данных, в которых находится модель
         * @return {WS.Data/Entity/Model|undefined}
         * @see itemsProperty
         * @example
         * Получим запись из набора данных, который содержит только ее:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *             rawData: {
         *                id: 1,
         *                title: 'C++ Beginners Tutorial'
         *             }
         *          }),
         *          article = data.getRow();
         *
         *       console.log(article.get('title'));//'C++ Beginners Tutorial'
         *    });
         * </pre>
         * @example
         * Получим записи статьи и темы из набора данных, который содержит несколько записей:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *             rawData: {
         *                article: {
         *                   id: 2,
         *                   topicId: 1,
         *                   title: 'Iron Man'
         *                },
         *                topic: {
         *                   id: 1,
         *                   title: 'Marvel Comics'
         *                }
         *             }
         *          }),
         *          article = data.getRow('article'),
         *          topic = data.getRow('topic');
         *
         *       console.log(article.get('title'));//'Iron Man'
         *       console.log(topic.get('title'));//'Marvel Comics'
         *    });
         * </pre>
         */
        DataSet.prototype.getRow = function (property) {
            this._checkAdapter();
            if (property === undefined) {
                property = this._$itemsProperty;
            }    //FIXME: don't use hardcoded signature for type detection
            //FIXME: don't use hardcoded signature for type detection
            var data = this._getDataProperty(property);
            var type = this.getAdapter().getProperty(data, '_type');
            if (type === 'recordset') {
                var tableAdapter = this.getAdapter().forTable(data);
                if (tableAdapter.getCount() > 0) {
                    return this._getModelInstance(tableAdapter.at(0));
                }
            } else {
                return this._getModelInstance(data);
            }
            return undefined;
        };    /**
         * Возвращает значение
         * @param {String} [property] Свойство данных, в которых находится значение
         * @return {*}
         * @see itemsProperty
         * @example
         * Получим количество открытых задач:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var statOpen = new DataSet({
         *          rawData: 234
         *       });
         *
         *       console.log(statOpen.getScalar());//234
         *    });
         * </pre>
         * @example
         * Получим количество открытых и закрытых задач:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var stat = new DataSet({
         *          rawData: {
         *             total: 500,
         *             open: 234,
         *             closed: 123,
         *             deleted: 2345
         *           }
         *       });
         *
         *       console.log(stat.getScalar('open'));//234
         *       console.log(stat.getScalar('closed'));//123
         *    });
         * </pre>
         */
        /**
         * Возвращает значение
         * @param {String} [property] Свойство данных, в которых находится значение
         * @return {*}
         * @see itemsProperty
         * @example
         * Получим количество открытых задач:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var statOpen = new DataSet({
         *          rawData: 234
         *       });
         *
         *       console.log(statOpen.getScalar());//234
         *    });
         * </pre>
         * @example
         * Получим количество открытых и закрытых задач:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var stat = new DataSet({
         *          rawData: {
         *             total: 500,
         *             open: 234,
         *             closed: 123,
         *             deleted: 2345
         *           }
         *       });
         *
         *       console.log(stat.getScalar('open'));//234
         *       console.log(stat.getScalar('closed'));//123
         *    });
         * </pre>
         */
        DataSet.prototype.getScalar = function (property) {
            if (property === undefined) {
                property = this._$itemsProperty;
            }
            return this._getDataProperty(property);
        };    /**
         * Возвращает свойство данных, в котором находися общее число элементов выборки
         * @return {String}
         * @see metaProperty
         */
        /**
         * Возвращает свойство данных, в котором находися общее число элементов выборки
         * @return {String}
         * @see metaProperty
         */
        DataSet.prototype.getMetaProperty = function () {
            return this._$metaProperty;
        };    /**
         * Возвращает мета-данные выборки
         * @return {Object}
         * @see metaProperty
         */
        /**
         * Возвращает мета-данные выборки
         * @return {Object}
         * @see metaProperty
         */
        DataSet.prototype.getMetaData = function () {
            return this._$metaProperty && this._getDataProperty(this._$metaProperty) || {};
        };    /**
         * Проверяет наличие свойства в данных
         * @param {String} property Свойство
         * @return {Boolean}
         * @see getProperty
         * @example
         * Проверим наличие свойств 'articles' и 'topics':
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          rawData: {
         *             articles: [{
         *                id: 1,
         *                title: 'C++ Beginners Tutorial'
         *             }]
         *          }
         *       });
         *
         *       console.log(data.hasProperty('articles'));//true
         *       console.log(data.hasProperty('topics'));//false
         *    });
         * </pre>
         */
        /**
         * Проверяет наличие свойства в данных
         * @param {String} property Свойство
         * @return {Boolean}
         * @see getProperty
         * @example
         * Проверим наличие свойств 'articles' и 'topics':
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          rawData: {
         *             articles: [{
         *                id: 1,
         *                title: 'C++ Beginners Tutorial'
         *             }]
         *          }
         *       });
         *
         *       console.log(data.hasProperty('articles'));//true
         *       console.log(data.hasProperty('topics'));//false
         *    });
         * </pre>
         */
        DataSet.prototype.hasProperty = function (property) {
            return property ? this._getDataProperty(property) !== undefined : false;
        };    /**
         * Возвращает значение свойства в данных
         * @param {String} property Свойство
         * @return {*}
         * @see hasProperty
         * @example
         * Получим значение свойства 'article':
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          rawData: {
         *             article: {
         *                id: 1,
         *                title: 'C++ Beginners Tutorial'
         *             }
         *          }
         *       });
         *
         *       console.log(data.getProperty('article'));//{id: 1, title: 'C++ Beginners Tutorial'}
         *    });
         * </pre>
         */
        /**
         * Возвращает значение свойства в данных
         * @param {String} property Свойство
         * @return {*}
         * @see hasProperty
         * @example
         * Получим значение свойства 'article':
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          rawData: {
         *             article: {
         *                id: 1,
         *                title: 'C++ Beginners Tutorial'
         *             }
         *          }
         *       });
         *
         *       console.log(data.getProperty('article'));//{id: 1, title: 'C++ Beginners Tutorial'}
         *    });
         * </pre>
         */
        DataSet.prototype.getProperty = function (property) {
            return this._getDataProperty(property);
        };    /**
         * Возвращает сырые данные
         * @return {*}
         * @see setRawData
         * @see rawData
         * @example
         * Получим данные в сыром виде:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          rawData: {
         *             id: 1,
         *             title: 'C++ Beginners Tutorial'
         *          }
         *       });
         *
         *       console.log(data.getRawData());//{id: 1, title: 'C++ Beginners Tutorial'}
         *    });
         * </pre>
         */
        /**
         * Возвращает сырые данные
         * @return {*}
         * @see setRawData
         * @see rawData
         * @example
         * Получим данные в сыром виде:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet({
         *          rawData: {
         *             id: 1,
         *             title: 'C++ Beginners Tutorial'
         *          }
         *       });
         *
         *       console.log(data.getRawData());//{id: 1, title: 'C++ Beginners Tutorial'}
         *    });
         * </pre>
         */
        DataSet.prototype.getRawData = function () {
            return this._$rawData;
        };    /**
         * Устанавливает сырые данные
         * @param rawData {*} Сырые данные
         * @see getRawData
         * @see rawData
         * @example
         * Установим данные в сыром виде:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *
         *       data.setRawData({
         *          id: 1,
         *          title: 'C++ Beginners Tutorial'
         *       });
         *       console.log(data.getRow().get('title'));//'C++ Beginners Tutorial'
         *    });
         * </pre>
         */
        /**
         * Устанавливает сырые данные
         * @param rawData {*} Сырые данные
         * @see getRawData
         * @see rawData
         * @example
         * Установим данные в сыром виде:
         * <pre>
         *    require(['WS.Data/Source/DataSet'], function (DataSet) {
         *       var data = new DataSet();
         *
         *       data.setRawData({
         *          id: 1,
         *          title: 'C++ Beginners Tutorial'
         *       });
         *       console.log(data.getRow().get('title'));//'C++ Beginners Tutorial'
         *    });
         * </pre>
         */
        DataSet.prototype.setRawData = function (rawData) {
            this._$rawData = rawData;
        };    //endregion Public methods
              //region Protected methods
              /**
         * Возвращает свойство данных
         * @param {String} property Свойство
         * @return {*}
         * @protected
         */
        //endregion Public methods
        //region Protected methods
        /**
         * Возвращает свойство данных
         * @param {String} property Свойство
         * @return {*}
         * @protected
         */
        DataSet.prototype._getDataProperty = function (property) {
            this._checkAdapter();
            return property ? this.getAdapter().getProperty(this._$rawData, property) : this._$rawData;
        };    /**
         * Возвращает инстанс модели
         * @param {*} rawData Данные модели
         * @return {WS.Data/Entity/Model}
         * @protected
         */
        /**
         * Возвращает инстанс модели
         * @param {*} rawData Данные модели
         * @return {WS.Data/Entity/Model}
         * @protected
         */
        DataSet.prototype._getModelInstance = function (rawData) {
            if (!this._$model) {
                throw new Error('Model is not defined');
            }
            return util_1.di.create(this._$model, {
                writable: this._$writable,
                rawData: rawData,
                adapter: this._$adapter,
                idProperty: this._$idProperty
            });
        };    /**
         * Возвращает инстанс рекордсета
         * @param {*} rawData Данные рекордсета
         * @return {WS.Data/Collection/RecordSet}
         * @protected
         */
        /**
         * Возвращает инстанс рекордсета
         * @param {*} rawData Данные рекордсета
         * @return {WS.Data/Collection/RecordSet}
         * @protected
         */
        DataSet.prototype._getListInstance = function (rawData) {
            return util_1.di.create(this._$listModule, {
                writable: this._$writable,
                rawData: rawData,
                adapter: this._$adapter,
                model: this._$model,
                idProperty: this._$idProperty
            });
        };    /**
         * Проверят наличие адаптера
         * @protected
         */
        /**
         * Проверят наличие адаптера
         * @protected
         */
        DataSet.prototype._checkAdapter = function () {
            if (!this.getAdapter()) {
                throw new Error('Adapter is not defined');
            }
        };
        return DataSet;
    }(util_1.mixin(type_1.Abstract, type_1.OptionsMixin, type_1.SerializableMixin)    /** @lends WS.Data/Source/DataSet.prototype */);
    /** @lends WS.Data/Source/DataSet.prototype */
    exports.default = DataSet;
    DataSet.prototype._moduleName = 'Data/source:DataSet';
    DataSet.prototype['[Data/_source/DataSet]'] = true;    // @ts-ignore
    // @ts-ignore
    DataSet.prototype._$adapter = 'Data/type:adapter.Json';    // @ts-ignore
    // @ts-ignore
    DataSet.prototype._$rawData = null;    // @ts-ignore
    // @ts-ignore
    DataSet.prototype._$model = 'Data/type:Model';    // @ts-ignore
    // @ts-ignore
    DataSet.prototype._$listModule = 'Data/collection:RecordSet';    // @ts-ignore
    // @ts-ignore
    DataSet.prototype._$idProperty = '';    // @ts-ignore
    // @ts-ignore
    DataSet.prototype._$itemsProperty = '';    // @ts-ignore
    // @ts-ignore
    DataSet.prototype._$metaProperty = '';    // @ts-ignore
    // @ts-ignore
    DataSet.prototype._$writable = true;
    util_1.di.register('Data/source:DataSet', DataSet, { instantiate: false });
});