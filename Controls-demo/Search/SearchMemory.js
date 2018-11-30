define('Controls-demo/Search/SearchMemory', [
   'WS.Data/Source/Memory',
      'Core/Deferred',
      'Controls-demo/Search/kbLayoutRevert',
      'WS.Data/Source/DataSet',
      'WS.Data/Entity/Model',
      'Core/core-clone'
   ],
   
   function(Memory, Deferred, kbLayoutRevert, DataSet, Model, clone) {
      
      'use strict';
      
      var BrowserMemory = Memory.extend({
         
         constructor: function(options) {
            BrowserMemory.superclass.constructor.apply(this, arguments);
            this.searchParam = options.searchParam || options.idProperty;
         },
         
         query: function(queryInst) {
            var resultDeferred = new Deferred();
            var superQuery = BrowserMemory.superclass.query.apply(this, arguments);
            var self = this;
            
            superQuery.addCallback(function(dataSet) {
               if (queryInst._where[self.searchParam]) {
                  var switchedStr = kbLayoutRevert.process(queryInst._where[self.searchParam]);
                  queryInst._where = clone(queryInst._where);
                  queryInst._where[self.searchParam] = switchedStr;
                  
                  BrowserMemory.superclass.query.call(self, queryInst).addCallback(function(revertedDataSet) {
                     var revertedRecordSet = revertedDataSet.getAll();
                     var recordSet = dataSet.getAll();
                     var rawData;
                     
                     var revertedRecordSetCount = revertedRecordSet.getCount();
                     
                     recordSet.append(revertedRecordSet);
                     rawData = recordSet.getRawData();
                     
                     var ds = new DataSet({
                        rawData: rawData,
                        idProperty: recordSet.getIdProperty(),
                        adapter: recordSet.getAdapter()
                     });
                     
                     var getAll = ds.getAll.bind(ds);
                     var originAll = getAll();
                     var originAllMeta = originAll.getMetaData();
                     var results = new Model({
                        rawData: {
                           tabsSelectedKey: queryInst.getWhere()['currentTab'] ? queryInst.getWhere()['currentTab'] : 1,
                           switchedStr: revertedRecordSetCount ? switchedStr : '',
                           tabs: [{id: 1, title: 'Вкладка'}, {id: 2, title: 'Вкладка2'}],
                        }
                     });
                     originAllMeta.results = results;
                     originAllMeta.more = recordSet.getMetaData().more;
                     ds.getAll = function() {
                        var resultAll = getAll();
                        resultAll.setMetaData(originAllMeta);
                        return resultAll;
                     };
                     
                     resultDeferred.callback(ds);
                     return revertedDataSet;
                  });
               } else {
                  var getAll = dataSet.getAll.bind(dataSet);
                  var originAll = getAll();
                  var originAllMeta = originAll.getMetaData();
                  var results = new Model({
                     rawData: {
                        tabsSelectedKey: queryInst.getWhere()['currentTab'] ? queryInst.getWhere()['currentTab'] : 1,
                        tabs: [{id: 1, title: 'Вкладка'}, {id: 2, title: 'Вкладка2'}],
                     }
                  });
                  originAllMeta.results = results;
                  originAllMeta.more = originAll.getMetaData().more;
                  dataSet.getAll = function() {
                     var resultAll = getAll();
                     resultAll.setMetaData(originAllMeta);
                     return resultAll;
                  };
                  resultDeferred.callback(dataSet);
               }
               return dataSet;
            });
            
            return resultDeferred;
         }
         
      });
      
      return BrowserMemory;
   });
