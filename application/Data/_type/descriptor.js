/// <amd-module name="Data/_type/descriptor" />
/**
 * Модуль описания типа.
 * @class WS.Data/Type/descriptor
 * @public
 * @author Мальцев А.А.
 */
define('Data/_type/descriptor', [
    'require',
    'exports'
], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });    /**
     * Normalizes type name.
     */
    /**
     * Normalizes type name.
     */
    function normalizeType(type) {
        if (typeof type === 'function') {
            switch (type) {
            case Boolean:
                type = 'boolean';
                break;
            case Number:
                type = 'number';
                break;
            case String:
                type = 'string';
                break;
            }
        }
        return type;
    }    /**
     * Returns validator for certain type.
     * @name WS.Data/Type/descriptor#validate
     * @param {Function|String} type Type descriptor.
     * @returns {Function} Validator.
     */
    /**
     * Returns validator for certain type.
     * @name WS.Data/Type/descriptor#validate
     * @param {Function|String} type Type descriptor.
     * @returns {Function} Validator.
     */
    function validate(type) {
        type = normalizeType(type);
        var typeName = typeof type;
        switch (typeName) {
        case 'string':
            return function validateTypeName(value) {
                if (value === undefined || typeof value === type || value instanceof String) {
                    return value;
                }
                return new TypeError('Value "' + value + '" should be type of ' + type);
            };
        case 'function':
            return function validateTypeIntance(value) {
                // @ts-ignore
                if (value === undefined || value instanceof type) {
                    return value;
                }
                return new TypeError('Value "' + value + '" should be instance of ' + type);
            };
        case 'object':
            return function validateTypeInterface(value) {
                if (value === undefined) {
                    return value;
                }
                var mixins = value && value._mixins;
                if (mixins instanceof Array && mixins.indexOf(type) !== -1) {
                    return value;
                }
                return new TypeError('Value "' + value + '" should implement ' + type);
            };
        }
        throw new TypeError('Argument "type" should be one of following types: string, function or object but "' + typeName + '" received.');
    }    /**
     * Returns validator for required value.
     * @name WS.Data/Type/descriptor#required
     * @returns {Chained} Validator
     */
    /**
     * Returns validator for required value.
     * @name WS.Data/Type/descriptor#required
     * @returns {Chained} Validator
     */
    function required() {
        var prev = this;
        return chain(function isRequired(value) {
            if (value === undefined) {
                return new TypeError('Value is required');
            }
            return prev(value);
        });
    }    /**
     * Returns validator for "One of" restriction.
     * @name WS.Data/Type/descriptor#oneOf
     * @param {Array} values Allowed values.
     * @returns {Chained} Validator.
     */
    /**
     * Returns validator for "One of" restriction.
     * @name WS.Data/Type/descriptor#oneOf
     * @param {Array} values Allowed values.
     * @returns {Chained} Validator.
     */
    function oneOf(values) {
        if (!(values instanceof Array)) {
            throw new TypeError('Argument values should be an instance of Array');
        }
        var prev = this;
        return chain(function isOneOf(value) {
            if (value !== undefined && values.indexOf(value) === -1) {
                return new TypeError('Invalid value ' + value);
            }
            return prev(value);
        });
    }    /**
     * Returns validator for Array<T> restriction.
     * @name WS.Data/Type/descriptor#oneOf
     * @param {Function|String} type Type descriptor.
     * @returns {Chained} Validator.
     */
    /**
     * Returns validator for Array<T> restriction.
     * @name WS.Data/Type/descriptor#oneOf
     * @param {Function|String} type Type descriptor.
     * @returns {Chained} Validator.
     */
    function arrayOf(type) {
        var prev = this;
        var validator = validate(type);
        return chain(function isArrayOf(value) {
            if (value !== undefined) {
                if (!(value instanceof Array)) {
                    return new TypeError('\'Value "' + value + '" is not an Array');
                }
                var valid = void 0;
                for (var i = 0; i < value.length; i++) {
                    valid = validator(value[i]);
                    if (valid instanceof Error) {
                        return valid;
                    }
                }
            }
            return prev(value);
        });
    }    /**
     * Creates chain element with all available validators.
     * @name WS.Data/Type/descriptor#chain
     * @param {Chained} parent Previous chain element.
     * @returns {Chained} New chain element.
     */
    /**
     * Creates chain element with all available validators.
     * @name WS.Data/Type/descriptor#chain
     * @param {Chained} parent Previous chain element.
     * @returns {Chained} New chain element.
     */
    function chain(parent) {
        var _this = this;
        var wrapper = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return parent.apply(_this, args);
        };
        Object.defineProperties(wrapper, {
            required: {
                enumerable: true,
                value: required
            },
            oneOf: {
                enumerable: true,
                value: oneOf
            },
            arrayOf: {
                enumerable: true,
                value: arrayOf
            }
        });
        return wrapper;
    }    /**
     * Creates type descriptor for given value type.
     * @name WS.Data/Type/descriptor#chain
     * @param {Descriptor} type Value type.
     * @returns {Chained} Type descriptor.
     */
    /**
     * Creates type descriptor for given value type.
     * @name WS.Data/Type/descriptor#chain
     * @param {Descriptor} type Value type.
     * @returns {Chained} Type descriptor.
     */
    function descriptor(type) {
        return chain(validate(type));
    }
    exports.default = descriptor;
});