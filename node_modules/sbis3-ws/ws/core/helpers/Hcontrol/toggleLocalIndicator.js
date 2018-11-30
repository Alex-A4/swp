define('Core/helpers/Hcontrol/toggleLocalIndicator', function () {
    /**
     * Модуль, в котором описана функция <b>toggleLocalIndicator(target, state)</b>.
     *
     * Показывает индикатор загрузки над конкретной областью.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>target</b> {jQuery} - область под индикатором.</li>
     *     <li><b>state</b> {Boolean} - состояние: скрыть / показать.</li>
     * </ul>
     *
     * @class Core/helpers/Hcontrol/toggleLocalIndicator
     * @public
     * @author Крайнов Д.О.
     */
    return function (target, state) {
        // ищем существующий индикатор
        var indicator = target.children('.ws-browser-ajax-loader').first();

        // если не нашли - создаём новый
        if (!indicator.length) {
            indicator = $('<div class="ws-browser-ajax-loader ws-hidden"><div class="ws-loading-indicator-outer">' +
                '<div class="ws-loading-indicator-block"><div class="ws-loading-indicator ws-browser-loading-indicator">' +
                '</div></div></div></div>');
            target.append(indicator);
        }

        // переключаем
        if (state) {
            indicator.removeClass('ws-hidden');
        }
        else {
            indicator.addClass('ws-hidden');
        }
    };
});