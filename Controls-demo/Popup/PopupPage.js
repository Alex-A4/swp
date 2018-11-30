define('Controls-demo/Popup/PopupPage',
   [
      'Core/Control',
      'wml!Controls-demo/Popup/PopupPage',
      'Core/helpers/Number/randomId',
      'Controls-demo/Popup/TestDialog',
      'css!Controls-demo/Popup/PopupPage'
   ],
   function (Control, template, randomId) {
      'use strict';

      var PopupPage = Control.extend({
         _template: template,

         constructor: function (cfg) {
            PopupPage.superclass.constructor.call(this, cfg);
         },

         openDialog: function () {
            this._children.dialog.open({
               opener: this._children.dialogButton
            });
         },

         openModalDialog: function () {
            this._children.modalDialog.open({});
         },

         openSticky: function () {
            this._children.sticky.open({
               target: this._children.stickyButton._container,
               opener: this._children.stickyButton,
               templateOptions: {
                  type: this._firstClick ? 'sticky' : 'dialog'
               }
            });
            this._firstClick = true;
         },

         openNotification: function () {
            this._children.notification.open({
               opener: this._children.notificationButton
            });
         },

         openStack: function () {
            this._children.stack.open({
               opener: this._children.stackButton
            });
         },

         openStackWithTemplateSizes: function () {
            this._children.stack2.open({
               opener: this._children.stackButton,
               templateOptions: {
                  width: '10000px'
               }
            });
         },

         openExecutingPopup: function () {
            this._children.executingStack.open({
               opener: this._children.stackButton,
               templateOptions: {text: randomId('popup-random')}
            });
            this._children.executingStack.open({
               opener: this._children.stackButton,
               templateOptions: {text: randomId('popup-random')}
            });
         },

         openMaximizedStack: function () {
            this._children.maximizedStack.open({
               minWidth: 900,
               maxWidth: 1200,
               minimizedWidth: 600,
               maximized: true,
               opener: this._children.stackButton
            });
         },

         openOldTemplate: function () {
            this._children.openOldTemplate.open({
               opener: this._children.stackButton2,
               isCompoundTemplate: true
            });
         },
         openStackWithPending: function() {
            this._children.openStackWithPending.open({
               opener: this._children.stackButton3
            });
         },
         openStackWithFormController: function() {
            this._children.openStackWithFormController.open({
               opener: this._children.stackButton4
            });
         },

         _onResult: function (result) {
            if( result ){
               alert(result);
            }
         }
      });

      return PopupPage;
   }
);