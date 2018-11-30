define('Controls-demo/OperationsPanel/Panel', [
   'Core/Control',
   'wml!Controls-demo/OperationsPanel/Panel/Panel',
   'wml!Controls-demo/OperationsPanel/Panel/RightTemplate',
   'WS.Data/Source/Memory',
   'css!Controls-demo/OperationsPanel/Panel/Panel'
], function(Control, template, RightTemplate, MemorySource) {
   'use strict';
   var PANEL_ITEMS_FIRST = [{
      id: 'remove',
      icon: 'icon-Erase icon-error',
      '@parent': false,
      title: 'Удалить',
      parent: null
   }, {
      id: 'save',
      icon: 'icon-Save',
      '@parent': true,
      title: 'Выгрузить',
      parent: null
   }, {
      id: 'savePDF',
      '@parent': false,
      title: 'PDF',
      parent: 'save'
   }, {
      id: 'saveExcel',
      '@parent': false,
      title: 'Excel',
      parent: 'save'
   }, {
      id: 'move',
      icon: 'icon-Move',
      '@parent': false,
      title: 'Перенести',
      parent: null
   }];
   var PANEL_ITEMS_SECOND = [{
      id: 'merge',
      icon: 'icon-Unite',
      '@parent': false,
      title: 'Объединить',
      parent: null
   }, {
      id: 'read',
      icon: 'icon-WorkRead',
      '@parent': false,
      title: 'Прочитать',
      parent: null
   }, {
      id: 'show',
      icon: 'icon-Show',
      '@parent': false,
      title: 'Поставить на контроль',
      parent: null
   }];
   var _private = {
      getPanelSource: function(key) {
         var data = [];
         if (key) {
            data = data.concat(PANEL_ITEMS_FIRST);
         }
         if (key === 2) {
            data = data.concat(PANEL_ITEMS_SECOND);
         }
         return new MemorySource({
            idProperty: 'id',
            data: data
         });
      }
   };
   var DEMO_ITEMS = [{
      id: 0,
      title: '0 items'
   }, {
      id: 1,
      title: '3 items'
   }, {
      id: 2,
      title: '6 items'
   }];
   return Control.extend({
      _template: template,
      _expanded: false,
      _eventName: '',
      _multiSelectorVisibility: true,
      _rightTemplate: true,
      _rightTemplateTpl: null,
      _viewSource: null,
      _sourceConfig: null,
      _sourceNumber: 1,
      _source: null,
      _ptivate: null,
      PANEL_ITEMS_FIRST: null,
      PANEL_ITEMS_SECOND: null,
      DEMO_ITEMS: null,
      _beforeMount: function() {
         this._rightTemplateTpl = RightTemplate;
         this._viewSource = new MemorySource({
            idProperty: 'id',
            data: DEMO_ITEMS
         });
         this._sourceConfig = new MemorySource({
            idProperty: 'id',
            data: DEMO_ITEMS
         });
         this._source = _private.getPanelSource(1);
         this._selectedKeys = [];
         this._excludedKeys = [];
         this._selectedKeysCount = 0;
      },
      sourceChange: function(e, key) {
         this._sourceNumber = key;
         this._source = _private.getPanelSource(key);
      },
      _reset: function() {
         this._eventName = '';
      },
      _selectedTypeChangedHandler: function(e, type) {
         if (type === 'selectAll') {
            this._selectedKeys = [null];
         } else if (type === 'unselectAll') {
            this._selectedKeys = [];
         } else {
            this._selectedKeys = this._selectedKeys.length ? [] : [null];
         }
      },

      _eventHandler: function(e) {
         this._eventName = e.type;
      }
   });
});
