/// <amd-module name="Data/type" />
/**
 * Библиотека типов.
 * @library Data/type
 * @includes Abstract Data/_type/Abstract
 * @includes adapter Data/_type/adapter
 * @includes descriptor Data/_type/descriptor
 * @includes factory Data/_type/factory
 * @includes format Data/_type/format
 * @includes functor Data/_type/functor
 * @includes Identity Data/_type/Identity
 * @includes ICloneable Data/_type/ICloneable
 * @includes IEquatable Data/_type/IEquatable
 * @includes IInstantiable Data/_type/IInstantiable
 * @includes IObject Data/_type/IObject
 * @includes IObservableObject Data/_type/IObservableObject
 * @includes IProducible Data/_type/IProducible
 * @includes IVersionable Data/_type/IVersionable
 * @includes Model Data/_type/Model
 * @includes Record Data/_type/Record
 * @includes relation Data/_type/relation
 * @public
 * @author Мальцев А.А.
 */
define('Data/type', [
    'require',
    'exports',
    'Data/_type/Abstract',
    'Data/_type/adapter',
    'Data/_type/CloneableMixin',
    'Data/_type/descriptor',
    'Data/_type/factory',
    'Data/_type/format',
    'Data/_type/FormattableMixin',
    'Data/_type/functor',
    'Data/_type/Identity',
    'Data/_type/ICloneable',
    'Data/_type/IEquatable',
    'Data/_type/IInstantiable',
    'Data/_type/InstantiableMixin',
    'Data/_type/IObject',
    'Data/_type/IObservableObject',
    'Data/_type/IProducible',
    'Data/_type/IVersionable',
    'Data/_type/ManyToManyMixin',
    'Data/_type/Model',
    'Data/_type/OptionsMixin',
    'Data/_type/ObservableMixin',
    'Data/_type/ReadWriteMixin',
    'Data/_type/Record',
    'Data/_type/relation',
    'Data/_type/SerializableMixin',
    'Data/_type/VersionableMixin'
], function (require, exports, Abstract_1, adapter, CloneableMixin_1, descriptor_1, factory_1, format, FormattableMixin_1, functor, Identity_1, ICloneable_1, IEquatable_1, IInstantiable_1, InstantiableMixin_1, IObject_1, IObservableObject_1, IProducible_1, IVersionable_1, ManyToManyMixin_1, Model_1, OptionsMixin_1, ObservableMixin_1, ReadWriteMixin_1, Record_1, relation, SerializableMixin_1, VersionableMixin_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    exports.Abstract = Abstract_1.default;
    exports.adapter = adapter;
    exports.CloneableMixin = CloneableMixin_1.default;
    exports.descriptor = descriptor_1.default;
    exports.factory = factory_1.default;
    exports.format = format;
    exports.FormattableMixin = FormattableMixin_1.default;
    exports.functor = functor;
    exports.Identity = Identity_1.default;
    exports.ICloneable = ICloneable_1.default;
    exports.IEquatable = IEquatable_1.default;
    exports.IInstantiable = IInstantiable_1.default;
    exports.InstantiableMixin = InstantiableMixin_1.default;
    exports.IObject = IObject_1.default;
    exports.IObservableObject = IObservableObject_1.default;
    exports.IProducible = IProducible_1.default;
    exports.IVersionable = IVersionable_1.default;
    exports.ManyToManyMixin = ManyToManyMixin_1.default;
    exports.Model = Model_1.default;
    exports.OptionsMixin = OptionsMixin_1.default;
    exports.ObservableMixin = ObservableMixin_1.default;
    exports.ReadWriteMixin = ReadWriteMixin_1.default;
    exports.Record = Record_1.default;
    exports.relation = relation;
    exports.SerializableMixin = SerializableMixin_1.default;
    exports.VersionableMixin = VersionableMixin_1.default;
});