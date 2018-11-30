define('Core/helpers/Hcontrol/getChildContainers', function () {

    /**
     * Модуль, в котором описана функция <b>getChildContainers(root, selector, correctOrder)</b>.
     *
     * Метод для поиска только "своих" элементов верстки (не отосящихся в верстке вложенных компонентов, если они есть)
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>root</b> {HTML|jQuery} - корневой элемент, в котором осуществляется поиск.</li>
     *     <li><b>[selector]</b> {String} - селектор, по кторому осуществляется поиск.</li>
     *     <li><b> [correctOrder]</b> {Function} - поменять порядок результирующего списка в зависимости от результата функции.</li>
     * </ul>
     *
     * @class Core/helpers/Hcontrol/getChildContainers
     * @public
     * @author Зуев Д.В.
     */

    return function (root, selector, correctOrder) {
        var
            topParent = root.get(0),
            components = root.find(selector),
            deadCollection = [];

        components.each(function () {
            var
                elem = this,
                p = elem;

            while ((p = p.parentNode) !== null) {
                if (p === topParent) {
                    if (correctOrder && correctOrder(elem)) {
                        deadCollection.unshift(elem);
                    } else {
                        deadCollection.push(elem);
                    }
                    break;
                }
                else if (p.getAttribute("hasMarkup") == "true" || p.localName == 'component') {
                    break;
                }
            }
        });

        return deadCollection;
    };
});