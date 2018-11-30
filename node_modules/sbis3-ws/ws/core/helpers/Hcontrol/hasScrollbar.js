define('Core/helpers/Hcontrol/hasScrollbar', function () {

    /**
     *
     * Модуль, в котором описана функция <b>hasScrollbar(element, kind)</b>.
     *
     * Определяет, показаны ли полосы прокрутки (скроллбары) в элементе.
     * Способ не очень быстрый, но надёжный.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>element</b> {HTML|jQuery} - Элемент HTML DOM или jQuery.</li>
     *     <li><b>[kind]</b> {String} - тип полосы прокрутки (скроллбара): undefined (любой), 'x' (горизонтальный) или 'y' (вертикальный).</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * {Boolean}
     *
     * @class Core/helpers/Hcontrol/hasScrollbar
     * @public
     * @author Крайнов Д.О.
     */
   var hasScrollbar = function (element, kind) {
            var el, result = false;

            element = $(element);//это может быть DOM-объект, а не jQuery-объект
            if (element.length > 0) { //проверим, есть ли полосы прокрутки
                el = element.get(0);
                if (kind === undefined || kind === 'y') {
                    result = (el.scrollHeight !== el.clientHeight);
                }

                if (!result && (kind === undefined || kind === 'x')) {
                    result = (el.scrollWidth !== el.clientWidth);
                }
            }

            return result;
        },

        /**
        * Определяет, показана ли горизонтальная полоса прокрутки в элементе.
        * @param element - Элемент HTML DOM или jQuery.
        * @return {Boolean}
        */
        //MOVE_TO КРАЙНОВ
        horizontal = function (element) {
            return hasScrollbar(element, 'x');
        },

        /**
         * Определяет, показана ли вертикальная полоса прокрутки в элементе.
         * @param element - Элемент HTML DOM или jQuery.
         * @return {Boolean}
         */
        //MOVE_TO КРАЙНОВ
        vertical = function (element) {
            return hasScrollbar(element, 'y');
        };

    hasScrollbar.horizontal = horizontal;

    hasScrollbar.vertical = vertical;

    return hasScrollbar;

});