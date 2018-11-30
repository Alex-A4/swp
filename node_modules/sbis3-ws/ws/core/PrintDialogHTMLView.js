define('Core/PrintDialogHTMLView', [
   'Core/core-merge',
   'Core/helpers/Function/shallowClone',
   'Core/WindowManager',
   'Core/moduleStubs'
], function (cMerge, shallowClone, WindowManager, moduleStubs) {
   /**
    * Модуль, в котором описана функция <b>showHTMLForPrint(htmlText, top, left, opener)</b>.
    * Показывает стандартный платформенный диалог печати.
    * Создание диалога производится на основе класса {@link Deprecated/Controls/PrintDialog/PrintDialog}.
    *
    * <h2>Параметры функции</h2>
    * <ul>
    *     <li><b>elem</b> {*} - переменная, тип котороой необходимо определить.</li>
    *     <li>{String|Object} htmlText|cfg Если этот параметр-строка, то в нём лежит html-текст, который нужно показать в окне предварительного просмотра при печати.
    *     Если этот параметр-объект, то в нём лежит набор аргументов функции плюс, если нужно, параметры, используемые в конструкторе диалога печати (см. справку по конструктору Lib/Control/Dialog/Dialog).
    *     Первый параметр можно задавать объектом, чтобы было удобнее передать только те аргументы, которые нужно, и не писать undefined вместо остальных.</li>
    *     <li>{Number} [top] отступ сверху для окна предварительного просмотра</li>
    *     <li>{Number} [left] отступ слева для окна предварительного просмотра</li>
    *     <li>{Object} [opener] контрол, который вызвал функцию (нужен в случае вызова из floatArea)</li>
    *     <li>{String} cfg.htmlText html-текст, который нужно показать в окне предварительного просмотра при печати</li>
    *     <li>{Number} [cfg.top] отступ сверху для окна предварительного просмотра</li>
    *     <li>{Number} [cfg.left] отступ слева для окна предварительного просмотра</li>
    *     <li>{Lib/Control/Control} [cfg.opener] контрол, который вызвал функцию (нужен в случае вызова из floatArea)</li>
    *     <li>{Object} [cfg.handlers] Обработчики событий для окна предварительного просмотра</li>
    *     <li>{Number} [cfg.maxHTMLLength] Максимально допустимая длина html для отображения (в символах)</li>
    *     <li>{Function} [cfg.errorHandler] Обработчик ошибки диалога печати</li>
    * </ul>
    *
    * <h2>Возвращает</h2>
    * {Core/Deferred} Созданное окно предварительного просмотра.
    *
    * @class Core/PrintDialogHTMLView
    * @public
    * @author Сухоручкин А.С.
    */
   return function showHTMLForPrint(htmlText, top, left, opener){

      var
         options = typeof(htmlText) === 'string' ? {} : shallowClone(htmlText),
         windowManager = WindowManager,
         errorHandler;

      function removeUndefinded(obj) {
         for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
               if (obj[key] === undefined) {
                  delete obj[key];
               }
            }
         }
         return obj;
      }

      //Параметры должны перебивать опции
      cMerge(options, removeUndefinded({
         top: top,
         left: left,
         opener: opener || (windowManager && windowManager.getActiveWindow())
      }), {clone: false, rec: false});

      //Устанавливаем неустановленные опции в дефолтные значения
      cMerge(options, {
         htmlText: String(htmlText),
         resizable: true,
         parent: null,
         handlers: {},
         maxHTMLLength: null
      }, {preferSource: true});

      errorHandler = options.errorHandler;
      return moduleStubs.requireModule('Deprecated/Controls/PrintDialog/PrintDialog').addCallback(function(result) {
         var dlg = new result[0](options);
         return dlg.getReadyDeferred().addCallback(function () {
              return dlg;
          }).addErrback(errorHandler || function () {
                 return dlg;
             });
      });
   }
});
