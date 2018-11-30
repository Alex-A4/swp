/**
 * Created by Яковлев В.В. on 15.04.14.
 * Modified by Шилов Д.А.:
 * Со смертью Browser.module.js и DataView.module.js
 * нам не нужен wsFixedLiveClick, а wsFixedLiveClick2
 * переименовал в wsFixedClick
 */

/**
 * Выключает обработку второго клика в случае обработки двойного клика. Всего есть два общих случая работы двойного клика:
 * 1)
 * - click
 * - click (не учитывается)
 * - dblclick
 * 2)
 * - click
 * - dblclick
 * - click (не учитывается)
 *
 * @param {String} selector Селектор по которому будут фильтроваться элементы.
 * @param {Function} click Обработчик на клик.
 * @param {Function} doubleclick Обработчик на двойной клик.
 */
define('Core/jquery-dblclick', ['Core/detection'], function(detection) {

   (function($) {

      if (detection.isMobileAndroid || detection.isMobileSafari) {

         $.fn.wsFixedClick = function(selector, clickHandler) {
            return this.on('click', selector, clickHandler);
         }

      } else {

         $.fn.wsFixedClick = function(selector, click, doubleclick) {
            return this.on('click', selector, function(event) {
               var self = $(this),
                   prevClick = self.data('wsClickTime'),
                   now = new Date().getTime();
               if (prevClick && Math.abs(now - prevClick) <= 300) { //Back to the...
                  self.data('wsClickTime', undefined);
               } else {
                  self.data('wsClickTime', now);
                  click.call(this, event);
               }
            }).on('dblclick', selector, function(event) {
               doubleclick.call(this, event);
            });
         };
      }

   })(jQuery);

});