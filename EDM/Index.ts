import * as Control from 'Core/Control';
import template = require('wml!EDM/Index');
import LocalStorage from 'EDM/LocalStorage/Source';
import 'css!EDM/indexstyle';
import * as debounce from 'Core/helpers/Function/debounce'

class Index extends Control {

    public _template:Function = template;

    public searchValue: String;

    public add(document: Document):void{
        LocalStorage.addDocument(document);
    }

    public remove(id: string):void{
        LocalStorage.removeDocument(id);
    }

    public readAll():void{
        LocalStorage.readAll();
    }

    public search():void{
        if(this.searchValue) {
            this.items = LocalStorage.search(this.searchValue);
        } else {
            this.items = LocalStorage.readAll();
        }
    }

    protected _beforeMount() {
        LocalStorage.initIfNotExist();
        this.items = LocalStorage.readAll();
    }

     _closeHandler(): void {
       this._children.StackPanel._forceUpdate();
    }

   myHDClick(e: Event, data:Object): void {
      this._children.StackPanel.open({
         templateOptions: {
            readOnly: false,
            item: data
         },
         eventHandlers: {
            onResult: () => {
                this.items = LocalStorage.readAll();
                this._forceUpdate();
            }
         }
      });
   }
}

export = Index;
