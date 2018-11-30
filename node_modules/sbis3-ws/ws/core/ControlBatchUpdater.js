define('Core/ControlBatchUpdater', [
   'Core/core-extend',
   'Core/IoC',
   'Core/Deferred',
   'Core/ParallelDeferred',
   'Core/core-instance',
   'Core/helpers/Object/isEmpty',
   'Core/helpers/Function/runDelayed'
], function(extend, ioc, Deferred, ParallelDeferred, cInstance, isEmptyObject, runDelayed) {

   /**
    * @class Core/ControlBatchUpdater
    * @public
    * @author Бегунов А.В.
    * @singleton
    */
   var ControlBatchUpdater = new (extend({}, /** @lends Core/ControlBatchUpdater.prototype */{
      $protected: {
         _applyUpdateInProcess: false,
         _batchUpdateSpanHint: null,
         _batchUpdateCount: 0,
         _batchUpdateControls: {},
         _delayedEventsHash: {},
         _delayedActionsHash: {},
         _delayedActionsHashLastOrder: 0,
         _con: null,
         _debugEnabled: false,
         _delayedEvents: [],
         _uids: {},
         _batches: {}
      },

      $constructor: function() {
         this._setDebugEnabled(this._debugEnabled);
      },

      _dummyUpdate: {},
      _nop: function() {},

      _setDebugEnabled: function(value) {
         this._debugEnabled = value;
         var self = this;

         this._con = window && window.console;
         if (!this._con || !this._debugEnabled) {
            this._con = {
               log: this._nop, info: this._nop,
               group: this._nop, groupEnd: this._nop,
               profile: this._nop, profileEnd: this._nop
            }
         }

         if (!this._con.group) {
            this._con.groupLevel = 0;
            this._con.group = function(a1, a2, a3) {
               self._con.log(a1, ' ', a2, ' ', a3);
               self._con.groupLevel++;
            };

            var oldLog = this._con.log;
            this._con.log = function(a1, a2, a3) {
               var str = '', ln = (self._con.groupLevel + 1) * 2;
               for (var i = 0; i < ln; i++) {
                  str += '_';
               }

               if (oldLog.call) {
                  oldLog.call(self._con, str, ' ', a1, ' ', a2, ' ', a3);
               }
               else {
                  oldLog(str, ' ', a1, ' ', a2, ' ', a3);
               }
            };

            this._con.groupEnd = function() {
               self._con.groupLevel--;
            };
         }

         if (!this._con.profile) {
            this._con.profile = this._nop;
         }

         if (!this._con.profileEnd) {
            this._con.profileEnd = this._nop;
         }

         this.addComment = this._debugEnabled ? this._addComment : this._nop;
         this.getType = this._debugEnabled ? this._getType : this._nop;
      },
      /**
       *
       * @param hint
       */
      ensureBatchUpdate: function(hint) {
         if (!this.haveBatchUpdate() && !this.haveApplyUpdateInProcess()) {
            this.beginBatchUpdate(hint);
            runDelayed(this.endBatchUpdate.bind(this, hint));
         }
      },
      /**
       *
       * @param hint
       */
      beginBatchUpdate: function(hint) {
         if (!(hint in this._batches)) {
            this._batches[hint] = 0;
         }
         this._batches[hint]++;

         if (this._batchUpdateCount === 0) {
            this._batchUpdateSpanHint = hint;
         }

         this._batchUpdateCount++;
      },

      _endBatchUpdateFinish: function() {
         this._con.group('endBatchUpdateFinish ', this._batchUpdateSpanHint);

         try {
            this._applyBatchUpdate(this._batchUpdateSpanHint, true);
         }
         finally {
            try {
               this._batchUpdateSpanHint = null;

               var delayedEvents = this._delayedEvents,
                  removeDestroyed = function(evt) {
                     return evt &&                                      //могут быть "дырки" в массиве _delayedEvents
                        (!evt.control || !evt.control.isDestroyed());//Не отсылаем события удалённых контролов
                  };

               //очистим переменные с событиями, и запомним их в локальных переменных, чтобы обработчики событий
               //их не испортили (они тоже могут работать в пакетном режиме и вызывать _sendDelayedEvents)
               this._delayedEvents = [];
               this._delayedEventsHash = {};

               this._runDelayedActions();


               //всё посчитали, теперь все размеры правильные, можно отслылать отложенные события
               delayedEvents.filter(removeDestroyed).forEach(function(evt) {
                  if (evt.event) {
                     evt.control._notify.apply(evt.control, evt.args);
                  }
                  else if (evt.func) {
                     evt.func.apply(evt.control);
                  }
               });
            }
            finally {
               this._con.groupEnd();
            }
         }
      },
      /**
       *
       * @param hint
       */
      endBatchUpdate: function(hint) {
         var batchFound;
         if (this._batches[hint]) {
            batchFound = true;
            this._batches[hint]--;
         }

         if (this._batches[hint] === 0) {
            delete this._batches[hint];
         }

         //if (this._batchUpdateCount === 0) {
         //   throw new Error(rk('Лишний вызов') + ' _endBatchChange: ' + hint);
         //}

         if (batchFound) {
            this._batchUpdateCount--;
         }
         if (this._batchUpdateCount === 0) {
            this._endBatchUpdateFinish(hint);
         }
      },

      /**
       * Создаёт функцию-обёртку, запускающую заданную функцию внутри пакета (через runInBatchUpdate)
       * @param {String} hint Имя пакета, для отладки.
       * @param {Function|String} callback Оборачиваемая функция, или имя поля объекта this, в котором она содержится.
       * Если указано имя поля, то функция с этим именем будет при каждом вызове находиться динамически.
       * Это полезно для оборачивания таких функций класса, которые могут меняться динамически.
       * @param {Object} thisObject Контекст, в котором будет вызываться оборачиваемая функция.
       * Если не указан, то контекстом будет this, актуальный на момент вызова обёртки.
       * @returns {Function}
       */
      createBatchUpdateWrapper: function(hint, callback, thisObject) {
         return this._createBatchUpdateWrapperOpts({
            hint: hint,
            callback: callback,
            thisObject: thisObject
         });
      },

      /**
       * То же, что и createBatchUpdateWrapper, кроме того, что, если переданная в параметре callback функция вернёт Deferred, то пакет закончится сразу,
       * не дожидаясь готовности этого Deferred-а.
       * @param {String} hint Имя пакета, для отладки.
       * @param {Function|String} callback См. документацию по функции createBatchUpdateWrapper
       * @param {Object} [thisObject] См. документацию по функции createBatchUpdateWrapper
       * @returns {*}
       */
      createBatchUpdateWrapperNoWaitDeferred: function(hint, callback, thisObject) {
         return ControlBatchUpdater._createBatchUpdateWrapperOpts({
            hint: hint,
            waitDeferredResult: false,
            callback: callback,
            thisObject: thisObject
         });
      },

      _createBatchUpdateWrapperOpts: function(options) {
         var updater = this,
            opts = Object.keys(options).reduce(function(memo, key) {
               memo[key] = options[key];
               return memo;
            }.bind(this), {});

         if (typeof opts.callback === 'string') {
            var funcName = opts.callback;
            opts.callback = function() { return this[funcName].apply(this, arguments); };
         }

         if (opts.thisObject) {
            return function() {
               opts.args = arguments;
               try {
                  return updater._runInBatchUpdateOpts(opts);
               } finally {
                  opts.args = null;
               }
            };
         }
         else {
            return function() {
               opts.args = arguments;
               opts.thisObject = this;
               try {
                  return updater._runInBatchUpdateOpts(opts);
               } finally {
                  opts.thisObject = null;
                  opts.args = null;
               }
            };
         }
      },
      /**
       *
       * @param callback
       * @param thisObject
       * @param args
       * @returns {*}
       */
      runInBatchUpdate: function(callback, thisObject, args) {
         return this._runInBatchUpdate('', thisObject, callback, args);
      },

      _runInBatchUpdate: function(hint, thisObject, callback, args) {
         return this._runInBatchUpdateOpts({
            hint: hint,
            thisObject: thisObject,
            callback: callback,
            args: args
         });
      },

      _runInBatchUpdateOpts: function(options) {
         var opts = options || {},
            hint = opts.hint,
            thisObject = opts.thisObject,
            callback = opts.callback,
            args = opts.args,
            waitDeferredResult = opts.waitDeferredResult !== undefined ? opts.waitDeferredResult : true;

         function batchRun() {
            var self = this, isSimple = true, deferredOk = false;

            function makeEndHandler() { return function(res) { self.endBatchUpdate(hint); return res; }; }
            function logLockedError(descr) {
               ioc.resolve('ILogger').error('ControlBatchUpdater',
                  '_runInBatchUpdate: ' + rk('нельзя добавить обработчик в') + ' ' + descr + ': ' + rk('обработчики заблокированы') + '. hint: ' + hint);
            }

            this.beginBatchUpdate(hint);
            try {
               var result = callback.apply(thisObject, args || []);

               if (result instanceof Deferred ) {
                  isSimple = false;
                  if (waitDeferredResult) {
                     if (result.isCallbacksLocked())
                        logLockedError('Deferred');
                     else {
                        result.addCallbacks(makeEndHandler('Deferred'), makeEndHandler('Deferred Error'));
                        deferredOk = true;
                     }
                  }
               } else if (result instanceof ParallelDeferred) {
                  isSimple = false;
                  if (waitDeferredResult) {
                     if (result.getResult().isCallbacksLocked())
                        logLockedError('ParallelDeferred');
                     else {
                        result.getResult().addCallbacks(makeEndHandler('Parallel Deferred'), makeEndHandler('Parallel Deferred Error'));
                        deferredOk = true;
                     }
                  }
               }
            }
            finally {
               if (isSimple) {
                  this.endBatchUpdate(hint);
               }
               else if (!waitDeferredResult) {
                  this.endBatchUpdate(hint);
               } else if (!deferredOk) {
                  this.endBatchUpdate(hint);
               }
            }

            return result;
         }

         function simpleRun() {
            return callback.apply(thisObject, args || []);
         }

         var func = this._applyUpdateInProcess ? simpleRun : batchRun;
         return func.apply(this);
      },

      getType: null,

      _getType: function(control) {
         var type = control.getContainer() && control.getContainer().attr('type');
         if (!type) {
            if (cInstance.instanceOfModule(control, 'Deprecated/Controls/ToolBar/ToolBar'))
               type = '@Control/ToolBar';
            else if (cInstance.instanceOfModule(control,'Deprecated/Controls/OperationsPanel/OperationsPanel'))
               type = '@Control/OperationsPanel';
            else if (cInstance.instanceOfModule(control, 'Lib/Control/Window/Window'))
               type = '@Control/Window';
            else if (cInstance.instanceOfModule(control, 'Lib/Control/Dialog/Dialog'))
               type = '@Control/Dialog';
            else if (cInstance.instanceOfModule(control, 'Deprecated/Controls/SimpleDialogAbstract/SimpleDialogAbstract'))
               type = '@Control/SimpleDialogAbstract';
            else if (cInstance.instanceOfModule(control, 'Deprecated/Controls/Tabs/Tabs'))
               type = '@Control/Tabs';
            else if (cInstance.instanceOfModule(control, 'Lib/Control/HTMLView/HTMLView'))
               type = '@Control/HTMLView';
            else if (cInstance.instanceOfModule(control, 'Deprecated/Controls/FiltersArea/FiltersArea'))
               type = '@Control/FiltersArea';
            else if (cInstance.instanceOfModule(control, 'Lib/Control/TemplatedArea/TemplatedArea'))
               type = '@Control/TemplatedArea';
            else if (cInstance.instanceOfModule(control, 'Lib/Control/TemplatedAreaAbstract/TemplatedAreaAbstract'))
               type = '@Control/TemplatedAreaAbstract';
            else if (cInstance.instanceOfModule(control, 'Lib/Control/AreaAbstract/AreaAbstract'))
               type = '@Control/AreaAbstract';
         }
         return type;
      },

      addComment: null,

      _addComment: function(node, comment) {
         if (!node.comments)
            node.comments = [comment];
         else
            node.comments.push(comment);
      },

      _ensureGetBatchUpdateData: function(control) {
         var data = control._getBatchUpdateData();
         if (data === undefined) {
            data = {};
            control._setBatchUpdateData(data);
         }
         return data;
      },

      _getUID: function(control) {
         var data = this._ensureGetBatchUpdateData(control);
         if (data.uid === undefined) {
            var id = control.getId(), cnt;

            if (this._uids[id] === undefined) {
               this._uids[id] = 0;
               data.uid = id;

               if (!control.isDestroyed()) {
                  control.once('onDestroy', function() {
                     delete this._uids[id];
                  }.bind(this));
               }

            } else {
               cnt = this._uids[id] + 1;
               this._uids[id] = cnt;
               data.uid = id + '_' + cnt;
            }
         }
         return data.uid;
      },

      /**
       * Обновляет побочную информацию о событии, объединяет события, если нужно
       * @param {String} eventName Название события
       * @param {Boolean} merge Нужно ли объединять события
       * @param {Lib/Control/Control} control Контрол, который извещает о событии
       * @private
       */
      _checkDelayedEventName: function(eventName, merge, control) {
         var id = eventName + ':' + this._getUID(control),
            hashEl = this._delayedEventsHash[id],
            length = this._delayedEvents.length;

         if (!hashEl) {
            hashEl = this._delayedEventsHash[id] = {last: undefined};
         }

         if (hashEl.last !== undefined && merge) {
            this._delayedEvents[hashEl.last] = null;
         }

         hashEl.last = length;
      },
      /**
       *
       * @param funcName
       * @param control
       * @param func
       */
      addDelayedFunc: function(funcName, control, func) {
         if (funcName) {
            this._checkDelayedEventName(funcName, true, control);
         }
         this._delayedEvents.push({func: func, control: control});
      },

      /**
       * Добавляет "задержанное событие"
       * @param {String} event Название события
       * @param {Boolean} merge Нужно ли объединять события
       * @param {Lib/Control/Control} control Контрол, который посылает событие
       * @param {Array} args Параметры события
       */
      addDelayedEvent: function(event, merge, control, args) {
         if (control.getEventHandlers(event)) {
            this._checkDelayedEventName(event, merge, control);
            this._delayedEvents.push({event: event, control: control, args: args});
         }
      },
      /**
       *
       * @param actionName
       * @param actionFunc
       * @param uniqueInGroup
       */
      registerDelayedAction: function(actionName, actionFunc, uniqueInGroup) {
         this._delayedActionsHash[actionName] = {
            actionFunc: actionFunc,
            uniqueInGroup: uniqueInGroup || 'DefaultActions',
            delayed: false,
            args: [],
            order: 0
         };
      },

      _addDelayedAction: function(actionName, args) {
         var action = this._delayedActionsHash[actionName];
         if (action) {
            this._delayedActionsHashLastOrder++;

            action.delayed = true;
            action.args = args;
            action.order = this._delayedActionsHashLastOrder;

            //Выключаем все иные действия в этой группе

            for (var key in this._delayedActionsHash) {
               if (this._delayedActionsHash.hasOwnProperty(key)) {
                  var
                     actionObj = this._delayedActionsHash[key];
                  if (action !== actionObj && actionObj.uniqueInGroup === action.uniqueInGroup) {
                     actionObj.delayed = false;
                  }
               }
            }
         }
      },
      /**
       *
       * @param actionName
       * @param args
       */
      runBatchedDelayedAction: function(actionName, args) {
         if (this.haveBatchUpdate()) {
            this._addDelayedAction(actionName, args);
         }
         else {
            this._runInBatchUpdate('runBatchedDelayedAction.' + actionName, this, function() {
               this._addDelayedAction(actionName, args);
            });
         }
      },
      /**
       *
       * @param control
       * @param recalculateOwnSize
       */
      addBatchSizeChanged: function(control, recalculateOwnSize) {
         var id = this._getUID(control), updates = this._batchUpdateControls, update = updates[id];

         if (!update) {
            update = updates[id] = {control: control, sizeChanged: true};
         }

         if (recalculateOwnSize) {
            update.recalculateOwnSize = true;
         }
      },

      _runDelayedActions: function() {
         this._delayedActionsHashLastOrder = 0;

         var actions =Object.keys(this._delayedActionsHash).reduce(function(result, key) {
               var
                  action = this._delayedActionsHash[key];
               if (action.delayed) {
                  result.push([key, action.args, action.order]);
               }

               action.delayed = false;
               action.args = [];
               return result;
            }.bind(this), []);

         actions.sort(function(action1, action2) {
            return action1[2] - action2[2];
         });

         for (var index in actions) {
            if (actions.hasOwnProperty(index)) {
               var
                  keyArgs = actions[index],
                  key = keyArgs[0], args = keyArgs[1] || [],
                  action = this._delayedActionsHash[key];
               if (action) {
                  action.actionFunc.apply(this, args);
               }
            }
         }
      },

      /**
       * Запускаем расчёт размеров, не влияющий на текущее состояние пакета.
       * Нужно для плавающих панелей, показываемых с анимацией, если на время анимации включен пакет,
       * чтобы посчитать размеры в промежуточном состоянии, не мешая им потом посчитаться в окончательном состоянии.
       * @param {String} hint Имя расчёта, для отладки.
       */
      applyBatchUpdateIntermediate: function(hint) {
         this._con.group('applyBatchUpdateIntermediate ', hint);
         try
         {
            this._applyBatchUpdate(hint, false);
         }
         finally
         {
            this._con.groupEnd();
         }
      },

      _applyBatchUpdate: function(hint, isFinal) {
         var nodeRoot, nodesById,
            self = this,
            addComment = this.addComment,
            getType = this.getType,
            debugEnabled = this._debugEnabled;

         function checkLikeWindowMixin(control) {
            return !!cInstance.instanceOfMixin(control, 'Lib/Mixins/LikeWindowMixin');
         }
         function checkScrollContainer(control) {
            return !!cInstance.instanceOfModule(control, 'SBIS3.CONTROLS/ScrollContainer')
         }
         function stopBubbling(control) {
            if (checkLikeWindowMixin(control)) {
               return true;
            }
            if (checkScrollContainer(control)) {
               var parent = control.getParent();
               //мы не можем на ScrollContainer проверить, нужно ли на нем останавливаться, он не знает изменился ли он
               // в размерах с предыдущего раза. поэтому ищем, есть ли сверху компонент, на который он может повлиять
               // своим изменением размеров. Повлиять он похоже может только на другой ScrollContainer, в котором он может
               // лежать и на FloatArea (он изменяет размеры или сдвигает положение).
               // Поэтому ищем сверху, нет ли другого ScrollContainer или LikeWindowMixin внутри одного и того же окна
               while (parent) {
                  if (checkLikeWindowMixin(parent)) {
                     return false;
                  }
                  if (checkScrollContainer(parent)) {
                     return false;
                  }
                  parent = parent.getParent();
               }
               return true;
            }
         }
         function getBatchParentNode(control) {
            var parent = control.getParent(),
               parentId = parent && self._getUID(parent),
               parentNode, upperParent;

            // бежим по парентам до компонента, выше которого не имеет смысл перерисовывать, потому что верстка этого компонента не влияет на верстку выше
            if (parentId && !stopBubbling(control)) {
               parentNode = nodesById[parentId];
               if (!parentNode) {
                  upperParent = getBatchParentNode(parent);

                  parentNode = {control: parent, type: getType(parent), children: {}};
                  upperParent.children[parentId] = parentNode;
                  nodesById[parentId] = parentNode;
               }
            }
            else {
               parentNode = nodeRoot;
            }

            return parentNode;
         }

         function haveAutoSize(node) {
            return node.control._haveAutoSize();
         }

         function getControls(nodes) {
            return nodes.map(function(node) {return node.control; });
         }

         function isControlVisible(control, visibleParentContainer) {
            //Здесь visibleParentContainer гарантированно видимый.
            // Это гарантируется тем, что isControlVisible вызывается только для контрола, у которого или нет родителя, или вся цепочка родителей видимая.
            // Это же гарантируется тем, что для контрола с невидимыми родителями всегда будет recalkNode/forceRecalkParent=true, и isControlVisible не вызовется.

            var result = control.isVisible(), node;
            if (result) {
               node = control.getContainer();
               //Проверяем узел и его родителей до visibleParentContainer
               do {
                  result = !node.hasClass('ws-hidden');
                  node = node.parent();
               } while (result && node.length !== 0 && node.get(0) !== visibleParentContainer);
            }
            return result;
         }

         function enumAllChildren(node, func) {
            var
               childs = node.children || {};
            for (var key in childs) {
               if (childs.hasOwnProperty(key)) {
                  var
                     child = childs[key];
                  enumAllChildren(child, func);
                  func(node);
               }
            }
         }

         function delayRecalkNode(node) {
            var control = node.control, cnt = 0;

            function processNode(node) {
               var nodeUpdate = node.update, data, delayedRecalkData;
               if (nodeUpdate && nodeUpdate.sizeChanged) {
                  data = self._ensureGetBatchUpdateData(control);
                  delayedRecalkData = data.delayedRecalkData;

                  if (delayedRecalkData === undefined) {
                     delayedRecalkData = [];
                     data.delayedRecalkData = delayedRecalkData;
                  }

                  delayedRecalkData.push({control: node.control, recalculateOwnSize: !!nodeUpdate.recalculateOwnSize});
                  cnt++;
               }
            }

            enumAllChildren(node, processNode);
            processNode(node);

            addComment(node, 'невидимый');
            if (cnt !== 0 && debugEnabled) {
               addComment(node, 'отложено ' + cnt + ' элементов');
            }
         }

         //алгоритм сейчас сделан только для пакетного _onSizeChanged. для добавления пакетного onResize надо усложнять его
         function recalkNode(node, forceRecalkParent, visibleParentContainer) {
            var update = node.update || self._dummyUpdate,
               noChildren = !node.children || isEmptyObject(node.children),
               haveOnSizeChangedFired = update.sizeChanged,
               control = node.control,
               visible = forceRecalkParent || isControlVisible(control, visibleParentContainer),
               forceRecalk = !visible && control._needRecalkInvisible(),
               dirtyNodes, result, dirty, hasAutoSize, controlContainerNode;

            if (visible || forceRecalk) {
               if (!visible) {
                  addComment(node, 'невидимый - всё равно пересчитываем');
                  delayRecalkNode(node);
               }

               hasAutoSize = haveAutoSize(node);
               control._beforeChildrenBatchCalc && control._beforeChildrenBatchCalc();
               try
               {
                  controlContainerNode = control.getContainer();
                  controlContainerNode = controlContainerNode && controlContainerNode.get(0);
                  dirtyNodes = Object.keys(node.children).reduce(function(memo, key) {
                     if (recalkNode(node.children[key], forceRecalk || forceRecalkParent, controlContainerNode || visibleParentContainer)) {
                        memo.push(node.children[key]);
                     }
                     return memo;
                  }, []);

                  if (!noChildren && debugEnabled) {
                     addComment(node, hasAutoSize ? 'прозрачный' : 'непрозрачный');
                     addComment(node, dirtyNodes.length + ' изм.');
                  }

                  result = haveOnSizeChangedFired || ((dirtyNodes.length > 0) && hasAutoSize);

                  if (dirtyNodes.length > 0 || (update.recalculateOwnSize)) {
                     dirty = control._onSizeChangedBatch && control._onSizeChangedBatch(getControls(dirtyNodes));
                     if (!dirty) {
                        result = false;
                     }

                     if (isFinal && control.hasEventHandlers('onBatchFinished')) {
                        control._notifyBatchDelayed('onBatchFinished');
                     }

                     //Это может быть не-контейнер, например, браузер. Тогда он не должен onResize рассылать в конце расчёта.
                     node.needSendOnResize = !!control._onResizeHandlerBatch;

                     if (debugEnabled) {
                        if (node.needSendOnResize) {
                           addComment(node, 'пакетный - есть изм. узлы! - ' + (dirty ? 'есть изм.' : 'нет изм.'));
                        }
                        else {
                           addComment(node, 'пакетный - пересчёт себя (нет изм. дочерних)');
                        }
                     }
                  } else if (debugEnabled) {
                     addComment(node, noChildren ? 'пакетный - листовой' : 'пакетный - нет изм. узлов');
                  }
               } finally {
                  control._afterChildrenBatchCalc && control._afterChildrenBatchCalc();
               }
            }
            else {
               delayRecalkNode(node);
               result = haveOnSizeChangedFired;
            }

            return result;
         }

         function sendOnResize(node, parentSent) {
            if (node.needSendOnResize && !parentSent) {
               parentSent = true;
               if (!node.control.isDestroyed()) {
                  // Из-за слоя совместимости можем дернуть _notify у новых контролов
                  // Если сделаем это до маунта контрола в DOM, то упадет ошибка
                  // Поэтому проверим для новых контролов свойство _mounted
                  if(node.control._template) {
                     if(node.control._mounted !== false) {
                        node.control._onResizeHandlerBatch();
                     }
                  } else {
                     node.control._onResizeHandlerBatch();
                  }
               }
               addComment(node, '*');
            }
            if (!parentSent) {
               for (var key in node.children) {
                  if (node.children.hasOwnProperty(key)) {
                     var
                        child = node.children[key];
                     sendOnResize(child, parentSent);
                  }
               }
            }
         }

         function printNode(node) {
            var i, l, nodeStr, comments;

            nodeStr = node.type + ' (' + (node.control ? (self._getUID(node.control) + ' - ') : '') + ') ';

            comments = node.comments || [];
            for (i = 0, l = comments.length; i < l; i++) {
               nodeStr += (comments[i] + ((i < l - 1) ? ', ' : ''));
            }

            if (!isEmptyObject(node.children)) {
               self._con.group(nodeStr, node.control && node.control.getContainer());

               for (var key in node.children) {
                  if (node.children.hasOwnProperty(key)) {
                     printNode(node.children[key]);
                  }
               }
               self._con.groupEnd();
            }
            else {
               self._con.log(nodeStr, node.control && node.control.getContainer());
            }
         }

         function doUpdate() {
            nodeRoot = {control: null, children: {}};
            nodesById = {};

            //если в пакетной обработке будет не только onSizeChanged - нужна доработка построения дерева и его обхода
            this._con.group('_applyBatchUpdate: ' + hint);

            for (var id in this._batchUpdateControls) {
               if (this._batchUpdateControls.hasOwnProperty(id)) {
                  var
                     update = this._batchUpdateControls[id],
                     control = update.control;
                  if (control && !control.isDestroyed()) {
                     var
                        type = getType(control),
                        parentNode = getBatchParentNode(control),
                        child;

                     if (parentNode !== nodeRoot || update.recalculateOwnSize) {
                        child = parentNode.children[id];
                        if (child) {
                           child.control = control;
                           child.type = type;
                        }
                        else {
                           child = {control: control, type: type, children: {}};
                           parentNode.children[id] = child;
                           nodesById[id] = child;
                        }
                        child.update = update;
                     }
                  }
               }
            }

            if (isFinal) {
               this._batchUpdateControls = {};
            }

            var rootContainer = $('html').get(0);
            for (var key in nodeRoot.children) {
               if (nodeRoot.children.hasOwnProperty(key)) {
                  var
                     child = nodeRoot.children[key];
                  recalkNode(child, false, rootContainer);
               }
            }
            sendOnResize(nodeRoot, false);

            if (this._debugEnabled) {
               printNode(nodeRoot);
            }

            this._con.groupEnd();
         }

         this._applyUpdateInProcess = true;
         try
         {
            doUpdate.call(this);
            if (isFinal && !isEmptyObject(this._batchUpdateControls)) {
               doUpdate.call(this);
            }
         }
         finally
         {
            if (isFinal) {
               this._batchUpdateControls = {};
            }
            this._applyUpdateInProcess = false;
         }
      },
      /**
       *
       * @returns {boolean}
       */
      haveBatchUpdate: function() {
         return this._batchUpdateCount > 0;
      },
      /**
       *
       * @returns {boolean}
       */
      haveApplyUpdateInProcess: function() {
         return this._applyUpdateInProcess;
      },

      _needDelayedRecalk: function(control) {
         var data = control._getBatchUpdateData();
         return data && data.delayedRecalkData;
      },

      _doDelayedRecalk: function(control) {
         var self = this,
            controlUpdates = control._getBatchUpdateData(),
            updatesStep1 = (controlUpdates && controlUpdates.delayedRecalkData),
            updatesStep2 = updatesStep1.reduce( function(memo, update) {
               if (control !== update.control)
                  memo.push(update);
               return memo;
            }, []);

         if (controlUpdates) {
            delete controlUpdates.delayedRecalkData;
         }

         function getHint(step) {
            var hint;
            if (self._debugEnabled) {
               hint = '_doDelayedRecalk: ' + step + self.getType(control) + ': ' + self._getUID(control);
            }
            else {
               hint = '_doDelayedRecalk ' + step;
            }

            return hint;
         }

         function processUpdates(step, updates) {
            function sendSizeChangedUpdates() {
               for (var key in updates) {
                  if (updates.hasOwnProperty(key)) {
                     var
                        update = updates[key],
                        control = update.control;
                     if (control && !control.isDestroyed()) {
                        control._notifyOnSizeChanged(control, control, update.recalculateOwnSize);
                     }
                  }
               }
            }

            self._runInBatchUpdate(getHint(step), self, sendSizeChangedUpdates);
         }

         processUpdates('-1 step-', updatesStep1);

         this.addDelayedFunc('doDelayedReCalc -2 step-', control, function() { processUpdates('-2 step-', updatesStep2); });
      }
   }))();

   return ControlBatchUpdater;
});
