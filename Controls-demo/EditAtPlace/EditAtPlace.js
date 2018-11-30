define('Controls-demo/EditAtPlace/EditAtPlace', [
   'Core/Control',
   'wml!Controls-demo/EditAtPlace/EditAtPlace',
   'WS.Data/Entity/Record',
   'WS.Data/Source/Memory',
   'wml!Controls-demo/EditAtPlace/resources/exampleTabTemplate',
   'wml!Controls-demo/EditAtPlace/resources/exampleTabTemplate2',

   'css!Controls-demo/EditAtPlace/EditAtPlace'
], function(
   Control,
   template,
   Record,
   MemorySource,
   exampleTabTemplate,
   exampleTabTemplate2
) {
   'use strict';
   var tabsData = [
         {
            id: 0,
            title: 'Поручение',
            align: 'left',
            number: '3565654',
            date: '09.01.17',
            itemTemplate: exampleTabTemplate
         },
         {
            id: 1,
            align: 'right',
            title: 'Лента событий'
         }
      ],
      tabsData2 = [
         {
            id: 0,
            align: 'left',
            name: 'Компания "Сбис плюс"',
            itemTemplate: exampleTabTemplate2
         }],
      toolbarItems = [
         {
            id: '1',
            icon: 'icon-Print',
            title: 'Распечатать',
            '@parent': false,
            parent: null
         },
         {
            id: '2',
            icon: 'icon-RelatedDocumentsDown',
            title: 'Связанные документы',
            '@parent': false,
            parent: null
         },
         {
            id: '3',
            icon: 'icon-Question2',
            title: 'Задать вопрос',
            '@parent': false,
            parent: null
         }
      ];

   var EditAtPlace = Control.extend({
      _template: template,
      _record: null,
      _selectedTab: 0,
      _selectedTab2: 0,
      _tabSource: null,

      _beforeMount: function() {
         this._record = new Record({
            rawData: {
               id: 1,
               text1: 'Мой отдел'
            }
         });
         this._tabSource = new MemorySource({
            idProperty: 'id',
            data: tabsData
         });
         this._tabSource2 = new MemorySource({
            idProperty: 'id',
            data: tabsData2
         });
         this._toolbarSource = new MemorySource({
            idProperty: 'id',
            data: toolbarItems
         });
      }
   });
   return EditAtPlace;
});
