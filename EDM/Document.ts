import * as Control from "Core/Control";
import template = require('wml!EDM/Document/Document');
import createGUID = require('Core/helpers/createGUID');
import LocalStorage from 'EDM/LocalStorage/Source';
import 'css!EDM/Document/DocumentStyles'
import Service from './Service';

class Document extends Control {
    public _template: Function = template;
    private _id: String = "";
    private _author: String = "";
    private _title: String = "";
    private _description: String = "";
    private _date: String = "";
    private _time: String = "";
    private _style: String = "_default";
    private _items: Object = {};
    private picture: String = "";
    public selectedItem: String;
    readOnly: Boolean = true;
    dateTime: Boolean;

    _beforeMount(options: Object): void {
        this.dateTime = true;
        this._id = options.item.id ? options.item.id : createGUID();
        this._author = options.item.author ? options.item.author : "";
        this._title = options.item.title ? options.item.title : "";
        this._description = options.item.description ? options.item.description : "";
        this.readOnly = options.readOnly ? options.readOnly : false;
        this.dateTime = options.dateTime;
        this._style = options.item.style ? options.item.style : "_default";

        let date = this.getCurrentDateAndTime();

        this._date = date.date;
        this._time = date.time;
    }
   _changeValue(e:Event):void{
       this._style = e.target.value;
   }
    private save(): void {
        let date = this.getCurrentDateAndTime(),
            newDoc;
        this._date = date.date;
        this._time = date.time;
        newDoc = this.createDocument();
        newDoc.sync = false;
        LocalStorage.update(this._id, newDoc);
        new Service(location.origin).post('api/update', {id: this._id, document: this.createDocument()});
        this._notify('sendResult', []);
        this._notify('close', [], {bubbling: true});
    }

    public edit(): void {
        this.dateTime = false;
        this.readOnly = false;
    }

    _valueChangedHandler(e: Event, tmp: Object) {
        if (!tmp) {
            this._notify('valueChanged', undefined);
        } else {
            this._notify('valueChanged', [tmp]);
        }
    }

    private createDocument(): Document {
        return {
            id: this._id,
            author: this._author,
            title: this._title,
            date: this._date,
            time: this._time,
            description: this._description,
            style: this._style
        };
    }

    private getCurrentDateAndTime(): any {
        let currentDate = new Date();

        return {
            date: currentDate.toLocaleDateString(),
            time: currentDate.toLocaleTimeString().slice(0, 5)
        };
    }
}

export = Document;
