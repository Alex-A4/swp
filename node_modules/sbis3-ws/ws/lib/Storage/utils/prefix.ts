/// <amd-module name="Lib/Storage/utils/prefix" />

export = {
    /**
     * Добавляет префикс к строке
     * @param {String} str
     * @param {String} prefix
     * @return {String}
     */
    add(str: string, prefix: string): string {
        return prefix && (prefix + "/" + str) || str;
    },
    /**
     * Возвращает строку без профекса
     * @param {String} str
     * @param {String} prefix
     * @return {String}
     */
    remove(str: string, prefix: string) : string {
        return prefix && this.startsWith(str, prefix) ? str.substr(prefix.length + 1) : str;
    },
    /**
     * Проверка начинается ли строка с конструкциюи вида prefix/, если передан префикс.
     * в случае отсуствия префикса вернёт true
     * @param {String} str
     * @param {String} prefix
     * @return {Boolean}
     */
    startsWith(str: string, prefix: string): boolean {
        return !prefix || str.indexOf(prefix + "/") === 0;
    }
}