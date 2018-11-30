define('Core/dom/getTouchEventCoords', function() {
   //MOVE_TO КРАЙНОВ

   /**
    * Возвращает координаты курсора мыши из jQuery-события.
    * @remark
    * Координаты возвращаются относительно левого верхнего угла <strong>документа</strong>, как в функции jQuery.offset().
    * @param {Object} event jQuery-событие.
    * @returns {{x: Number, y: Number}}
    * @see keyDown
    * @see checkCapsLock
    * @see wheel
    * @see getTouchEventClientCoords
    */
   return function (event) {
      var x = event.pageX,
         y = event.pageY;
      if (!x) {
         var touch = event.originalEvent.touch || (event.originalEvent.touches && event.originalEvent.touches[0]) ||
            (event.originalEvent.changedTouches && event.originalEvent.changedTouches[0]);
         if (touch) {
            x = touch.pageX;
            y = touch.pageY;
         }
      }
      return {'x': x, 'y': y};
   };
});
