import * as EventBus from 'Core/EventBus';
import Source from 'EDM/LocalStorage/Source';
import Service from 'EDM/Service';


let synchChannel = EventBus.channel("syncChannel");

const Synchronizer = {
    connected: false,
    sync() {
        new Service(`${location.origin}`).get("api/list")
            .then((list) => {
                Source.merge(list)});
    },
};

synchChannel.subscribe('connected', Synchronizer.sync.bind(Synchronizer));

export default Synchronizer;
