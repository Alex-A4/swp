import * as Control from 'Core/Control';

import 'css!EDM/Reestr/rowstyle';

import template = require('wml!EDM/Reestr/Row');

class Row extends Control {
	public _template : Function = template;

   rowClickHandler(e: Event, data:Object): void {
      this._children.StackPanel.open({
         templateOptions: {item: data, _readOnly: true}
   	});
   }
}


export = Row;
