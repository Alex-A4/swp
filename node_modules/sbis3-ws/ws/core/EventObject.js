define('Core/EventObject', [], function () {
   'use strict';

   var EventObject = function(eventName, target) {
      this.name = this._eventName = eventName;
      this._target = target;
   };
    /**
     *
     * @class Core/EventObject
     * @author Мальцев А.А.
     * @public
     */
   EventObject.prototype = /** @lends Core/EventObject.prototype */{
      _isBubbling: true,
      _result: undefined,
      _eventName: null,
      _target: null,

      /**
       * Отменить дальнейшую обработку
       */
      cancelBubble: function() {
         this._isBubbling = false;
      },

      /**
       * Будет ли продолжена дальнейшая обработка
       * @returns {Boolean}
       */
      isBubbling: function() {
         return this._isBubbling;
      },

      /**
       * Возвращает результат
       * @returns {*}
       */
      getResult: function() {
         return this._result;
      },

      /**
       * Устанавливает результат
       * @param {*} r
       */
      setResult: function(r) {
         this._result = r;
      },

      /**
       * Возвращает объект, инициировавший событие
       * @returns {*}
       */
      getTarget: function() {
         return this._target;
      }
   };

   return EventObject;
});
