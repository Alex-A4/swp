define('Transport/Templates/CompoundControlTemplate', [
   'Transport/Templates/Template',
   'Core/core-merge',
   'Core/property-merge',
   'Core/helpers/Number/randomId'
], function(Template, coreMerge, propertyMerge, randomId) {
   var CompoundControlTemplate;

   CompoundControlTemplate = Template.extend({
      $protected: {
         _options: {
            template: null
         },
         _elementId: null,
         _docFragment: null,
         _instance: null
      },
      $constructor: function() {
         this._elementId = randomId();
         this._loadedHandlers = this._options.template && this._options.template.handlers || {};
         this._dReady.done();
      },
      _collectAllControlsToPreload: function(source) {
         return source[0] && [source[0]] || [];
      },
      getConfig: function() {
         var
            templateClass = this._options.template,
            proto = templateClass.prototype,
            result = {},
            dimensions = templateClass.dimensions || templateClass.prototype.dimensions || {}; //Для наследования дименшены могут объявить на прототипе

         if (proto && proto._initializer) {
            proto._initializer.call(result, propertyMerge);
            result = result._options || {};

            //По умолчанию у xhtml-шаблонов нужно устанавливать isRelativeTemplate, чтоб ресайзера не было у
            //области по шаблону, которая загружает его
            if (result.isRelativeTemplate === undefined) {
               result.isRelativeTemplate = true;
            }
         }

         coreMerge(result, dimensions);
         return result;
      },
      getStyle: function() {
         return '';
      },
      getDimensions: function() {
         var config = this.getConfig();
         return 'width height'.split(' ').reduce(function(result, opt) {
            if (opt in config) {
               result[opt] = config[opt];
            }
            return result;
         }, {});
      },
      isPage: function() {
         return true;
      },
      getTitle: function() {
         var config = this.getConfig();
         return (config && config.title) || this._options.template.title || '';
      },
      createMarkup: function(container, config) {
         var element = document.createElement('div');
         element.setAttribute('id', this._elementId);
         if (config) {
            element._componentConfig = config;
         }
         container.append(element);
      },
      getControls: function(parentId, templateRoot) {
         if (parentId && this._elementId != parentId) {
            return [];
         }
         var elem = templateRoot && templateRoot.find('#' + this._elementId).get(0);
         return [
            coreMerge({
               id: this._elementId,
               type: this._templateName
            }, (elem && elem._componentConfig) || {})];
      },
      _getIncludeDescriptorNodes: function() {
         // У CompoundControl все зависимости и подключения - в requirejs
         return [];
      }
   });

   return CompoundControlTemplate;
});
