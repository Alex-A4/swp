define('Core/helpers/openFile',[
    "Core/moduleStubs",
    "Core/IoC"
], function (moduleStubs, IoC) {
    var pluginDef;
    function getPlugin() {
        if (!pluginDef) {
            pluginDef = moduleStubs.require(["SBIS3.Plugin/Source/LocalService"]).addCallback(function(modules){
                return modules[0];
            });
        }
        return pluginDef.createDependent();
    }
    /**
     * Открывает указанный файл при помощи FileLink плагина нотификатора.
     * @example
     * <pre>
     * helpers.openFile('C:\update.txt').addCallback(function() {
       *    helpers.alert('Файл успешно открыт!');
       * }).addErrback(function() {
       *    helpers.alert('При открытии файла произошла ошибка.');
       * });
     * </pre>
     * @param {String} fileName Имя открываемого файла.
     * @param {String} pluginMode Отображения информационного окна плагина (в случае ошибки) (только 1 раз: runOnce, всегда: always)
     * @returns {Deferred} Деферред с результатом выполнения функции.
     */
    return function (fileName, pluginMode) {
        return getPlugin().addCallback(function (LocalService) {
            var service = new LocalService({
                endpoint: {
                    address: 'FileLink-1.0.0.4',
                    contract: 'FileLink'
                },
                options: {
                    mode: pluginMode || 'runOnce'
                }
            });
            return service.call('OpenLink', {path: fileName});
        }).addErrback(function(err) {
            IoC.resolve('ILogger').log('Core/helpers/openFile', 'error opening file "' + fileName + '".');
            return err;
        });
    }
});