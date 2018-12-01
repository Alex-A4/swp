import Service from './Service';
import * as EventBus from 'Core/EventBus';

let Channel = EventBus.channel('syncChannel');
let DocChannel = EventBus.channel('docChannel');
let socket;

const SocketWorker = {
    startListen(url: string, recconectTime: number = 1000) {
        const service = new Service(`${location.origin}`);
        socket = new WebSocket(url);

        socket.onopen = () => {
            Channel.notify('connected');
        };

        socket.onclose = (event) => {
            setTimeout(() => {
                SocketWorker.startListen("ws://localhost:777", recconectTime * 2)
            }, recconectTime * 2);
        };

        socket.onmessage = (event) => {
            let data = JSON.parse(event.data);

            switch(data.method){
                case 'update':
                    DocChannel.notify('update', JSON.parse(data.args[0]), data.args[1]);
                    break;
                case 'delete':
                    DocChannel.notify('delete', JSON.parse(data.args[0]));
                    break;
            }
        };
    }
};

export default SocketWorker;
