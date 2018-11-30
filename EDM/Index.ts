import * as Control from 'Core/Control';
import template = require('wml!EDM/Index');
import LocalStorage from 'EDM/LocalStorage/Source';
import * as debounce from 'Core/helpers/Function/debounce'

class Index extends Control {

    public _template:Function = template;
    
    public add():void{
        LocalStorage.addDocument({
            id: '1243',
            title: 'Prodam GARAGE',
            description: 'Hochy prodat garage pod samagon',
            date: '10.11.2018',
            time: '15:32',
            author: 'Dima'
        });
    }

    public remove():void{
        LocalStorage.removeDocument('1243');
    }

    public readAll():void{
        LocalStorage.readAll();
    }

    public search():void{
        LocalStorage.search(this.state);
    }
    
    protected _beforeMount() {
        LocalStorage.initIfNotExist();
    }
}

export = Index;