/// <amd-module name="Data/_source/Local" />
/**
 * Источник данных, работающий локально.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class WS.Data/Source/Local
 * @extends WS.Data/Source/Base
 * @implements WS.Data/Source/ICrud
 * @implements WS.Data/Source/ICrudPlus
 * @mixes WS.Data/Source/DataCrudMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/Local', [
    'require',
    'exports',
    'tslib',
    'Data/_source/Base',
    'Data/_source/DataMixin',
    'Data/_source/DataCrudMixin',
    'Data/util',
    'Core/Deferred',
    'Core/helpers/Number/randomId'
], function (require, exports, tslib_1, Base_1, DataMixin_1, DataCrudMixin_1, util_1, Deferred, randomId) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var MOVE_POSITION = {
        on: 'on',
        before: 'before',
        after: 'after'
    };
    function compareValues(given, expect, operator) {
        // If array expected, use "given in expect" logic
        if (expect instanceof Array) {
            for (var i = 0; i < expect.length; i++) {
                if (compareValues(given, expect[i], operator)) {
                    return true;
                }
            }
            return false;
        }    // If array given, use "given has only expect" logic
        // If array given, use "given has only expect" logic
        if (given instanceof Array) {
            for (var i = 0; i < given.length; i++) {
                if (!compareValues(given[i], expect, operator)) {
                    return false;
                }
            }
            return true;
        }    //Otherwise - just compare
        //Otherwise - just compare
        return given == expect;
    }
    var Local = /** @class */
    function (_super) {
        tslib_1.__extends(Local, _super);
        function Local(options) {
            var _this = _super.call(this, options) || this;    //region ICrud
            //region ICrud
            _this['[Data/_source/ICrud]'] = true;    //endregion ICrud
                                                     //region ICrudPlus
            //endregion ICrud
            //region ICrudPlus
            _this['[Data/_source/ICrudPlus]'] = true;
            _this._reIndex();
            return _this;
        }
        Object.defineProperty(Local.prototype, '_data', {
            /**
             * Данные, с которыми работает источник
             */
            get: function () {
                return this._getTableAdapter().getData();
            },
            enumerable: true,
            configurable: true
        });
        Local.prototype.create = function (meta) {
            var _this = this;
            meta = util_1.object.clonePlain(meta, true);
            return this._loadAdditionalDependencies().addCallback(function () {
                return _this._prepareCreateResult(meta);
            });
        };
        Local.prototype.read = function (key, meta) {
            var _this = this;
            var data = this._getRecordByKey(key);
            if (data) {
                return this._loadAdditionalDependencies().addCallback(function () {
                    return _this._prepareReadResult(data);
                });
            } else {
                return Deferred.fail('Record with key "' + key + '" does not exist');
            }
        };
        Local.prototype.update = function (data, meta) {
            var _this = this;
            var updateRecord = function (record) {
                var idProperty = _this.getIdProperty();
                var key = idProperty ? record.get(idProperty) : undefined;
                if (key === undefined) {
                    key = randomId('k');
                    record.set(idProperty, key);
                }
                var adapter = _this._getTableAdapter();
                var index = _this._getIndexByKey(key);
                if (index === -1) {
                    adapter.add(record.getRawData());
                    if (_this._index) {
                        _this._index[key] = adapter.getCount() - 1;
                    }
                } else {
                    adapter.replace(record.getRawData(), index);
                }
                return key;
            };
            var keys = [];
            if (DataMixin_1.default.isListInstance(data)) {
                data.each(function (record) {
                    keys.push(updateRecord(record));
                });
            } else {
                keys = updateRecord(data);
            }
            return this._loadAdditionalDependencies().addCallback(function () {
                return _this._prepareUpdateResult(data, keys);
            });
        };
        Local.prototype.destroy = function (keys, meta) {
            var _this = this;
            var destroyByKey = function (key) {
                var index = _this._getIndexByKey(key);
                if (index !== -1) {
                    _this._getTableAdapter().remove(index);
                    _this._reIndex();
                    return true;
                } else {
                    return false;
                }
            };
            if (!(keys instanceof Array)) {
                keys = [keys];
            }
            for (var i = 0, len = keys.length; i < len; i++) {
                if (!destroyByKey(keys[i])) {
                    return Deferred.fail('Record with key "' + keys[i] + '" does not exist');
                }
            }
            return Deferred.success(true);
        };
        Local.prototype.query = function (query) {
            var _this = this;
            var items = this._applyFrom(query ? query.getFrom() : undefined);
            var adapter = this.getAdapter();
            var total;
            if (query) {
                items = this._applyJoin(items, query.getJoin());
                items = this._applyWhere(items, query.getWhere());
                items = this._applyOrderBy(items, query.getOrderBy());
                total = adapter.forTable(items).getCount();
                items = this._applyPaging(items, query.getOffset(), query.getLimit());
            } else if (this._$filter) {
                items = this._applyWhere(items);
            } else {
                total = adapter.forTable(items).getCount();
            }
            return this._loadAdditionalDependencies().addCallback(function () {
                return _this._prepareQueryResult({
                    items: items,
                    meta: { total: total }
                }, query);
            });
        };
        Local.prototype.merge = function (from, to) {
            var indexOne = this._getIndexByKey(from);
            var indexTwo = this._getIndexByKey(to);
            if (indexOne === -1 || indexTwo === -1) {
                return Deferred.fail('Record with key "' + from + '" or "' + to + '" does not exist');
            } else {
                this._getTableAdapter().merge(indexOne, indexTwo, this.getIdProperty());
                this._reIndex();
                return Deferred.success(true);
            }
        };
        Local.prototype.copy = function (key, meta) {
            var _this = this;
            var index = this._getIndexByKey(key);
            if (index === -1) {
                return Deferred.fail('Record with key "' + key + '" does not exist');
            } else {
                var copy_1 = this._getTableAdapter().copy(index);
                this._reIndex();
                return this._loadAdditionalDependencies().addCallback(function () {
                    return _this._prepareReadResult(copy_1);
                });
            }
        };
        Local.prototype.move = function (items, target, meta) {
            var _this = this;
            meta = meta || {};
            var sourceItems = [];
            if (!(items instanceof Array)) {
                items = [items];
            }
            var tableAdapter = this._getTableAdapter();
            var adapter = this.getAdapter();
            items.sort(function (a, b) {
                var indexa = _this._getIndexByKey(a);
                var indexb = _this._getIndexByKey(b);
                return meta.position == MOVE_POSITION.after ? indexb - indexa : indexa - indexb;
            }).forEach(function (id) {
                var index = _this._getIndexByKey(id);
                sourceItems.push(adapter.forRecord(tableAdapter.at(index)));
            });
            var targetPosition = -1;
            var targetItem = null;
            if (target !== null) {
                targetPosition = this._getIndexByKey(target);
                targetItem = adapter.forRecord(tableAdapter.at(targetPosition));
                if (targetPosition === -1) {
                    return Deferred.fail('Can\'t find target position');
                }
            }
            if (meta.position === MOVE_POSITION.on) {
                return this._hierarchyMove(sourceItems, targetItem, meta);
            }
            return this._reorderMove(sourceItems, targetItem, meta);
        };    //endregion ICrudPlus
              //region DataMixin
        //endregion ICrudPlus
        //region DataMixin
        Local.prototype._wrapToDataSet = function (data) {
            return _super.prototype._wrapToDataSet.call(this, util_1.object.clonePlain(data, true));
        };    //endregion DataMixin
              //region DataCrudMixin
        //endregion DataMixin
        //region DataCrudMixin
        Local.prototype._prepareCreateResult = function (data) {
            return DataCrudMixin_1.default._prepareCreateResult.call(this, util_1.object.clonePlain(data, true));
        };
        Local.prototype._prepareReadResult = function (data) {
            return DataCrudMixin_1.default._prepareReadResult.call(this, util_1.object.clonePlain(data, true));
        };    /**
         * Возвращает данные модели с указанным ключом
         * @param {String} key Значение ключа
         * @return {Array|undefined}
         * @protected
         */
        /**
         * Возвращает данные модели с указанным ключом
         * @param {String} key Значение ключа
         * @return {Array|undefined}
         * @protected
         */
        Local.prototype._getRecordByKey = function (key) {
            return this._getTableAdapter().at(this._getIndexByKey(key));
        };    /**
         * Возвращает индекс модели с указанным ключом
         * @param {String} key Значение ключа
         * @return {Number} -1 - не найден, >=0 - индекс
         * @protected
         */
        /**
         * Возвращает индекс модели с указанным ключом
         * @param {String} key Значение ключа
         * @return {Number} -1 - не найден, >=0 - индекс
         * @protected
         */
        Local.prototype._getIndexByKey = function (key) {
            var index = this._index[key];
            return index === undefined ? -1 : index;
        };    /**
         * Перестраивает индекс
         * @protected
         */
        /**
         * Перестраивает индекс
         * @protected
         */
        Local.prototype._reIndex = function () {
            var _this = this;
            this._index = {};
            var adapter = this.getAdapter();
            this._each(this._data, function (item, index) {
                var key = adapter.forRecord(item).get(_this._$idProperty);
                _this._index[key] = index;
            });
        };    /**
         * Применяет фильтр
         * @param {*} data Данные
         * @param {Object|Function} where Фильтр
         * @return {*}
         * @protected
         */
        /**
         * Применяет фильтр
         * @param {*} data Данные
         * @param {Object|Function} where Фильтр
         * @return {*}
         * @protected
         */
        Local.prototype._applyWhere = function (data, where) {
            var _this = this;
            where = where || {};
            if (!this._$filter && typeof where === 'object' && !Object.keys(where).length) {
                return data;
            }
            var checkFields = function (fields, item) {
                var result = true;
                for (var name in fields) {
                    if (!fields.hasOwnProperty(name)) {
                        continue;
                    }
                    result = compareValues(item.get(name), fields[name], '=');
                    if (!result) {
                        break;
                    }
                }
                return result;
            };
            var adapter = this.getAdapter();
            var tableAdapter = adapter.forTable();
            var isPredicate = typeof where === 'function';
            this._each(data, function (item, index) {
                item = adapter.forRecord(item);
                var isMatch = true;
                if (_this._$filter) {
                    isMatch = _this._$filter(item, where);
                } else {
                    isMatch = isPredicate ? where(item, index) : checkFields(where, item);
                }
                if (isMatch) {
                    tableAdapter.add(item.getData());
                }
            });
            return tableAdapter.getData();
        };    /**
         * Применяет сортировку
         * @param {*} data Данные
         * @param {Array.<WS.Data/Query/Order>} order Параметры сортировки
         * @return {*}
         * @protected
         */
        /**
         * Применяет сортировку
         * @param {*} data Данные
         * @param {Array.<WS.Data/Query/Order>} order Параметры сортировки
         * @return {*}
         * @protected
         */
        Local.prototype._applyOrderBy = function (data, order) {
            order = order || [];
            if (!order.length) {
                return data;
            }    //Создаем карту сортировки
            //Создаем карту сортировки
            var orderMap = [];
            for (var i = 0; i < order.length; i++) {
                orderMap.push({
                    field: order[i].getSelector(),
                    order: order[i].getOrder()
                });
            }    //Создаем служебный массив, который будем сортировать
            //Создаем служебный массив, который будем сортировать
            var adapter = this.getAdapter();
            var dataMap = [];
            this._each(data, function (item, index) {
                var value;
                var values = [];
                for (var i = 0; i < orderMap.length; i++) {
                    value = adapter.forRecord(item).get(orderMap[i].field);    //undefined значения не передаются в compareFunction Array.prototype.sort, и в результате сортируются непредсказуемо. Поэтому заменим их на null.
                    //undefined значения не передаются в compareFunction Array.prototype.sort, и в результате сортируются непредсказуемо. Поэтому заменим их на null.
                    values.push(value === undefined ? null : value);
                }
                dataMap.push({
                    index: index,
                    values: values
                });
            });
            var compare = function (a, b) {
                if (a === null && b !== null) {
                    //Считаем null меньше любого не-null
                    return -1;
                }
                if (a !== null && b === null) {
                    //Считаем любое не-null больше null
                    return 1;
                }
                if (a == b) {
                    return 0;
                }
                return a > b ? 1 : -1;
            };    //Сортируем служебный массив
            //Сортируем служебный массив
            dataMap.sort(function (a, b) {
                var result = 0;
                for (var index = 0; index < orderMap.length; index++) {
                    result = (orderMap[index].order ? -1 : 1) * compare(a.values[index], b.values[index]);
                    if (result !== 0) {
                        break;
                    }
                }
                return result;
            });    //Создаем новую таблицу по служебному массиву
            //Создаем новую таблицу по служебному массиву
            var sourceAdapter = adapter.forTable(data);
            var resultAdapter = adapter.forTable();
            for (var i = 0, count = dataMap.length; i < count; i++) {
                resultAdapter.add(sourceAdapter.at(dataMap[i].index));
            }
            return resultAdapter.getData();
        };    /**
         * Применяет срез
         * @param {*} data Данные
         * @param {Number} [offset=0] Смещение начала выборки
         * @param {Number} [limit] Количество записей выборки
         * @return {*}
         * @protected
         */
        /**
         * Применяет срез
         * @param {*} data Данные
         * @param {Number} [offset=0] Смещение начала выборки
         * @param {Number} [limit] Количество записей выборки
         * @return {*}
         * @protected
         */
        Local.prototype._applyPaging = function (data, offset, limit) {
            offset = offset || 0;
            if (offset === 0 && limit === undefined) {
                return data;
            }
            var dataAdapter = this.getAdapter().forTable(data);
            if (limit === undefined) {
                limit = dataAdapter.getCount();
            } else {
                limit = limit || 0;
            }
            var newDataAdapter = this.getAdapter().forTable();
            var newIndex = 0;
            var beginIndex = offset;
            var endIndex = Math.min(dataAdapter.getCount(), beginIndex + limit);
            for (var index = beginIndex; index < endIndex; index++, newIndex++) {
                newDataAdapter.add(dataAdapter.at(index));
            }
            return newDataAdapter.getData();
        };
        Local.prototype._reorderMove = function (items, target, meta) {
            var _this = this;
            var parentValue;
            if (meta.parentProperty) {
                parentValue = target.get(meta.parentProperty);
            }
            if (!meta.position && meta.hasOwnProperty('before')) {
                meta.position = meta.before ? MOVE_POSITION.before : MOVE_POSITION.after;
            }
            var tableAdapter = this._getTableAdapter();
            var targetsId = target.get(this._$idProperty);
            items.forEach(function (item) {
                if (meta.parentProperty) {
                    item.set(meta.parentProperty, parentValue);
                }
                var index = _this._getIndexByKey(item.get(_this._$idProperty));
                var targetIndex = _this._getIndexByKey(targetsId);
                if (meta.position === MOVE_POSITION.before && targetIndex > index) {
                    targetIndex--;
                } else if (meta.position === MOVE_POSITION.after && targetIndex < index) {
                    targetIndex++;
                }
                tableAdapter.move(index, targetIndex);
                _this._reIndex();
            });
            return new Deferred().callback();
        };
        Local.prototype._hierarchyMove = function (items, target, meta) {
            if (!meta.parentProperty) {
                return Deferred.fail('Parent property is not defined');
            }
            var parentValue = target ? target.get(this._$idProperty) : null;
            items.forEach(function (item) {
                item.set(meta.parentProperty, parentValue);
            });
            return new Deferred().callback();
        };
        return Local;
    }(util_1.mixin(Base_1.default, DataCrudMixin_1.default));
    exports.default = Local;
    Local.prototype._moduleName = 'Data/source:Local';
    Local.prototype['[Data/_source/Local]'] = true;    // @ts-ignore
    // @ts-ignore
    Local.prototype._$filter = null;    // @ts-ignore
    // @ts-ignore
    Local.prototype._index = null;
});