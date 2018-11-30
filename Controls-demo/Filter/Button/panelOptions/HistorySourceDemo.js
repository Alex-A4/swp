define('Controls-demo/Filter/Button/panelOptions/HistorySourceDemo',
   [
      'Core/Control',
      'WS.Data/Di',
      'WS.Data/Source/Memory',
      'Controls/History/Service',
      'Core/Deferred',
      'WS.Data/Source/DataSet',
      'WS.Data/Collection/RecordSet',
      'WS.Data/Adapter/Sbis',
      'Core/Serializer',
      'WS.Data/Entity/Model',
      'Controls/History/Source'
   ],

   function(Control, Di, Memory, HistoryService, Deferred, DataSet, RecordSet, SbisAdapter, Serializer, Model, HistorySource) {
      'use strict';

      var items = [
         {
            id: 'period',
            value: [1],
            resetValue: [1],
            source: new Memory({
               data: [
                  { key: 1, title: 'All time' },
                  { key: 2, title: 'Today' },
                  { key: 3, title: 'Past month' },
                  { key: 4, title: 'Past 6 months' },
                  { key: 5, title: 'Past year' }
               ],
               idProperty: 'key'
            })
         },
         {
            id: 'state',
            value: [1],
            resetValue: [1],
            source: new Memory({
               data: [
                  { key: 1, title: 'All states' },
                  { key: 2, title: 'In progress' },
                  { key: 3, title: 'Done' },
                  { key: 4, title: 'Not done' },
                  { key: 5, title: 'Deleted' }
               ],
               idProperty: 'key'
            })
         },
         {
            id: 'limit',
            value: [1],
            resetValue: [1],
            textValue: 'Due date',
            visibility: false,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'Due date' },
                  { key: 2, title: 'Overdue' }
               ]
            })
         },
         {
            id: 'sender', value: '', resetValue: '', visibility: false
         },
         { id: 'author', value: 'Ivanov K.K.', resetValue: '' },
         {
            id: 'responsible', value: '', resetValue: '', visibility: false
         },
         {
            id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false
         },
         {
            id: 'operation', value: '', resetValue: '', visibility: false
         },
         {
            id: 'group',
            value: [1],
            resetValue: '',
            visibility: false,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'My' },
                  { key: 2, title: 'My department' }
               ]
            })

         },
         {
            id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false
         },
         {
            id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false
         },
         {
            id: 'own',
            value: [2],
            resetValue: '',
            textValue: 'On department',
            visibility: false,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'On me' },
                  { key: 2, title: 'On department' }
               ]
            })
         },
         {
            id: 'our organisation', value: '', resetValue: '', visibility: false
         },
         {
            id: 'document', value: '', resetValue: '', visibility: false
         },
         {
            id: 'activity', value: [1], resetValue: '', selectedKeys: [1], visibility: false
         }
      ];

      var items1 = [
         {
            id: 'period',
            value: [1],
            resetValue: [1],
            source: new Memory({
               data: [
                  { key: 1, title: 'All time' },
                  { key: 2, title: 'Today' },
                  { key: 3, title: 'Past month' },
                  { key: 4, title: 'Past 6 months' },
                  { key: 5, title: 'Past year' }
               ],
               idProperty: 'key'
            })
         },
         {
            id: 'state',
            value: [1],
            resetValue: [1],
            source: new Memory({
               data: [
                  { key: 1, title: 'All states' },
                  { key: 2, title: 'In progress' },
                  { key: 3, title: 'Done' },
                  { key: 4, title: 'Not done' },
                  { key: 5, title: 'Deleted' }
               ],
               idProperty: 'key'
            })
         },
         {
            id: 'limit',
            value: [1],
            resetValue: [1],
            textValue: 'Due date',
            visibility: false,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'Due date' },
                  { key: 2, title: 'Overdue' }
               ]
            })
         },
         {
            id: 'sender', value: '', resetValue: '', visibility: false
         },
         {
            id: 'author',
            value: 'Ivanov K.K.',
            textValue: 'Author: Ivanov K.K.',
            resetValue: '',
            templateItem: 'wml!Controls-demo/Filter/Button/resources/itemTemplate/author'
         },
         {
            id: 'responsible', value: '', resetValue: '', visibility: false
         },
         {
            id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false
         },
         {
            id: 'operation', value: '', resetValue: '', visibility: false
         },
         {
            id: 'group',
            value: [1],
            resetValue: '',
            visibility: false,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'My' },
                  { key: 2, title: 'My department' }
               ]
            })
         },
         {
            id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: false
         },
         {
            id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false
         },
         {
            id: 'own',
            value: [2],
            resetValue: '',
            textValue: 'On department',
            visibility: false,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'On me' },
                  { key: 2, title: 'On department' }
               ]
            })
         },
         {
            id: 'our organisation', value: '', resetValue: '', visibility: false
         },
         {
            id: 'document', value: '', resetValue: '', visibility: false
         },
         {
            id: 'activity',
            value: [1],
            resetValue: [1],
            visibility: false,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'Activity for the last month' },
                  { key: 2, title: 'Activity for the last quarter' },
                  { key: 3, title: 'Activity for the last year' }
               ]
            })
         }
      ];

      var items2 = [
         {
            id: 'period',
            value: [1],
            resetValue: [1],
            source: new Memory({
               data: [
                  { key: 1, title: 'All time' },
                  { key: 2, title: 'Today' },
                  { key: 3, title: 'Past month' },
                  { key: 4, title: 'Past 6 months' },
                  { key: 5, title: 'Past year' }
               ],
               idProperty: 'key'
            })
         },
         {
            id: 'state',
            value: [1],
            resetValue: [1],
            source: new Memory({
               data: [
                  { key: 1, title: 'All states' },
                  { key: 2, title: 'In progress' },
                  { key: 3, title: 'Done' },
                  { key: 4, title: 'Not done' },
                  { key: 5, title: 'Deleted' }
               ],
               idProperty: 'key'
            })
         },
         {
            id: 'limit',
            value: [1],
            resetValue: '',
            textValue: 'Due date',
            visibility: true,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'Due date' },
                  { key: 2, title: 'Overdue' }
               ]
            })
         },
         {
            id: 'sender', value: '', resetValue: '', textValue: 'Petrov B.B', visibility: true
         },
         {
            id: 'author',
            value: 'Ivanov K.K.',
            textValue: 'Author: Ivanov K.K.',
            resetValue: '',
            templateItem: 'wml!Controls-demo/Filter/Button/resources/itemTemplate/author'
         },
         {
            id: 'responsible', value: '', resetValue: '', visibility: false
         },
         {
            id: 'tagging', value: '', resetValue: '', textValue: 'Marks', visibility: false
         },
         {
            id: 'operation', value: '', resetValue: '', visibility: false
         },
         {
            id: 'group',
            value: [1],
            resetValue: [1],
            visibility: false,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'My' },
                  { key: 2, title: 'My department' }
               ]
            })
         },
         {
            id: 'unread', value: true, resetValue: false, textValue: 'Unread', visibility: true
         },
         {
            id: 'loose', value: true, resetValue: '', textValue: 'Loose', visibility: false
         },
         {
            id: 'own',
            value: [2],
            resetValue: '',
            textValue: 'On department',
            visibility: true,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'On me' },
                  { key: 2, title: 'On department' }
               ]
            })
         },
         {
            id: 'our organisation', value: '', resetValue: '', visibility: false
         },
         {
            id: 'document', value: '', resetValue: '', visibility: false
         },
         {
            id: 'activity',
            value: [1],
            resetValue: [1],
            visibility: false,
            source: new Memory({
               idProperty: 'key',
               data: [
                  { key: 1, title: 'Activity for the last month' },
                  { key: 2, title: 'Activity for the last quarter' },
                  { key: 3, title: 'Activity for the last year' }
               ]
            })
         }
      ];

      var config = {
         originSource: new Memory({
            idProperty: 'id',
            data: items
         }),
         historySource: new HistoryService({
            historyId: 'DEMO_HISTORY_ID'
         }),
         parentProperty: 'parent'
      };

      var pinnedData = {
         _type: 'recordset',
         d: [

         ],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };
      var frequentData = {
         _type: 'recordset',
         d: [
            [
               '6', 'History 6', 'TEST_HISTORY_ID_V1'
            ],
            [
               '4', 'History 4', 'TEST_HISTORY_ID_V1'
            ],
            [
               '9', 'History 9', 'TEST_HISTORY_ID_V1'
            ]
         ],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };
      var recentData = {
         _type: 'recordset',
         d: [
            [
               '8', JSON.stringify(items2, new Serializer().serialize), 'TEST_HISTORY_ID_2'
            ],
            [
               '5', JSON.stringify(items1, new Serializer().serialize), 'TEST_HISTORY_ID_1'
            ]
         ],
         s: [
            { n: 'ObjectId', t: 'Строка' },
            { n: 'ObjectData', t: 'Строка' },
            { n: 'HistoryId', t: 'Строка' }
         ]
      };

      function createRecordSet(data) {
         return new RecordSet({
            rawData: data,
            idProperty: 'ObjectId',
            adapter: new SbisAdapter()
         });
      }

      var data = new DataSet({
         rawData: {
            frequent: createRecordSet(frequentData),
            pinned: createRecordSet(pinnedData),
            recent: createRecordSet(recentData)
         },
         itemsProperty: '',
         idProperty: 'ObjectId'
      });

      config.historySource.saveHistory = function() {};

      var histSource = Control.extend({
         getHistoryId: function() {
            return 'DEMO_HISTORY_ID';
         },

         saveHistory: function() {

         },

         update: function(dataHistory, meta) {
            data = new DataSet({
               rawData: {
                  frequent: createRecordSet(frequentData),
                  pinned: createRecordSet(pinnedData),
                  recent: createRecordSet(recentData)
               },
               itemsProperty: '',
               idProperty: 'ObjectId'
            });
            return {};
         },

         query: function() {
            var def = new Deferred();
            def.addCallback(function(set) {
               return set;
            });
            def.callback(data);
            return def;
         }
      });

      Di.register('demoSourceHistory', histSource);

      return histSource;
   });
