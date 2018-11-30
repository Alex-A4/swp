define('Core/helpers/String/ucFirst', function() {
   //SBIS3.CONTROLS.FilterHistoryControllerUntil
    /**
     * Модуль, в котором описана функция <b>ucFirst()</b>, которая для строки переводит первой символ в верхний регистр.
     *
     * <h2>Пример использования</h2>
     * <pre>
     *    require(['Core/helpers/String/ucFirst'], function(ucFirst) {
     *       console.log(ucFirst('abc'));//Abc
     *    });
     * </pre>
     * @class Core/helpers/String/ucFirst
     * @public
     * @author Мальцев А.А.
     */
   return function ucFirst() {
      var str = arguments.length ? arguments[0] : this;
      return str.substr(0, 1).toUpperCase() + str.substr(1);
   };
});
