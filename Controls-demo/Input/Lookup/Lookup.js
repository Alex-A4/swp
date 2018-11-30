define('Controls-demo/Input/Lookup/Lookup',
   [
      'Core/Control',
      'wml!Controls-demo/Input/Lookup/Lookup',
      'WS.Data/Source/Memory',
      'Controls-demo/Utils/MemorySourceFilter',
      'Controls-demo/Input/Lookup/LookupData',
      'Controls/Input/Lookup',
      'css!Controls-demo/Input/Lookup/Collection',
      'css!Controls-demo/Input/Lookup/Lookup'
   ],
   function(Control, template, Memory, memorySourceFilter, lookupData) {
      'use strict';
      var Lookup = Control.extend({
         _template: template,
         _value: '',
         _value1: '',
         _value2: '',
         _value3: '',
         _value4: '',
         _value5: '',
         _selectedKeys: null,
         _selectedKeys1: null,
         _selectedKeys2: null,
         _selectedKeys3: null,
         _selectedKeys4: null,
         _selectedKeys5: null,
         _selectedKeys6: null,
         _selectedKeys7: null,
         _source: null,
         _beforeMount: function() {
            this._selectedKeys = [4];
            this._selectedKeys1 = [4];
            this._selectedKeys2 = [4];
            this._selectedKeys3 = [4];
            this._selectedKeys4 = [4];
            this._selectedKeys5 = [4];
            this._selectedKeys6 = [4, 2, 5 ,3, 8];
            this._selectedKeys7 = [];
            this._source = new Memory({
               data: lookupData.names,
               idProperty: 'id',
               filter: memorySourceFilter()
            });
         },

         showSelector: function() {
            this._children.lookup.showSelector();
         },

         showSelector2: function() {
            this._children.lookup2.showSelector();
         }
      });

      return Lookup;
   });
