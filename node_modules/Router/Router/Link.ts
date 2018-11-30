/// <amd-module name="Router/Link" />

// @ts-ignore
import * as Control from 'Core/Control';
// @ts-ignore
import template = require('wml!Router/Link');

import RouterHelper from 'Router/Helper';

import 'css!Router/Link';

class Link extends Control {

   private _href: string = '';
   private _prettyhref: string = '';

   public _template: Function = template;

   clickHandler(e:Event): void {
      e.preventDefault();
      e.stopPropagation();
      this._notify('routerUpdated', [this._href, this._prettyhref], { bubbling: true });
   }

   _beforeMount(cfg: object): void {
      this._recalcHref(cfg);
   }

   _afterMount(): void {
      this._notify('linkCreated', [this], { bubbling: true });
   }

   _beforeUpdate(cfg: object): void {
      this._recalcHref(cfg);
   }

   _beforeUnmount() {
      this._notify('linkDestroyed', [this], { bubbling: true });
   }

   _recalcHref(cfg: any): void {
      this._href = RouterHelper.calculateHref(cfg.href, cfg, undefined);
      if (cfg.prettyUrl) {
         this._prettyhref = RouterHelper.calculateHref(cfg.prettyUrl, cfg, undefined);
      } else {
         this._prettyhref = undefined;
      }
   }

   recalcHref(): void {
      this._recalcHref(this._options);
      this._forceUpdate();
   }
}

export = Link;
