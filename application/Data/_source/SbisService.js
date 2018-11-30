/// <amd-module name="Data/_source/SbisService" />
/**
 * Класс источника данных на сервисах бизнес-логики СБИС.
 * <br/>
 * <b>Пример 1</b>. Создадим источник данных для объекта БЛ:
 * <pre>
 *    require(['WS.Data/Source/SbisService'], function(SbisService) {
 *       var dataSource = new SbisService({
 *          endpoint: 'СообщениеОтКлиента'
 *       });
 *    });
 * </pre>
 * <b>Пример 2</b>. Создадим источник данных для объекта БЛ, используя отдельную точку входа:
 * <pre>
 *    require(['WS.Data/Source/SbisService'], function(SbisService) {
 *       var dataSource = new SbisService({
 *          endpoint: {
 *             address: '/my-service/entry/point/',
 *             contract: 'СообщениеОтКлиента'
 *          }
 *       });
 *    });
 * </pre>
 * <b>Пример 3</b>. Создадим источник данных для объекта БЛ с указанием своих методов для чтения записи и списка записей, а также свой формат записи:
 * <pre>
 *    require(['WS.Data/Source/SbisService'], function(SbisService) {
 *       var dataSource = new SbisService({
 *          endpoint: 'СообщениеОтКлиента',
 *          binding: {
 *             read: 'Прочитать',
 *             query: 'СписокОбщий',
 *             format: 'Список'
 *          },
 *          idProperty: '@СообщениеОтКлиента'
 *       });
 *    });
 * </pre>
 * <b>Пример 4</b>. Создадим новую статью:
 * <pre>
 *    require(['WS.Data/Source/SbisService'], function(SbisService) {
 *       var dataSource = new SbisService({
 *          endpoint: 'Статья',
 *          idProperty: 'id'
 *       });
 *
 *       dataSource.create().addCallbacks(function(article) {
 *          var id = article.getId();
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * <b>Пример 5</b>. Прочитаем статью:
 * <pre>
 *    require(['WS.Data/Source/SbisService'], function(SbisService) {
 *       var dataSource = new SbisService({
 *          endpoint: 'Статья',
 *          idProperty: 'id'
 *       });
 *
 *       dataSource.read('article-1').addCallbacks(function(article) {
 *          var title = article.get('title');
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * <b>Пример 6</b>. Сохраним статью:
 * <pre>
 *    require(['WS.Data/Source/SbisService', 'WS.Data/Entity/Model', , 'WS.Data/Adapter/Sbis'], function(SbisService, Model, SbisAdapter) {
 *       var dataSource = new SbisService({
 *             endpoint: 'Статья',
 *             idProperty: 'id'
 *          }),
 *          article = new Model({
 *             adapter: new SbisAdapter(),
 *             format: [
 *                {name: 'id', type: 'integer'},
 *                {name: 'title', type: 'string'}
 *             ],
 *             idProperty: 'id'
 *          });
 *
 *       article.set({
 *          id: 'article-1',
 *          title: 'Article 1'
 *       });
 *
 *       dataSource.update(article).addCallbacks(function() {
 *          console.log('Article updated!');
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * <b>Пример 7</b>. Удалим статью:
 * <pre>
 *    require(['WS.Data/Source/SbisService'], function(SbisService) {
 *       var dataSource = new SbisService({
 *          endpoint: 'Статья',
 *          idProperty: 'id'
 *       });
 *
 *       dataSource.destroy('article-1').addCallbacks(function() {
 *          console.log('Article deleted!');
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * <b>Пример 8</b>. Прочитаем первые сто статей:
 * <pre>
 *    require(['WS.Data/Source/SbisService', 'WS.Data/Query/Query'], function(SbisService, Query) {
 *       var dataSource = new SbisService({
 *             endpoint: 'Статья'
 *          }),
 *          query = new Query();
 *
 *       query.limit(100);
 *       dataSource.query(query).addCallbacks(function(dataSet) {
 *          var articles = dataSet.getAll();
 *          console.log('Articles count: ' + articles.getCount());
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * @class WS.Data/Source/SbisService
 * @extends WS.Data/Source/Rpc
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/SbisService', [
    'require',
    'exports',
    'tslib',
    'Data/_source/Rpc',
    'Data/_source/OptionsMixin',
    'Data/_source/DataMixin',
    'Data/util',
    'Core/ParallelDeferred'
], function (require, exports, tslib_1, Rpc_1, OptionsMixin_1, DataMixin_1, util_1, ParallelDeferred) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Типы навигации для query()
     */
    /**
     * Типы навигации для query()
     */
    var NAVIGATION_TYPE = Object.assign({
        POSITION: 'Position'    //Add POSITION navigation type
    }, //Add POSITION navigation type
    Rpc_1.default.NAVIGATION_TYPE);    /**
     * Разделитель частей сложного идентификатора
     */
    /**
     * Разделитель частей сложного идентификатора
     */
    var COMPLEX_ID_SEPARATOR = ',';    /**
     * Детектор сложного идентификатора
     */
    /**
     * Детектор сложного идентификатора
     */
    var COMPLEX_ID_MATCH = /^[0-9]+,[А-яA-z0-9]+$/;    /**
     * Возвращает ключ объекта БЛ из сложного идентификатора
     * @param {String} id Идентификатор
     * @return {String}
     */
    /**
     * Возвращает ключ объекта БЛ из сложного идентификатора
     * @param {String} id Идентификатор
     * @return {String}
     */
    function getKeyByComplexId(id) {
        id = String(id || '');
        if (id.match(COMPLEX_ID_MATCH)) {
            return id.split(COMPLEX_ID_SEPARATOR)[0];
        }
        return id;
    }    /**
     * Возвращает имя объекта БЛ из сложного идентификатора
     * @param {String} id Идентификатор
     * @param {String} defaults Значение по умолчанию
     * @return {String}
     */
    /**
     * Возвращает имя объекта БЛ из сложного идентификатора
     * @param {String} id Идентификатор
     * @param {String} defaults Значение по умолчанию
     * @return {String}
     */
    function getNameByComplexId(id, defaults) {
        id = String(id || '');
        if (id.match(COMPLEX_ID_MATCH)) {
            return id.split(COMPLEX_ID_SEPARATOR)[1];
        }
        return defaults;
    }    /**
     * Создает сложный идентификатор
     * @param {String} id Идентификатор
     * @param {String} defaults Имя объекта БЛ по умолчанию
     * @return {Array.<String>}
     */
    /**
     * Создает сложный идентификатор
     * @param {String} id Идентификатор
     * @param {String} defaults Имя объекта БЛ по умолчанию
     * @return {Array.<String>}
     */
    function createComplexId(id, defaults) {
        id = String(id || '');
        if (id.match(COMPLEX_ID_MATCH)) {
            return id.split(COMPLEX_ID_SEPARATOR, 2);
        }
        return [
            id,
            defaults
        ];
    }    /**
     * Собирает группы по именам объектов БЛ
     * @param {Array.<String>} ids Идентификаторы
     * @param {String} defaults Имя объекта БЛ по умолчанию
     * @return {Object.<Array.<String>>}
     */
    /**
     * Собирает группы по именам объектов БЛ
     * @param {Array.<String>} ids Идентификаторы
     * @param {String} defaults Имя объекта БЛ по умолчанию
     * @return {Object.<Array.<String>>}
     */
    function getGroupsByComplexIds(ids, defaults) {
        var groups = {};
        var name;
        for (var i = 0, len = ids.length; i < len; i++) {
            name = getNameByComplexId(ids[i], defaults);
            groups[name] = groups[name] || [];
            groups[name].push(getKeyByComplexId(ids[i]));
        }
        return groups;
    }    /**
     * Calls destroy method for some BL-Object
     * @param {WS.Data/Source/SbisService} instance Экземпляр SbisService
     * @param {Array.<String>} ids Идентификаторы удаляемых записей
     * @param {String} name Имя объекта БЛ
     * @param {Object} meta Дополнительные данные
     * @return {Core/Deferred}
     */
    /**
     * Calls destroy method for some BL-Object
     * @param {WS.Data/Source/SbisService} instance Экземпляр SbisService
     * @param {Array.<String>} ids Идентификаторы удаляемых записей
     * @param {String} name Имя объекта БЛ
     * @param {Object} meta Дополнительные данные
     * @return {Core/Deferred}
     */
    function callDestroyWithComplexId(instance, ids, name, meta) {
        return instance._callProvider(instance._$endpoint.contract === name ? instance._$binding.destroy : name + '.' + instance._$binding.destroy, instance._$passing.destroy.call(instance, ids, meta));
    }    /**
     * Строит запись из объекта
     * @param {Object|WS.Data/Entity/Record} data Данные полей записи
     * @param {WS.Data/Adapter/IAdapter} adapter Адаптер
     * @return {WS.Data/Entity/Record|null}
     */
    /**
     * Строит запись из объекта
     * @param {Object|WS.Data/Entity/Record} data Данные полей записи
     * @param {WS.Data/Adapter/IAdapter} adapter Адаптер
     * @return {WS.Data/Entity/Record|null}
     */
    function buildRecord(data, adapter) {
        var Record = util_1.di.resolve('Data/type:Record');
        return Record.fromObject(data, adapter);
    }
    exports.buildRecord = buildRecord;    /**
     * Строит рекодсет из массива
     * @param {Array.<Object>|WS.Data/Collection/RecordSet} data Данные рекордсета
     * @param {WS.Data/Adapter/IAdapter} adapter Адаптер
     * @param {String} idProperty
     * @return {WS.Data/Collection/RecordSet|null}
     */
    /**
     * Строит рекодсет из массива
     * @param {Array.<Object>|WS.Data/Collection/RecordSet} data Данные рекордсета
     * @param {WS.Data/Adapter/IAdapter} adapter Адаптер
     * @param {String} idProperty
     * @return {WS.Data/Collection/RecordSet|null}
     */
    function buildRecordSet(data, adapter, idProperty) {
        if (data === null) {
            return data;
        }
        if (data && DataMixin_1.default.isListInstance(data)) {
            return data;
        }
        var RecordSet = util_1.di.resolve('Data/collection:RecordSet');
        var records = new RecordSet({
            adapter: adapter,
            idProperty: idProperty
        });
        var count = data.length || 0;
        for (var i = 0; i < count; i++) {
            records.add(buildRecord(data[i], adapter));
        }
        return records;
    }
    exports.buildRecordSet = buildRecordSet;    /**
     * Возвращает параметры сортировки
     * @param {WS.Data/Query/Query} query Запрос
     * @return {Array|null}
     */
    /**
     * Возвращает параметры сортировки
     * @param {WS.Data/Query/Query} query Запрос
     * @return {Array|null}
     */
    function getSortingParams(query) {
        if (!query) {
            return null;
        }
        var orders = query.getOrderBy();
        if (orders.length === 0) {
            return null;
        }
        var sort = [];
        var order;
        for (var i = 0; i < orders.length; i++) {
            order = orders[i];
            sort.push({
                n: order.getSelector(),
                o: order.getOrder(),
                l: !order.getOrder()
            });
        }
        return sort;
    }
    exports.getSortingParams = getSortingParams;    /**
     * Возвращает параметры навигации
     * @param {WS.Data/Query/Query} query Запрос
     * @param {Object} options Опции источника
     * @param {WS.Data/Adapter/IAdapter} adapter Адаптер
     * @return {Object|null}
     */
    /**
     * Возвращает параметры навигации
     * @param {WS.Data/Query/Query} query Запрос
     * @param {Object} options Опции источника
     * @param {WS.Data/Adapter/IAdapter} adapter Адаптер
     * @return {Object|null}
     */
    function getPagingParams(query, options, adapter) {
        if (!query) {
            return null;
        }
        var offset = query.getOffset();
        var limit = query.getLimit();
        var meta = query.getMeta();
        var moreProp = options.hasMoreProperty;
        var hasMoreProp = meta.hasOwnProperty(moreProp);
        var more = hasMoreProp ? meta[moreProp] : offset >= 0;
        var withoutOffset = offset === 0;
        var withoutLimit = limit === undefined || limit === null;
        if (hasMoreProp) {
            delete meta[moreProp];
            query.meta(meta);
        }
        var params = null;
        switch (options.navigationType) {
        case NAVIGATION_TYPE.PAGE:
            if (!withoutOffset || !withoutLimit) {
                params = {
                    'Страница': limit > 0 ? Math.floor(offset / limit) : 0,
                    'РазмерСтраницы': limit,
                    'ЕстьЕще': more
                };
            }
            break;
        case NAVIGATION_TYPE.POSITION:
            if (!withoutLimit) {
                var where_1 = query.getWhere();
                var pattern_1 = /(.+)([<>]=|~)$/;
                var fields_1 = null;
                var order_1 = '';
                var parts_1;
                Object.keys(where_1).forEach(function (expr) {
                    parts_1 = expr.match(pattern_1);
                    if (parts_1) {
                        if (!fields_1) {
                            fields_1 = {};
                        }
                        fields_1[parts_1[1]] = where_1[expr];
                        if (!order_1) {
                            switch (parts_1[2]) {
                            case '~':
                                order_1 = 'both';
                                break;
                            case '<=':
                                order_1 = 'before';
                                break;
                            }
                        }    // delete in query by link
                        // delete in query by link
                        delete where_1[expr];
                    }
                });
                order_1 = order_1 || 'after';
                params = {
                    HaveMore: more,
                    Limit: limit,
                    Order: order_1,
                    Position: buildRecord(fields_1, adapter)
                };
            }
            break;
        default:
            if (!withoutOffset || !withoutLimit) {
                params = {
                    Offset: offset || 0,
                    Limit: limit,
                    'ЕстьЕще': more
                };
            }
        }
        return params;
    }
    exports.getPagingParams = getPagingParams;    /**
     * Возвращает дополнительные параметры
     * @param {WS.Data/Query/Query} query Запрос
     * @return {Array}
     */
    /**
     * Возвращает дополнительные параметры
     * @param {WS.Data/Query/Query} query Запрос
     * @return {Array}
     */
    function getAdditionalParams(query) {
        var meta = [];
        if (query) {
            meta = query.getMeta();
            if (meta && DataMixin_1.default.isModelInstance(meta)) {
                var obj_1 = {};
                meta.each(function (key, value) {
                    obj_1[key] = value;
                });
                meta = obj_1;
            }
            if (meta instanceof Object) {
                var arr = [];
                for (var key in meta) {
                    if (meta.hasOwnProperty(key)) {
                        arr.push(meta[key]);
                    }
                }
                meta = arr;
            }
            if (!(meta instanceof Array)) {
                throw new TypeError('WS.Data/Source/SbisService::getAdditionalParams(): unsupported metadata type: only Array, WS.Data/Entity/Record or Object allowed');
            }
        }
        return meta;
    }
    exports.getAdditionalParams = getAdditionalParams;
    function passCreate(meta) {
        if (!DataMixin_1.default.isModelInstance(meta)) {
            meta = Object.assign({}, meta || {});
            if (!('ВызовИзБраузера' in meta)) {
                meta['ВызовИзБраузера'] = true;
            }
        }    //TODO: вместо 'ИмяМетода' может передаваться 'Расширение'
        //TODO: вместо 'ИмяМетода' может передаваться 'Расширение'
        return {
            'Фильтр': buildRecord(meta, this._$adapter),
            'ИмяМетода': this._$binding.format || null
        };
    }
    function passRead(key, meta) {
        var args = {
            'ИдО': key,
            'ИмяМетода': this._$binding.format || null
        };
        if (meta && Object.keys(meta).length) {
            args['ДопПоля'] = meta;
        }
        return args;
    }
    function passUpdate(data, meta) {
        var superArgs = Rpc_1.default.prototype['_$passing'].update.call(this, data, meta);
        var args = {};
        var recordArg = DataMixin_1.default.isListInstance(superArgs[0]) ? 'Записи' : 'Запись';
        args[recordArg] = superArgs[0];
        if (superArgs[1] && Object.keys(superArgs[1]).length) {
            args['ДопПоля'] = superArgs[1];
        }
        return args;
    }    /**
     * Возвращает аргументы метода пакетного обновления рекордсета
     * @param {WS.Data/Collection/RecordSet} items Обновляемый рекордсет
     * @return {Object}
     * @protected
     */
    /**
     * Возвращает аргументы метода пакетного обновления рекордсета
     * @param {WS.Data/Collection/RecordSet} items Обновляемый рекордсет
     * @return {Object}
     * @protected
     */
    function passUpdateBatch(items, meta) {
        var RecordSet = util_1.di.resolve('Data/collection:RecordSet');
        var patch = RecordSet.patch(items);
        return {
            changed: patch.get('changed'),
            added: patch.get('added'),
            removed: patch.get('removed')
        };
    }
    function passDestroy(keys, meta) {
        var args = { 'ИдО': keys };
        if (meta && Object.keys(meta).length) {
            args['ДопПоля'] = meta;
        }
        return args;
    }
    function passQuery(query) {
        var nav = getPagingParams(query, this._$options, this._$adapter);
        var filter = query ? query.getWhere() : null;
        var sort = getSortingParams(query);
        var add = getAdditionalParams(query);
        return {
            'Фильтр': buildRecord(filter, this._$adapter),
            'Сортировка': buildRecordSet(sort, this._$adapter, this.getIdProperty()),
            'Навигация': buildRecord(nav, this._$adapter),
            'ДопПоля': add
        };
    }
    function passCopy(key, meta) {
        var args = {
            'ИдО': key,
            'ИмяМетода': this._$binding.format
        };
        if (meta && Object.keys(meta).length) {
            args['ДопПоля'] = meta;
        }
        return args;
    }
    function passMerge(from, to) {
        return {
            'ИдО': from,
            'ИдОУд': to
        };
    }
    function passMove(from, to, meta) {
        return {
            IndexNumber: this._$orderProperty,
            HierarchyName: meta.parentProperty || null,
            ObjectName: meta.objectName,
            ObjectId: from,
            DestinationId: to,
            Order: meta.position,
            ReadMethod: meta.objectName + '.' + this._$binding.read,
            UpdateMethod: meta.objectName + '.' + this._$binding.update
        };
    }    /**
     * Calls move method in old style
     * @param {WS.Data/Source/SbisService} instance Экземпляр SbisService
     * @param {String} from Идентификатор перемещаемой записи
     * @param {String} to Идентификатор целевой записи
     * @param {Object} meta Дополнительные данные
     * @return {Core/Deferred}
     */
    /**
     * Calls move method in old style
     * @param {WS.Data/Source/SbisService} instance Экземпляр SbisService
     * @param {String} from Идентификатор перемещаемой записи
     * @param {String} to Идентификатор целевой записи
     * @param {Object} meta Дополнительные данные
     * @return {Core/Deferred}
     */
    function oldMove(instance, from, to, meta) {
        util_1.logger.info(instance._moduleName, 'Move elements through moveAfter and moveBefore methods have been deprecated, please use just move instead.');
        var moveMethod = meta.before ? instance._$binding.moveBefore : instance._$binding.moveAfter;
        var params = {
            'ПорядковыйНомер': instance._$orderProperty,
            'Иерархия': meta.hierField || null,
            'Объект': instance._$endpoint.moveContract,
            'ИдО': createComplexId(from, instance._$endpoint.contract)
        };
        params[meta.before ? 'ИдОДо' : 'ИдОПосле'] = createComplexId(to, instance._$endpoint.contract);
        return instance._callProvider(instance._$endpoint.moveContract + '.' + moveMethod, params);
    }
    var SbisService = /** @class */
    function (_super) {
        tslib_1.__extends(SbisService, _super);    /** @lends WS.Data/Source/SbisService.prototype */
        /** @lends WS.Data/Source/SbisService.prototype */
        function SbisService(options) {
            var _this = _super.call(this, options) || this;
            if (!_this._$endpoint.moveContract) {
                _this._$endpoint.moveContract = 'IndexNumber';
            }
            return _this;
        }    //region Public methods
        //region Public methods
        SbisService.prototype.getOrderProperty = function () {
            return this._$orderProperty;
        };
        SbisService.prototype.setOrderProperty = function (name) {
            this._$orderProperty = name;
        };    //endregion Public methods
              //region ICrud
              /**
         * Создает пустую модель через источник данных
         * @param {Object|WS.Data/Entity/Record} [meta] Дополнительные мета данные, которые могут понадобиться для создания модели
         * @return {Core/Deferred} Асинхронный результат выполнения: в случае успеха вернет {@link WS.Data/Entity/Model}, в случае ошибки - Error.
         * @see WS.Data/Source/ICrud#create
         * @example
         * Создадим нового сотрудника:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *        var dataSource = new SbisService({
         *           endpoint: 'Сотрудник',
         *           idProperty: '@Сотрудник'
         *        });
         *        dataSource.create().addCallbacks(function(employee) {
         *           console.log(employee.get('Имя'));
         *        }, function(error) {
         *           console.error(error);
         *        });
         *     });
         * </pre>
         * Создадим нового сотрудника по формату:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *        var dataSource = new SbisService({
         *           endpoint: 'Сотрудник',
         *           idProperty: '@Сотрудник',
         *           binding: {
         *              format: 'СписокДляПрочитать'
         *           }
         *        });
         *        dataSource.create().addCallbacks(function(employee) {
         *           console.log(employee.get('Имя'));
         *        }, function(error) {
         *           console.error(error);
         *        });
         *     });
         * </pre>
         */
        //endregion Public methods
        //region ICrud
        /**
         * Создает пустую модель через источник данных
         * @param {Object|WS.Data/Entity/Record} [meta] Дополнительные мета данные, которые могут понадобиться для создания модели
         * @return {Core/Deferred} Асинхронный результат выполнения: в случае успеха вернет {@link WS.Data/Entity/Model}, в случае ошибки - Error.
         * @see WS.Data/Source/ICrud#create
         * @example
         * Создадим нового сотрудника:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *        var dataSource = new SbisService({
         *           endpoint: 'Сотрудник',
         *           idProperty: '@Сотрудник'
         *        });
         *        dataSource.create().addCallbacks(function(employee) {
         *           console.log(employee.get('Имя'));
         *        }, function(error) {
         *           console.error(error);
         *        });
         *     });
         * </pre>
         * Создадим нового сотрудника по формату:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *        var dataSource = new SbisService({
         *           endpoint: 'Сотрудник',
         *           idProperty: '@Сотрудник',
         *           binding: {
         *              format: 'СписокДляПрочитать'
         *           }
         *        });
         *        dataSource.create().addCallbacks(function(employee) {
         *           console.log(employee.get('Имя'));
         *        }, function(error) {
         *           console.error(error);
         *        });
         *     });
         * </pre>
         */
        SbisService.prototype.create = function (meta) {
            var _this = this;
            meta = util_1.object.clonePlain(meta, true);
            return this._loadAdditionalDependencies(function (def) {
                _this._connectAdditionalDependencies(_super.prototype.create.call(_this, meta), def);
            });
        };
        SbisService.prototype.update = function (data, meta) {
            var _this = this;
            if (this._$binding.updateBatch && DataMixin_1.default.isListInstance(data)) {
                return this._loadAdditionalDependencies(function (def) {
                    _this._connectAdditionalDependencies(_this._callProvider(_this._$binding.updateBatch, passUpdateBatch(data, meta)).addCallback(function (key) {
                        return _this._prepareUpdateResult(data, key);
                    }), def);
                });
            }
            return _super.prototype.update.call(this, data, meta);
        };
        SbisService.prototype.destroy = function (keys, meta) {
            if (!(keys instanceof Array)) {
                return callDestroyWithComplexId(this, [getKeyByComplexId(keys)], getNameByComplexId(keys, this._$endpoint.contract), meta);
            }    //В ключе может содержаться ссылка на объект БЛ - сгруппируем ключи по соответствующим им объектам
            //В ключе может содержаться ссылка на объект БЛ - сгруппируем ключи по соответствующим им объектам
            var groups = getGroupsByComplexIds(keys, this._$endpoint.contract);
            var pd = new ParallelDeferred();
            for (var name in groups) {
                if (groups.hasOwnProperty(name)) {
                    pd.push(callDestroyWithComplexId(this, groups[name], name, meta));
                }
            }
            return pd.done().getResult();
        };
        SbisService.prototype.query = function (query) {
            var _this = this;
            query = util_1.object.clonePlain(query, true);
            return this._loadAdditionalDependencies(function (def) {
                _this._connectAdditionalDependencies(_super.prototype.query.call(_this, query), def);
            });
        };    //endregion ICrud
              //region ICrudPlus
        //endregion ICrud
        //region ICrudPlus
        SbisService.prototype.move = function (items, target, meta) {
            meta = meta || {};
            if (this._$binding.moveBefore) {
                //TODO: поддерживаем старый способ с двумя методами
                return oldMove(this, items, target, meta);
            }    //На БЛ не могут принять массив сложных идентификаторов,
                 //поэтому надо сгуппировать идентификаторы по объекту и для каждой группы позвать метод
            //На БЛ не могут принять массив сложных идентификаторов,
            //поэтому надо сгуппировать идентификаторы по объекту и для каждой группы позвать метод
            var groups = getGroupsByComplexIds(items, this._$endpoint.contract);
            var groupsCount = Object.keys(groups).length;
            var pd = new ParallelDeferred();
            if (target !== null) {
                target = getKeyByComplexId(target);
            }
            for (var name in groups) {
                if (groups.hasOwnProperty(name)) {
                    meta.objectName = name;
                    var def = this._callProvider(this._$binding.move.indexOf('.') > -1 ? this._$binding.move : this._$endpoint.moveContract + '.' + this._$binding.move, this._$passing.move.call(this, groups[name], target, meta));
                    if (groupsCount === 1) {
                        //TODO: нужно доработать ParallelDeferred что бы он возвращал оригинал ошибки
                        //на это есть задача в 3.17.110 https://online.sbis.ru/opendoc.html?guid=ecb592a4-bc06-463f-a3a0-90527f397ac2&des=
                        return def;
                    }
                    pd.push(def);
                }
            }
            return pd.done().getResult();
        };    //endregion ICrudPlus
              //region Remote
        //endregion ICrudPlus
        //region Remote
        SbisService.prototype.getProvider = function () {
            if (!this._provider) {
                this._provider = this._createProvider(this._$provider, {
                    endpoint: this._$endpoint,
                    options: this._$options,
                    //TODO: remove pass 'service' and 'resource'
                    service: this._$endpoint.address,
                    resource: this._$endpoint.contract
                });
            }
            return this._provider;
        };
        Object.defineProperty(SbisService, 'NAVIGATION_TYPE', {
            //endregion Remote
            //region Statics
            get: function () {
                return NAVIGATION_TYPE;
            },
            enumerable: true,
            configurable: true
        });
        return SbisService;
    }(Rpc_1.default    /** @lends WS.Data/Source/SbisService.prototype */);
    /** @lends WS.Data/Source/SbisService.prototype */
    exports.default = SbisService;
    SbisService.prototype['[Data/_source/SbisService]'] = true;
    SbisService.prototype._moduleName = 'Data/source:SbisService';    // @ts-ignore
    // @ts-ignore
    SbisService.prototype._$binding = {
        /**
         * @cfg {String} Имя метода для создания записи через {@link create}.
         * @name WS.Data/Source/SbisService#binding.create
         * @example
         * Зададим свою реализацию для метода create:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             create: 'МойМетодСоздать'
         *          }
         *       });
         *    });
         * </pre>
         * Зададим реализацию для метода create на другом объекте БЛ:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             create: 'Персонал.Создать'
         *          }
         *       });
         *    });
         * </pre>
         */
        create: 'Создать',
        /**
         * @cfg {String} Имя метода для чтения записи через {@link read}.
         * @name WS.Data/Source/SbisService#binding.read
         * @example
         * Зададим свою реализацию для метода read:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             read: 'МойМетодПрочитать'
         *          }
         *       });
         *    });
         * </pre>
         * Зададим реализацию для метода create на другом объекте БЛ:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             read: 'Персонал.Прочитать'
         *          }
         *       });
         *    });
         * </pre>
         */
        read: 'Прочитать',
        /**
         * @cfg {String} Имя метода для обновления записи или рекордсета через {@link update}.
         * @name WS.Data/Source/SbisService#binding.update
         * @example
         * Зададим свою реализацию для метода update:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             update: 'МойМетодЗаписать'
         *          }
         *       });
         *    });
         * </pre>
         * Зададим реализацию для метода update на другом объекте БЛ:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             update: 'Персонал.Записать'
         *          }
         *       });
         *    });
         * </pre>
         */
        update: 'Записать',
        /**
         * @cfg {String} Имя метода для обновления рекордсета через метод {@link update} с передачей только измененных записей.
         * @remark
         * Метод должен принимать следующий набор аргументов:
         * RecordSet changed,
         * RecordSet added,
         * Array<Sting|Number> removed
         * Где changed - измененные записи, added - добавленные записи, removed - ключи удаленных записей.
         * @name WS.Data/Source/SbisService#binding.updateBatch
         */
        updateBatch: '',
        /**
         * @cfg {String} Имя метода для удаления записи через {@link destroy}.
         * @name WS.Data/Source/SbisService#binding.destroy
         * @example
         * Зададим свою реализацию для метода destroy:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             destroy: 'МойМетодУдалить'
         *          }
         *       });
         *    });
         * </pre>
         * Зададим реализацию для метода destroy на другом объекте БЛ:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             destroy: 'Персонал.Удалить'
         *          }
         *       });
         *    });
         * </pre>
         */
        destroy: 'Удалить',
        /**
         * @cfg {String} Имя метода для получения списка записей через {@link query}.
         * @name WS.Data/Source/SbisService#binding.query
         * @example
         * Зададим свою реализацию для метода query:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             query: 'МойСписок'
         *          }
         *       });
         *    });
         * </pre>
         * Зададим реализацию для метода query на другом объекте БЛ:
         * <pre>
         *    require(['WS.Data/Source/SbisService'], function(SbisService) {
         *       var dataSource = new SbisService({
         *          endpoint: 'Сотрудник',
         *          binding: {
         *             query: 'Персонал.Список'
         *          }
         *       });
         *    });
         * </pre>
         */
        query: 'Список',
        /**
         * @cfg {String} Имя метода для копирования записей через {@link copy}.
         * @name WS.Data/Source/SbisService#binding.copy
         */
        copy: 'Копировать',
        /**
         * @cfg {String} Имя метода для объединения записей через {@link merge}.
         * @name WS.Data/Source/SbisService#binding.merge
         */
        merge: 'Объединить',
        /**
         * @cfg {String} Имя метода перемещения записи перед указанной через метод {@link move}.
         * @remark Метод перемещения, используемый по умолчанию - IndexNumber.Move, при изменении родителя вызовет методы Прочитать(read) и Записать(Update)
         * они обязательно должны быть у объекта БЛ.
         * @name WS.Data/Source/SbisService#binding.move
         */
        move: 'Move',
        /**
         * @cfg {String} Имя метода для получения формата записи через {@link create}, {@link read} и {@link copy}. Метод должен быть декларативным.
         * @name WS.Data/Source/SbisService#binding.format
         */
        format: ''
    };    // @ts-ignore
    // @ts-ignore
    SbisService.prototype._$passing = {
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link create}.
         * @name WS.Data/Source/BindingMixin#passing.create
         */
        create: passCreate,
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link read}.
         * @name WS.Data/Source/BindingMixin#passing.read
         */
        read: passRead,
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link update}.
         * @name WS.Data/Source/BindingMixin#passing.update
         */
        update: passUpdate,
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link destroy}.
         * @name WS.Data/Source/BindingMixin#passing.destroy
         */
        destroy: passDestroy,
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link query}.
         * @name WS.Data/Source/BindingMixin#passing.query
         */
        query: passQuery,
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link copy}.
         * @name WS.Data/Source/BindingMixin#passing.copy
         */
        copy: passCopy,
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link merge}.
         * @name WS.Data/Source/BindingMixin#passing.merge
         */
        merge: passMerge,
        /**
         * @cfg {Function} Метод подготовки аргументов при вызове {@link move}.
         * @name WS.Data/Source/BindingMixin#passing.move
         */
        move: passMove
    };    /**
     * @cfg {String|Function|WS.Data/Adapter/IAdapter} Адаптер для работы с данными. Для работы с БЛ всегда используется адаптер {@link WS.Data/Adapter/Sbis}.
     * @name WS.Data/Source/SbisService#adapter
     * @see getAdapter
     * @see WS.Data/Adapter/Sbis
     * @see WS.Data/Di
     */
          // @ts-ignore
    /**
     * @cfg {String|Function|WS.Data/Adapter/IAdapter} Адаптер для работы с данными. Для работы с БЛ всегда используется адаптер {@link WS.Data/Adapter/Sbis}.
     * @name WS.Data/Source/SbisService#adapter
     * @see getAdapter
     * @see WS.Data/Adapter/Sbis
     * @see WS.Data/Di
     */
    // @ts-ignore
    SbisService.prototype._$adapter = 'Data/type:adapter.Sbis';    /**
     * @cfg {String|Function|WS.Data/Source/Provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер, по умолчанию {@link WS.Data/Source/Provider/SbisBusinessLogic}.
     * @name WS.Data/Source/SbisService#provider
     * @see WS.Data/Source/Rpc#provider
     * @see getProvider
     * @see WS.Data/Di
     * @example
     * Используем провайдер нотификатора:
     * <pre>
     *    require(['WS.Data/Source/SbisService', 'Plugin/DataSource/Provider/SbisPlugin'], function (SbisService, SbisPluginProvider) {
     *       var dataSource = new SbisService({
     *          endpoint: 'Сотрудник',
     *          provider: new SbisPluginProvider()
     *       });
     *    });
     * </pre>
     */
                                                                   // @ts-ignore
    /**
     * @cfg {String|Function|WS.Data/Source/Provider/IAbstract} Объект, реализующий сетевой протокол для обмена в режиме клиент-сервер, по умолчанию {@link WS.Data/Source/Provider/SbisBusinessLogic}.
     * @name WS.Data/Source/SbisService#provider
     * @see WS.Data/Source/Rpc#provider
     * @see getProvider
     * @see WS.Data/Di
     * @example
     * Используем провайдер нотификатора:
     * <pre>
     *    require(['WS.Data/Source/SbisService', 'Plugin/DataSource/Provider/SbisPlugin'], function (SbisService, SbisPluginProvider) {
     *       var dataSource = new SbisService({
     *          endpoint: 'Сотрудник',
     *          provider: new SbisPluginProvider()
     *       });
     *    });
     * </pre>
     */
    // @ts-ignore
    SbisService.prototype._$provider = 'Data/source:provider.SbisBusinessLogic';    /**
     * @cfg {String} Имя поля, по которому по умолчанию сортируются записи выборки. По умолчанию 'ПорНомер'.
     * @name WS.Data/Source/SbisService#orderProperty
     * @see move
     */
                                                                                    // @ts-ignore
    /**
     * @cfg {String} Имя поля, по которому по умолчанию сортируются записи выборки. По умолчанию 'ПорНомер'.
     * @name WS.Data/Source/SbisService#orderProperty
     * @see move
     */
    // @ts-ignore
    SbisService.prototype._$orderProperty = 'ПорНомер';    // @ts-ignore
    // @ts-ignore
    SbisService.prototype._$options = OptionsMixin_1.default.addOptions(Rpc_1.default, {
        /**
         * @cfg {String} Название свойства мета-данных {@link WS.Data/Query/Query#meta запроса}, в котором хранится значение поля HasMore аргумента Навигация, передаваемое в вызов {@link query}.
         * @name WS.Data/Source/SbisService#options.hasMoreProperty
         */
        hasMoreProperty: 'hasMore'
    });    //Also add SBIS adapter to lazy loaded dependencies
    //Also add SBIS adapter to lazy loaded dependencies
    SbisService.prototype._additionalDependencies = Rpc_1.default.prototype._additionalDependencies.slice();
    SbisService.prototype._additionalDependencies.push('WS.Data/Adapter/Sbis');
    util_1.di.register('Data/source:SbisService', SbisService, { instantiate: false });
});