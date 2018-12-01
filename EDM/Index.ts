import * as Control from 'Core/Control';
import template = require('wml!EDM/Index');
import LocalStorage from 'EDM/LocalStorage/Source';
import 'css!EDM/indexstyle';
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
        if(this.searchValue) {https://github.com/Alex-A4/swp/pull/4/conflict?name=EDM%252FLocalStorage%252FSource.ts&ancestor_oid=ce11b4367993fcc0dd791f20fd351db22b078f6a&base_oid=95bf135029cdb3d8dc4989b50d4edc49e491e3e8&head_oid=92c8c749525b0f1303142011f3dfa63082e04acd
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
