define('Transport/Templates/EmptyTemplate', [
   'Transport/Templates/Template'
], function(Template) {
   var EmptyTemplate;
   /**
    * Класс - заглушка, представляющий собой пустой шаблон.
    * Его может быть удобно подставить вместо настоящего шаблона.
    * @class EmptyTemplate/Templates/EmptyTemplateEmptyTemplate
    * @extends Transport/Templates/Template
    * @author Бегунов А.В.
    * @public
    */
   EmptyTemplate = Template.extend({
      $constructor: function () {
         this._dReady.done();
      },
      _collectAllControlsToPreload: function () {
         return [];
      },
      isPage: function () {
         return true;
      },
      getConfig: function () {
         return {};
      },
      getStyle: function () {
         return '';
      },
      getAlignment: function () {
         return {horizontalAlignment: 'Stretch', verticalAlignment: 'Stretch'};
      },
      getTitle: function () {
         return '';
      },
      createMarkup: function (container) {
         container.get(0).innerHTML = '';
      },
      getDimensions: function () {
         return {width: '', height: ''};
      },
      getControls: function () {
         return [];
      },
      _getIncludeDescriptorNodes: function () {
         return [];
      }
   });
   
   return EmptyTemplate;
});