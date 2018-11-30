define('Core/helpers/Hcontrol/isElementVisible', function () {
    /**
     * Модуль, в котором описана функция <b>isElementVisible(elem)</b>.
     *
     * Проверить видимость элемента
     * Метод выполняет для переданного элемента две проверки:
     * <ul>
     *    <li>Элемент находится в DOM (у него есть родитель 'html').</li>
     *    <li>У него нет невидимых родителей ('.ws-hidden').</li>
     * </ul>
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>elem</b> {jQuery} - проверяемый на видимость элемент.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * {Boolean} Видимость элемента.
     *
     * @class Core/helpers/Hcontrol/isElementVisible
     * @public
     * @author Крайнов Д.О.
     */
    return (function () {
        var invisibleRe = /\bws-hidden\b/;
        return function isElementVisibleInner(elem) {
            var classes, doc = document;

            elem = (elem && elem.jquery) ? elem[0] : elem;

            // todo это костыльное решение, потому что иногда vdom-компоненты отдают сюда не элемент, а свою ноду
            // например падает тест http://tsd-mitinau:1000/IntFieldLink4.html если открывать панель нижнего поля связи
            if (!(elem instanceof HTMLElement) && !(elem instanceof SVGElement)) {
                return false;
            }

            if (elem.wsControl && elem.wsControl.iWantVDOM) {
                return !elem.wsControl.isVisible || elem.wsControl.isVisible();
            }

            while (elem && elem.getAttribute) {
                classes = elem.getAttribute('class');
                if (classes && invisibleRe.test(classes)) {
                    break;
                }
                elem = elem.parentNode;
            }
            return elem === doc;
        }
    })();
});