/// <amd-module name="Data/collection" />
/**
 * Библиотека коллекций.
 * @library Data/collection
 * @includes ArrayEnumerator Data/_collection/ArrayEnumerator
 * @includes comparator Data/_collection/comparator
 * @includes Dictionary Data/_collection/Dictionary
 * @includes Enum Data/_collection/Enum
 * @includes factory Data/_collection/factory
 * @includes format Data/_collection/format
 * @includes Flags Data/_collection/Flags
 * @includes IBind Data/_collection/IBind
 * @includes IEnum Data/_collection/IEnum
 * @includes IFlags Data/_collection/IFlags
 * @includes IEnumerable Data/_collection/IEnumerable
 * @includes IEnumerator Data/_collection/IEnumerator
 * @includes IList Data/_collection/IList
 * @includes IndexedEnumeratorMixin Data/_collection/IndexedEnumeratorMixin
 * @includes List Data/_collection/List
 * @includes MapEnumerator Data/_collection/MapEnumerator
 * @includes ObjectEnumerator Data/_collection/ObjectEnumerator
 * @includes ObservableList Data/_collection/ObservableList
 * @includes RecordSet Data/_collection/RecordSet
 * @public
 * @author Мальцев А.А.
 */
define('Data/collection', [
    'require',
    'exports',
    'Data/_collection/ArrayEnumerator',
    'Data/_collection/comparator',
    'Data/_collection/Enum',
    'Data/_collection/EventRaisingMixin',
    'Data/_collection/factory',
    'Data/_collection/format',
    'Data/_collection/Flags',
    'Data/_collection/IBind',
    'Data/_collection/IEnum',
    'Data/_collection/IFlags',
    'Data/_collection/IEnumerable',
    'Data/_collection/IEnumerator',
    'Data/_collection/IList',
    'Data/_collection/IndexedEnumeratorMixin',
    'Data/_collection/List',
    'Data/_collection/MapEnumerator',
    'Data/_collection/ObjectEnumerator',
    'Data/_collection/ObservableList',
    'Data/_collection/RecordSet'
], function (require, exports, ArrayEnumerator_1, comparator_1, Enum_1, EventRaisingMixin_1, factory, format, Flags_1, IBind_1, IEnum_1, IFlags_1, IEnumerable_1, IEnumerator_1, IList_1, IndexedEnumeratorMixin_1, List_1, MapEnumerator_1, ObjectEnumerator_1, ObservableList_1, RecordSet_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.ArrayEnumerator = ArrayEnumerator_1.default;
    exports.comparator = comparator_1.default;
    exports.Enum = Enum_1.default;
    exports.EventRaisingMixin = EventRaisingMixin_1.default;
    exports.factory = factory;
    exports.format = format;
    exports.Flags = Flags_1.default;
    exports.IBind = IBind_1.default;
    exports.IEnum = IEnum_1.default;
    exports.IFlags = IFlags_1.default;
    exports.IEnumerable = IEnumerable_1.default;
    exports.EnumeratorCallback = IEnumerable_1.EnumeratorCallback;
    exports.IEnumerator = IEnumerator_1.default;
    exports.IList = IList_1.default;
    exports.IndexedEnumeratorMixin = IndexedEnumeratorMixin_1.default;
    exports.List = List_1.default;
    exports.MapEnumerator = MapEnumerator_1.default;
    exports.ObjectEnumerator = ObjectEnumerator_1.default;
    exports.ObservableList = ObservableList_1.default;
    exports.RecordSet = RecordSet_1.default;
});