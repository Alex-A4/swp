define('Lib/Control/BaseCompatible/Mixins/WsCompatibleConstructor', [
   'Core/core-extend',
   'Core/IoC'
], function(cExtend){

   /**
    * Этот файл нужен только лишь для отчетности,
    * они патчат прототипы и считают это нормальным явлением
    * файл подключается к тем классам, которые они патчат - это кнопка
    */
   return {
      $constructor: function(){},
      _fakeConstructor: null,
      _initFakeConstructor: function(){
         if (!this.$constructor.extendPlugin){
            this.$constructor.extendPlugin = function(pluginConfig){ cExtend.extendPlugin(this, pluginConfig) };
         }


         this._fakeConstructor = this.$constructor;
         Object.defineProperty(this, "$constructor", {get: function(){
            /*Невозможно в ближайшие несколько версий отказаться от $constructor
            * предупреждающих сообщений сейчас слишком много */
            return this._fakeConstructor;
         }});
      }
   };
});
