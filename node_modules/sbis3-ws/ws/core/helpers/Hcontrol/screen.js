define('Core/helpers/Hcontrol/screen', function() {
   return {

      /**
       * Переводит координаты относительно экрана в координаты относительно документа.
       * @param {{top: number, left: number}} pos
       * @return {{top: number, left: number}}
       */
      //MOVE_TO КРАЙНОВ
      fromScreen: function(pos) {
         var
            body = document.body,
            docElem = document.documentElement,
            scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
            scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
            clientTop = docElem.clientTop || body.clientTop || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top = pos.top + scrollTop - clientTop,
            left = pos.left + scrollLeft - clientLeft;

         return { top: Math.round(top), left: Math.round(left) };
      },

      /**
       * Переводит координаты относительно документа в координаты относительно экрана.
       * @param {{top: number, left: number}} pos
       * @return {{top: number, left: number}}
       */
      //MOVE_TO КРАЙНОВ
      toScreen: function(pos) {
         var
            body = document.body,
            docElem = document.documentElement,
            scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop,
            scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft,
            clientTop = docElem.clientTop || body.clientTop || 0,
            clientLeft = docElem.clientLeft || body.clientLeft || 0,
            top = pos.top - scrollTop + clientTop,
            left = pos.left - scrollLeft + clientLeft;

         return { top: Math.round(top), left: Math.round(left) };
      }
   };
});
