import * as Control from "Core/Control";
import template = require('wml!EDM/Document/Document');
import createGUID = require("Core/helpers/createGUID");
import LocalStorage from 'EDM/LocalStorage/Source';
import 'css!EDM/Document/DocumentStyles'

class Document extends Control {
   public _template: Function = template;
   private  _id: String = "";
   private _author: String = "";
   private _title: String = "";
   private _description: String = "";
   private _date: String = "";
   private _time: String = "";
   readOnly: Boolean = true;
   dateTime: Boolean = true;

   _beforeMount(options:Object): void {
      this._author = options.item ? options.item.author : "";
      this._title = options.item ? options.item.title : "";
      this._description = options.item ? options.item.description: "";
      this.readOnly = options.readOnly ? options.readOnly : false;
      this.dateTime = true;

      var date =  new Date();
      var month = 1 + date.getMonth();
      var minute =  date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      this._date = options.item ? options.item.date : date.getDate() + "." + month + "." + date.getFullYear();
      this._time = options.item ? options.item.time : date.getHours() + ":" + minute;
   }

   public save(): void {

      this._id = createGUID();
      var date =  new Date();
      var month = 1 + date.getMonth();
      var minute =  date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      this._date = date.getDate() + "." + month + "." + date.getFullYear();
      this._time = date.getHours() + ":" + minute;

      LocalStorage.addDocument({
         id: this._id,
         author: this._author,
         title: this._title,
         date: this._date,
         time: this._time,
         description: this._description
      });
      
      this._notify('sendResult', []);
      this._notify('close', [], {bubbling: true});
   }

   public edit(): void {
      this.dateTime = false;
      this.readOnly = false;

   }


}

export = Document;
