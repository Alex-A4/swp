/**
 * Created by am.gerasimov on 13.12.2017.
 */
define('ControlsSandbox/VDomSuggest', [
   'Core/Control',
   'tmpl!ControlsSandbox/VDomSuggest',
   'WS.Data/Source/Memory',
   'Core/Deferred',
   'Controls/Input/Suggest',
   'Controls/Container/List'
], function(Control, template, MemorySource, Deferred) {
   
   'use strict';
   
   var sourceData = [
      { id: 1, title: 'Sasha' },
      { id: 2, title: 'Dmitry' },
      { id: 3, title: 'Andrey' },
      { id: 4, title: 'Aleksey' },
      { id: 5, title: 'Sasha' },
      { id: 6, title: 'Ivan' },
      { id: 7, title: 'Petr' },
      { id: 8, title: 'Roman' },
      { id: 9, title: 'Maxim' },
      { id: 10, title: 'Andrey' },
      { id: 12, title: 'Sasha' },
      { id: 13, title: 'Sasha' },
      { id: 14, title: 'Sasha' },
      { id: 15, title: 'Sasha' },
      { id: 16, title: 'Sasha' },
      { id: 17, title: 'Sasha' },
      { id: 18, title: 'Dmitry' },
      { id: 19, title: 'Andrey' },
      { id: 20, title: 'Aleksey' },
      { id: 21, title: 'Sasha' },
      { id: 22, title: 'Ivan' },
      { id: 23, title: 'Petr' },
      { id: 24, title: 'Roman' },
      { id: 25, title: 'Maxim' },
      { id: 26, title: 'Andrey' },
      { id: 27, title: 'Sasha' },
      { id: 28, title: 'Sasha' },
      { id: 29, title: 'Sasha' },
      { id: 30, title: 'Sasha' },
      { id: 31, title: 'Sasha' },
      { id: 32, title: 'Sasha' },
      { id: 33, title: 'Dmitry' },
      { id: 34, title: 'Andrey' },
      { id: 35, title: 'Aleksey' },
      { id: 36, title: 'Sasha' },
      { id: 37, title: 'Ivan' },
      { id: 38, title: 'Petr' },
      { id: 39, title: 'Roman' },
      { id: 40, title: 'Maxim' },
      { id: 41, title: 'Andrey' },
      { id: 42, title: 'Sasha' },
      { id: 43, title: 'Sasha' },
      { id: 44, title: 'Sasha' },
      { id: 45, title: 'Sasha' },
      { id: 46, title: 'Sasha' },
      { id: 47, title: 'Andrey' },
      { id: 48, title: 'Aleksey' },
      { id: 49, title: 'Sasha' },
      { id: 50, title: 'Ivan' },
      { id: 51, title: 'Petr' },
      { id: 52, title: 'Roman' },
      { id: 53, title: 'Maxim' },
      { id: 54, title: 'Andrey' },
      { id: 55, title: 'Sasha' },
      { id: 56, title: 'Sasha' },
      { id: 57, title: 'Sasha' },
      { id: 58, title: 'Sasha' },
      { id: 59, title: 'Sasha' },
      { id: 24, title: 'Roman' },
      { id: 25, title: 'Maxim' },
      { id: 26, title: 'Andrey' },
      { id: 27, title: 'Sasha' },
      { id: 28, title: 'Sasha' },
      { id: 29, title: 'Sasha' },
      { id: 30, title: 'Sasha' },
      { id: 31, title: 'Sasha' },
      { id: 32, title: 'Sasha' },
      { id: 33, title: 'Dmitry' },
      { id: 34, title: 'Andrey' },
      { id: 35, title: 'Aleksey' },
      { id: 36, title: 'Sasha' },
      { id: 37, title: 'Ivan' },
      { id: 38, title: 'Petr' },
      { id: 39, title: 'Roman' },
      { id: 40, title: 'Maxim' },
      { id: 41, title: 'Andrey' },
      { id: 42, title: 'Sasha' },
      { id: 43, title: 'Sasha' },
      { id: 44, title: 'Sasha' },
      { id: 45, title: 'Sasha' },
      { id: 46, title: 'Sasha' },
      { id: 47, title: 'Andrey' },
      { id: 48, title: 'Aleksey' },
      { id: 49, title: 'Sasha' },
      { id: 50, title: 'Ivan' },
      { id: 51, title: 'Petr' },
      { id: 52, title: 'Roman' },
      { id: 53, title: 'Maxim' },
      { id: 54, title: 'Andrey' },
      { id: 55, title: 'Sasha' },
      { id: 56, title: 'Sasha' },
      { id: 57, title: 'Sasha' },
      { id: 58, title: 'Sasha' },
      { id: 59, title: 'Sasha' }
   ];
   
   var VDomSuggest = Control.extend({
      _template: template,
      _suggest1Value: '',
      _suggest2Value: '',
      
      constructor: function() {
         VDomSuggest.superclass.constructor.apply(this, arguments);
         this._suggestSource = new MemorySource({
            idProperty: 'id',
            data: sourceData
         });
         
         //Чтобы запрос был асинхронным.
         var origQuery = this._suggestSource.query;
         this._suggestSource.query = function() {
            var self = this,
                arg = arguments;
            var def = Deferred.fromTimer(100);
            def.addCallback(function() {
               return origQuery.apply(self, arg);
            });
            return def;
         };
      }
   });
   
   return VDomSuggest;
});