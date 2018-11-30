'use strict';

const crypto = require('crypto');
const xmldom = require('tensor-xmldom');
const parser = new xmldom.DOMParser();
const serializer = new xmldom.XMLSerializer();

function wrap(obj, prop, replacer) {
   ((orig) => {
      obj[prop] = replacer;
      obj[prop].restore = () => {
         obj[prop] = orig;
      };
   })(obj[prop]);
}

function uniqname(names, ext) {
   const md5 = crypto.createHash('md5');
   md5.update(`${names}`);
   return `${md5.digest('hex')}.${ext}`;
}

function domify(text) {
   wrap(console, 'log', () => {
      // ничего не делаем
   });
   wrap(console, 'warn', () => {
      // ничего не делаем
   });
   wrap(console, 'error', () => {
      // ничего не делаем
   });
   let result;
   try {
      result = parser.parseFromString(text, 'text/html');
   } catch (e) {
      if (typeof e === 'string') {
         throw new Error(e);
      }
      throw e;
   } finally {
      // eslint-disable-next-line no-console
      console.log.restore();

      // eslint-disable-next-line no-console
      console.warn.restore();

      // eslint-disable-next-line no-console
      console.error.restore();
   }

   return result;
}

function stringify(dom) {
   return serializer.serializeToString(dom);
}

function mkDomNode(document, node, attributes) {
   const newNode = document.createElement(node);
   Object.keys(attributes || {}).forEach((attrName) => {
      newNode.setAttribute(attrName, attributes[attrName]);
   });
   if (node === 'script') {
      newNode.textContent = ' ';
   }
   return newNode;
}

function mkCommentNode(document, data) {
   return document.createComment(data);
}

module.exports = {
   uniqname,
   domify,
   stringify,
   mkDomNode,
   mkCommentNode
};
