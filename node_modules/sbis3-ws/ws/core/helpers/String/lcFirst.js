define('Core/helpers/String/lcFirst', function() {
    /**
     * Модуль, в котором описана функция <b>lcFirst()</b>, которая в строке переводит первой символ в нижний регистр.
     *
     * <h2>Пример использования</h2>
     * <pre>
     *    require(['Core/helpers/String/lcFirst'], function(lcFirst) {
     *       console.log(lcFirst('ABC'));//aBC
     *    });
     * </pre>
     * @class Core/helpers/String/lcFirst
     * @public
     * @author Мальцев А.А.
     */
    return function lcFirst() {
       var str = arguments.length ? arguments[0] : this;
      return str.substr(0, 1).toLowerCase() + str.substr(1);
   };
});
