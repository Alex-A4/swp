/// <amd-module name="Router/Route" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!Router/Route');

import RouterHelper from 'Router/Helper';
import History from 'Router/History';

class Route extends Control {
   private _urlOptions = null;
   private _entered: boolean = false;
   private _index: number = 0;

   public _template: Function = template;

   public pathUrlOptionsFromCfg(cfg: object): void {
      for (let i in cfg) {
         if (!this._urlOptions.hasOwnProperty(i) && cfg.hasOwnProperty(i) &&
            i !== 'mask' && i !== 'content' && i !== '_logicParent') {
            this._urlOptions[i] = cfg[i];
         }
      }
   }

   /**
    * return flag = resolved params from URL
    */
   public _wasResolvedParam(): boolean {
      let notUndefVal = false;
      for (let i in this._urlOptions) {
         if (this._urlOptions.hasOwnProperty(i)) {
            if (this._urlOptions[i] !== undefined) {
               notUndefVal = true;
               break;
            }
         }
      }
      return notUndefVal;
   }

   public _applyNewUrl(mask: string, cfg: object): boolean {
      this._urlOptions = RouterHelper.calculateUrlParams(mask, undefined, this._index);
      const notUndefVal = this._wasResolvedParam();
      this.pathUrlOptionsFromCfg(cfg);
      return notUndefVal;
   }

   public beforeApplyUrl(newLoc: any, oldLoc: any): Promise<any> {
      let result;
      this._urlOptions = RouterHelper.calculateUrlParams(this._options.mask, newLoc.url, this._index);
      const wasResolvedParam = this._wasResolvedParam();
      if (wasResolvedParam) {
         this.pathUrlOptionsFromCfg(this._options);
         if (!this._entered) {
            result = this._notify('enter', [newLoc, oldLoc]);
         } else {
            result = (new Promise((resolve) => {
               resolve(true);
            }));
         }
         this._entered = true;
      } else {
         this.pathUrlOptionsFromCfg(this._options);
         if (this._entered) {
            result = this._notify('leave', [newLoc, oldLoc]);
         } else {
            result = (new Promise((resolve) => {
               resolve(true);
            }));
         }
         this._entered = false;
      }
      return result;
   }

   public afterUpForNotify(): Promise<any> {
      this._urlOptions = RouterHelper.calculateUrlParams(this._options.mask, RouterHelper.getRelativeUrl(), this._index);
      const notUndefVal = this._wasResolvedParam();
      this.pathUrlOptionsFromCfg(this._options);

      const currentState = History.getCurrentState();
      let prevState = History.getPrevState();
      if (notUndefVal) {
         this._entered = true;
         if (!prevState) {
            prevState = {
               url: RouterHelper.calculateHref(this._options.mask, {clear: true}, undefined)
            };
         }
         return this._notify('enter', [currentState, prevState]);
      }
      return new Promise((resolve) => {resolve(); });
   }

   public applyNewUrl(): void {
      this._forceUpdate();
   }

   public _reserve(index: number, newUrl: string): number {
      let res = RouterHelper.findIndex(this._options.mask, index, newUrl);
      if (res !== -1) {
         this._index = res - 1;
      } else {
         res = index;
      }
      return res;
   }

   public _beforeMount(cfg: any): void {
      this._urlOptions = {};
      this._applyNewUrl(cfg.mask, cfg);
   }

   public _afterMount(): void {
      this._notify('routerCreated', [this], { bubbling: true });
      this.afterUpForNotify();
   }

   public _beforeUpdate(cfg: any) {
      this._applyNewUrl(cfg.mask, cfg);
   }

   public _beforeUnmount() {
      this._notify('routerDestroyed', [this], { bubbling: true });
   }
}

export = Route;
