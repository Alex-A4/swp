define('Controls-demo/PropertyGrid/EnumTemplate',
   [
      'Core/Control',
      'wml!Controls-demo/PropertyGrid/EnumTemplate',
      'WS.Data/Source/Memory',
      'Core/core-merge',
      'css!Controls-demo/Input/resources/VdomInputs',
      'css!Controls-demo/Input/Suggest/Suggest'
   ],
   function(Control, template, Memory, cMerge) {
      'use strict';
      var stringTmpl = Control.extend({
         _template: template,
         _source: null,
         _beforeMount: function(opt) {
            var self = this;
            this._source = Object.keys(opt.enum).map(function(key, index) {
               if (opt.default === key) {
                  self._selectedKey = index;
               }
               return {
                  id: index,
                  value: opt.enum[key],
                  title: key,
                  comment: opt.enum[key],
                  type: (opt.displayType ? 'source' : '')
               };
            });
            this._comboboxOptions = {
               selectedKey: this._selectedKey,
               displayProperty: 'title',
               keyProperty: 'id'
            };
            cMerge(this._comboboxOptions, opt);
         },
         _selectedItemHandler: function(event, tmp) {
            if (this._source[tmp]) {
               if (this._source[tmp].type === 'source') {
                  this._notify('valueChanged',  [this._source[tmp].comment]);
               } else {
                  this._notify('valueChanged',  [this._source[tmp].title]);
               }
            } else {
               this._notify('valueChanged', undefined);
            }
         },
         _comboBoxSource: function() {
            return new Memory({
               idProperty: 'id',
               data: this._source
            });
         }
      });


      return stringTmpl;
   });
