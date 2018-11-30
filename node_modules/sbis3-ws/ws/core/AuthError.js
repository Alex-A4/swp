define('Core/AuthError', [
    'Core/UserInfo',
    'Core/EventBus',
    'Lib/Tab/Message'
], function(
    UserInfo,
    EventBus,
    TabMessage
) {
    /**
     * Компонент, отвечающий за перезагрузку страницы при обнаружении ошибке авторизации
     * Необходим для того чтобы  при смене пользователя на одной вкладке,
     * остальные вкладки не пытались работать с данными текущего клиента
     *
     * Раньше этот кусок был в Tema_Skrepka, которая сейчас подключается не везде
     *
     * @name Core/AuthError
     * @author Заляев А.В.
     */
    var tm = new TabMessage();
    EventBus.channel('errors').subscribe('onAuthError', function () {
        tm.notify('authError');
        window.location.reload();
    });
    /*
     * Если на соседних вкладках задетектили ошибку на соседней вкладке
     * то проверяем что текущая сессия не актуальна и перезагружаем
     */
    tm.subscribe('authError', function () {
        if (!UserInfo.isValid()) {
            window.location.reload();
        }
    });
});
