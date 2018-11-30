define('Core/helpers/i18n/moneyToWritten', function() {
   var DIGITS = {
         '0': '',
         '1': 'один',
         '2': 'два',
         '3': 'три',
         '4': 'четыре',
         '5': 'пять',
         '6': 'шесть',
         '7': 'семь',
         '8': 'восемь',
         '9': 'девять',
         '10': 'десять',
         '11': 'одиннадцать',
         '12': 'двенадцать',
         '13': 'тринадцать',
         '14': 'четырнадцать',
         '15': 'пятнадцать',
         '16': 'шестнадцать',
         '17': 'семнадцать',
         '18': 'восемнадцать',
         '19': 'девятнадцать'
      },
      DIGITS_F = {
         '1': 'одна',
         '2': 'две'
      },
      DOZENS = {
         '2': 'двадцать',
         '3': 'тридцать',
         '4': 'сорок',
         '5': 'пятьдесят',
         '6': 'шестьдесят',
         '7': 'семьдесят',
         '8': 'восемьдесят',
         '9': 'девяносто'
      },
      HUNDREDS = {
         '0': '',
         '1': 'сто',
         '2': 'двести',
         '3': 'триста',
         '4': 'четыреста',
         '5': 'пятьсот',
         '6': 'шестьсот',
         '7': 'семьсот',
         '8': 'восемьсот',
         '9': 'девятьсот'
      },
      PLURALS = {
         0: {'0': '', '1': '', '2': ''},
         1: {'0': 'тысяч', '1': 'тысяча', '2': 'тысячи'},
         2: {'0': 'миллионов', '1': 'миллион', '2': 'миллиона'},
         3: {'0': 'миллиардов', '1': 'миллиард', '2': 'миллиарда'},
         4: {'0': 'триллионов', '1': 'триллион', '2': 'триллиона'},
         5: {'0': 'квадриллионов', '1': 'квадриллион', '2': 'квадриллиона'},
         6: {'0': 'квинтиллионов', '1': 'квинтиллион', '2': 'квинтиллиона'},
         7: {'0': 'сикстиллионов', '1': 'сикстиллион', '2': 'сикстиллиона'},
         8: {'0': 'септиллионов', '1': 'септиллион', '2': 'септиллиона'},
         9: {'0': 'октиллионов', '1': 'октиллион', '2': 'октиллиона'},
         10: {'0': 'нониллионов', '1': 'нониллион', '2': 'нониллиона'},
         11: {'0': 'дециллионов', '1': 'дециллион', '2': 'дециллиона'}
      },

      /**
       *
       * @param {Number} value
       * @param {Boolean} [feminine=false] Женский род
       * @returns {String}
       */
      numberToWritten999 = function (value, feminine) {
         var digits = DIGITS,
            h,
            d;

         if (feminine) {
            digits = Object.create(DIGITS);
            digits['1'] = DIGITS_F['1'];
            digits['2'] = DIGITS_F['2'];
         }
         d = value % 100;
         d = d <= 19 ? digits[d] : DOZENS[Math.floor(d / 10)] + (d % 10 ? ' ' : '') + digits[d % 10];
         h = HUNDREDS[Math.floor(value / 100)];
         if (h && d) {
            h += ' ';
         }

         return h + d;
      },

      /**
       *
       * @param {Number} value
       * @returns {Number}
       */
      chooseNumericEndingType = function (value) {
         var fst = Math.abs(value % 10),
            sec = Math.abs(value % 100);

         if (fst === 0 || fst >= 5 || sec >= 11 && sec <= 19) {
            return 0;
         }
         if (fst === 1) {
            return 1; // 11 excluded
         }
         return 2;
      },

      /**
       *
       * @param {Number} numAsStr
       * @param {Boolean} [feminine=false] Женский род
       * @param {Boolean} [allowMinus=false]
       * @returns {String}
       */
      numberToWritten = function (numAsStr, feminine, allowMinus) {
         allowMinus = allowMinus || true;
         var result = '',
            i = 0,
            three, writning, negative;
         if (numAsStr.charAt(0) === '-') {
            if (allowMinus) {
               negative = true;
               numAsStr = numAsStr.slice(1);
            }
            else {
               return 'ОШИБКА';
            }
         }
         if (parseInt(numAsStr, 10) === 0) {
            return 'ноль';
         }
         if (isNaN(numAsStr)) {
            return 'ОШИБКА';
         }
         if ('' === numAsStr) {
            return '';
         }
         while (numAsStr.length > 0) {
            three = parseInt(numAsStr.substr(Math.max(numAsStr.length - 3, 0), 3), 10);
            var ct = chooseNumericEndingType(three);
            writning = PLURALS[i] && PLURALS[i][ct] ? ' ' + PLURALS[i][ct] : '';

            if (three > 0) {
               if (i && writning === '') {
                  return 'ОШИБКА'; // Слишком много разрядов
               }
               result = numberToWritten999(three, i === 1 || feminine) + writning + (result ? ' ' + result : '');
            }
            numAsStr = numAsStr.slice(0, -3);
            i++;
         }
         if (negative) {
            result = 'минус ' + result;
         }
         return result;
      };

   /**
    *
    * Модуль, в котором описана функция <b>moneyToWritten(numAsStr,short)</b>, которая используется для перевода числа или денежного значения из его цифрового представления в строковое (словесное).
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *     <li>numAsStr (String) - число. Диапазон значений параметра:
    *         <ul>
    *             <li>от 0 до 999999999999999 - целая часть;</li>
    *             <li>от 0 .. 99 дробная часть (если есть еще дробные знаки, то они отбрасываются).</li>
    *         </ul>
    *         Целая или дробная часть могут отсутствовать.
    *     </li>
    *     <li>short (Boolean) - cокращать до 'руб' 'коп' или без сокращений ('рубли' 'копейки'). По умолчанию false.</li>
    * </ul>
    *
    * <h2>Пример использования</h2>
    * <pre>
    *    require(['Core/helpers/i18n/moneyToWritten'], function(moneyToWritten) {
    *       var num = '673453453535.567';
    *       console.log(moneyToWritten(num));//'шестьсот семьдесят три миллиарда четыреста пятьдесят три миллиона четыреста пятьдесят три тысячи пятьсот тридцать пять рублей пятьдесят шесть копеек'
    *       console.log(moneyToWritten(num, true));//'шестьсот семьдесят три миллиарда четыреста пятьдесят три миллиона четыреста пятьдесят три тысячи пятьсот тридцать пять руб пятьдесят шесть коп'
    *    });
    * </pre>
    *
    * @class Core/helpers/i18n/moneyToWritten
    * @public
    * @author Мальцев А.А.
    */
   return function moneyToWritten(numAsStr, short) {
      // если short = true, то тоже самое что и moneyToWritten, но сокращенно аббревиатуры руб и коп.
      // если short = false или не указана, то полностью, например, рублей и копеек.
      // Все операции проводим со строками, чтобы можно было оперировать с большими числами
      numAsStr = (numAsStr + '').replace(/\s/g, '');
      if (isNaN(numAsStr) || !numAsStr.match(/^[-0-9.]*$/)) {
         return 'ОШИБКА';
      }
      if ('' === numAsStr) {
         return '';
      }
      var
         arr = (numAsStr + '').split('.'),
         rub = arr[0] || '0',
         kop = arr[1] || '00',
         rubles = {'0': 'рублей', '1': 'рубль', '2': 'рубля'},
         kopeks = {'0': 'копеек', '1': 'копейка', '2': 'копейки'},
         rubR, kopR, result;
      if (rub === '-') {
         rub = '-0';
      }
      if (kop.length === 1) {
         kop += '0';
      }
      if (kop.length > 2) {
         // rounding
         var flow = kop.charAt(2);
         kop = kop.substr(0, 2);
         if (flow >= '5') {
            kop = parseInt(kop, 10) + 1 + '';
            if (kop.length === 1) {
               kop = '0' + kop;
            }
            if (kop === '100') {
               kop = '00';
               if (rub === '') {
                  rub = 1;
               }
               var pos = rub.length - 1, after = '';
               while (true) {// eslint-disable-line no-constant-condition
                  if (pos < 0 || isNaN(parseInt(rub.charAt(pos), 10))) {
                     after = (pos >= 0 ? rub.substr(0, pos + 1) : '') + '1' + after;
                     break;
                  }
                  else if (rub.charAt(pos) === '9') {
                     after = '0' + after;
                     pos--;
                  }
                  else {
                     after = rub.substr(0, pos) + (parseInt(rub.charAt(pos), 10) + 1) + after;
                     break;
                  }
               }
               rub = after;
            }
         }
      }

      rubR = numberToWritten(rub);
      if (rubR === 'ОШИБКА') {
         return 'ОШИБКА';
      }
      rubR = rubR || 'ноль';
      rubR += ' ' + (short ? 'руб' : rubles[chooseNumericEndingType(parseInt(rub.substr(Math.max(0, rub.length - 2), 2), 10))]);
      kopR = ' ' + kop + ' ' + (short ? 'коп' : kopeks[chooseNumericEndingType(parseInt(kop, 10))]);
      if (parseInt(kop.substr(0, 2), 10) > 0 && rub.charAt(0) === '-' && rubR.charAt(0) !== 'м') {
         rubR = 'минус ' + rubR; // так как 0 рублей, то минус не прописался
      }
      result = rubR + kopR;
      result = result.charAt(0).toUpperCase() + result.substr(1);
      return result;
   };
});
