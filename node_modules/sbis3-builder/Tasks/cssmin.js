'use strict';

const path = require('path'),
   fs = require('fs-extra'),
   helpers = require('../lib/helpers'),
   logger = require('../lib/logger').logger(),
   runMinifyCss = require('../lib/run-minify-css'),
   pMap = require('p-map');

module.exports = function register(grunt) {
   grunt.registerMultiTask('cssmin', 'Minify CSS',

      /** @this grunt */
      async function cssminTask() {
         try {
            const self = this,
               applicationRoot = path.join(self.data.root, self.data.application).replace(/\\/g, '/'),
               mDepsPath = helpers.prettifyPath(path.join(applicationRoot, 'resources/module-dependencies.json')),
               done = self.async();

            try {
               self.mDeps = await fs.readJson(mDepsPath);
               self.nodes = Object.keys(self.mDeps.nodes);
            } catch (err) {
               logger.error({
                  message: "Can't read module-dependencies",
                  error: err,
                  filePath: mDepsPath
               });
            }

            await pMap(
               self.files,
               async(value) => {
                  const prettyFilePath = helpers.prettifyPath(value.dest);
                  let outputFilePath = prettyFilePath;
                  if (self.data.splittedCore) {
                     outputFilePath = outputFilePath.replace('.css', '.min.css');
                  }
                  const cssStyles = await fs.readFile(prettyFilePath);

                  let compiledObj;
                  try {
                     compiledObj = runMinifyCss(cssStyles);
                  } catch (err) {
                     logger.error({
                        message: 'CSS minification failed',
                        error: err,
                        filePath: prettyFilePath
                     });
                     return;
                  }

                  if (compiledObj.errors.length) {
                     const errors = compiledObj.errors.toString();
                     logger.warning({
                        message: `Error while minifying css: ${errors}`,
                        filePath: prettyFilePath
                     });
                  }

                  if (self.data.splittedCore) {
                     let currentNodePath = helpers.removeLeadingSlash(prettyFilePath.replace(applicationRoot, ''));
                     const currentNode = self.nodes.filter(node => self.mDeps.nodes[node].path === currentNodePath);
                     currentNodePath = helpers.removeLeadingSlash(outputFilePath.replace(applicationRoot, ''));
                     if (currentNode.length > 0) {
                        currentNode.forEach((node) => {
                           self.mDeps.nodes[node].path = currentNodePath;
                        });
                     }
                  }
                  await fs.writeFile(outputFilePath, compiledObj.styles);
               },
               { concurrency: 20 }
            );

            if (self.data.splittedCore) {
            // пишем module-dependencies, если производили в нём изменения
               await fs.writeJson(mDepsPath, self.mDeps);
            }
            done();
         } catch (err) {
            logger.error({
               message: 'Критическая ошибка в задаче cssmin',
               error: err
            });
         }
      });
};
