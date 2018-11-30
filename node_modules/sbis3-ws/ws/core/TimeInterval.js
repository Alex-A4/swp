define('Core/TimeInterval', ['Core/core-clone'], function(coreClone) {
   //MOVE_TO МАЛЦЬЕВ
   /**
    * Реализация объекта "Временной интервал".
    *
    * "Временной интервал" предназначен для хранения относительного временного промежутка, т.е. начало и окончание которого
    * не привязано к конкретным точкам во времени. Он может быть использован для хранения времени выполнения какого-либо
    * действия или для хранения времени до наступления события. При установке значения переменной данного типа, сохраняется
    * только дельта. При этом нужно учитывать, что интервал нормализует значения. В результате, интервал в 1 день, 777 часов,
    * 30 минут будет преобразован в интервал равный 33-м дням, 9 часам, 30 минутам, и будет сохранён именно в таком формате.
    * Формат ISO 8601 урезан до дней. Причина в том, что в случае использования месяцев и лет возникает неоднозначность. В итоге,
    * строковой формат выглядит так:
    * P[<Число_недель>W][<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S]
    *
    * @class Core/TimeInterval
    * @public
    * @author Бегунов А.В.
    */
   var
      millisecondsInSecond = 1000,
      millisecondsInMinute = 60000,
      millisecondsInHour = 3600000,
      millisecondsInDay = 86400000,
      secondsInMinute = 60,
      minutesInHour = 60,
      hoursInDay = 24,
      intervalKeys = ['days', 'hours', 'minutes', 'seconds', 'milliseconds'],
      millisecondsConst = {
         days: millisecondsInDay,
         hours: millisecondsInHour,
         minutes: millisecondsInMinute,
         seconds: millisecondsInSecond,
         milliseconds: 1
      },
      regExesArrayForParsing = [
         {
            regExp: /^P(?:(-?[0-9]+)D)?(?:T(?:(-?[0-9]+)H)?(?:(-?[0-9]+)M)?(?:(-?[0-9]+(?:\.[0-9]{0,3})?)[0-9]*S)?)?$/i,
            format: 'P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S]'
         }
      ],
      regExesArrayForValidation = [
         {
            regExp: /^P(-?[0-9]+D)?(T(-?[0-9]+H)?(-?[0-9]+M)?(-?[0-9]+(\.[0-9]+)?S)?)?$/i,
            format: 'P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S]'
         }
      ];

   // вспомогательные функции
   function getAvailableFormats() {
      var formats = [];

      for (var i = 0; i < regExesArrayForValidation.length; i++) {
         formats[i] = regExesArrayForValidation[i].format;
      }

      return formats.join(', ');
   }

   function toNumber(number) {
      return parseFloat(number) || 0;
   }

   function truncate(number) {
      return number > 0
         ? Math.floor(number)
         : Math.ceil(number);
   }

   // нужно учитывать, что данный метод округляет число
   function toFixedNumber(number, fractionDigits) {
      return toNumber(toNumber(number).toFixed(fractionDigits));
   }

   function fromIntervalStrToIntervalArray(intervalStr) {
      var
         intervalArray = [],
         regexResult,
         validatorIndex;

      if (!isValidStrInterval(intervalStr)) {
         throw new Error(rk('Передаваемый аргумент не соответствует формату ISO 8601. Допустимые форматы') + ': ' + getAvailableFormats() + '. ');
      }

      for (validatorIndex = 0; validatorIndex < regExesArrayForParsing.length; validatorIndex++) {
         if ((regexResult = regExesArrayForParsing[validatorIndex].regExp.exec(intervalStr))) {
            break;
         }
      }

      switch (validatorIndex) {
         case 0:
            // i = 1 - исключаем первый элемент из перебора, так как это всего лишь строка intervalStr
            for (var i = 1; i < regexResult.length; i++) {
               // если секунды
               if (i === (regexResult.length - 1)) {
                  // секунды
                  intervalArray.push(truncate(regexResult[i]));
                  // миллисекунды
                  intervalArray.push(toFixedNumber((regexResult[i] % 1) * 1000));
               } else {
                  intervalArray.push(toNumber(regexResult[i]));
               }
            }
      }

      return intervalArray;
   }

   function fromIntervalArrayToIntervalObj(intervalArray) {
      var intervalObj = {};

      for (var i = 0; i < intervalKeys.length; i++) {
         intervalObj[intervalKeys[i]] = toNumber(intervalArray[i]);
      }

      return intervalObj;
   }

   function fromIntervalObjToMilliseconds(intervalObj) {
      var milliseconds = 0;
      for (var key in millisecondsConst) {
         if (millisecondsConst.hasOwnProperty(key)) {
            var
               val = millisecondsConst[key];
            milliseconds += val * toNumber(intervalObj[key]);
         }
      }
      return milliseconds;
   }

   function fromMillisecondsToNormIntervalObj(milliseconds) {
      var normIntervalObj = {};
      for (var key in millisecondsConst) {
         if (millisecondsConst.hasOwnProperty(key)) {
            var
               val = millisecondsConst[key];
            normIntervalObj[key] = truncate(milliseconds / val);
            milliseconds = milliseconds % val;
         }
      }
      return normIntervalObj;
   }

   // преобразует нормализованный объект в нормализованную строку: {days: 1, hours: 2, minutes: 3, seconds: 4, milliseconds: 5} => "P1DT2H3M4.005S"
   function fromNormIntervalObjToNormIntervalStr(normIntervalObj) {
      var secondsWithMilliseconds = toFixedNumber(normIntervalObj.seconds + normIntervalObj.milliseconds / 1000, 3);

      return 'P' + normIntervalObj.days + 'D' + 'T' + normIntervalObj.hours + 'H' + normIntervalObj.minutes + 'M' + secondsWithMilliseconds + 'S';
   }

   function isValidStrInterval(intervalStr) {
      for (var i = 0; i < regExesArrayForValidation.length; i++) {
         if (regExesArrayForValidation[i].regExp.test(String(intervalStr))) {
            return true;
         }
      }
      return false;
   }

   function isInteger(number) {
      if (typeof number === 'number' && (number % 1) === 0) {
         return true
      }

      return false
   }

   // вызывать с помощью call или apply
   function dateModifier(sign, date) {
      if (!(date instanceof Date)) {
         throw new Error(rk('Передаваемый аргумент должен быть объектом класса Date'));
      }

      date = new Date(date.getTime());

      date.setTime(date.getTime() + sign * this.getTotalMilliseconds());

      return date;
   }

   /**
    * Конструктор.
    *
    * @param {Core/TimeInterval | String | Array | Object | Number} source - Может быть: строка - “P20DT3H1M5S”, массив - [5, 2, 3, -4], объект - {days: 1, minutes: 5}, число – 6 или объект типа Core/TimeInterval. Если передается массив, то первый элемент – дни, второй – часы, т.д. до миллисекунд. Остальные элементы игнорируются. Если передается число, то оно интерпретируется, как количество миллисекунд.
    * @return {Core/TimeInterval}
    */
   function TimeInterval(source) {
      // вызов через оператор new
      if (this instanceof TimeInterval) {
         this._normIntervalObj = undefined;
         this._normIntervalStr = undefined;

         this.set(source);
      } else {
         throw new Error(rk('TimeInterval вызывать через оператор new'));
      }
   }

   /**
    * @class
    * @name Core/TimeInterval
    * @public
    */
   /**
    * Возвращает колличество дней в интервале.
    * @return {Number}
    * @function
    * @name Core/TimeInterval#getDays
    */
   TimeInterval.prototype.getDays = function() {
      return this._normIntervalObj.days;
   };

   /**
    * Добавляет дни к интервалу.
    *
    * @param {Number} days - Колличество дней.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#addDays
    */
   TimeInterval.prototype.addDays = function(days) {
      return this.addMilliseconds(toNumber(days) * millisecondsInDay);
   };

   /**
    * Вычитает дни из интервала.
    *
    * @param {Number} days - Колличество дней.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#subDays
    */
   TimeInterval.prototype.subDays = function(days) {
      return this.subMilliseconds(toNumber(days) * millisecondsInDay);
   };

   /**
    * Возвращает колличество часов в интервале.
    *
    * @return {Number}
    * @function
    * @name Core/TimeInterval#getHours
    */
   TimeInterval.prototype.getHours = function() {
      return this._normIntervalObj.hours;
   };

   /**
    * Добавляет часы к интервалу.
    *
    * @param {Number} hours - Колличество часов.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#addHours
    */
   TimeInterval.prototype.addHours = function(hours) {
      return this.addMilliseconds(toNumber(hours) * millisecondsInHour);
   };

   /**
    * Вычитает часы из интервала.
    *
    * @param {Number} hours - Колличество часов.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#subHours
    */
   TimeInterval.prototype.subHours = function(hours) {
      return this.subMilliseconds(toNumber(hours) * millisecondsInHour);
   };

   /**
    * Возвращает колличество минут в интервале.
    *
    * @return {Number}
    * @function
    * @name Core/TimeInterval#getMinutes
    */
   TimeInterval.prototype.getMinutes = function() {
      return this._normIntervalObj.minutes;
   };

   /**
    * Добавляет минуты к интервалу.
    *
    * @param {Number} minutes - Колличество минут.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#addMinutes
    */
   TimeInterval.prototype.addMinutes = function(minutes) {
      return this.addMilliseconds(toNumber(minutes) * millisecondsInMinute);
   };

   /**
    * Вычитает часы из интервала.
    *
    * @param {Number} hours - Колличество часов.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#subMinutes
    */
   TimeInterval.prototype.subMinutes = function(minutes) {
      return this.subMilliseconds(toNumber(minutes) * millisecondsInMinute);
   };

   /**
    * Возвращает колличество секунд в интервале.
    *
    * @return {Number}
    * @function
    * @name Core/TimeInterval#getSeconds
    */
   TimeInterval.prototype.getSeconds = function() {
      return this._normIntervalObj.seconds;
   };

   /**
    * Добавляет секунды к интервалу.
    *
    * @param {Number} seconds - Колличество секунд.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#addSeconds
    */
   TimeInterval.prototype.addSeconds = function(seconds) {
      return this.addMilliseconds(toNumber(seconds) * millisecondsInSecond);
   };

   /**
    * Вычитает секунды из интервала.
    *
    * @param seconds {Number} Колличество секунд.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#subSeconds
    */
   TimeInterval.prototype.subSeconds = function(seconds) {
      return this.subMilliseconds(toNumber(seconds) * millisecondsInSecond);
   };

   /**
    * Возвращает колличество миллисекунд в интервале.
    *
    * @return {Number}
    * @function
    * @name Core/TimeInterval#getMilliseconds
    */
   TimeInterval.prototype.getMilliseconds = function() {
      return this._normIntervalObj.milliseconds;
   };

   /**
    * Добавляет миллисекунды к интервалу.
    *
    * @param {Number} milliseconds - Колличество миллисекунд.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#addMilliseconds
    */
   TimeInterval.prototype.addMilliseconds = function(milliseconds) {
      return this.set(this.getTotalMilliseconds() + truncate(milliseconds));
   };

   /**
    * Вычитает миллисекунды из интервала.
    *
    * @param {Number} milliseconds - Колличество миллисекунд.
    * @return {Core/TimeInterval}
    * @function
    * @name Core/TimeInterval#subMilliseconds
    */
   TimeInterval.prototype.subMilliseconds = function(milliseconds) {
      return this.set(this.getTotalMilliseconds() - truncate(milliseconds));
   };

   /**
    * Возвращает общее колличество часов в интервале, переводя дни в часы.
    *
    * @return {Number}
    * @function
    * @name Core/TimeInterval#getTotalHours
    */
   TimeInterval.prototype.getTotalHours = function() {
      return this._normIntervalObj.days * hoursInDay + this._normIntervalObj.hours;
   };

   /**
    * Возвращает общее колличество минут в интервале, переводя дни и часы в минуты.
    *
    * @return {Number}
    * @function
    * @name Core/TimeInterval#getTotalMinutes
    */
   TimeInterval.prototype.getTotalMinutes = function() {
      return this.getTotalHours() * minutesInHour + this._normIntervalObj.minutes;
   };

   /**
    * Возвращает общее колличество секунд в интервале, переводя дни, часы и минуты в секунды.
    *
    * @return {Number}
    * @function
    * @name Core/TimeInterval#getTotalSeconds
    */
   TimeInterval.prototype.getTotalSeconds = function() {
      return this.getTotalMinutes() * secondsInMinute + this._normIntervalObj.seconds;
   };

   /**
    * Возвращает общее колличество миллисекунд в интервале, переводя дни, часы, минуты и секунды в миллисекунды.
    *
    * @return {Number}
    * @function
    * @name Core/TimeInterval#getTotalMilliseconds
    */
   TimeInterval.prototype.getTotalMilliseconds = function() {
      return this.getTotalSeconds() * millisecondsInSecond + this._normIntervalObj.milliseconds;
   };

   /**
    * Устанавливает значение интервала.
    *
    * @param {Core/TimeInterval | String | Array | Object | Number} source - Может быть: строка - “P20DT3H1M5S”, массив - [5, 2, 3, -4], объект - {days: 1, minutes: 5}, число – 6 или объект типа Core/TimeInterval. Если передается массив, то первый элемент – дни, второй – часы, т.д. до миллисекунд. Остальные элементы игнорируются. Если передается число, то оно интерпретируется, как количество миллисекунд.
    * @return {Core/TimeInterval} Возвращает this.
    * @function
    * @name Core/TimeInterval#set
    */
   TimeInterval.prototype.set = function(source) {
      var type;

      source = coreClone(source);

      if (source instanceof TimeInterval) {
         type = 'timeInterval';
      } else if (typeof source === 'string') {
         type = 'intervalStr';
      } else if (source instanceof Array) {
         type = 'intervalArray';
      } else if (source && typeof source === 'object') {
         type = 'intervalObj';
      } else {
         source = toNumber(source);
         type = 'milliseconds';
      }

      switch (type) {
         case 'intervalStr':
            source = fromIntervalStrToIntervalArray(source);
         // pass through
         case 'intervalArray':
            source = fromIntervalArrayToIntervalObj(source);
         // pass through
         case 'intervalObj':
            source = fromIntervalObjToMilliseconds(source);
         // pass through
         case 'milliseconds':
            this._normIntervalObj = source = fromMillisecondsToNormIntervalObj(source, false);
            this._normIntervalStr = fromNormIntervalObjToNormIntervalStr(source, false);
            break;
         case 'timeInterval':
            this._normIntervalObj = source._normIntervalObj;
            this._normIntervalStr = source._normIntervalStr;
            break;
      }

      return this;
   };

   /**
    * Возвращает значение интервала в виде строки формата ISO 8601.
    *
    * @return {String} P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S].
    * 
    */
   TimeInterval.prototype.toString = function() {
      return this._normIntervalStr;
   };
   TimeInterval.prototype.valueOf = TimeInterval.prototype.toString;

   /**
    * Возвращает значение интервала в виде объекта {days: 1, minutes: 2, seconds: 3, miliseconds: 4}.
    *
    * @return {Object}
    */
   TimeInterval.prototype.toObject = function() {
      return this._normIntervalObj;
   };

   /**
    * Возвращает клон интервала.
    *
    * @return {Core/TimeInterval}
    */
   TimeInterval.prototype.clone = function() {
      return new TimeInterval(this);
   };

   /**
    * Возвращает результат операции над интервалом.
    *
    * @param {String} operation - Возможные значения: '==', '!=', '>=', '<=', '>', '<', '+', '-', '+=', '-='.
    * @param {Core/TimeInterval} operand
    * @return {Core/TimeInterval | Boolean} ['+=', '-='] - this, ['+', '-'] - новый TimeInterval-объект, ['==', '!=', '>=', '<=', '>', '<'] - true/false.
    */
   TimeInterval.prototype.calc = function(operation, operand) {
      var
         allowedOps = [
            '==',
            '!=',
            '>=',
            '<=',
            '>',
            '<',
            '+',
            '-',
            '+=',
            '-='
         ];

      if (allowedOps.indexOf(operation) === -1) {
         throw new Error(rk('Операция') + ' \"' + operation + '\" ' + rk('не доступна. Разрешенные операции') + ': ' + allowedOps.join(', '));
      }
      if (!(this instanceof TimeInterval && operand instanceof TimeInterval)) {
         throw new Error(rk('Operand должен быть объектом класса TimeInterval'));
      }

      var
         milliseconds1 = this.getTotalMilliseconds(),
         milliseconds2 = operand.getTotalMilliseconds();

      switch (operation) {
         case '==':
            return milliseconds1 === milliseconds2;
         case '!=':
            return milliseconds1 !== milliseconds2;
         case '>=':
            return milliseconds1 >= milliseconds2;
         case '<=':
            return milliseconds1 <= milliseconds2;
         case '>':
            return milliseconds1 > milliseconds2;
         case '<':
            return milliseconds1 < milliseconds2;
         case '+':
            return new TimeInterval().set(milliseconds1 + milliseconds2);
         case '-':
            return new TimeInterval().set(milliseconds1 - milliseconds2);
         case '+=':
            return this.set(milliseconds1 + milliseconds2);
         case '-=':
            return this.set(milliseconds1 - milliseconds2);
      }
   };

   /**
    * Прибавляет интервал к дате.
    *
    * @param {Date} date
    * @return {Date}
    */
   TimeInterval.prototype.addToDate = function(date) {
      return dateModifier.call(this, 1, date);
   };

   /**
    * Вычитает интервал из даты.
    *
    * @param {Date} date
    * @return {Date}
    */
   TimeInterval.prototype.subFromDate = function(date) {
      return dateModifier.call(this, -1, date);
   };

   /**
    * Возвращает строку формата ISO 8601.
    *
    * @param {Core/TimeInterval | String | Array | Object | Number} source - Может быть: строка - “P20DT3H1M5S”, массив - [5, 2, 3, -4], объект - {days: 1, minutes: 5}, число – 6 или объект типа Core/TimeInterval. Если передается массив, то первый элемент – дни, второй – часы, т.д. до миллисекунд. Остальные элементы игнорируются. Если передается число, то оно интерпретируется, как количество миллисекунд.
    * @return {String} P[<Число_дней>D][T[<Число_часов>H][<Число_минут>M][<Число_секунд>[.Число_долей_секунды]S].
    */
   TimeInterval.toString = function(source) {
      if (source !== undefined) {
         return TimeInterval.prototype.set.call({}, source)._normIntervalStr;
      }

      return Function.toString.call(this);
   };

   return TimeInterval;

});