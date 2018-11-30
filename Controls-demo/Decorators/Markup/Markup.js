define('Controls-demo/Decorators/Markup/Markup', [

   'Core/Control',
   'Controls/Decorator/Markup/resolvers/linkDecorate',
   'Controls/Decorator/Markup/resolvers/highlight',
   'WS.Data/Source/Memory',
   'wml!Controls-demo/Decorators/Markup/Markup',

   'css!Controls-demo/Decorators/Markup/Markup',
   'Controls/Decorator/Markup'

], function(Control,
   linkDecorateResolver,
   highlightResolver,
   MemorySource,
   template) {
   'use strict';

   return Control.extend({
      _template: template,
      _resolversMemorySource: null,
      _newParamKey: '',
      _newParamValue: '',

      allTagResolvers: [],
      json: [],
      strJson: '',
      tagResolverId: 1000000,
      tagResolverName: 'Без резолвера',
      tagResolver: null,
      resolverParams: {},

      _combineResolver: function(json, parent, resolverParams) {
         var newJson = linkDecorateResolver(json, parent, resolverParams);
         if (newJson === json) {
            newJson = highlightResolver(json, parent, resolverParams);
         }
         return newJson;
      },
      _updateResolver: function(event, data) {
         this.tagResolverId = data.get('id');
         this.tagResolverName = data.get('title');
      },
      _applyNewResolverParam: function() {
         if (this._newParamKey) {
            this.resolverParams[this._newParamKey] = this._newParamValue;
         }
         this._newParamKey = '';
         this._newParamValue = '';
      },
      _applyJson: function(event) {
         if (event.type === 'click' || event.nativeEvent.code === 'Enter') {
            this.tagResolver = this.allTagResolvers[this.tagResolverId];
            try {
               this.json = JSON.parse(this.strJson);
            } catch (e) {
               this.json = ['span', { 'class': 'ControlsDemo-Markup__error' }, e.message];
               this.tagResolver = '';
            }
         }
      },
      _beforeMount: function() {
         this.allTagResolvers = [linkDecorateResolver, highlightResolver, this._combineResolver];
         this._resolversMemorySource = new MemorySource({
            idProperty: 'id',
            data: [
               {
                  id: 1000000,
                  title: 'Без резолвера'
               },
               {
                  id: 0,
                  title: 'Резолвер декорирования ссылок'
               },
               {
                  id: 1,
                  title: 'Резолвер выделения текста'
               },
               {
                  id: 2,
                  title: 'Комбинация резолверов'
               }
            ]
         });
      },

      objectToStr: function(object) {
         return JSON.stringify(object);
      }
   });
});
