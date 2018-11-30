define('Controls/List/Grid/GridView', [
   'Core/Deferred',
   'Controls/List/ListView',
   'wml!Controls/List/Grid/GridViewTemplateChooser',
   'wml!Controls/List/Grid/Item',
   'wml!Controls/List/Grid/Column',
   'wml!Controls/List/Grid/HeaderContent',
   'Core/detection',
   'wml!Controls/List/Grid/GroupTemplate',
   'wml!Controls/List/Grid/Header',
   'wml!Controls/List/Grid/Results',
   'wml!Controls/List/Grid/ColGroup',
   'css!theme?Controls/List/Grid/Grid',
   'Controls/List/BaseControl/Scroll/Emitter'
], function(cDeferred, ListView, GridViewTemplateChooser, DefaultItemTpl, ColumnTpl, HeaderContentTpl, cDetection, GroupTemplate) {

   'use strict';

   var
      _private = {
         prepareGridTemplateColumns: function(columns, multiselect) {
            var
               result = '';
            if (multiselect === 'visible' || multiselect === 'onhover') {
               result += 'auto ';
            }
            columns.forEach(function(column) {
               result += column.width ? column.width + ' ' : '1fr ';
            });
            return result;
         },
         prepareHeaderAndResultsIfFullGridSupport: function(results, header, container) {
            var
               resultsPadding,
               cells;
            if (results) {
               if (results.position === 'top') {
                  if (header) {
                     resultsPadding = container.getElementsByClassName('controls-Grid__header-cell')[0].getBoundingClientRect().height + 'px';
                  } else {
                     resultsPadding = '0';
                  }
               } else {
                  resultsPadding = 'calc(100% - ' + container.getElementsByClassName('controls-Grid__results-cell')[0].getBoundingClientRect().height + 'px)';
               }
               cells = container.getElementsByClassName('controls-Grid__results-cell');
               Array.prototype.forEach.call(cells, function(elem) {
                  elem.style.top = resultsPadding;
               });
            }
         }
      },
      GridView = ListView.extend({
         _gridTemplateName: null,
         isNotFullGridSupport: cDetection.isNotFullGridSupport,
         _template: GridViewTemplateChooser,
         _groupTemplate: GroupTemplate,
         _defaultItemTemplate: DefaultItemTpl,
         _headerContentTemplate: HeaderContentTpl,
         _prepareGridTemplateColumns: _private.prepareGridTemplateColumns,

         _beforeMount: function(cfg) {
            var
               requireDeferred = new cDeferred(),
               modules = [];
            this._gridTemplateName = cDetection.isNotFullGridSupport ? 'wml!Controls/List/Grid/OldGridView' : 'wml!Controls/List/Grid/NewGridView';
            modules.push(this._gridTemplateName);
            if (cDetection.isNotFullGridSupport) {
               modules.push('css!Controls/List/Grid/OldGrid');
            }
            GridView.superclass._beforeMount.apply(this, arguments);
            this._listModel.setColumnTemplate(ColumnTpl);
            require(modules, function() {
               requireDeferred.callback();
            });
            return requireDeferred;
         },

         _afterMount: function() {
            GridView.superclass._afterMount.apply(this, arguments);
            if (!cDetection.isNotFullGridSupport) {
               _private.prepareHeaderAndResultsIfFullGridSupport(this._listModel.getResults(), this._listModel.getHeader(), this._container);
            }
         }
      });

   GridView._private = _private;

   return GridView;
});
