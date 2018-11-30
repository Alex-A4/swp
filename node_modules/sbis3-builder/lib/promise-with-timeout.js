'use strict';
class TimeoutError extends Error {
   constructor(message) {
      super();
      this.message = message || 'Timeout!';
   }
}
const promiseWithTimeout = async(promise, timeoutMillis) => {
   let timeout;

   /**
    * Устраиваем гонки между промисом выполнения определённого функционала и промисом таймаута.
    * Первый разрешённый промис вернётся к нам в качестве результата(ошибка или результат).
    * В зависимости от результата разрешаем наш финальный промис - либо всё хорошо и отдаём
    * результат, либо ошибку и мы возвращаем эту ошибку, либо ответа мы не получили
    * и информируем разрабов соответственного функционала о неперехватываемом исключении
    */
   try {
      const result = await Promise.race([
         promise,
         new Promise((resolve, reject) => {
            timeout = setTimeout(() => {
               reject(new TimeoutError());
            }, timeoutMillis);
         })
      ]);
      if (timeout) {
         clearTimeout(timeout);
      }
      return result;
   } catch (err) {
      if (timeout) {
         clearTimeout(timeout);
      }
      throw err;
   }
};

module.exports = {
   TimeoutError,
   promiseWithTimeout
};
