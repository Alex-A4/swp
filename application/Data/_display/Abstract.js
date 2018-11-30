/// <amd-module name="Data/_display/Abstract" />
/**
 * Абстрактная проекция данных.
 * Это абстрактный класс, не предназначенный для создания самостоятельных экземпляров.
 * @class WS.Data/Display/Abstract
 * @extends WS.Data/Entity/Abstract
 * @mixes WS.Data/Entity/OptionsMixin
 * @mixes WS.Data/Entity/ObservableMixin
 * @public
 * @author Мальцев А.А.
 */
define('Data/_display/Abstract', [
    'require',
    'exports',
    'tslib',
    'Data/type',
    'Data/util'
], function (require, exports, tslib_1, type_1, util_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Массив соответствия индексов проекций и коллекций
     */
    /**
     * Массив соответствия индексов проекций и коллекций
     */
    var displaysToCollections = [];    /**
     * Массив соответствия индексов проекций и их инстансов
     */
    /**
     * Массив соответствия индексов проекций и их инстансов
     */
    var displaysToInstances = [];    /**
     * Счетчик ссылок на singlton-ы
     */
    /**
     * Счетчик ссылок на singlton-ы
     */
    var displaysCounter = [];
    var Abstract = /** @class */
    function (_super) {
        tslib_1.__extends(Abstract, _super);    /** @lends WS.Data/Display/Abstract.prototype */
        /** @lends WS.Data/Display/Abstract.prototype */
        function Abstract(options) {
            var _this = _super.call(this, options) || this;
            type_1.OptionsMixin.call(_this, options);
            type_1.ObservableMixin.call(_this, options);
            return _this;
        }
        Abstract.prototype.destroy = function () {
            type_1.Abstract.prototype.destroy.call(this);
            type_1.ObservableMixin.prototype.destroy.call(this);
        };    //region Statics
              /**
         * Возвращает проекцию по умолчанию
         * @param {WS.Data/Collection/IEnumerable} collection Объект, для которого требуется получить проекцию
         * @param {Object} [options] Опции конструктора проекции
         * @param {Boolean} [single=false] Возвращать singleton для каждой collection
         * @return {WS.Data/Display/Abstract}
         * @static
         */
        //region Statics
        /**
         * Возвращает проекцию по умолчанию
         * @param {WS.Data/Collection/IEnumerable} collection Объект, для которого требуется получить проекцию
         * @param {Object} [options] Опции конструктора проекции
         * @param {Boolean} [single=false] Возвращать singleton для каждой collection
         * @return {WS.Data/Display/Abstract}
         * @static
         */
        Abstract.getDefaultDisplay = function (collection, options, single) {
            if (arguments.length === 2 && typeof options !== 'object') {
                single = options;
                options = {};
            }
            var index = single ? displaysToCollections.indexOf(collection) : -1;
            if (index === -1) {
                options = options || {};
                options.collection = collection;
                var instance = void 0;
                if (collection && collection['[Data/_collection/IEnum]']) {
                    instance = util_1.di.create('Data/display:Enum', options);
                } else if (collection && collection['[Data/_collection/IFlags]']) {
                    instance = util_1.di.create('Data/display:Flags', options);
                } else if (collection && collection['[Data/_collection/IEnumerable]']) {
                    instance = util_1.di.create('Data/display:Collection', options);
                } else if (collection instanceof Array) {
                    instance = util_1.di.create('Data/display:Collection', options);
                } else {
                    throw new TypeError('Argument "collection" should implement WS.Data/Collection/IEnumerable or be an instance of Array, but "' + collection + '" given.');
                }
                if (single) {
                    displaysToCollections.push(collection);
                    displaysToInstances.push(instance);
                    displaysCounter.push(1);
                }
                return instance;
            } else {
                displaysCounter[index]++;
                return displaysToInstances[index];
            }
        };    /**
         * Освобождает проекцию, которую запрашивали через getDefaultDisplay как singleton
         * @param {WS.Data/Display/Abstract} display Проекция, полученная через getDefaultDisplay с single=true
         * @return {Boolean} Ссылка на проекцию была освобождена
         * @static
         */
        /**
         * Освобождает проекцию, которую запрашивали через getDefaultDisplay как singleton
         * @param {WS.Data/Display/Abstract} display Проекция, полученная через getDefaultDisplay с single=true
         * @return {Boolean} Ссылка на проекцию была освобождена
         * @static
         */
        Abstract.releaseDefaultDisplay = function (display) {
            var index = displaysToInstances.indexOf(display);
            if (index === -1) {
                return false;
            }
            displaysCounter[index]--;
            if (displaysCounter[index] === 0) {
                displaysToInstances[index].destroy();
                displaysCounter.splice(index, 1);
                displaysToInstances.splice(index, 1);
                displaysToCollections.splice(index, 1);
            }
            return true;
        };
        return Abstract;
    }(util_1.mixin(type_1.Abstract, type_1.OptionsMixin, type_1.ObservableMixin)    /** @lends WS.Data/Display/Abstract.prototype */);
    /** @lends WS.Data/Display/Abstract.prototype */
    exports.default = Abstract;
    Abstract.prototype['[Data/_display/Abstract]'] = true;    // Deprecated
    // Deprecated
    Abstract.prototype['[WS.Data/Display/Display]'] = true;
});