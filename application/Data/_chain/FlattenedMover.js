/// <amd-module name="Data/_chain/FlattenedMover" />
/**
 * Передвигаемый рекурсивный указатель.
 * @author Мальцев А.А.
 */
define('Data/_chain/FlattenedMover', [
    'require',
    'exports',
    'Data/collection'
], function (require, exports, collection_1) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    var FlattenedMover = /** @class */
    function () {
        /**
         * @param {WS.Data/Collection/IEnumerator|Array} parent
         */
        function FlattenedMover(parent) {
            if (parent instanceof Array) {
                this.parent = new collection_1.ArrayEnumerator(parent);
            } else {
                this.parent = parent;
            }
        }
        FlattenedMover.prototype.getCurrent = function () {
            if (!this.hasOwnProperty('current')) {
                return undefined;
            }
            if (this.current instanceof FlattenedMover) {
                return this.current.getCurrent();
            }
            return this.current;
        };
        FlattenedMover.prototype.moveNext = function () {
            if (!this.parent) {
                return false;
            }
            if (this.hasOwnProperty('current')) {
                if (this.current instanceof FlattenedMover) {
                    var hasNext = this.current.moveNext();
                    if (hasNext) {
                        return hasNext;
                    }
                }
                delete this.current;
            }
            if (!this.hasOwnProperty('current')) {
                if (this.parent.moveNext()) {
                    this.current = this.parent.getCurrent();
                } else {
                    return false;
                }
            }
            if (this.current instanceof Array) {
                this.current = new FlattenedMover(this.current);
                return this.current.moveNext();
            }
            if (this.current && this.current['[Data/_collection/IEnumerable]']) {
                this.current = new FlattenedMover(this.current.getEnumerator());
                return this.current.moveNext();
            }
            return true;
        };
        return FlattenedMover;
    }();
    exports.default = FlattenedMover;
});