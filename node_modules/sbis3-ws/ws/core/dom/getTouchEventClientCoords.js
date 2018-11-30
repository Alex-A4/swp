define('Core/dom/getTouchEventClientCoords', function() {
   //MOVE_TO КРАЙНОВ

   /**
    * Возвращает координаты курсора мыши из jQuery-события.
    * @remark
    * Координаты возвращаются относительно левого верхнего угла <strong>Window</strong>, как в функции element.getBoundingClientRect.
    * @param {Object} event jQuery-событие.
    * @returns {{x: Number, y: Number}}
    * @see keyDown
    * @see checkCapsLock
    * @see wheel
    * @see getTouchEventCoords
    */
   return function(event) {
      var x = event.clientX,
         y = event.clientY;
      if (x === undefined) {
         var touch = event.originalEvent.touch || event.originalEvent.touches && event.originalEvent.touches[0] ||
            event.originalEvent.changedTouches && event.originalEvent.changedTouches[0];
         if (touch) {
            x = touch.clientX;
            y = touch.clientY;
         }
      }
      return {'x': x, 'y': y};
   };
});
