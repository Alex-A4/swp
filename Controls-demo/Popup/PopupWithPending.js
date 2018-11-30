define('Controls-demo/Popup/PopupWithPending',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/PopupWithPending',
      'WS.Data/Entity/Record',
      'Core/Deferred'
   ],
   function (Control, template, Record, Deferred) {
      'use strict';

      var TestDialog = Control.extend({
         _template: template,

         _close: function(){
            this._notify('close', [], {bubbling: true});
         },
         _afterMount: function () {
            this._onPropertyChangeHandler = this._onPropertyChange.bind(this);
            this._record = new Record();
            this._record.subscribe('onPropertyChange', this._onPropertyChangeHandler);
         },
         _onPropertyChange: function() {
            if (!this._propertyChangeNotified) {
               var def = new Deferred();
               var self = this;

               self._propertyChangeNotified = true;
               self._notify('registerPending', [def, {
                  showLoadingIndicator: false,
                  onPendingFail: function(forceFinishValue) {
                     self._showConfirmDialog(def, forceFinishValue);
                     return def;
                  }
               }], { bubbling: true });
            }
         },
         _showConfirmDialog: function(def) {
            function updating(answer) {
               if (answer === true) {
                  self._propertyChangeNotified = false;
                  def.callback(true);
               } else if (answer === false) {
                  def.callback(false);
               }
            }

            var self = this;

            return self._children.popupOpener.open({
               message: rk('Сохранить изменения?'),
               details: rk('Чтобы продолжить редактирование, нажмите "Отмена".'),
               type: 'yesnocancel'
            }).addCallback(function(answer) {
               updating.call(self, answer);
            });
         },
      });

      return TestDialog;
   }
);
