/**
 * Created with JetBrains PhpStorm.
 * User: tm.baeva
 * Date: 16.04.13
 * Time: 14:48
 * To change this template use File | Settings | File Templates.
 */
define('Lib/Control/ProgressBar/ProgressBar', [
   'Lib/Control/Control',
   'tmpl!Lib/Control/ProgressBar/ProgressBar',
   'css!Lib/Control/ProgressBar/ProgressBar'
], function(
   Control,
   dotTplFn
) {

   'use strict';

   /**
    * @class Lib/Control/ProgressBar/ProgressBar
    * @extends Lib/Control/Control
    * @public
    * @control
    * @category Decorate
    * @author Крайнов Д.О.
    * @deprecated Используйте класс {@link SBIS3.CONTROLS/ProgressBar}.
    */
   var ProgressBar = Control.Control.extend(/** @lends Lib/Control/ProgressBar/ProgressBar.prototype */{
      $protected: {
         _border: null,
         _progress: null,
         _progressValue: null,
         _options: {
             /**
              * @cfg {Number} Ширина прогрессбара в пикселях
              */
            width: 'auto',
             /**
              * @cfg {String} Выравнивание по горизонтали
              * @variant left Слева
              * @variant center По центру
              * @variant right Справа
              */
            align: 'center',
             /**
              * @cfg {Boolean} Отображать проценты
              */
            showPercent: true
         }
      },
      $constructor: function(){
         this._progress = this._container.find('.ws-progressbar-indicator');
         this._border = this._container.find('.ws-progressbar-border');
         this._progressValue = this._container.find('.ws-progressbar-progress-value');
      },
      /**
       * Устанавливает шкалу прогрессбара в заданный процент
       * @param {Number} percent процент выполнения
       * @return {Boolean} успешность выполнения операции
       */
      setProgress: function(percent){
         percent = parseInt(percent, 10);
         if(percent <= 100 && percent >=0){
            this._progress.find('.ws-progressbar-indicator-left, .ws-progressbar-indicator-right').toggleClass('ws-hidden', percent === 0);
            this._progress.width(percent + '%');
            this._progressValue.text(percent + '%');
            return true;
         }
         else {
            return false;
         }
      },
      _dotTplFn: dotTplFn
   });

   return ProgressBar;

});
