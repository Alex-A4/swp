define('Core/helpers/Hcontrol/saveToFile', [
    'Core/constants',
    'Core/cookie',
    'Transport/RPCJSON',
    'Core/Deferred',
    'Transport/prepareGetRPCInvocationURL'
], function(
    _const,
    cookie,
    RPCJSON,
    Deferred,
    prepareGetRPCInvocationURL
) {

    /**
     * Модуль, в котором описана функция <b>saveToFile(object, methodName, params, url, useGET)</b>.
     *
     * Сохраняет файл в формате PDF или Excel. В результате выполнения метода в веб-браузере будет выведено окно для сохранения файла.
     *
     * По умолчанию метод saveToFile создаёт POST-запрос к серверу веб-приложения. В ответе на такой запрос возвращается файл, однако не создаётся ссылка, по которой файл будет доступен для скачивания. С помощью необязательного параметра <i>useGet</i> можно создавать Get-запрос, в ответе которого возвращается ссылка на скачивание файла.<br/><br/>
     * Для Get-запросов веб-браузеры устанавливают ограничение на длину URL-адреса, в котором передаются данные для метода БЛ. Когда фактическая длина превышает установленное ограничение, адрес обрезается, и на сервер передаются некорректные данные запроса. Поэтому в параметрах метода запрещено передавать record’ы, RecordSet’ы и результаты xsl-преобразования. Лучшей практикой считается передача небольшого набора данных. Например это может быть массив идентификаторов, по которым метод БЛ получит записи из таблицы БД. <br/><br/>
     * Современные веб-браузеры блокируют открытие новых окон (вкладок), если <i>window.open</i> вызвано не в результате действия пользователя. Поэтому при вызове метода saveToFile диалог для скачивания файла отображается в текущей вкладке веб-браузера. Если Get-запрос завершается с ошибкой, то её сообщение будет выведено в текущей вкладке, что приведёт к закрытию страницы веб-приложения (например, <a href="https://online.sbis.ru/#groupId=e70429b3-4874-4545-a66b-01efb4e47ed5">online.sbis.ru</a>) и потере пользовательских данных.<br/><br/>
     * При выполнении запроса метод saveToFile в объекте <i>params</i> добавляет параметр "fileDownloadToken", если он отсутствует. Значение такого параметра - это случайно сгенерированное число, с помощью которого определяется момент завершения выполнения метода БЛ. Поэтому на вызываемый метод БЛ накладываются ограничения:
     * <ul>
     *    <li>метод принимает дополнительный параметр с именем "fileDownloadToken" (число целое 8 байт);</li>
     *    <li>метод устанавливает cookie с именем (!) "fileDownloadToken_" + "значение_параметра_в_виде_строки" и значением "значение_параметра_в_виде_строки".</li>
     * </ul>
     *
     * <h2>Параметры функции</h2>
     * <ul>
     *     <li><b>object</b> {String} - название объекта БЛ.</li>
     *     <li><b>methodName</b> {String} - имя метода БЛ, который возвращает файл.</li>
     *     <li><b>params</b> {Object} - параметры, необходимые для вызова метода БЛ.</li>
     *     <li><b>[url='/service/']</b> {String} - ссылка на сервис, из которого будет производится вызов метода БЛ. Если значение не задано, то вызов производится из сервиса по умолчанию: '/service/'.</li>
     *     <li><b>[useGET=false]</b> {Boolean} - создать GET-запрос. По умолчанию создаётся POST-запрос.</li>
     * </ul>
     *
     * <h2>Возвращает</h2>
     * {Core/Deferred}
     *
     * @class Core/helpers/Hcontrol/saveToFile
     * @public
     * @author Крайнов Д.О.
     */
    return function(object, methodName, params, url, useGET) {
        var dResult = new Deferred();

        dResult.addErrback(function (e) {
            return e;
        });

        if (object && methodName && params) {
            if (!params['fileDownloadToken']) {
                params['fileDownloadToken'] = Math.floor(1e16 * Math.random());
            }
            if (useGET) {
                window.open(prepareGetRPCInvocationURL(object, methodName, params));
                dResult.callback();
            } else {
                var body = $('body'),
                    cookieName = 'fileDownloadToken_' + params['fileDownloadToken'],
                    fileDownloadCheckTimer,
                    cookieValue,
                    form = $('.ws-upload-form'),
                    iframe = $('.ws-upload-iframe');

                if (!form.length && !iframe.length) {
                    body.append(form = $('<form enctype="multipart/form-data" target="ws-upload-iframe" ' +
                        'action="' + (url ? url : _const.defaultServiceUrl) +
                        '?raw_file_result" method="POST" class="ws-upload-form ws-hidden">' +
                        '<input type="hidden" name="Запрос"></form>'));
                    body.append(iframe = $('<iframe class="ws-upload-iframe ws-hidden" name="ws-upload-iframe"></iframe>'));
                }
                form.find('[name=Запрос]').val(
                    RPCJSON.jsonRpcPreparePacket(object + '.' + methodName, params, parseInt(("" + Math.random()).substr(2),10)).reqBody
                );
                form.submit();
                fileDownloadCheckTimer = setInterval(function() {
                    var iframeText = iframe.contents().find('pre');
                    cookieValue = cookie.get(cookieName);
                    if (parseInt(cookieValue, 10) === params['fileDownloadToken']) {
                        clearInterval(fileDownloadCheckTimer);
                        cookie.set(cookieName, null);
                        if (iframeText.length) {
                            dResult.errback(new Error(JSON.parse(iframeText.html()).error.details));
                            iframeText.remove('pre');
                        } else {
                            dResult.callback();
                        }
                    } else {
                        // Ошибка может быть еще до выполнения метода
                        if (iframeText.length) {
                            var html = JSON.parse(iframeText.html());
                            if (html.error) {
                                clearInterval(fileDownloadCheckTimer);
                                cookie.set(cookieName, null);
                                dResult.errback(new Error(html.error.details));
                                iframeText.remove('pre');
                            }
                        }
                    }
                }, 1000);
            }
        } else {
            dResult.errback();
        }
        return dResult;
    };
});