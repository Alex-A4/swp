import * as Control from 'Core/Control';
import template = require('wml!EDM/Index');
import LocalStorage from 'EDM/LocalStorage/Source';
import detection = require('Core/detection');
import 'css!theme?EDM/Index';
import * as EventBus from 'Core/EventBus';
import Socket from './Socket';
import Service from './Service';

class Index extends Control {

    public _template: Function = template;

    public searchValue: String;

    public page: number = 0;
    public sizePage: number = 5;

    public items: Array<Document>;
    public allItems: Array<Document>;
    public countPage: number;

    public add(document: Document): void {
        var t = 0;
        if (this.allItems.length == 0) {
           // this.page = 0;
            t = 1;
        }
        LocalStorage.addDocument(document);
        /*if (t == 1) {
            this.changeCurrentPage(0);
        }*/
    }

    public remove(event, id: string): void {
        LocalStorage.removeDocument(id);
        this.getFreshData();
    }

    public update(event, id: string, document: Document) {
        document.sync = true;
        LocalStorage.update(id, document);
        this.getFreshData();
    }

    public readAll(): void {
        LocalStorage.readAll();
    }

    public changeCurrentPage(indx: number): void {
        this.page = indx;
        if (this.allItems.length % this.sizePage == 0) {
            this.countPage = Math.floor(this.allItems.length / this.sizePage);
        } else {
            this.countPage = Math.floor(this.allItems.length / this.sizePage) + 1;
        }
        /*if (this.allItems.length == 0) {
            this.items = [];
            this.countPage = 0;
            return;
        }*/
        this.items = [];
        /* this.allItems ..... -> .... this.items = []*/
        let first: number = indx * this.sizePage;
        let last: number = first + this.sizePage - 1;
        for (let i = first; i <= last; i++) {
            if (i < this.allItems.length)
                this.items.push(this.allItems[i]);
        }
    }

    public changeCurrentPageHdl(event, i): void {
        this.changeCurrentPage(i);
    }

    private getFreshData() {
        this.allItems = LocalStorage.readAll();
        this.changeCurrentPage(this.page);
        this._forceUpdate();
        this._children.relhoc._forceUpdate();
    }

    public search(): void {
        if (this.searchValue) {
            this.items = LocalStorage.search(this.searchValue);
        } else {
            this.items = LocalStorage.readAll();
        }
    }

    protected _beforeMount(): void {
        LocalStorage.initIfNotExist();

        this.remove = this.remove.bind(this);
        this.update = this.update.bind(this);
        this.getFreshData = this.getFreshData.bind(this);

        EventBus.channel('docChannel').subscribe('remove', this.remove);
        EventBus.channel('docChannel').subscribe('update', this.update);
        EventBus.channel('docChannel').subscribe('refresh', this.getFreshData);

        this.allItems = LocalStorage.readAll();
        this.changeCurrentPage(this.page);

        if (detection.isMobilePlatform) {
            this.myTheme = "mobile";
        } else {
            this.myTheme = "desktop";
        }
    }

    protected _afterMount(): void {
        Socket.startListen('ws://localhost:8080');
    }

    private addButtonClickHandler(e: Event, data: Object): void {
        this.openWindow(data, false, false);
    }

    private rowClickHandler(e: Event, item: Document): void {
        this.openWindow(item, true, true);
    }

    private deleteRowClickHandler(e: Event, data: Document): void {
        LocalStorage.removeDocument(data.id);
        let len = this.allItems.length;
        if (len % this.sizePage == 0) {
            this.page--; // WOOOOORK
        }
        this.changeCurrentPage(this.page);
        this._forceUpdate();
        new Service(location.origin).post('api/delete', {id: data.id})
    }

    private openWindow(item, readonly, datetime) {
        this._children.StackPanel.open({
            templateOptions: {
                readOnly: readonly,
                dateTime: datetime,
                item: item
            },
            eventHandlers: {
                onResult: () => {
                    this.getFreshData();
                }
            }
        });
    }
}

export = Index;
