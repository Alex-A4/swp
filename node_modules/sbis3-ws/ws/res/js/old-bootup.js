define('old-bootup', [
   'require',
   'Core/detection',
   'Core/constants',
   'Core/IoC',
   'Core/core-merge',
   'SBIS3.CONTROLS/Utils/InformationPopupManager',
   'Core/Context',
   'Core/Deferred',
   'Core/ParallelDeferred',
   'Core/EventBus',
   'Core/CommandDispatcher',
   'Core/HashManager',
   'Core/WindowManager',
   'Transport/deserializeURLData',
   'Deprecated/Record',
   'Deprecated/RecordSet',
   'Transport/attachTemplate',
   'Lib/Control/Control',
   'bootup',
   'Transport/ReportPrinter',
   'Transport/HTTPError'
], function(
   require,
   detection,
   constants,
   ioc,
   cMerge,
   InformationPopupManager,
   Context,
   Deferred,
   ParallelDeferred,
   EventBus,
   CommandDispatcher,
   HashManager,
   WindowManager,
   deserializeURLData,
   Record,
   RecordSet,
   attach,
   Control,
   bootup,
   ReportPrinter,
   HTTPError
) {
   'use strict';

   var pagesReady = {};

   function closePage() {
      $('#closePage').click(function() {
         window.onbeforeunload = function() {
         };
         window.close();
      });
   }

   function errorHandler(error) {
      $('body').toggleClass('ws-progress', false);
      if (error instanceof HTTPError && error.httpError !== 0) {
         InformationPopupManager.showMessageDialog({
            status: 'error',
            message: error.message
         });
      }
      ioc.resolve('ILogger').error('bootup', (error && error.message) || error);
      return error;
   }

   function closeWindowWithIPadFix() {
      // на iPad просто так закрытие окна через window.close не работает, но можно попробовать сделать грязный хак
      // http://stackoverflow.com/questions/10712906/window-close-doesnt-work-on-ios
      if (detection.isMobileSafari) {
         setTimeout(window.close, 301);
      } else {
         window.close();
      }
   }

   function declareCloseCommand(instance) {
      CommandDispatcher.declareCommand(instance, 'close', instance.close ? instance.close : function() {
         closeWindowWithIPadFix();
      });
   }

   function getUserId() {
      return HashManager.get("usedId");
   }

   function setUserId(userId) {
      return HashManager.set("usedId", userId, true);
   }

   function prepareData(result, transform, currentRootId, columns, titleColumn, params) {
      var reportPrinter = new ReportPrinter({columns: columns, titleColumn: titleColumn}),
          eventTransform = params._eventBusChannel.notify('onSelectReportTransform', params.idR, result, transform, params.list);
      reportPrinter.prepareReport(result, eventTransform || transform, currentRootId).addCallback(function(reportText) {
         return Control.ControlStorage.waitChildByName("ws-dataview-print-report").addCallback(function(htmlView) {
            htmlView.subscribe("onContentSet", function() {
               $('body').toggleClass('ws-progress', false);
            });
            htmlView.setHTML(reportText);
         });
      }).addErrback(errorHandler);
   }

   function prepareHTML(params) {
      var recordSet;
      if (params.idR && !params.list) {
         if (params.keys.length > 0) {
            var dMultiResult = new ParallelDeferred(),
                records = [];

            recordSet = new RecordSet(cMerge({
               "readerType": "ReaderUnifiedSBIS",
               firstRequest: false
            }, params.dS));

            for (var i = 0, l = params.keys.length; i < l; i++) {
               dMultiResult.push(recordSet.readRecord(params.keys[i]).addCallback(function(record) {
                  records.push(record);
               }));
            }

            dMultiResult.done();
            dMultiResult.getResult().addCallback(function() {
               var eventResult = params._eventBusChannel.notify('onPrepareReportData', params.idR, records);
               if (eventResult instanceof Deferred) {
                  eventResult.addCallback(function(result) {
                     if (result instanceof Record || result instanceof RecordSet || result instanceof Array) {
                        records = result;
                     }
                     prepareData(records, params.xsl, params.root, params.cols, params.tCol, params);
                  }).addErrback(errorHandler);
               } else {
                  if (eventResult instanceof Record || eventResult instanceof RecordSet || eventResult instanceof Array) {
                     records = eventResult;
                  }
                  prepareData(records, params.xsl, params.root, params.cols, params.tCol, params);
               }
            }).addErrback(errorHandler);
         }
      } else {
         recordSet = new RecordSet(cMerge({"readerType": "ReaderUnifiedSBIS"}, params.dS));
         recordSet.subscribe("onAfterLoad", function() {
            prepareData(recordSet, params.xsl, params.root, params.cols, params.tCol, params);
         });
      }
   }

   function loadPage(page, container, record, params, areaTemplate, isPrint) {
      var
         recordIsValid = record !== undefined && record instanceof Record,
         $container = typeof container == 'string' ? $('#' + container) : container,
         originalTemplateName = ($container.attr('data-template-name') || ''),
         hasMarkup = $container.attr('hasMarkup') == 'true';

      if ($container.get(0).wsControl) {
         return;
      }

      if (hasMarkup && originalTemplateName && originalTemplateName !== page) {
         $container.attr('hasMarkup', 'false');
         hasMarkup = false;
      }

      if (recordIsValid && record.getKey() !== null) {
         setUserId(record.getKey());
      }

      // Здесь поставить вторым аргументом true чтобы работать с новыми шаблонами
      attach.attachTemplate(page, {
         fast: hasMarkup || constants.fasttemplate,
         html: hasMarkup ? $container.get(0).outerHTML : ''
      }).addCallback(function(template) {
         var
            finishContextDfr = new Deferred(),
            context = Context.createContext(finishContextDfr),
            declareCommandFunction = declareCloseCommand;

         if (isPrint) {
            prepareHTML(params);
         }

         if (recordIsValid) {
            context.setContextData(record);
            declareCommandFunction = function(instance) {
               declareCloseCommand(instance);
               if (instance.isNewRecord()) {
                  instance.subscribe('onRecordUpdate', function(event, recId) {
                     if (getUserId() === undefined && recId !== null) {
                        setUserId(recId);
                     }
                  });
                  instance.subscribe('onBeforeClose', function(event) {
                     if (!this.isRecordSaved()) {
                        this.getRecord().destroy().addBoth(function() {
                           if (event.getResult() !== false) {
                              instance.destroy(true);
                           }
                        });
                     }
                  });
               }
               instance.destroy = function(isSaved) {
                  var
                     activeWindow = WindowManager.getActiveWindow(),
                     prevActive = activeWindow && activeWindow.getActiveChildControl();

                  if (prevActive) {
                     prevActive.setActive(false, undefined, undefined, null);
                  }

                  if (isSaved === true || !(instance.isNewRecord() && !this.isRecordSaved())) {
                     if (!areaTemplate) {
                        if (!params.history && !!window.opener) {
                           // Если у нас есть opener, попробуем найти там браузер, из которого открыли документ
                           // перезагрузить его
                           // и закрыть текущее окно
                           var openerWS = false;
                           try {
                              openerWS = window.opener.wsConfig;
                           } catch (e) {
                              // Сюда мы попадем, если opener - какое-то чужое окно
                           }
                           if (openerWS) {
                              // Если мы оказались здесь, значит смогли добраться до WS в opener
                              try {
                                 // Пытаемся получить браузер
                                 var browser = Control.ControlStorage.get(params.id);
                                 // И перезагрузить, если надо
                                 if (!browser.isReadOnly()) {
                                    browser.reload();
                                 }
                              } catch (e) {
                                 // Сюда мы попадем если не смогли найти браузер
                              }
                              // Передадим фокус на родительское окно
                              window.opener.focus();
                              // Закроем текущее
                              closeWindowWithIPadFix();
                              return;
                           }
                        }

                        // Здесь мы окажемся, если пришли с чужого окна
                        // А значит надо закрыть текущее или перейти на предыдущую страницу
                        if (window.previousPageURL === undefined) {
                           closeWindowWithIPadFix();
                        } else {
                           window.location.href = window.previousPageURL;
                        }
                     } else {
                        bootup(areaTemplate);
                     }
                  }
               };
            };
         }

         function pageReady() {
            this.unsubscribe('onReady', pageReady);
            pagesReady[page] && pagesReady[page].callback();
         }

         $container.empty();
         if (template.isPage()) {
            var cfg = {
               template: template,
               horizontalAlignment: 'Stretch',
               verticalAlignment: 'Stretch',
               autoWidth: true,
               autoHeight: true,
               context: context,
               zIndex: 0,
               element: container,
               newRecord: params && ( params.pk === undefined || params.copy === true ),
               enabled: params && params.readOnly !== undefined ? !params.readOnly : true,
               page: true,
               reports: params && params.reports || {},
               handlers: {
                  onBeforeShowPrintReports: params ? params._events['onBeforeShowPrintReports'] : [],
                  onSelectReportTransform: params ? params._events['onSelectReportTransform'] : [],
                  onPrepareReportData: params ? params._events['onPrepareReportData'] : [],
                  onReady: pageReady,
                  onDestroy: function() {
                     finishContextDfr.callback();
                  }
               }
            };
            if (params && params.readOnly) {
               cfg.enable = false;
            }
            require([params ? 'Deprecated/Controls/RecordArea/RecordArea' : 'Lib/Control/TemplatedArea/TemplatedArea'], function(Area) {
               declareCommandFunction(new Area(cfg));
            });
         } else {
            require(['Lib/Control/Dialog/Dialog'], function(Dialog) {
               declareCommandFunction(new Dialog({
                  context: context,
                  template: template,
                  enabled: params && params.readOnly !== undefined ? !params.readOnly : true,
                  handlers: {
                     onReady: pageReady,
                     onDestroy: function() {
                        finishContextDfr.callback();
                     }
                  }
               }));
            });
         }
      }).addErrback(errorHandler);
   }

   function getHandlers(params) {
      var pdHandlers = new ParallelDeferred();
      params._eventBusChannel = EventBus.channel();
      for (var event in params._events) {
         if (!params._events.hasOwnProperty(event)) {
            continue;
         }
         var _handlers = params._events[event];
         for (var i = 0, l = _handlers.length; i < l; i++) {
            (function(event, i) {
               //Для поддержки устаревшой загрузки модулей типа "имя_модуля/функция"
               //Пример: "Billing/Navigation:PreparationConstants"
               var hand = _handlers[i].split(':');
               var readyHand = new Deferred();
               require([hand[0]], function(module) {
                  if (hand[1]) {
                     readyHand.callback(module[hand[1]]);
                  } else {
                     readyHand.callback(module);
                  }
                  pdHandlers.push(readyHand.addCallback(function(handler) {
                     params._eventBusChannel.subscribe(event, handler, params);
                  }));
               });
            })(event, i);
         }
      }
      return pdHandlers.done().getResult();
   }

   function getRecord(recordSet, params) {
      var userId = getUserId();

      if (params.pk === undefined && userId === undefined) {
         var filter = params.filter || {};
         if (params.hierMode) {
            filter[params.pIdCol] = {
               'hierarchy': [
                  params.pId,   // Превращение иерархии в массив идет на уровне сериализации
                  (params.branch ? true : null)
               ]
            };
         }
         var newRecord = params._eventBusChannel.notify('onBeforeCreate', params.pId, params.branch ? true : null, filter);
         if (newRecord instanceof Deferred) {
            var waitRecord = new Deferred();

            waitRecord.addErrback(function (e) {
               return e;
            });

            newRecord.addCallbacks(function(result) {
               if (result instanceof Record) {
                  waitRecord.callback(result);
               } else {
                  if (result && Object.prototype.toString.call(result) == "[object Object]") {
                     filter = cMerge(result, filter);
                  }
                  if (!!params.id) {
                     filter["ВызовИзБраузера"] = true;
                  }
                  recordSet.createRecord(filter).addCallbacks(function(record) {
                     waitRecord.callback(record);
                  }, function(error) {
                     waitRecord.errback(error);
                  });
               }
            }, function(error) {
               waitRecord.errback(error);
            });
            return waitRecord;
         } else if (newRecord instanceof Record) {
            return new Deferred().callback(newRecord);
         } else if (newRecord === false) {
            return new Deferred().callback(newRecord);
         } else {
            if (!!params.id) {
               filter["ВызовИзБраузера"] = true;
            }
            return recordSet.createRecord(filter, params.format || params.obj + "." + params.method);
         }
      } else if (params.copy === true) {
         return recordSet.copyRecord(params.pk);
      } else {
         var editableRecord = params._eventBusChannel.notify('onBeforeRead', params.pk || userId);
         if (editableRecord instanceof Deferred) {
            return editableRecord;
         } else if (editableRecord instanceof Record) {
            return new Deferred().callback(editableRecord);
         } else if (editableRecord === false) {
            return new Deferred().callback(editableRecord);
         } else {
            return recordSet.readRecord(params.pk || userId, params.format || params.obj + "." + params.method);
         }
      }
   }

   function recordConfigFunc(record, page, container, areaTemplate, params) {
      if (record instanceof Record) {
         if (params.changedRecordValues) {
            for (var i in params.changedRecordValues) {
               if (params.changedRecordValues.hasOwnProperty(i)) {
                  record.set(i, params.changedRecordValues[i]);
               }
            }
         }
         var flag = params._eventBusChannel.notify('onBefore' + (params.pk === undefined ? 'Insert' : 'Update'), record);
         params.pk = params.pk ? params.pk : getUserId();
         if (typeof(flag) !== 'boolean') {
            loadPage(typeof(flag) == 'string' ? flag : page, container, record, params, areaTemplate);
         } else if (params.pk === undefined && flag === false) {
            record.destroy();
         }
      } else if (record instanceof Deferred) {
         record.addCallback(function(recordFromCallback) {
            recordConfigFunc(recordFromCallback, page, container, areaTemplate, params);
         });
      } else {
         closePage();
      }
   }

   function loadPageWithEditParams(page, container, areaTemplate, params) {
      params.method = params.method || "Список";
      var recordSet = new RecordSet({
         readerType: params.type || "ReaderUnifiedSBIS",
         filterParams: params.filter || {},
         readerParams: {
            "dbScheme": "",
            "queryName": params.method,
            "readMethodName": params.readMethod || "Прочитать",
            "createMethodName": params.createMethod || "Создать",
            "updateMethodName": params.updateMethod || "Записать",
            "destroyMethodName": params.destroyMethod || "Удалить",
            "linkedObject": params.obj,
            "format": params.format
         },
         firstRequest: false,
         requiredParams: [],
         usePages: ''
      });

      getRecord(recordSet, params).addCallbacks(function(record) {
         if (record && params._events.hasOwnProperty('onBeforeShowRecord')) {
            var resultRecord = params._eventBusChannel.notify('onBeforeShowRecord', record);
            if (resultRecord !== undefined) {
               record = resultRecord;
            }
         }
         recordConfigFunc(record, page, container, areaTemplate, params);
      }, function(error) {
         var methodName = params.obj + ".";
         if (params.pk === undefined) {
            methodName += (params.createMethod || "Создать");
         } else {
            methodName += (params.readMethod || "Прочитать");
         }
         if (error instanceof HTTPError && !error.processed && error.httpError !== 0 && params._eventBusChannel.notify('onLoadError', error, methodName) !== true) {
            InformationPopupManager.showMessageDialog({
               status: 'error',
               message: error.message
            });
            $('.gt-loader-indicator').addClass('ws-hidden');
            error.processed = true;
         }
         closePage();
      });
   }

   /**
    * Загрузит страницу page в контейнер container.
    * @param {String} page
    * @param {jQuery} container
    * @param {String} [areaTemplate]
    * @param {Core/Deferred} [def]
    */
   return function(page, container, areaTemplate, def) {
      pagesReady[page] = def;
      container = container || 'ctr';

      var params = Context.global.getValue('editParams');
      if (params !== undefined) {
         params = deserializeURLData(params);
         getHandlers(params).addCallback(function() {
            loadPageWithEditParams(page, container, areaTemplate, params);
         });
      } else {
         params = Context.global.getValue("printParams");
         if (params !== undefined) {
            params = deserializeURLData(params);
            getHandlers(params).addCallback(function() {
               loadPage(page, container, undefined, params, undefined, true);
            });
         } else {
            loadPage(page, container, undefined);
         }
      }
   };
});
