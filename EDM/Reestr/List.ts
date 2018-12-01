import * as Control from 'Core/Control';

import 'css!theme?EDM/Reestr/rowstyle';

import template = require('wml!EDM/Reestr/List');
import LocalStorage from "../LocalStorage/Source";

class List extends Control {
	public _template : Function = template;

	rowClickHandler(e: Event, data:Object){
      this._notify('rowClick', [data]);
	}
   deleteHandler(e: Event, data:Object){
      this._notify('deleteRowClick', [data]);
      e.stopPropagation();


	}
}
export = List;
