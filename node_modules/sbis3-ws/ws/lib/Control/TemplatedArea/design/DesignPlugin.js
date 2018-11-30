define('Lib/Control/TemplatedArea/design/DesignPlugin',
   [
   "Lib/Control/TemplatedArea/TemplatedArea"
],
   function(TemplatedArea){
   /**
    * @class TemplatedArea.DesignPlugin
    * @extends TemplatedArea
    * @plugin
    */
   TemplatedArea.DesignPlugin = TemplatedArea.extendPlugin({
    _loadTemplate: function() {
      var self = this;
      if (arguments.length) {
        var lastParams = arguments[arguments.length - 1]
        if (this._options.template && this._options.template.indexOf('js!') !== 0) {
          if (lastParams && lastParams.addBoth) {
            lastParams.addBoth(function() {
              setTimeout(function() {
                var errorArea = $('<div class="ws-area-service"></div>');
                errorArea.append($('<p>Невозможно загрузить XAML-шаблон (' + self._options.template + '.xaml) в WebGenie</p>'))
                errorArea.append($('<p>Воспользуйтесь новой спецификацией</p>'))
                self.getContainer().empty().append(errorArea);
              }, 100)
            });
          }
        }
      }
    }
   });
});