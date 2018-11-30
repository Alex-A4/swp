define('Core/helpers/Hcontrol/variableStorage', function() {


    /**
     * Модуль, в котором описана функция <b>variableStorage()</b>.
     *
     * Необходима для работы с хранилищем, содержашим переменные необходимые для DoT-шаблонизатора.
     *
     * @class Core/helpers/Hcontrol/variableStorage
     * @public
     * @author Шипин А.А.
     */
    var
        global = (function() { return this || (0,eval)('this') })(),
        varStorage;

    function init() {
        if (!global.wsDotVarStorage) {
            global.wsDotVarStorage = { storage: {} };
        }
        varStorage = global.wsDotVarStorage;
    }

    init();

    return /** @lends Core/helpers/Hcontrol/variableStorage.prototype */{
        /**
         * Возвращает значение из хранилища.
         * @returns {*}
         */
        getValue: function () {
            return varStorage;
        },
        /**
         * Очищает храницище.
         */
        clear: function () {
            varStorage.storage = {};
        },

        init: init

    };
});