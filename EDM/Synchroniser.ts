import * as EventBus from 'Core/EventBus';
import Source from 'EDM/LocalStorage/Source';
import Service from 'EDM/Service';

/*посты и геты */
/*локальная база данных в браузере localstorage*/
/*моя база данных в облаке*/
/*в локальную базу все равно сохрянаем!*/
/*ссылка на весь сайт, если порт есть, то добавляем*/
/*в локал сторадже уже удалено, мы дожидаемся конекта и удаляем в базе*/

let synchChannel = EventBus.channel("synchChannel");




const Synchroniser = {
    connected: false,
    service: new Service(`${location.origin}${location.port ? `: 
    ${location.port}` : ''}`),

    sync() {
        this.service.get("/api/list")
            .then((list) => {
                localStorage.merge(list));
            }
    },

}


synchChannel.subscribe('connected', Synchroniser.sync.bind(Synchroniser));


