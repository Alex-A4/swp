define('Transport/ReportPrinter', [
   'Core/core-extend',
   'Core/Deferred',
   'Core/xslt-async',
   'Transport/RecordSetToXMLSerializer'
], function(
   coreExtend,
   Deferred,
   XSLTransform,
   RecordSetToXMLSerializer
) {
   var ReportPrinter;

   /**
    * @class Transport/ReportPrinter
    * @author Бегунов А.В.
    * @public
    */
   ReportPrinter = coreExtend.extend({}, /** @lends Transport/ReportPrinter.prototype */{
      $protected: {
         _options: {
            columns: [],
            titleColumn: ''
         }
      },
      /**
       * Подготавливает отчет по входящим данным и трансормации
       *
       * @param {Deprecated/Record|Deprecated/RecordSet} object Данные для отчета
       * @param {string|Document} xsl Адрес, текстовое содержимое или инстанс XSL-документа
       * @param {*|number|string} rootNode Текущий отображаемый узел
       * @param {Document} xml XML-документ
       * @returns {Core/Deferred} Асинхронный результат, возвращающий текст отчета
       */
      prepareReport: function(object, xsl, rootNode, xml) {
         var resDef = new Deferred();
         var xmlDoc = xml && xml.documentElement ? xml : RecordSetToXMLSerializer.serialize(object, this._options.columns, this._options.titleColumn, rootNode);
         var transofrmer = new XSLTransform({xml: xmlDoc, xsl: xsl});
         transofrmer.execute().addCallback(function () {
            transofrmer.transformToText().addCallback(function (res) {
               res.replace('<transformiix:result xmlns:transformiix=\"http://www.mozilla.org/TransforMiix\">', '')
                  .replace('</transformiix:result>', '');
               transofrmer.destroy();
               resDef.callback(res);
            });
         });

         return resDef;
      },
      /**
       * Возвращает набор колонок, по которым строится отчет на печать
       * @returns {*|Array}
       */
      getColumns: function() {
         return this._options.columns;
      },
      /**
       * Устанавливает набор колонок, по которым строится отчет на печать
       * @param {*|Array} columns Массив колонок, по которым строится отчет на печать
       */
      setColumns: function(columns) {
         this._options.columns = columns;
      },
      /**
       * Возвращает поле с названием иерархии, по которому строится отчет на печать
       * @return {string}
       */
      getTitleColumn: function() {
         return this._options.titleColumn;
      }
   });

   return ReportPrinter;
});
