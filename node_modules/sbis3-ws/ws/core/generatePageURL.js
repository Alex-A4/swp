define('Core/generatePageURL', [
   'Core/constants',
   'Core/IoC',
   'Core/helpers/Object/isEmpty',
   'Transport/serializeURLData'
], function(
   constants,
   IoC,
   isEmptyObject,
   serializeURLData
) {

   /**
    * Создаёт URL для открытия страницы редактирования/создания записи.
    * @param {Object} cfg Объект параметров функции.
    * @param {String} cfg.recordId Идентификатор записи.
    * @param {Boolean} cfg.isBranch Узел или лист.
    * @param {Number} cfg.parentId Идентификатор родителя отображаемой записи.
    * @param {Boolean} cfg.isCopy Копирование.
    * @param {String} cfg.editDialogTemplate Имя шаблона диалога редактирования элемента.
    * @param {String} cfg.id Идентификатор браузера.
    * @param {Boolean} cfg.readOnly Будет ли невозможно менять содержимое.
    * @param {Object} cfg.dataSource Параметры получения данных.
    * @param {Object} cfg.filter Текущий фильтр.
    * @param {Object} cfg.reports Список отчетов.
    * @param {Object} cfg.handlers Обработчики событий. Ключ - имя события, значение - путь к обработчику
    * @param {String} cfg.columnParentId Поле иерархии.
    * @param {String} cfg.changedRecordValues Хэш-меп значений, которые уже изменены в записи и которые нужно перенести на страницу редактирования.
    * @param {Boolean} cfg.history
    * @param {Boolean} [retParams] Признак того, как возвращать результат: в виде объекта (true) или строки (false).
    * @param {String} [url]
    * @return {String|Boolean}
    * @example
    * <pre>
    *  var params = {
       *      recordId : "1",
       *      editDialogTemplate : "Edit",
       *      id: view.getid(),
       *      readOnly: false,
       *      dataSource: dataSource,
       *      reports : reports,
       *      handlers : {
       *       'onBeforeCreate': ['/resources/Module/handlerFile/handlerFunction']
       *      }
       *  },
    *  paramsObj = helpers.generatePageURL(params, true );
    * </pre>
    * @see generateURL
    * @see randomId
    * @see createGUID
    */
   return function (cfg, retParams, url) {
      if ((cfg.editDialogTemplate && (constants.htmlNames[cfg.editDialogTemplate] || constants.xmlContents[cfg.editDialogTemplate]))) {
         var isHierarchyMode = !!(cfg.isBranch),
            hdlIsObject = cfg.handlers && Object.prototype.toString.call(cfg.handlers) == "[object Object]",
            params = {
               id: cfg.id,
               hierMode: isHierarchyMode,
               pk: cfg.recordId,
               copy: cfg.isCopy || false,
               readOnly: cfg.readOnly || false,
               obj: cfg.dataSource.readerParams.linkedObject,
               _events: {}
            },
            editTemplate,
            pageURL;
         if (url) {
            pageURL = url;
         }
         else if (constants.htmlNames[cfg.editDialogTemplate]) {
            var arr = constants.htmlNames[cfg.editDialogTemplate].split('/');
            pageURL = arr[arr.length - 1];
         }
         else {
            editTemplate = constants.xmlContents[cfg.editDialogTemplate].split('/');
            pageURL = constants.appRoot + editTemplate[editTemplate.length - 1] + ".html";
         }
         params["changedRecordValues"] = cfg.changedRecordValues;
         params["history"] = cfg.history;
         params["format"] = cfg.dataSource.readerParams.format;
         params["type"] = cfg.dataSource.readerType;
         if (cfg.dataSource.readerParams.otherURL !== constants.defaultServiceUrl) {
            params["url"] = cfg.dataSource.readerParams.otherURL;
         }
         params["db"] = cfg.dataSource.readerParams.dbScheme;
         params["method"] = cfg.dataSource.readerParams.queryName;
         params["readMethod"] = cfg.dataSource.readerParams.readMethodName;
         params["createMethod"] = cfg.dataSource.readerParams.createMethodName;
         params["updateMethod"] = cfg.dataSource.readerParams.updateMethodName;
         params["destroyMethod"] = cfg.dataSource.readerParams.destroyMethodName;
         if (isHierarchyMode) {
            params["branch"] = cfg.isBranch;
            params["pId"] = cfg.parentId;
            if (cfg.columnParentId)
               params["pIdCol"] = cfg.columnParentId;
         }
         if (cfg.recordId === undefined) {
            params["filter"] = cfg.filter;
            params._events["onBeforeCreate"] = hdlIsObject && cfg.handlers.onBeforeCreate || [];
            params._events["onBeforeInsert"] = hdlIsObject && cfg.handlers.onBeforeInsert || [];
         }
         params._events["onBeforeRead"] = hdlIsObject && cfg.handlers.onBeforeRead || [];
         params._events["onBeforeUpdate"] = hdlIsObject && cfg.handlers.onBeforeUpdate || [];
         params._events["onBeforeShowRecord"] = hdlIsObject && cfg.handlers.onBeforeShowRecord || [];
         params._events["onLoadError"] = hdlIsObject && cfg.handlers.onLoadError || [];
         if (cfg.reports && !(isEmptyObject(cfg.reports))) {
            params["reports"] = cfg.reports;
            params._events["onBeforeShowPrintReports"] = hdlIsObject && cfg.handlers.onBeforeShowPrintReports || [];
            params._events["onPrepareReportData"] = hdlIsObject && cfg.handlers.onPrepareReportData || [];
            params._events["onSelectReportTransform"] = hdlIsObject && cfg.handlers.onSelectReportTransform || [];
         }
         if (retParams) {
            return params;
         }
         else {
            pageURL += "?editParams=" + encodeURIComponent(serializeURLData(params));
            return pageURL;
         }
      } else {
         if (!constants.htmlNames[cfg.editDialogTemplate] && !constants.xmlContents[cfg.editDialogTemplate]) {
            IoC.resolve('ILogger').log('Core/generatePageURL', 'ВНИМАНИЕ! Диалог "' + cfg.editDialogTemplate + '" отсутствует в оглавлении!');
         }
         return false;
      }
   };
});
