/// <amd-module name="Data/_source/PrefetchProxy" />
/**
 * Источник данных, содержащий предварительно загруженные данные и возвращающий их на первый вызов любого метода чтения данных. Все последующие вызовы проксируются на целевой источник данных.
 *
 * Создадим источник с заранее загруженным результатом списочного метода:
 * <pre>
 *    require(['WS.Data/Source/PrefetchProxy', 'WS.Data/Source/Memory', 'WS.Data/Source/DataSet'], function (PrefetchProxy, MemorySource, DataSet) {
 *       var fastFoods = new PrefetchProxy({
 *          target: new MemorySource({
 *             data: [
 *                {id: 1, name: 'Kurger Bing'},
 *                {id: 2, name: 'DcMonald\'s'},
 *                {id: 3, name: 'CFK'},
 *                {id: 4, name: 'Kuicq'}
 *             ],
 *          }),
 *          data: {
 *             query: new DataSet({
 *                rawData: [
 *                   {id: 1, name: 'Mret a Panger'},
 *                   {id: 2, name: 'Cofta Cosfee'},
 *                   {id: 3, name: 'AET'},
 *                ]
 *             })
 *          }
 *       });
 *
 *       //First query will return prefetched data
 *       fastFoods.query().addCallbacks(function(spots) {
 *          spots.getAll().forEach(function(spot) {
 *             console.log(spot.get('name'));//'Mret a Panger', 'Cofta Cosfee', 'AET'
 *          });
 *       }, function(error) {
 *          console.error(error);
 *       });
 *
 *       //Second query will return real data
 *       fastFoods.query().addCallbacks(function(spots) {
 *          spots.getAll().forEach(function(spot) {
 *             console.log(spot.get('name'));//'Kurger Bing', 'DcMonald's', 'CFK', 'Kuicq'
 *          });
 *       }, function(error) {
 *          console.error(error);
 *       });
 *    });
 * </pre>
 * @class WS.Data/Source/PrefetchProxy
 * @extends WS.Data/Entity/Abstract
 * @implements WS.Data/Source/ICrud
 * @implements WS.Data/Source/ICrudPlus
 * @mixes WS.Data/Entity/OptionsMixin
 * @mixes WS.Data/Entity/SerializableMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_source/PrefetchProxy', [
    'require',
    'exports',
    'tslib',
    'Data/type',
    'Data/util',
    'Core/Deferred'
], function (require, exports, tslib_1, type_1, util_1, Deferred) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var PrefetchProxy = /** @class */
    function (_super) {
        tslib_1.__extends(PrefetchProxy, _super);
        function PrefetchProxy(options) {
            var _this = _super.call(this, options) || this;    /**
             * @cfg {WS.Data/Source/ICrud|WS.Data/Source/ICrudPlus} Целевой источник данных.
             * @name WS.Data/Source/PrefetchProxy#target
             */
            /**
             * @cfg {WS.Data/Source/ICrud|WS.Data/Source/ICrudPlus} Целевой источник данных.
             * @name WS.Data/Source/PrefetchProxy#target
             */
            _this._$target = null;    /**
             * @cfg {Object} Предварительно загруженные данные для методов чтения, определенных в интерфейсах {@link WS.Data/Source/ICrud} и {@link WS.Data/Source/ICrudPlus}.
             * @name WS.Data/Source/PrefetchProxy#data
             */
            /**
             * @cfg {Object} Предварительно загруженные данные для методов чтения, определенных в интерфейсах {@link WS.Data/Source/ICrud} и {@link WS.Data/Source/ICrudPlus}.
             * @name WS.Data/Source/PrefetchProxy#data
             */
            _this._$data = {
                /**
                 * @cfg {WS.Data/Entity/Record} Предварительно загруженные данные для метода {@link WS.Data/Source/ICrud#read}.
                 * @name WS.Data/Source/PrefetchProxy#data.read
                 */
                read: null,
                /**
                 * @cfg {WS.Data/Source/DataSet} Предварительно загруженные данные для метода {@link WS.Data/Source/ICrud#query}.
                 * @name WS.Data/Source/PrefetchProxy#data.query
                 */
                query: null,
                /**
                 * @cfg {WS.Data/Entity/Record} Предварительно загруженные данные для метода {@link WS.Data/Source/ICrud#copy}.
                 * @name WS.Data/Source/PrefetchProxy#data.copy
                 */
                copy: null
            };    /**
             * Методы, уже отдавший заранее приготовленные данные
             */
            /**
             * Методы, уже отдавший заранее приготовленные данные
             */
            _this._done = {};    //region ICrud
            //region ICrud
            _this['[Data/_source/ICrud]'] = true;    //endregion ICrud
                                                     //region ICrudPlus
            //endregion ICrud
            //region ICrudPlus
            _this['[Data/_source/ICrudPlus]'] = true;
            type_1.OptionsMixin.call(_this, options);
            type_1.SerializableMixin.constructor.call(_this);
            if (!_this._$target) {
                throw new ReferenceError('Option "target" is required.');
            }
            return _this;
        }
        PrefetchProxy.prototype.create = function (meta) {
            return this._$target.create(meta);
        };
        PrefetchProxy.prototype.read = function (key, meta) {
            if (this._$data.read && !this._done.read) {
                this._done.read = true;
                return Deferred.success(this._$data.read);
            }
            return this._$target.read(key, meta);
        };
        PrefetchProxy.prototype.update = function (data, meta) {
            return this._$target.update(data, meta);
        };
        PrefetchProxy.prototype.destroy = function (keys, meta) {
            return this._$target.destroy(keys, meta);
        };
        PrefetchProxy.prototype.query = function (query) {
            if (this._$data.query && !this._done.query) {
                this._done.query = true;
                return Deferred.success(this._$data.query);
            }
            return this._$target.query(query);
        };
        PrefetchProxy.prototype.merge = function (from, to) {
            return this._$target.merge(from, to);
        };
        PrefetchProxy.prototype.copy = function (key, meta) {
            if (this._$data.copy && !this._done.copy) {
                this._done.copy = true;
                return Deferred.success(this._$data.copy);
            }
            return this._$target.copy(key, meta);
        };
        PrefetchProxy.prototype.move = function (items, target, meta) {
            return this._$target.move(items, target, meta);
        };    //endregion ICrudPlus
              //region Base
        //endregion ICrudPlus
        //region Base
        PrefetchProxy.prototype.getOptions = function () {
            return this._$target.getOptions();
        };
        PrefetchProxy.prototype.setOptions = function (options) {
            return this._$target.setOptions(options);
        };    //endregion Base
              // region SerializableMixin
        //endregion Base
        // region SerializableMixin
        PrefetchProxy.prototype._getSerializableState = function (state) {
            state = type_1.SerializableMixin._getSerializableState.call(this, state);
            state._done = this._done;
            return state;
        };
        PrefetchProxy.prototype._setSerializableState = function (state) {
            var fromSerializableMixin = type_1.SerializableMixin._setSerializableState(state);
            return function () {
                fromSerializableMixin.call(this);
                this._done = state._done;
            };
        };
        return PrefetchProxy;
    }(util_1.mixin(type_1.Abstract, type_1.OptionsMixin, type_1.SerializableMixin));
    exports.default = PrefetchProxy;
    PrefetchProxy.prototype._moduleName = 'Data/source:PrefetchProxy';
    PrefetchProxy.prototype['[Data/_source/PrefetchProxy]'] = true;
});