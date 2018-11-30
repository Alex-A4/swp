define('Core/helpers/i18n/wordCaseByNumber',['Core/IoC'], function() {
   /**
    *
    * Модуль, в котором описана функция <b>wordCaseByNumber(num, word0, word1, word2)</b>, которая возвращает слово в нужном падеже в зависимоси от числа.
    *
    * Параметры функции:
    * <ul>
    *     <li>{Number} num Число, стоящее перед словом.</li>
    *     <li>{String} word0 Падеж, соответствующий числу 0.</li>
    *     <li>{String} word1 Падеж, соответствующий числу 1.</li>
    *     <li>{String} word2 Падеж, соответствующий числу 2.</li>
    * </ul>
    * Пример использования:
    * <pre>
    *    require(['Core/helpers/i18n/wordCaseByNumber'], function(wordCaseByNumber) {
    *       console.log(wordCaseByNumber(10, 'рублей', 'рубль', 'рубля')); // 'рублей'
    *    });
    * </pre>
    *
    * @class Core/helpers/i18n/wordCaseByNumber
    * @public
    * @author Мальцев А.А.
    * @deprecated Используйте функцию rk (см. <a href="https://wi.sbis.ru/doc/platform/developmentapl/internalization/#word-case-by-number">Склонение слова в зависимости от числа</a>).
    * Версия WS, в которой будет удалена функция wordCaseByNumber, пока не установлена.
    */
   return function wordCaseByNumber(num, word0, word1, word2) {
      num = Math.abs(num);

      // если есть дробная часть
      if (num % 1 > 0)
         return word2;

      // если две последние цифры 11 ... 19
      num = num % 100;
      if (num >= 11 && num <= 19)
         return word0;

      // все остальные случаи - по последней цифре
      num = num % 10;

      if (num == 1)
         return word1;

      if (num == 2 || num == 3 || num == 4)
         return word2;
      else
         return word0;
   };
});
