import * as Control from 'Core/Control';
import template = require('wml!EDM/Index');
import LocalStorage from 'EDM/LocalStorage/Source';
import detection = require('Core/detection');
import 'css!theme?EDM/Index';
import * as debounce from 'Core/helpers/Function/debounce'

class Index extends Control {

    public _template:Function = template;

    public add(document: Document):void{
        LocalStorage.addDocument(document);
    }

    public remove(id: string):void{
        LocalStorage.removeDocument(id);
    }

    public readAll():void{
        LocalStorage.readAll();
    }

    public search(line:string):void{
        LocalStorage.search(line);
    }

    protected _beforeMount() {
        LocalStorage.initIfNotExist();
        if (detection.isMobilePlatform) {
            this.myTheme = "mobile";
        } else {
            this.myTheme = "desktop";
        }
    }

     _closeHandler(): void {
       this._children.StackPanel._forceUpdate();
    }

   myHDClick(e: Event, data:Object): void {
      this._children.StackPanel.open({
         templateOptions: {
            readOnly: false,
            item: data
         }
      });
   }
}

export = Index;
