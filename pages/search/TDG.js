function onRequiredFn(SearchForm, TreeDataGridView, ComponentBinder, Memory, CoreDeferred) {
   var
      event = $.Event('keypress'),
      SearchMemorySource = Memory.extend({
         query: function (query) {
            return CoreDeferred.success(
               this._prepareQueryResult({
                  items: query.getOffset() === 0 ? page1 : page2,
                  total: 12
               })
            );
         }
      }),
      treeDataGridView = new TreeDataGridView({
         element: 'TreeDataGridView',
         dataSource: new SearchMemorySource({
            data: [],
            idProperty: 'id'
         }),
         columns: viewColumns,
         idProperty: 'id',
         parentProperty: 'par',
         displayProperty: 'title',
         allowEnterToFolder: false,
         itemsActions: [],
         pageSize: 10,
         infiniteScroll: true
      }),
      treeDataGridViewExpand = new TreeDataGridView({
         element: 'TreeDataGridViewExpand',
         items: [].concat(page1, page2),
         columns: viewColumns,
         idProperty: 'id',
         parentProperty: 'par',
         displayProperty: 'title',
         allowEnterToFolder: false,
         expand: true,
         itemsActions: [],
         pageSize: 10
      }),
      searchForm = new SearchForm({
         element: 'SearchForm'
      }),
      componentBinder = new ComponentBinder({
         searchForm: searchForm,
         view: treeDataGridView
      });
   componentBinder.bindSearchGrid('title');
   searchForm.setText('item');
   event.which = 13;
   searchForm._keyUpBind(event);
}

var
   viewColumns = [
      {
         title: 'title',
         field: 'title'
      }
   ],
   page1 = [
      { id: 'f1', title: 'folder 1', par: null, 'par@': true },
      { id: 'i1', title: 'item 1', par: 'f1', 'par@': null },
      { id: 'i2', title: 'item 2', par: 'f1', 'par@': null },
      { id: 'i3', title: 'item 3', par: 'f1', 'par@': null },
      { id: 'f2', title: 'folder 2', par: null, 'par@': true },
      { id: 'f3', title: 'folder 3', par: 'f2', 'par@': true },
      { id: 'i4', title: 'item 4', par: 'f3', 'par@': null },
      { id: 'f4', title: 'folder 4', par: null, 'par@': true },
      { id: 'f5', title: 'folder 5', par: 'f4', 'par@': true },
      { id: 'i5', title: 'item 5', par: 'f5', 'par@': null }],
   page2 = [
      { id: 'f4', title: 'folder 4', par: null, 'par@': true },
      { id: 'f5', title: 'folder 5', par: 'f4', 'par@': true },
      { id: 'f6', title: 'folder 6', par: 'f5', 'par@': true },
      { id: 'f7', title: 'folder 7', par: 'f6', 'par@': true },
      { id: 'i6', title: 'item 6', par: 'f7', 'par@': null },
      { id: 'f8', title: 'folder 8', par: null, 'par@': true },
      { id: 'i7', title: 'item 7', par: 'f8', 'par@': null },
      { id: 'i8', title: 'item 8', par: null, 'par@': null }];

// ----------------------------------------- ON ENGINE READY AND FILES REQUIRED ----------------------------------------
$ws.core.ready.addCallback(function () {
   $(document).ready(function () {
      require(['SBIS3.CONTROLS/Link'], function(Link) {
         new Link({
            element: 'BackButton',
            caption: 'Назад',
            href: '../../',
            icon: 'sprite:icon-16 icon-DayBackward icon-primary'
         });
         require(['SBIS3.CONTROLS/SearchForm', 'SBIS3.CONTROLS/Tree/DataGridView', 'SBIS3.CONTROLS/ComponentBinder', 'WS.Data/Source/Memory', 'Core/Deferred'], onRequiredFn);
      });
   });
});