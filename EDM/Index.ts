import * as Control from 'Core/Control';
import template = require('wml!EDM/Index');
import LocalStorage from 'EDM/LocalStorage/Source';
import detection = require('Core/detection');
import 'css!theme?EDM/Index';
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

        if (detection.isMobilePlatform) {
            this.myTheme = "mobile";
        } else {
            this.myTheme = "desktop";
        }
    }

     _closeHandler(): void {
       this._children.StackPanel._forceUpdate();
    }

   addButtonClickHandler(e: Event, data:Object): void {
      this.openWindow(data, false);
   }

   rowClickHandler(e: Event, item: Document) {
       this.openWindow(item, true);
   }
   deleteRowClickHandler (e:Event, data:Document){
       LocalStorage.removeDocument(data.id);
      this.items = LocalStorage.readAll();
   }

   private openWindow(item, readonly) {
      this._children.StackPanel.open({
         templateOptions: {
            readOnly: readonly,
            item: item
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
