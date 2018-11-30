define("Lib/Type/CustomType", ['Core/core-extend', 'Core/property-merge'], function (cExtend, propertyMerge) {

   "use strict";

   /**
    * Описание составного типа
    * @class CustomType
    * @category Выбор
    */
   var CustomType = cExtend({}, /** @lends CustomType.prototype */{
      $protected: {
         _options: {}
      },
      updateProperties: function(cfg) {
         propertyMerge(cfg, this._options);
         this.init();
      },
      init: function() {

         for (var key in this._options) {
            if (this._options.hasOwnProperty(key)) {
               this[key] = this._options[key];
            }
         }
      },
      /**
       * Проверка на CustomType
       * @returns {boolean}
       */
      isCustomType: function () {
         return true;
      },
      /**
       * Проверка, правильно ли сконфигурирован тип, реализуется в каждом типе отдельно
       * @returns {boolean}
       * @example
       * <pre>
       *    if(this._options.myType.isConfigured())
       *       this.doSomething();
       * </pre>
       */
      isConfigured: function () {
         return false;
      }
   });
   return CustomType;
});