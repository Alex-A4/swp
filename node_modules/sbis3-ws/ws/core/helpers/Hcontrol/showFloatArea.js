define('Core/helpers/Hcontrol/showFloatArea', [
    'Core/moduleStubs',
   'Core/Deferred'
    ], function (
    moduleStubs,
    Deferred
) {

    /**
     *
     * Модуль, в котором описана функция <b>showFloatArea(config)</b>.
     *
     * Производит создание и отображение всплывающей панели по переданной конфигурации.
     *
     * Если панель уже существует, то создание новой не производится. Для корректной работы необходимо передать опцию "name" в параметре "config".
     *
     * Используйте следующие контролы для создания панели:
     * <ul>
     *    <li>{@link Lib/Control/FloatArea/FloatArea} - для обычной плавающей панели;</li>
     *    <li>{@link Deprecated/Controls/RecordFloatArea/RecordFloatArea} - для панели с рекордом;</li>
     *    <li>{@link Deprecated/Controls/FilterFloatArea/FilterFloatArea} - для панели фильтров.</li>
     * </ul>
     *
     * <h2>Параметры функции</h2>
     * Единственный параметр - это <b>config</b> {Object}, в котором описана конфигурация панели.
     * Параметры конфигурации должны быть теми, которые требуются конструктору класса создаваемой панели (список классов панелей приведён в примечаниях).
     * Класс создаваемой панели определяется так: если в параметре config есть поле 'path' (путь к классу), то будет создан экземпляр указанного класса с заданными настройками.
     *
     * <h3>Особенности</h3>
     * <ul>
     *    <li>Поле path работает аналогично параметру 'path' у функции {@link Core.attachInstance}.</li>
     *    <li>Если же path не указан, но в параметре config есть поле 'filter': true, то будет загружаться панель фильтров (Deprecated/Controls/FilterFloatArea/FilterFloatArea) - так, как если бы в поле 'path' было бы
     *    'Deprecated/Controls/FilterFloatArea/FilterFloatArea'.</li>
     *    <li>Если же не указано ни поле 'path', ни поле 'filter', то будет создаваться обычная плав. панель (Lib/Control/FloatArea/FloatArea).</li>
     *    <li>Если в параметре config есть поля 'id' или 'name', то панель со своим конфигом будет сохранена в кеше по указанным ключам (id и/или name), и при следующем вызове функции showFloatArea
     *    (или {@link showHoverFloatArea}) с теми же параметрами 'id' или 'name' будет показана та же панель.</li>
     *    <li>Если в новом конфиге поля path, filter, или template отличаются от таких полей в старом конфиге, будет создана новая панель (потому что класс или шаблон сменился).</li>
     *    <li>Если же в новом конфиге отличаются поля target, hoverTarget, opener, то они будут переустановлены методами setTarget/setHoverTarget/setOpener, и будет показана старая панель с переустановленными параметрами.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     *
     * {Core/Deferred}
     *
     * @class Core/helpers/Hcontrol/showFloatArea
     * @public
     * @author Крайнов Д.О.
     */
    var showFloatArea = function(config) {
        function addToStorage() {
            if (id !== undefined) {
                storage.id[id] = storageEntry;
            }
            if (name !== undefined) {
                storage.name[name] = storageEntry;
            }
        }
        function deleteFromStorage() {
            if (id !== undefined) {
                delete storage.id[id];
            }
            if (name !== undefined) {
                delete storage.name[name];
            }
        }

        var
            id = config.id,
            name = config.name,
            storage = showFloatArea.storage,
            storageEntry, result, oldCfg;

        if (!storage) {
            showFloatArea.storage = storage = {
                id: {},
                name: {}
            };
        }

        var path;
        if (config.path) {
            path = config.path;
        }
        else if (config.filter) {
            path = 'Deprecated/Controls/FilterFloatArea/FilterFloatArea';
        } else {
            path = 'Lib/Control/FloatArea/FloatArea';
        }

        storageEntry = storage.id[id] || storage.name[name];
        if (storageEntry) {
            oldCfg = storageEntry.config;
            if (oldCfg.path !== config.path || oldCfg.filter !== config.filter || oldCfg.template !== config.template) {
                storageEntry = null;

                deleteFromStorage();
            }
        }

       config._openFromAction = true;

        if (storageEntry) {
            result = storageEntry.instDfr.addCallback(function (instance) {
                var result = instance;
                if (instance.isDestroyed()) {
                    result = moduleStubs.requireModule(path).addCallback(function(result){
                        return new result[0](config);
                    });
                } else {
                    if (config.target) {
                        instance.setTarget(config.target);
                    }

                    if (config.hoverTarget) {
                        instance.setHoverTarget(config.hoverTarget, true);
                    }

                    //переустановим opener-а на случай, если старый удалился, и панель от него отвязалась, оставшись без opener-а
                    if (config.opener) {
                        instance.setOpener(config.opener);
                    }

                    if (config.autoShow || config.autoShow === undefined) {
                        instance.show();
                    }
                }
                return result;
            });
        }
        else {
            var def = new Deferred();
            requirejs(['optional!Controls/Popup/Compatible/ShowDialogHelper'], function(ShowDialogHelper) {
               var res;
               if (ShowDialogHelper) {
                  res = ShowDialogHelper.open(path, config);
               } else {
                  res = moduleStubs.requireModule(path).addCallback(function (result) {
                     return new result[0](config);
                  });
               }
               res.addCallback(function (res) {
                  def.callback(res);
               });
               res.addErrback(function (err) {
                  def.errback(err);
               });
            });
            result = def;

            storageEntry = {
                instDfr: result,
                config: config
            };

            addToStorage();

            result.addCallback(function (instance) {
                //при удалении области выкидываем её из кеша,
                //чтоб зря память не ела.
                if (instance.isDestroyed()) {
                    deleteFromStorage();
                } else {
                    instance.once('onDestroy', function () {
                        deleteFromStorage();
                    });
                }
                return instance;
            });
        }

        //нужно отдавать результат через createDependent, чтобы клиентский код не мог испортить состояния deferred-а с экземпляром панельки
        return result.createDependent();
    };

    return showFloatArea;
});