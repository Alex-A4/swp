import * as Control from 'Core/Control';
import template = require('wml!EDM/Index');
import LocalStorage from 'EDM/LocalStorage/Source';
import detection = require('Core/detection');
import 'css!theme?EDM/Index';
import * as debounce from 'Core/helpers/Function/debounce'

class Index extends Control {

    public _template: Function = template;

    public searchValue: String;

    public page: number = 0;
    public sizePage: number = 5;

    public items: Array<Document>;
    public allItems: Array<Document>;
    public countPage: number;


    public add(document: Document): void {
        LocalStorage.addDocument(document);
    }

    public remove(id: string): void {
        LocalStorage.removeDocument(id);
    }

    public readAll(): void {
        LocalStorage.readAll();
    }

    public changeCurrentPage(indx: number): void {
        this.page = indx;
        if (this.allItems.length % this.sizePage == 0) {
            this.countPage = this.allItems.length / this.sizePage;
        } else {
            this.countPage = Math.floor(this.allItems.length / this.sizePage) + 1;
        }
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

    public search(): void {
        if (this.searchValue) {
            this.items = LocalStorage.search(this.searchValue);
        } else {
            this.items = LocalStorage.readAll();
        }
    }

    protected _beforeMount() {
        LocalStorage.initIfNotExist();

        // this.items = LocalStorage.readAll();
        this.allItems = LocalStorage.readAll();
        this.changeCurrentPage(this.page);

        if (detection.isMobilePlatform) {
            this.myTheme = "mobile";
        } else {
            this.myTheme = "desktop";
        }
    }

    _closeHandler(): void {
        this._children.StackPanel._forceUpdate();
    }

    addButtonClickHandler(e: Event, data: Object): void {
        this.openWindow(data, false, false);
    }

    rowClickHandler(e: Event, item: Document) {
        this.openWindow(item, true, true);
    }

    deleteRowClickHandler(e: Event, data: Document) {
        LocalStorage.removeDocument(data.id);
        this.allItems = LocalStorage.readAll();
        var len = this.allItems.length;
        if (len % this.sizePage == 0) {
            this.page--;
            var t = 666;
        }
        this.changeCurrentPage(this.page);
        this._forceUpdate();
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
                    //this.items = LocalStorage.readAll();
                    this.allItems = LocalStorage.readAll();
                    this.changeCurrentPage(this.page);
                    this._forceUpdate();
                }
            }
        });
    }
}

export = Index;
