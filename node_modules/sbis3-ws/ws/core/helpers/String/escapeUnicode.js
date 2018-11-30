define('Core/helpers/String/escapeUnicode', function () {

    /**
     * Модуль, в котором описана функция <b>escapeTagsFromStr(str, tags)</b>, которая удаляет указанные тэги из строки.
     *
     * Заменяет/убирает Юникод-символы на аналогичные коды из win1251.
     *
     * Актуально до тех пор, пока БД в кодировке win1251.
     *
     * @class Core/helpers/String/escapeUnicode
     * @public
     * @author Мальцев А.А.
     */

    return function() {
        // Коды для замены utf символов аналогами из win1251
        var codeMap = {
            8210: 45,
            1105: 1105, //'ё'
            8470: 8470,  //'№'
            187: 187,//»
            171: 171//«
        };
        return function(str) {
            var L = [];
            for (var i=0; i<str.length; i++) {
                var ord = str.toString().charCodeAt(i);
                // диапозон win1251 оставляем
                if (ord < 128 || (ord >= 1025 && ord < 1104)) {
                    L.push(String.fromCharCode(ord));
                } else if(ord in codeMap) { // если код входит в таблицу codeMap
                    L.push(String.fromCharCode(codeMap[ord]));
                }
            }
            return L.join('');
        };
    }();
});