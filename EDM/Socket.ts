import Service from './Service';
import * as EventBus from 'Core/EventBus';
import Synchronize from './Synchronizer';

let DocChannel = EventBus.channel('docChannel');
let socket;

const SocketWorker = {
    startListen(url: string, recconectTime: number = 1000) {
        const service = new Service(`${location.origin}`);
        socket = new WebSocket(url);

        socket.onopen = () => {
            Synchronize();
        };

        socket.onclose = (event) => {
            setTimeout(() => {
                SocketWorker.startListen(url, recconectTime * 2)
            }, recconectTime * 2);
        };

        socket.onmessage = (event) => {
            let data = JSON.parse(event.data);

            switch(data.method){
                case 'update':
                    DocChannel.notify('update', data.args[0], JSON.parse(data.args[1]));
                    break;
                case 'delete':
                    DocChannel.notify('remove', JSON.parse(data.args[0]));
                    break;
            }
        };
    }
};

export default SocketWorker;
