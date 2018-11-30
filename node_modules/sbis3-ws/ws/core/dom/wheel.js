define('Core/dom/wheel', [
   'Core/constants'
], function(constants) {
   //MOVE_TO КРАЙНОВ

   /**
    * Устанавливает обработчик на вращение колеса мыши.
    * @param {jQuery} element Элемент, над которым нужно вращать колесо мыши. В некоторых браузерах также необходимо, чтобы страница имела фокус.
    * @param {Function} callback Функция, которая будет вызвана. Получит один аргумент - event, объект jQuery-события. У него будет задано свойство wheelDelta. При вращении колеса вниз значение будет отрицательным, вверх - положительным. Значение примерно равно количеству пикселей, на которое будет проскроллен блок, но не гарантируется, что в разных браузерах это значение будет одинаковым.
    * @return {jQuery}
    * @see keyDown
    * @see checkCapsLock
    * @see getTouchEventCoords
    * @see getTouchEventClientCoords
    */
   return function (element, callback) {
      var support = constants.compatibility.wheel;
      return element.bind(support, function (event) {
         var originalEvent = event.originalEvent;
         if (support === 'wheel') {
            event.wheelDelta = -originalEvent.deltaY;
            if (originalEvent.deltaMode === 1) {
               event.wheelDelta *= 40;
            }
         }
         else if (support === 'DOMMouseScroll') {
            event.wheelDelta = -originalEvent.detail * 40;
         } else if (support === 'mousewheel') {
            event.wheelDelta = originalEvent.wheelDelta;
         }
         callback.call(this, event);
      });
   };
});
