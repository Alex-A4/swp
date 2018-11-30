define('Controls-demo/Popup/resources/MyTextBox',
   [
      'Lib/Control/CompoundControl/CompoundControl',
      'wml!Controls-demo/Popup/resources/MyTextBox',
      'css!Controls-demo/Popup/resources/MyTextBox',
      'SBIS3.CONTROLS/TextBox'
   ], function(CompoundControl, dotTplFn) {
      var moduleClass = CompoundControl.extend({
         _dotTplFn: dotTplFn,
         $protected: {
            _options: {

            }
         },
         $constructor: function() {
         },
         init: function() {
            moduleClass.superclass.init.call(this);
         }
      });
      return moduleClass;
   });
