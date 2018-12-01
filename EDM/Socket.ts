import Service from './Service';
import * as EventBus from 'Core/EventBus';
import { Collection } from 'builder-ui/builder-json-cache/platform/Data/display';
import create from 'builder-ui/builder-json-cache/platform/View/_Request/createDefault';



let Channel = EventBus.channel('syncChannel');
let DocChannel = EventBus.channel('docChannel');


const service = new Service(`${location.origin}${location.port ? `:
                                ${location.port}` : ''}`);
let socket;

const SocketWorker = {
    startListen(url: string, recconectTime: number = 1000) {
        socket = new WebSocket("ws://localhost:777");

        socket.onopen = () => {
            console.log("Соединение установлено.");
            
            Channel.notify('connected');
        };

        socket.onclose = (event) => {
            
            Channel.notify('disconnected');

            setTimeout(function(){
                SocketWorker.startListen("ws://localhost:777")
            }, recconectTime * 2);
        };

        socket.onmessage = function(event) {
            let data = JSON.parse(event.data);

            switch(data.method){
                case 'create':
                    DocChannel.notify('create', data.document);
                    break;
                case 'uppdate':
                    DocChannel.notify('update', data.id, data.document);
                    break;
                case 'delete':
                    DocChannel.notify('delete', data.id);
                    break;
                default: {

                }
            }
        };

        socket.onerror = function(error) {
            
            Channel.notify('error');
        };
    }
}

export default SocketWorker;