define('Core/helpers/String/escapeASCII', function() {

    /**
     *
     * Модуль, в котором описана функция <b>escapeASCII(str)</b>, которая преобразовывает HTML-сущности в символы.
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>str</b> {String} - строка для преобразования.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * {String} Преобразованная строка.
     *
     * @class Core/helpers/String/escapeASCII
     * @public
     * @author Мальцев А.А.
     */
    return function (str) {
        if (typeof str == "string") {
            var
                chars = {
                    '&minus;': '-',
                    '&nbsp;': ' ',
                    '&#92;': '\\'
                },
                chr;
            for (chr in chars) {
                str = str.replace(new RegExp(chr, 'g'), chars[chr]);
            }
        }
        return str;
    };
});