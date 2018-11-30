define('Controls-demo/Switch/standartDemoSwitch', [
   'Core/Control',
   'wml!Controls-demo/Switch/standartDemoSwitch',
   'WS.Data/Source/Memory',
   'tmpl!Controls-demo/Switch/resources/customCaptionTemplate',
   'css!Controls-demo/Switch/standartDemoSwitch'
], function(Control, template, MemorySource, customCaptionTemplate) {
   'use strict';
   var ModuleClass = Control.extend({
      _template: template,
      _source: null,
      _selectKey: '1',
      _selectKey2: '1',
      _selectKey3: '',
      _selectKey4: '1',
      value: false,
      value1: true,
      value2: false,
      value3: true,
      value4: false,
      value5: true,
      value6: true,
      _customCaptionTemplate: customCaptionTemplate,
      _beforeMount: function() {
         this._source = new MemorySource({
            idProperty: 'id',
            displayProperty: 'caption',
            data: [
               {
                  id: '1',
                  title: 'State1'
               },
               {
                  id: '2',
                  title: 'State2'
               }
            ]
         });
         this._sourceAdditional = new MemorySource({
            data: [
               {
                  id: '1',
                  title: 'По юридическим лицам',
                  additionalTitle: '- группировка сотрудников по нашим организациям, в которые они приняты на работу'
               },
               {
                  id: '2',
                  title: 'Управленческая структура',
                  additionalTitle: ' - единый список сотрудников по всем нашим организациям, группировка по управленческим подразделениям'
               }
            ]
         });
      },

      changeKey: function(e, radioIndex, key) {
         switch (radioIndex) {
            case 1:
               this._selectKey = key;
               break;
            case 2:
               this._selectKey2 = key;
               break;
            case 3:
               this._selectKey3 = key;
               break;
            case 4:
               this._selectKey4 = key;
               break;
         }
      }
   });
   return ModuleClass;
});
