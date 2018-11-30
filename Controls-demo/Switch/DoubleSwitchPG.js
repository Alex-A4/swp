define('Controls-demo/Switch/DoubleSwitchPG',
   [
      'Core/Control',
      'tmpl!Controls-demo/PropertyGrid/DemoPG',
      'json!Controls-demo/PropertyGrid/pgtext',

      'css!Controls-demo/Filter/Button/PanelVDom',
      'css!Controls-demo/Input/resources/VdomInputs',
      'css!Controls-demo/Wrapper/Wrapper'
   ],

   function(Control, template, config) {
      'use strict';
      var NumberPG = Control.extend({
         _template: template,
         _items: null,
         _itemsSimple: null,
         _metaData: null,
         _content: 'Controls/Toggle/DoubleSwitch',
         _dataObject: null,
         _componentOptions: null,
         _beforeMount: function() {
            this._items = [
               'on', 'off'
            ];
            this._itemsSimple = [
               'first', 'second'
            ];
            this._dataObject = {
               value: {
                  readOnly: false
               },
               orientation: {
                  keyProperty: 'id',
                  displayProperty: 'title',
                  placeholder: 'select',
                  selectedKey: 0
               },
               captions: {
                  items: [
                     { id: '1', title: 'On-Off', items: this._items },
                     { id: '2', title: 'First-Second', items: this._itemsSimple }
                  ],
                  value: 'On-Off'
               },
            };
            this._componentOptions = {
               name: 'DoubleSwitch',
               readOnly: false,
               captions: this._items,
               tooltip: 'myTooltip',
               orientation: 'horizontal'
            };
            this._metaData = config[this._content].properties['ws-config'].options;
         }
      });
      return NumberPG;
   });
