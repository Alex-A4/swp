define('Core/generateURL', [
   'Core/generatePageURL'
], function(
   generatePageURL
) {

   /**
    * Создаёт URL для открытия страницы редактирования/создания записи.
    * @param {String} recordId Идентификатор записи.
    * @param {Boolean} isBranch Признак: узел или лист.
    * @param {Number} parentId Идентификатор родителя отображаемой записи.
    * @param {Boolean} isCopy Производить ли копирование записи.
    * @param {String} editDialogTemplate Имя шаблона диалога редактирования элемента.
    * @param {String} id Идентификатор браузера.
    * @param {Boolean} readOnly Будет ли невозможно менять содержимое.
    * @param {Object} dataSource Параметры получения данных.
    * @param {Object} filter Текущий фильтр.
    * @param {Object} [reports] Список отчетов.
    * @param {Object} [handlers] Обработчики событий.
    * @param {String} [columnParentId] Поле иерархии.
    * @return {String|Boolean}
    * @see generatePageURL
    * @see randomId
    * @see createGUID
    */
   return function (recordId, isBranch, parentId, isCopy, editDialogTemplate, id, readOnly, dataSource, filter, reports, handlers, columnParentId) {
      var params = {
         recordId: recordId,
         isBranch: isBranch,
         parentId: parentId,
         isCopy: isCopy,
         editDialogTemplate: editDialogTemplate,
         id: id,
         readOnly: readOnly,
         dataSource: dataSource,
         filter: filter,
         reports: reports,
         handlers: handlers,
         columnParentId: columnParentId
      };
      return generatePageURL(params, false);
   };
});
