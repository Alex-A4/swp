define('Core/helpers/Hcontrol/isScrollable', function () {

    /**
     * Модуль, в котором описана функция <b>isScrollable(element, kind)</b>.
     *
     * Определяет, разрешена ли прокрутка (скроллбары) в элементе (по свойствам overflow/overflow-x/y).
     * При isScrollable === false прокрутки при вылезании содержимого элемента за его границы не будет.
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
     * @class Core/helpers/Hcontrol/isScrollable
     * @public
     * @author Крайнов Д.О.
     */
    return function (element, kind) {
        var el = $(element);

        function isOxScrollable() {
            var overflowX = el.css('overflow-x');
            return overflowX === 'auto' || overflowX === 'scroll';
        }
        function isOyScrollable() {
            var overflowY = el.css('overflow-y');
            return overflowY === 'auto' || overflowY === 'scroll';
        }

        if (kind === 'x') {
            return isOxScrollable();
        } else if (kind === 'y') {
            return isOyScrollable();
        } else {
            return isOxScrollable() || isOyScrollable();
        }
    };
});