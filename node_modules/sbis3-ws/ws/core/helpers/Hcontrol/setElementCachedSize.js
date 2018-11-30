define('Core/helpers/Hcontrol/setElementCachedSize', function () {

    /**
     * Модуль, в котором описана функция <b>setElementCachedSize(element, size)</b>.
     *
     * @class Core/helpers/Hcontrol/setElementCachedSize
     * @public
     * @author Зуев Д.В.
     */

    return function (element, size) {
        var cachedSize = element.data('cachedSize');
        if (!cachedSize || cachedSize.width !== size.width || cachedSize.height !== size.height) {
            element.data('cachedSize', size);
            element.css(size);
        }
    };
});