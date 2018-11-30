define('Core/helpers/Hcontrol/getElementCachedDim', function () {
    /**
     * Модуль, в котором описана функция <b>getElementCachedDim(element, dim)</b>.
     *
     * @class Core/helpers/Hcontrol/getElementCachedDim
     * @public
     * @author Зуев Д.В.
     */

    return function (element, dim) {
        var size = element.data('cachedSize');
        if (!size) {
            size = {};
            element.data('cachedSize', size);
        }
        if (!(dim in size)) {
            size[dim] = element[dim]();
        }

        return size[dim];
    };
});