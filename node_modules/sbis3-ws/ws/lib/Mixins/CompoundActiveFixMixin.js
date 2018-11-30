define('Lib/Mixins/CompoundActiveFixMixin', [
   "Lib/Control/AreaAbstract/AreaAbstract",
   "Lib/Control/Control"
], function(CAreaAbstract, ControlModule){

   var Control = ControlModule.Control;
   /**
    * @class $SBIS3.CORE.CompoundActiveFixMixin
    * @deprecated
    */
   return CompoundActiveFixMixin = /** @lends Lib/Mixins/CompoundActiveFixMixin.prototype */{
      instead: {
         setActive: function() {
            return Control.prototype.setActive.apply(this, arguments);
         },
         /**
          * CompoundControl к которому подмешан CompoundActiveFixMixin ведет себя как Control, а не как AreaAbstract
          * setChildActive необходимо перебить, потому что у AreaAbstract сохраняются индексы активных потомков в контроле,
          * а контрол не должен знать ни про каких потомков. Если он будет про них знать, при приеме активности
          * он будет пытаться проставить фокус в них, а не в себя.
          * https://inside.tensor.ru/opendoc.html?guid=e79a23df-0726-4877-9151-b430319944ee&description=#msid=s1477930419700
          * Тут фокус сразу уходит на suggest, а в TextBox фокус не встает
          */
         setChildActive: function() {
            var
               wasActive = this._isControlActive;

            this._isControlActive = true;
            this._updateActiveStyles();
            if (wasActive !== this._isControlActive && this._isControlActive) {
               this._notify('onFocusIn');
            }
         },

         _onClickHandler: function(){
            return Control.prototype._onClickHandler.apply(this, arguments);
         },

         canAcceptFocus: function() {
            return Control.prototype.canAcceptFocus.apply(this, arguments);
         },

         onBringToFront: function() {
            var childs = this._childControls || [];
            if (childs.length) {
               var control = this.getActiveChildControl(true);
               if (control) {
                  if (control instanceof CAreaAbstract) {
                     control.onBringToFront();
                  }
                  else {
                     control.setActive(true);
                  }
               }
               else {
                  this.setActive(true);
               }
            }
            else {
               this.setActive(true);
            }
         }
      }
   };
});
