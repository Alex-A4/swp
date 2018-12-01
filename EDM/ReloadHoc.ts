import * as Control from 'Core/Control';
import template = require('wml!EDM/ReloadHoc');

class ReloadHoc extends Control {

    public _template: Function = template;

}

export = ReloadHoc;
