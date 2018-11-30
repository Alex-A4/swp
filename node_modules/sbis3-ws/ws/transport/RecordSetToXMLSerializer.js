define('Transport/RecordSetToXMLSerializer', [
   'Core/helpers/axo',
   'Core/core-instance',
   'Core/IoC'
], function(
   axo,
   cInstance,
   IoC
) {
   var RecordSetToXMLSerializer;

   function removeInvalidXMLChars(valueStr) {
      /* eslint-disable no-control-regex */
      if (typeof valueStr == "string") {
         valueStr = valueStr.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]*/g, "");
      }
      return valueStr;
   }

   /**
    * Сериализатор выборки-СБИС.
    * Сериализует выборку-СБИС или Запись в XML.
    * @see http://inside.sbis.ru/doc/_layouts/DocIdRedir.aspx?ID=SBIS-5-946
    *
    * @class Transport/RecordSetToXMLSerializer
    * @public
    * @author Бегунов А.В.
    * @singleton
    */
   RecordSetToXMLSerializer = /** @lends Transport/RecordSetToXMLSerializer.prototype */{
      _complexFields: {
         "Связь" : true,
         "Иерархия" : true,
         "Перечисляемое" : true,
         "Флаги" : true,
         "Массив" : true,
         "Запись" : true,
         "Выборка" : true
      },
      _wordsToTranslate: {
         "Дата" : "Date",
         "Время" : "Time",
         "Строка" : "String",
         "Текст" : "Text",
         "Логическое" : "Boolean",
         "Деньги" : "Money",
         "Двоичное" : "Binary",
         'Файл-rpc': 'RPCFile',
         'Временной интервал':'TimeInterval',
         'Идентификатор': 'ID',
         'JSON-объект': 'JSON-object'
      },
      _colNameToTag: {
         "Число целое" : "Integer",
         "Число вещественное" : "Double",
         "Дата и время" : "DateTime"
      },
      _branchTypes: {
         "true": "Node",
         "false": "Leaf",
         "null": "HiddenNode"
      },
      /**
       * Сериализует контейнер в XML-документ
       * @param {Deprecated/Record | Deprecated/RecordSet | Array} records набор сериализуемых записей
       * @return {Document}  результат сериализации
       */
      serialize: function(records, columns, titleColumn, rootNode) {
         var doc = this._createXMLDocument(),
             object = cInstance.instanceOfModule(records, 'Deprecated/Record') ? [records] : records;
         this._serializeObject(object, doc, doc);
         this._serializeColumns(columns, object, doc, titleColumn, rootNode);
         return doc;
      },
      _serializeColumns: function(columns, object, doc, titleColumn, rootNode) {
         var hierField = '',
             cols, column;
         if (columns && columns instanceof Array && columns.length > 0) {
            doc.documentElement.appendChild(cols = doc.createElement('Columns'));
            for (var i = 0, l = columns.length; i < l; i++) {
               cols.appendChild(column = doc.createElement('Column'));
               column.setAttribute('Name', columns[i].title);
               column.setAttribute('Field', columns[i].field);
            }
         }
         if (cInstance.instanceOfModule(object, 'Deprecated/RecordSet')) {
            hierField = object.getHierarchyField();
         }
         if (object instanceof Array && cInstance.instanceOfModule(object[0], 'Deprecated/Record') && object[0].getRecordSet() !== null) {
            var rs = object[0].getRecordSet();
            if (rs) {
               hierField = rs.getHierarchyField();
            }
         }
         if (hierField !== '') {
            doc.documentElement.setAttribute('HierarchyField', hierField);
            doc.documentElement.setAttribute('HierarchyName', titleColumn === undefined ? '' : titleColumn);
            doc.documentElement.setAttribute('Root', rootNode ? (rootNode + "") : '');
         }
      },
      _serializeObject: function(object, parentElement, document) {
         var dataRow,
             currentElement,
             columns = [],
             recordElement,
             pkColumnName;
         if (cInstance.instanceOfModule(object, 'Deprecated/RecordSet')) {
            parentElement.appendChild(currentElement = document.createElement('RecordSet'));
            object.rewind();
            while ((dataRow = object.next()) !== false) {
               this._serializeObject(dataRow, currentElement, document);
            }
         } else if (object instanceof Array) {
            parentElement.appendChild(currentElement = document.createElement('RecordSet'));
            var l = object.length;
            for (var i = 0; i < l; i++) {
               this._serializeObject(object[i], currentElement, document);
            }
         } else if (cInstance.instanceOfModule(object, 'Deprecated/Record')) {
            parentElement.appendChild(recordElement = document.createElement('Record'));
            var key = object.getKey();
            if (key === null) {
               key = 'null';
            }
            recordElement.setAttribute('RecordKey', removeInvalidXMLChars(key + ""));
            columns = object.getColumns();
            pkColumnName = object.getRecordSet() === null ? columns[0] : columns[object.getRecordSet().getPkColumnIndex()];
            recordElement.setAttribute('KeyField', pkColumnName);
            for (var k = 0, cnt = columns.length; k < cnt; k++) {
               this._serializeField(columns[k], object, recordElement, document);
            }
         }
      },
      _serializeField: function(columnName, record, recordElement, document) {
         var colDef,
             fieldElement,
             tagName,
             element,
             cyrillicTest = /[а-я]+/gi;
         colDef = record.getColumnDefinition(columnName);
         recordElement.appendChild(fieldElement = document.createElement('Field'));
         fieldElement.setAttribute('Name', colDef.title);
         var fieldValue = record.get(colDef.title) === null ? "" : record.get(colDef.title);
         var typeName = typeof(colDef.type) == 'object' ? colDef.type.n : colDef.type;
         if (!this._complexFields[typeName] && !colDef.s && !this._complexFields[colDef.s]) {
            tagName = this._colNameToTag[colDef.type] ? this._colNameToTag[colDef.type] : colDef.type;
            tagName = this._wordsToTranslate[tagName] ? this._wordsToTranslate[tagName] : tagName;
            var resultTest = cyrillicTest.test(tagName);
            if(resultTest) {
               IoC.resolve('ILogger').error('XSLT', rk('Внимание! Кирилический тэг без замены:') + ' ' + tagName);
            }
            element = document.createElement(tagName);
            if (fieldValue instanceof Date) {
               if (colDef.type == "Дата и время") {
                  fieldValue = fieldValue.toSQL() + "T" + fieldValue.toTimeString().replace(" GMT", "").replace(/\s[\w\W]*/, "");
               }
               if (colDef.type == "Дата") {
                  fieldValue = fieldValue.toSQL();
               }
               if (colDef.type == "Время") {
                  fieldValue = fieldValue.toTimeString().replace(" GMT", "").replace(/\s[\w\W]*/, "");
               }
            }
            fieldValue = removeInvalidXMLChars(fieldValue + "");
            element.appendChild(document.createTextNode(fieldValue));
            fieldElement.appendChild(element);
         } else if (typeName == 'Связь') {
            element = document.createElement('Link');
            element.setAttribute('Table', typeof(colDef.type) == 'object' ? colDef.type.t : colDef.table);
            element.appendChild(document.createTextNode(fieldValue));
            fieldElement.appendChild(element);
         } else if (typeName == 'Иерархия' || (colDef.s && colDef.s == 'Иерархия')) {
            fieldElement.appendChild(element = document.createElement('Hierarchy'));
            var pID, flBranch;
            element.appendChild(pID = document.createElement('Parent'));
            element.appendChild(flBranch = document.createElement('NodeType'));
            if (typeof(colDef.type) == 'object') {
               element.setAttribute('HierarchyName', colDef.type.f + "");
               pID.appendChild(document.createTextNode(fieldValue[1] + ""));
               flBranch.appendChild(document.createTextNode(this._branchTypes[fieldValue[0] + ""]));
            } else {
               if (typeName == "Идентификатор") {
                  element.setAttribute('HierarchyName', colDef.titleColumn + "");
                  pID.appendChild(document.createTextNode(fieldValue + ""));
                  if (record.hasColumn(colDef.title + "@")) {
                     fieldValue = this._branchTypes[record.get(colDef.title + "@") + ""];
                     flBranch.appendChild(document.createTextNode(fieldValue));
                  }
               } else {
                  recordElement.removeChild(fieldElement);
               }
            }
         } else if (typeName == 'Перечисляемое') {
            fieldElement.appendChild(element = document.createElement('Enumerable'));
            var option;
            fieldValue = fieldValue.toObject();
            for (var key in fieldValue.availableValues) {
               if (fieldValue.availableValues.hasOwnProperty(key)) {
                  element.appendChild(option = document.createElement('Variant'));
                  option.setAttribute('Value', key);
                  var value = fieldValue.availableValues[key];
                  if (value === null) {
                     value = '';
                  }
                  option.setAttribute('Title', value);
                  if (key == fieldValue.currentValue) {
                     option.setAttribute('Checked', 'true');
                  }
               }
            }
         } else if (typeName == 'Флаги') {
            fieldElement.appendChild(element = document.createElement('Flags'));
            var flag;
            if (fieldValue) {
                fieldValue = fieldValue.toObject();
                for (var number in fieldValue) {
                    if (fieldValue.hasOwnProperty(number)) {
                        element.appendChild(flag = document.createElement('Flag'));
                        flag.setAttribute('Title', number);
                        flag.setAttribute('Condition', fieldValue[number] + "");
                    }
                }
            }
         } else if (typeName == 'Массив') {
            fieldElement.appendChild(element = document.createElement('Array'));
            element.setAttribute('DataType', typeof(colDef.type) == 'object' ? colDef.type.t : colDef.arrayType);
            var elem;
            for (var i = 0, l = fieldValue.length; i < l; i++) {
               element.appendChild(elem = document.createElement('Value'));
               //для элементов массива всегда добавляем их значение как текст, ведь там может быть null
               elem.appendChild(document.createTextNode(removeInvalidXMLChars(fieldValue[i] + '')));
            }
         } else if (cInstance.instanceOfModule(fieldValue, 'Deprecated/RecordSet') || cInstance.instanceOfModule(fieldValue, 'Deprecated/Record')) {
            this._serializeObject(fieldValue, fieldElement, document);
         }
      },
      _createXMLDocument: function() {
         var doc;
         // нормальные браузеры
         if (document.implementation && document.implementation.createDocument) {
            doc = document.implementation.createDocument("", "", null);
         }
         // IE
         if (axo) {
            doc = axo('Microsoft.XmlDom');
         }
         return doc;
      }
   };

   return RecordSetToXMLSerializer;
});
