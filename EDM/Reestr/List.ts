import * as Control from 'Core/Control';

import 'css!EDM/Reestr/rowstyle';

import template = require('wml!EDM/Reestr/List');

class List extends Control {
	public _template : Function = template;

	public rowClickHandler(): void {		
	}

	public deleteHandler(): void{
		alert("Кнопка удаления нажата");
	}
}


export = List;