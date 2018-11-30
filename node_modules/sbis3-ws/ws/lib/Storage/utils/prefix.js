/// <amd-module name="Lib/Storage/utils/prefix" />
define("Lib/Storage/utils/prefix", ["require", "exports"], function (require, exports) {
    "use strict";
    return {
        /**
         * Добавляет префикс к строке
         * @param {String} str
         * @param {String} prefix
         * @return {String}
         */
        add: function (str, prefix) {
            return prefix && (prefix + "/" + str) || str;
        },
        /**
         * Возвращает строку без профекса
         * @param {String} str
         * @param {String} prefix
         * @return {String}
         */
        remove: function (str, prefix) {
            return prefix && this.startsWith(str, prefix) ? str.substr(prefix.length + 1) : str;
        },
        /**
         * Проверка начинается ли строка с конструкциюи вида prefix/, если передан префикс.
         * в случае отсуствия префикса вернёт true
         * @param {String} str
         * @param {String} prefix
         * @return {Boolean}
         */
        startsWith: function (str, prefix) {
            return !prefix || str.indexOf(prefix + "/") === 0;
        }
    };
});
