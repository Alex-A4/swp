define('Core/helpers/Hcontrol/mergeAttributes', function () {
    /**
     * Модуль, в котором описана функция <b>mergeAttributes()</b>.
     *
     * Мержит набор строк, переданных в аргументах, рассматривая их как значения, разделенные пробелами
     * Функция дял слияния таких DOM-аттрибутов как class.
     *
     * <h2>Возвращает</h2>
     * {Array}
     *
     * @class Core/helpers/Hcontrol/mergeAttributes
     * @public
     * @author Шипин А.А.
     */

    return function () {
        var
            args = arguments,
            unfilteredList, prev = null;
        unfilteredList = Object.keys(args).map(function(index) {
            return (args[index] || '').trim().split(/\s+/);
        });
        unfilteredList = Array.prototype.concat.apply([], unfilteredList).sort();

        return unfilteredList.filter(function (item) {
            var check = item !== prev;
            prev = item;
            return check;
        });
    };
});
