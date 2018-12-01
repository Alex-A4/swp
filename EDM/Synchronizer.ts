import * as EventBus from 'Core/EventBus';
import Source from 'EDM/LocalStorage/Source';
import Service from 'EDM/Service';

function Synchronize() {
    let service = new Service(location.origin);
    service.get("api/list")
        .then((list) => {
            Source.merge(list);
            let diff = Source.filter('sync', false);
            diff = diff.map((item) => {delete item.sync; return item});
            if (diff.length) {
                service.post('api/sync', {documents: diff})
                    .then(() => {
                        diff.forEach((item) => {
                            item.sync = true;
                            Source.update(item.id, item);
                        });
                    });
            } else {
                EventBus.channel('docChannel').notify('refresh');
            }
        });
};

export default Synchronize;
