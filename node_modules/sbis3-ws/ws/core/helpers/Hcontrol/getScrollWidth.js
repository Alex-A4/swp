define('Core/helpers/Hcontrol/getScrollWidth', function () {

    //TODO Должен будет переехать в CONTROLS.
    /**
     * Модуль, в котором описана функция <b>getScrollWidth()</b>.
     *
     * Вычисляет ширину скроллбара в текущем браузере
     *
     * @class Core/helpers/Hcontrol/getScrollWidth
     * @public
     * @author Крайнов Д.О.
     */
    var getScrollWidth = function () {
        if (document && document.body) {
            var div = document.createElement('div');
            div.style.cssText = "position:absolute;height:50px;overflow-y:scroll;visibility:hidden";
            div.innerHTML = '<div style="height:100px"></div>';

            document.body.appendChild(div);
            //Переписал расчет ширины скролла, чтобы работал на 4к мониторах с масштабированием
            //Когда на div была указана явно ширина - скролл был на пиксель меньше чем нужно
            var scrollWidth = div.offsetWidth - div.clientWidth;
            document.body.removeChild(div);

            getScrollWidth = function () {
                return scrollWidth;
            };
            return scrollWidth;
        } else if (!document) {
            throw new Error(rk('Ошибка: функция $ws.helpers.getScrollWidth вызвана на сервере. Она должна вызываться только в клиентском браузере'));
        } else {
            throw new Error(rk('Ошибка: функция $ws.helpers.getScrollWidth вызвана на клиентском браузере, однако body ещё не готово'));
        }
    };

    return getScrollWidth;
});