/* global define, Date */
define('Core/Date', [
   'Core/helpers/Date/toSql',
   'Core/helpers/Date/fromSql',
   'Core/helpers/Date/strftime',
   'Core/helpers/i18n/locales',
   'Core/constants',
   'Core/i18n'
], function(
   toSql,
   fromSql,
   strftime,
   locales,
   constants,
   i18n
) {
   'use strict';

   Date.SQL_SERIALIZE_MODE_DATE = undefined;
   Date.SQL_SERIALIZE_MODE_DATETIME = true;
   Date.SQL_SERIALIZE_MODE_TIME = false;
   Date.SQL_SERIALIZE_MODE_AUTO = null;

   /**
    * @class
    * @name Core/Date
    * @public
    * @author Бегунов А.В.
    */

   /**
    * Приводит объект Date() к виду, необходимому для передачи в SQL.
    * @function
    * @name Core/Date#toSQL
    * @param {Boolean|Object} [mode] Признак: необходимость выводить время.
    * <ul>
    *    <li>Date.SQL_SERIALIZE_MODE_DATE - сериализуется как Дата.</li>
    *    <li>Date.SQL_SERIALIZE_MODE_DATETIME - сериализуется как Дата и время.</li>
    *    <li>Date.SQL_SERIALIZE_MODE_TIME - сериализуется как Время.</li>
    *    <li>Date.SQL_SERIALIZE_MODE_AUTO - выбрать тип автоматически (см. setSQLSerializationMode).</li>
    * <ul>
    * @returns {String}
    */
   Date.prototype.toSQL = function(mode) {
      if (mode === Date.SQL_SERIALIZE_MODE_AUTO) {
         mode = this._serializeMode;
      }
      switch (mode) {
         case Date.SQL_SERIALIZE_MODE_DATETIME:
            mode = toSql.MODE_DATETIME;
            break;
         case Date.SQL_SERIALIZE_MODE_DATE:
            mode = toSql.MODE_DATE;
            break;
         case Date.SQL_SERIALIZE_MODE_TIME:
            mode = toSql.MODE_TIME;
            break;
      }

      return toSql(this, mode);
   };

   /**
    * Разбирает дату из БД в объект Date. Если передать дату со временем или только время, то оно будет приведено к местному.
    * @param {String} dateTime Дата и/или время в формате БД
    * @param {Boolean} [useDefaultTimeZone=true] Использовать временную зону по умолчанию (Москва), если в dateTime указано время без временной зоны. Если передать false, то при отсутствии временной зоны коррекция к местному времени производиться не будет.
    * @returns {Date}
    * @function
    * @name Core/Date#fromSQL
    */
   Date.fromSQL = function(dateTime, useDefaultTimeZone) {
      return fromSql(
         dateTime,
         useDefaultTimeZone || useDefaultTimeZone === undefined ? constants.moscowTimeOffset : undefined
      );
   };

   /**
    * Производит установку режима сериализации даты в SQL-формат.
    * @function
    * @name Core/Date#setSQLSerializationMode
    * @param {Boolean} mode Режим сериализации текущего инстанса даты в SQL-формат по умолчанию.
    * <ul>
    *    <li>Date.SQL_SERIALIZE_MODE_DATE - сериализуется как Дата.</li>
    *    <li>Date.SQL_SERIALIZE_MODE_DATETIME - сериализуется как Дата и время.</li>
    *    <li>Date.SQL_SERIALIZE_MODE_TIME - сериализуется как Время.</li>
    * <ul>
    */
   Date.prototype.setSQLSerializationMode = function(mode) {
      this._serializeMode = mode;
   };

   /**
    * Возвращает значение режима, который установлен для сериализации даты в SQL-формат.
    * @function
    * @name Core/Date#getSQLSerializationMode
    * @returns {Boolean|*}
    * <ul>
    *    <li>Date.SQL_SERIALIZE_MODE_DATE - сериализуется как Дата.</li>
    *    <li>Date.SQL_SERIALIZE_MODE_DATETIME - сериализуется как Дата и время.</li>
    *    <li>Date.SQL_SERIALIZE_MODE_TIME - сериализуется как Время.</li>
    * <ul>
    */
   Date.prototype.getSQLSerializationMode = function() {
      return this._serializeMode;
   };

   /**
    * Производит сравнение текущей даты с другой.
    * @function
    * @name Core/Date#equals
    * @param {Date} d Другая дата.
    * @return {Boolean} Если даты равны, возвращает true, иначе - false.
    */
   Date.prototype.equals = function(d) {
      var res = false;
      if (d instanceof Date) {
         res = this.getTime() === d.getTime();
      }
      return res;
   };

   /**
    * Производит откат даты.
    * @function
    * @name Core/Date#rollback
    * @param {Number} timeValue Число, равное количеству миллисекунд, прошедших с полуночи 1 января 1970 года по универсальному времени.
    */
   Date.prototype.rollback = function(timeValue) {
      this.setTime(timeValue);
   };

   /**
    * Производит форматирование даты. Подробное описание форматов см. в функции {@link Core/helpers/Date/strftime}
    *
    * @example
    * 1. Пример вывода даты.
    * <pre>
    *    var date = new Date();
    *
    *    date.strftime('Сегодня %e %q %Y года.');
    *    // > "Сегодня 16 апреля 2014 года."
    *
    *    date.setMonth(date.getMonth() + 1);
    *    date.setDate(0);
    *    date.strftime('Последний день текущего месяца будет %e %q %Y года.');
    *    // > "Последний день текущего месяца будет 30 апреля 2014 года."
    * </pre>
    * 2. Про %V, %g и %G.
    * По стандарту ISO-8601:1988 счет недель начинается с той, которая содержит минимум 4 дня текущего года.
    * Неделя начинается с понедельника, даже если он выпал на предыдущий год.
    * <pre>
    *    var date = new Date(2013,11,30);
    *
    *    date.toString();
    *    // > "Mon Dec 30 2013 00:00:00 GMT+0400 (Московское время (зима))"
    *
    *    date.strftime('Дата %d %q %Y года по ISO-8601:1988 выпадает на %V неделю %G года (%G-%V).');
    *    // > "Дата 30 декабря 2013 года по ISO-8601:1988 выпадает на 01 неделю 2014 года (2014-01)."
    * </pre>
    * @param {String} format Формат вывода
    * @returns {String} Дата в выбранном формате.
    * @function
    * @name Core/Date#strftime
    * @see Core/helpers/Date#strftime
    */
   Date.prototype.strftime = function(format) {
      return strftime(this, format);
   };

   /**
    * Отменяет перевод времени, производимый в функции fromSQL.
    * @returns {Date} Возвращает текущую уже изменённую дату.
    * @function
    * @name Core/Date#toServerTime
    */
   Date.prototype.toServerTime = function() {
      // Приводим время к серверному (московскому) из местного
      this.setMinutes(this.getMinutes() + this.getTimezoneOffset() + constants.moscowTimeOffset);
      return this;
   };

   /**
    * Устанавливает дату на последний день месяца.
    * @param {Number} [month] Номер месяца 0 - 11, последний день которого нужен.
    * Если не указан берется из даты.
    * @returns {Date}
    * @function
    * @name Core/Date#setLastMonthDay
    */
   Date.prototype.setLastMonthDay = function(month) {
      month = month === undefined ? this.getMonth() : parseInt(month, 10);
      this.setDate(1);
      this.setMonth(month + 1);
      this.setDate(0);
      return this;
   };

   //Global scope accessing
   var global = (function() {
      return this || (0, eval)('this');//eslint-disable-line no-eval
   }());

   //Dirty hack for Node.js: use client cookies to detect it's time zone (if possible)
   if (constants.isNodePlatform) {
      //Save system time zone
      var systemTimeZone = new Date().getTimezoneOffset();

      //XXX: replace Date::getTimezoneOffset implementation with own that translates time zone from cookies
      Date.prototype._getTimezoneOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = function() {
         //Return time zone from cookies if possible. Use typecasting.
         var clientTimeZone = global.process && global.process.domain && global.process.domain.req && global.process.domain.req.cookies && global.process.domain.req.cookies.tz;
         return parseInt(clientTimeZone || systemTimeZone, 10);
      };
   }

   //FIXME: isEnabled() result can be changed during runtime
   if (i18n.isEnabled() && global.Intl) {
      //XXX: replace Date::toLocaleString, Date::toLocaleDateString, Date::toLocaleTimeString implementation with own that translates current lang
      Date.prototype._toLocaleString = Date.prototype.toLocaleString;
      Date.prototype._toLocaleDateString = Date.prototype.toLocaleDateString;
      Date.prototype._toLocaleTimeString = Date.prototype.toLocaleTimeString;

      Date.prototype.toLocaleString = function(locales, options) {
         return this._toLocaleString(locales || i18n.getLang() || [], options);
      };
      Date.prototype.toLocaleDateString = function(locales, options) {
         return this._toLocaleDateString(locales || i18n.getLang() || [], options);
      };
      Date.prototype.toLocaleTimeString = function(locales, options) {
         return this._toLocaleTimeString(locales || i18n.getLang() || [], options);
      };
   }

   //Export locales name to constants.Locales
   Object.defineProperty(constants, 'Locales', {
      configurable: true,
      get: function() {
         return locales.available;
      }
   });

   //Export current locale config to constants.Date
   Object.defineProperty(constants, 'Date', {
      configurable: true,
      get: function() {
         return locales.current.config;
      }
   });

   return Date;
});
