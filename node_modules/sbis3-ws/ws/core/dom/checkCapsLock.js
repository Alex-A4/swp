define('Core/dom/checkCapsLock', function() {
   //MOVE_TO КРАЙНОВ

   /**
    * Проверяет нажата ли клавиша CapsLock.
    * @param {Event} keypressEvent jQuery-событие keypress, для которого проверяется нажат капс-лок или нет.
    * @returns {Boolean} Зажат ли CapsLock. undefined возвращается, когда определить невозможно.
    * @see keyDown
    * @see wheel
    * @see getTouchEventCoords
    * @see getTouchEventClientCoords
    */
   return function (keypressEvent) {
      if (!keypressEvent || !keypressEvent.which)
         return undefined;
      var asciiCode = keypressEvent.which;
      var letter = String.fromCharCode(asciiCode);
      var upper = letter.toUpperCase();
      var lower = letter.toLowerCase();
      var shiftKey = keypressEvent.shiftKey;

      // Если верхние и нижние регистры равны, то нет возможности определить нажат ли капс-лок
      if (upper !== lower) {

         // Если вводится верхний символ при ненажатом шифте, значит капс-лок включен
         if (letter === upper && !shiftKey) {
            return true;
            // Если нижний, то выключен.
         } else if (letter === lower && !shiftKey) {
            return false;
            // Если нижний при нажажатом шифте, то включен
         } else if (letter === lower && shiftKey) {
            return true;
         } else if (letter === upper && shiftKey) {
            if (navigator.platform.toLowerCase().indexOf("win") !== -1) {
               // Если на Windows, то выключен
               return false;
            } else {
               if (navigator.platform.toLowerCase().indexOf("mac") !== -1) {
                  // Если на Mac, то выключен
                  return false;
               } else {
                  return undefined;
               }
            }
         } else {
            return undefined;
         }
      } else {
         return undefined;
      }
   };
});
