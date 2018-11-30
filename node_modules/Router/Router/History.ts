/// <amd-module name="Router/History" />

import RouterHelper from 'Router/Helper';

let localHistory = [];
let currentPosition = 0;

/*
* Code is relevant only oin browser,
* because in browser we can navigate through history
* */
if (typeof window !== 'undefined') {
   let state = {id: 0, url: RouterHelper.getRelativeUrl(), prettyUrl: RouterHelper.getRelativeUrl()};
   localHistory.push(state);
}

function getCurrentState():any {
   return localHistory[currentPosition];
}

function getPrevState():any {
   return localHistory[currentPosition-1];
}

function getNextState():any {
   return localHistory[currentPosition+1];
}

function back(): void {
   currentPosition--;
   if (!localHistory[currentPosition]) {
      const state = _getHistoryObject(RouterHelper.getRelativeUrl(), RouterHelper.getRelativeUrl());
      currentPosition = 0;
      state.id = 0;
      localHistory.forEach((el) => { el.id++; });
      localHistory = [state].concat(localHistory);
   }
   RouterHelper.setRelativeUrl(localHistory[currentPosition].url);
}

function forward(): void {
   currentPosition++;
   if (!localHistory[currentPosition]) {
      _pushToHistory(RouterHelper.getRelativeUrl(), RouterHelper.getRelativeUrl());
   }
   RouterHelper.setRelativeUrl(localHistory[currentPosition].url);
}

function _getHistoryObject(url: string, prettyUrl: string): any {
   return {
      id: currentPosition,
      url: url,
      prettyUrl: prettyUrl
   };
}

function _pushToHistory(url: string, prettyUrl: string): void {
   localHistory.push(_getHistoryObject(url, prettyUrl));
}

function push(newUrl: string, prettyUrl: string): void {
   currentPosition++;
   localHistory.splice(currentPosition);

   _pushToHistory(newUrl, prettyUrl);
   RouterHelper.setRelativeUrl(newUrl);
   window.history.pushState(getCurrentState(), prettyUrl, prettyUrl);

}

export default {
   getCurrentState,
   getPrevState,
   getNextState,
   back,
   forward,
   push
}