define('Controls/Input/Render',
   [
      'Core/Control',
      'WS.Data/Type/descriptor',
      'Controls/Utils/tmplNotify',

      'wml!Controls/Input/Render/Render',
      'css!Controls/Input/Render/Render'
   ],
   function(Control, descriptor, tmplNotify, template) {

      'use strict';

      var Render = Control.extend({
         _template: template,

         _notifyHandler: tmplNotify,

         _getState: function() {
            if (this._options.readOnly) {
               return '_readOnly';
            } else if (this._active) {
               return '_active';
            } else {
               return '';
            }
         }
      });

      Render.getDefaultTypes = function() {
         return {
            content: descriptor(Function).required(),
            afterFieldWrapper: descriptor(Function),
            beforeFieldWrapper: descriptor(Function),
            size: descriptor(String).oneOf([
               's',
               'm',
               'l'
            ]).required(),
            fontStyle: descriptor(String).oneOf([
               'default',
               'primary'
            ]).required(),
            textAlign: descriptor(String).oneOf([
               'left',
               'right'
            ]).required(),
            style: descriptor(String).oneOf([
               'info',
               'danger',
               'invalid',
               'primary',
               'success',
               'warning'
            ]).required(),
            tagStyle: descriptor(String).oneOf([
               'info',
               'danger',
               'primary',
               'success',
               'warning',
               'secondary'
            ])
         };
      };

      return Render;
   }
);
