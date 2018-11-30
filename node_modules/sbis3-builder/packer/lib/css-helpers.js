'use strict';

const path = require('path');
const postcss = require('postcss');
const postcssUrl = require('postcss-url');
const safe = require('postcss-safe-parser');
const logger = require('../../lib/logger').logger();
const helpers = require('../../lib/helpers');
const invalidUrl = /^(\/|#|data:|[a-z]+:\/\/)(?=.*)/i;
const importCss = /@import[^;]+;/gi;

function rebaseUrlsToAbsolutePath(root, sourceFile, css, resourceRoot) {
   let result;
   const resourceRootWithSlash = resourceRoot ? path.join('/', resourceRoot) : '/';
   try {
      result = postcss()
         .use(
            postcssUrl({
               url(asset, dir) {
                  // ignore absolute urls, hashes or data uris
                  if (invalidUrl.test(asset.url)) {
                     return asset.url;
                  }
                  return `${helpers.prettifyPath(path.join(resourceRootWithSlash, path.relative(dir.to, path.join(dir.from, asset.url))))}`;
               }
            })
         )
         .process(css, {
            parser: safe,
            from: sourceFile,

            // internally it uses path.dirname so we need to supply a filename
            to: path.join(root, 'someFakeInline.css')
         }).css;
   } catch (e) {
      logger.warning({
         message: 'Failed to parse CSS file.',
         filePath: sourceFile,
         error: e
      });
      result = '';
   }

   return result;
}

/**
 * Собирает все @import из склееных css, и перемещает их вверх,
 * т.к. все @import должны быть вверху css
 * @param {String} packedCss - пакованная css
 * @return {String}
 */
function bumpImportsUp(packedCss) {
   let result = packedCss;
   const imports = result.match(importCss);
   if (imports) {
      imports.forEach((anImport) => {
         result = result.replace(anImport, '');
      });
      result = imports.join('\n') + result;
   }

   return result;
}

function splitIntoBatches(numSelectorsPerBatch, content) {
   const batches = [];
   let numSelectorsInCurrentBatch = 0;

   function mkBatch() {
      const batch = postcss.root();
      batches.push(batch);
      numSelectorsInCurrentBatch = 0;
      return batch;
   }

   function serializeChildren(node) {
      return node.nodes ? `${node.nodes.reduce(fastSerialize, '{')}}` : '';
   }

   function fastSerialize(memo, node) {
      if (node.type === 'decl') {
         return `${memo + node.prop}:${node.value}${node.important ? '!important' : ''};`;
      }
      if (node.type === 'rule') {
         return memo + node.selector + serializeChildren(node);
      }
      if (node.type === 'atrule') {
         return `${memo}@${node.name} ${node.params}${node.nodes ? serializeChildren(node) : ';'}`;
      }
      return memo;
   }

   function toCSSString(root) {
      return root.nodes.reduce(fastSerialize, '');
   }

   // wtf: если не сделать slice, то ровно половина массива пропадёт
   const nodes = postcss()
      .process(content, { parser: safe })
      .root.nodes.slice();
   let batch = mkBatch();
   for (const node of nodes) {
      // Считать селекторы будем только для CSS-правил (AtRules и т.п. - игнорируем)
      if (node.type === 'rule') {
         const numSelectorsInThisRule = node.selectors.length;

         // Если в пачке уже что-то есть и текущий селектор в нее не влезает - переносим в другую пачку
         // но в пустую пачку можно добавить блок, превышающий ограничения
         if (numSelectorsInCurrentBatch > 0) {
            if (numSelectorsInCurrentBatch + numSelectorsInThisRule > numSelectorsPerBatch) {
               batch = mkBatch();
            }
         }
         numSelectorsInCurrentBatch += numSelectorsInThisRule;
      }

      batch.append(node);
   }

   return batches.map(toCSSString);
}

module.exports = {
   rebaseUrls: rebaseUrlsToAbsolutePath,
   bumpImportsUp,
   splitIntoBatches
};
