define('Core/defaultRenders', [
   'require',
   'Core/constants'
], function(
   require,
   constants
) {
    /**
     * Класс базовых функций для форматирования и проверки значений и их типов.
     * @class Core/defaultRenders
     * @public
     */
   return /** @lends Core/defaultRenders.prototype */{
      /**
       * Отображает число с добавлением нулей слева от него. Используется для приведения к виду с заданным количеством знаков.
       * @param {Number} val Число.
       * @param {Number} l Число разрядов в числе после форматирования.
       * @returns {String} Отформатированное число.
       * @example
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Core/defaultRenders'
       *        ],
       *        function(... , defaultRenders) {
       *           ...
       *
       *           // результат 00002
       *           defaultRenders.leadZero(2, 5);
       *        }
       *     );
       * </pre>
       */
      leadZero: function(val, l) {
         var s = '' + Math.floor(val);
         if (s.length < l) {
            s = '00000000000000000000000000000000'.substr(0, l - s.length) + s;
         }
         return s;
      },
      /**
       * Производит разделение триад целого числа пробелами.
       * @param {Number} val Целое число.
       * @param {Boolean} [noDelimiters = false] Признак отображения разделителей триад.
       * <ul>
       *    <li>true - не применять разделение по триадам.</li>
       *    <li>false или null - применить разделение по триадам.</li>
       * </ul>
       * @returns {String} Отформатированное число.
       * @example
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Core/defaultRenders'
       *        ],
       *        function(... , defaultRenders) {
       *           ...
       *
       *           // выведет 1 111 111
       *           defaultRenders.integer(1111111);
       *
       *           // выведет 1111111
       *           defaultRenders.integer(1111111, true)
       *        }
       *     );
       * </pre>
       */
      integer: function(val, noDelimiters) {
         try {
            val = ('' + val).trim();
         } catch (e) {
            val = '';
         }
         //пример регулярки "-000233.222px"
         var numRe = /^-?([0]*)(\d+)\.?\d*\D*$/, f;
         if (!val.match(numRe)) {
            return '0';
         }
         f = val.replace(numRe, '$2');
         return (val.substr(0, 1) == '-' ? '-' : '') + (noDelimiters ? f : f.replace(/(?=(\d{3})+$)/g, ' ').trim());
      },
      /**
       * Возвращает чекбокс с установленным/сброшенным флагом.
       * @param {Boolean} val Исходное значение.
       * @param {Boolean} [returnStr = false] Нужно ли вернуть как строку или же как jQuery (на случай использования в прикладном коде).
       * По умолчанию возвращает jQuery-объект.
       * @returns {String|jQuery} Cтрока или jQuery-объект.
       * @example
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Core/defaultRenders'
       *        ],
       *        function(... , defaultRenders) {
       *           ...
       *
       *           // вернёт "<span class="ws-browser-checkbox-logic true"></span>"
       *           defaultRenders.logic(true,true);
       *        }
       *     );
       * </pre>
       */
      logic: function(val, returnStr) {
         var className;
         if (val) {
            className = 'ws-browser-checkbox-logic-true';
         } else {
            className = 'ws-browser-checkbox-logic-false';
         }
         var str = '<span class="ws-browser-checkbox-logic ' + (className) + '"></span>';
         return returnStr ? str : $(str);
      },
      /**
       * Преображает число в формат денежной единицы.
       * @remark
       * Округляет с точностью до двух знаков после запятой, целую часть разделяет на триады пробелами.
       * Дробная часть округляется математически.
       * format: -N NNN.NN, ..., -1.00, -, 1.00, ... N NNN.NN
       * @param {Number} val Вещественное число.
       * @returns {String} {val} Форматированное вещественное число.
       * @example
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Core/defaultRenders'
       *        ],
       *        function(... , defaultRenders) {
       *           ...
       *
       *           // выведет "12 345.68"
       *           defaultRenders.money(12345.678);
       *        }
       *     );
       * </pre>
       */
      money: function(val) {
         return this.real(val, 2, true);
      },
      /**
       * Возвращает отформатированного по установленным параметрам число.
       * @param {Number|String} val Вещественное число.
       * @param {Number} integers Количество знаков до запятой.
       * @param {Boolean} delimiters Отделить ли триады пробелами.
       * @param {Number} decimals Количество знаков после запятой. Если их нет, то добавляются нули.
       * @param {Boolean} notNegative Показывать только неотрицательное значения или произвольные.
       * @param {Number} maxLength Максимальная длины текста в поле.
       * @returns {String} val Отформатированное число.
       */
      numeric: function(val, integers, delimiters, decimals, notNegative, maxLength, floor) {
         var
         // позиция точки
            dotPos,
         // позиция второй точки
            dotSec,
         // позиция 0 до точки справа
            lastZeroPos,
         // присутствует ли минус в значении
            hasMinus;

         /**
          * Разделение числа, в формате строки, на целую и дробную части может быть как через точку, так и через запятую.
          * Например 1.23 и 1,23. Чтобы не поддерживать 2 формата сведем его к одному. Будем работать через точку.
          */
         if (typeof val === 'string') {
            val = val.replace(/,/g, '.');
         }

         if ((val + '').indexOf('e') !== -1 && !isNaN(parseFloat(val + '')) && isFinite(val + '')) {
            val = val.toFixed(20);
            lastZeroPos = val.length;
            while (val.charAt(lastZeroPos - 1) === '0') {
               --lastZeroPos;
            }
            val = val.substr(0, lastZeroPos);
         }
         val = ('' + val);
         // Вырезаем все кроме чисел.
         val = val.replace(notNegative ? /[^0-9\.]/g : /[^0-9\.\-]/g, '');

         dotPos = val.indexOf('.');
         dotSec = val.indexOf('.', dotPos + 1);
         hasMinus = /\-/.test(val) ? 1 : 0;
         if (dotSec !== -1) {
            val = val.substring(0, dotSec);
         }
         if (dotPos === val.length - 1) {
            val = val.substr(0, val.length - 1);
            dotPos = -1;
         }
         if (!/^\-?[0-9]*(\.[0-9]*)?$/.test(val)) {
            val = '';
         }
         if (val === '' || val === null) { // все нумерик поля кроме денег могут иметь значение null
            val = null;
         } else {
            if (integers >= 0) {
               if (dotPos === -1) {
                  dotPos = val.length;
               }
               if (integers + hasMinus < dotPos) {
                  val = val.substring(0, integers + hasMinus) + val.substr(dotPos);
               }
               dotPos = val.indexOf('.');
            }
            if (decimals < 0) {
               val = dotPos === -1
                  ? this.integer(val, !delimiters)
                  : [
                  this.integer(val.substring(0, dotPos), !delimiters),
                  val.substr(dotPos)
               ].join('');
            } else {
               val = val.substr(0, maxLength && !delimiters ? maxLength : val.length);
               val = this.real(val, decimals, delimiters, floor);
            }
         }
         return val;
      },
      /**
       * Возвращает отформатированное вещественное число.
       * @param {Number} val Вещественное число.
       * @param {Number} decimals Количество знаков после запятой. Если их нет, то устанавливают нули.
       * @param {Boolean} delimiters Отделить ли триады пробелами.
       * @param {Boolean} floor Обрезать дробную часть, если false - будет округлена.
       * @returns {String} val Отформатированное вещественное число.
       * @example
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Core/defaultRenders'
       *        ],
       *        function(... , defaultRenders) {
       *           ...
       *
       *           // выведет "2 564.00"
       *           defaultRenders.real(2564, 2, true);
       *        }
       *     );
       * </pre>
       */
      real: function(val, decimals, delimiters, floor) {
         decimals = decimals === undefined ? 0 : decimals;
         var dotPos = (val = (val + "")).indexOf(".");
         var firstPart = val;

         if (dotPos != -1) {
            firstPart = val.substring(0, dotPos);
         }

         // Получаем математическое округление дробной части
         var
            parsedVal = dotPos != -1 ? val.substr(dotPos) : 0,
            isNegative = firstPart.indexOf('-') !== -1,
            weNeedDecimals;
         if (parsedVal == '.') {
            parsedVal = '.0';
         }
         if (floor && parseFloat(parsedVal) != 0) {
            weNeedDecimals = parseFloat((parsedVal + '00000000000000000000000000000000').substr(0, decimals+1)).toFixed(decimals);
         } else {
            weNeedDecimals = parseFloat(parsedVal).toFixed(decimals);
         }
         if (weNeedDecimals == 1) {
            firstPart = parseInt(firstPart, 10);
            firstPart = isNegative ? firstPart - 1 : firstPart + 1;
         }
         weNeedDecimals = weNeedDecimals.replace(/.+\./, "");

         // Если передано значение без точки или нам нужна только целая часть
         if (decimals === 0) {
            return this.integer(firstPart, !delimiters);
         }

         var buffer = [];
         buffer.push(this.integer(firstPart, !delimiters));
         buffer.push('.');
         buffer.push(weNeedDecimals);
         return buffer.join('');
      },
      /**
       * Отображает любое число в виде вещественного с 3 знаками после запятой.
       * @remark
       * Может использоваться для перевода из миллисекунд в секунды и других целей.
       * В результате перевода всегда будут 3 знака после запятой, если их нет - устанавливаются нули.
       * Например, 20000 = 20,000.
       * При делении округляет в меньшую сторону, например, 2,65 = 0,002.
       * @param {Number} val Вещественное число.
       * @returns {String} Возвращает строку.
       * @example
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Core/defaultRenders'
       *        ],
       *        function(... , defaultRenders) {
       *           ...
       *
       *           // выведет 123.456
       *           defaultRenders.timer(123456);
       *        }
       *     );
       * </pre>
       */
      timer: function(val) {
         return Math.floor(val / 1000) + "." + this.leadZero(val % 1000, 3);
      },
      /**
       * Отображает объект Date строкой вида 'DD.MM.YY HH:MM:SS'
       * @remark
       * Месяцы нумеруются с 0 по 11. 0 - январь, 11 - декабрь.
       * @param {Date} date Объект даты.
       * @param {String} [type] Возможные значения: "Дата", "Время", "Дата и время".
       * @param {Boolean|Object} [prec] Устанавливает точность.
       * <ul>
       *    <li>true - время с секундами и миллисекундами.</li>
       *    <li>{precision: 'sec'} - только с секундами.</li>
       *    <li>{precision: 'msec'} - с секундами и миллисекундами.</li>
       *    <li>{precision: 'min'} - только с минутами.</li>
       *    <li>что-то другое - только с секундами.</li>
       * </ul>
       * @returns {String} Возвращает строку.
       * @example
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Core/defaultRenders'
       *        ],
       *        function(... , defaultRenders) {
       *           ...
       *
       *           // выведет "07.11.13 09:27:00.001"
       *           defaultRenders.timestamp(new Date(2013,10,7,9,27,0,1), "Дата и время", true);
       *        }
       *     );
       * </pre>
       */
      timestamp : function(date, type, prec){
         var retval = "";
         if (typeof prec == 'object' && 'precision' in prec) {
            prec = prec.precision;
         } else if (prec === true) {
            prec = 'msec';
         } else {
            prec = 'sec';
         }

         if(date instanceof Date){
            if (type == 'Дата') {
               retval = date.strftime(constants.Date.masks.date);
            } else if (type == 'Время') {
               retval = date.strftime(constants.Date.masks[prec]);
            } else if (type == 'Дата и время') {
               retval = date.strftime(constants.Date.masks.date) + ' ' + date.strftime(constants.Date.masks[prec]);
            }
         } else {
            retval = "&minus;";
         }
         return retval;
      },
      /**
       * Возвращает установленное значение для данных типа "Перечисляемое".
       * @param {Deprecated/Enum} iEnum Набор доступных значений.
       * @returns {String} Возвращает строковое значение, соответствующее переданному экземпляру.
       * @example
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Deprecated/Enum',
       *           'Core/defaultRenders'
       *        ],
       *        function(... , Enum, defaultRenders) {
       *           ...
       *
       *           var myEnum = new Enum({
       *               availableValues: {
       *                  "0" : "синий",
       *                  "1" : "красный",
       *                  "2" : "белый"
       *               }
       *           });
       *           myEnum.set("1");
       *
       *           // выведет "красный"
       *           defaultRenders.enumType(myEnum);
       *        }
       *     );
       * </pre>
       */
      enumType: function(iEnum) {
         var Enum = require.defined('Deprecated/Enum') ? require('Deprecated/Enum') : null;
         if (Enum && (iEnum instanceof Enum)) {
            var value = iEnum.getCurrentValue();
            if (value === null) {
               return '';
            }
            return iEnum.getValues()[iEnum.getCurrentValue()];
         }
         return '';
      },
      /**
       * Возвращает строку из именами логических полей из записи, для которых значение установлено в true.
       * @param {Deprecated/Record} record Запись, флаги передаются именно в таком виде.
       * @returns {string} Возвращает строку, имена полей перечислены через запятую.
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Deprecated/Record',
       *           'Core/defaultRenders'
       *        ],
       *        function(... , Record, defaultRenders) {
       *           ...
       *
       *           var record = new Record({
       *              colDef: [{
       *                 "n": "Первое",
       *                 "t": "Логическое"
       *              },{
       *                "n": "Второе",
       *                "t": "Логическое"
       *              },{
       *                "n": "Третье",
       *                "t": "Логическое"
       *              }],
       *              row: [true, false, true]
       *           });
       *
       *           // выведет "Первое, Третье"
       *           defaultRenders.flags(record);
       *        }
       *     );
       * </pre>
       */
      flags: function(record) {
         var res = [];
         record.each(function(title, value) {
            if (value) {
               res.push(title);
            }
         });
         if (res.length) {
            return res.join(', ');
         }
         return "&minus;";
      },
      /**
       * Проверяет: является ли значение строковым.
       * @param {String} type Тип данных.
       * @returns {Boolean} true, если передано строковое значение.
       * @example
       * <pre>
       *     define('SBIS3.MyArea.MySite',
       *        [
       *           ... ,
       *           'Core/defaultRenders'
       *        ],
       *        function(... , defaultRenders) {
       *           ...
       *
       *           defaultRenders.isText("xid"); // выведет "false"
       *        }
       *     );
       * </pre>
       */
      isText: function(type) {
         return type.indexOf('char') !== -1 || type == 'text';
      }
   }
});
