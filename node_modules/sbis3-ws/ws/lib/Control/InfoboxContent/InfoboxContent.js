define('Lib/Control/InfoboxContent/InfoboxContent',
   [
      'require',
      'Lib/Control/CompoundControl/CompoundControl',
      'tmpl!Lib/Control/InfoboxContent/InfoboxContent',
      'Core/Sanitize',
      'Core/js-template-doT' //Приходится пока что реквайрить dot, потому что очень многие задают шаблоны строками
   ],
   function(
      require,
      CompoundControl,
      dotTplFn,
      Sanitize
   ) {

      'use strict';

      var _sanitize = function(markup) {
        return Sanitize(markup, {validNodes: {component: true}, validAttributes : {config: true} });
      };

      var InfoboxContent = CompoundControl.extend({
         _dotTplFn: dotTplFn,
         $protected: {
            _options: {
               message: '',
               title: '',
               options: {}
            }
         },

         _modifyOptions: function (cfg) {
            cfg.message = _sanitize(cfg.message);
            if (cfg.title) {
               cfg.title = _sanitize(cfg.title);
            }
            return cfg;
         },

         _onResizeHandler: function() {
            if (this._options.infoboxSingleton) {
               this._options.infoboxSingleton._resizeBox();
            }
         }
      });

      return InfoboxContent;
   });