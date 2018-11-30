define('Core/helpers/String/escapeTagsFromStr', function () {

    /**
     * Модуль, в котором описана функция <b>escapeTagsFromStr(str, tags)</b>, которая удаляет указанные тэги из строки.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *    <li>{String} str Строка для преобразования.</li>
     *    <li>{Array|String} tags Массив тэгов, которые необходимо убрать из строки.</li>
     * </ul>
     *
     * @class Core/helpers/String/escapeTagsFromStr
     * @public
     * @author Мальцев А.А.
     */
    //SBIS3.CORE.FieldLabel, Deprecated/Controls/FieldLink/FieldLink, Deprecated/Controls/FilterButton/FilterButton, Deprecated/Controls/FilterButton/plugins/RequestHistory-plugin, Deprecated/Controls/HierarchyViewAbstract/HierarchyViewAbstract,
    // Lib/Control/Infobox/Infobox, Lib/Control/LoadingIndicator/LoadingIndicator, Deprecated/Controls/Menu/Menu, Deprecated/Controls/NavigationPanel/NavigationPanel, Deprecated/Controls/SimpleDialogAbstract/SimpleDialogAbstract, Deprecated/Controls/TabButtons/TabButtons, Deprecated/Controls/TableView/TableView, Deprecated/Controls/TableView/plugins/AtPlaceEdit-plugin

    return function () {
        var reCache = {};

        return function (str, tags) {
            var tagString, re;
            if (typeof tags == 'string')
                tags = [tags];
            if (typeof str == 'string' && tags instanceof Array) {
                tagString = tags.join('|');
                re = reCache[tagString] || (reCache[tagString] = new RegExp('<(?=\/*(?:' + tagString + '))[^>]+>', 'ig'));
                re.lastIndex = 0;
                str = str.replace(re, '');
            }
            return str;
        }
    }();

});
