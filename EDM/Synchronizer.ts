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
                diff.forEach((oneItem) => {
                    service.post('api/update', {id: oneItem.id, document: oneItem})
                    .then(() => {
                        oneItem.sync = true;
                        Source.update(oneItem.id, oneItem);
                    });
                });
                
            } else {
                EventBus.channel('docChannel').notify('refresh');
            }
        });
};

export default Synchronize;
