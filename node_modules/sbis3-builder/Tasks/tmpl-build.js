'use strict';

const path = require('path'),
   fs = require('fs-extra'),
   stripBOM = require('strip-bom'),
   pMap = require('p-map');

const logger = require('../lib/logger').logger(),
   processingTmpl = require('../lib/processing-tmpl'),
   processingXhtml = require('../lib/processing-xhtml'),
   runJsonGenerator = require('../lib/i18n/run-json-generator'),
   helpers = require('../lib/helpers');

const extFile = /(\.tmpl|\.x?html)$/;

async function writeTemplate(templateOptions, nodes, splittedCore) {
   /**
    * Позорный костыль для обратной поддержки препроцессора
    */
   const {
      fullPath, original, data, currentNode
   } = templateOptions;

   if (splittedCore) {
      await fs.writeFile(fullPath.replace(extFile, '.min$1'), data);
      if (nodes.hasOwnProperty(currentNode)) {
         nodes[currentNode].amd = true;
         nodes[currentNode].path = nodes[currentNode].path.replace(extFile, '.min$1');
      }
   } else {
      await Promise.all([
         fs.writeFile(fullPath.replace(extFile, '.original$1'), original),
         fs.writeFile(fullPath, data)
      ]);
      if (nodes.hasOwnProperty(currentNode)) {
         nodes[currentNode].amd = true;
      }
   }
}

module.exports = function register(grunt) {
   const splittedCore = grunt.option('splitted-core');

   grunt.registerMultiTask('tmpl-build', 'Generate static html from modules', async function tmplBuildTask() {
      // eslint-disable-next-line no-invalid-this
      const self = this,
         done = self.async();

      try {
         logger.debug('Запускается задача tmpl-build.');
         const start = Date.now(),
            { root, application } = self.data,
            applicationRoot = path.join(root, application),
            resourcesRoot = path.join(root, application, 'resources'),
            mDeps = await fs.readJSON(path.join(resourcesRoot, 'module-dependencies.json')),
            { nodes } = mDeps;

         let componentsProperties = {};

         // запускаем только при наличии задач локализации
         if (grunt.option('prepare-xhtml' || grunt.option('make-dict') || grunt.option('index-dict'))) {
            const optModules = grunt.option('modules').replace(/"/g, '');
            const optJsonCache = grunt.option('json-cache').replace(/"/g, '');
            const folders = await fs.readJSON(optModules);
            const resultJsonGenerator = await runJsonGenerator(folders, optJsonCache);
            for (const error of resultJsonGenerator.errors) {
               logger.warning({
                  message: 'Ошибка при разборе JSDoc комментариев',
                  filePath: error.filePath,
                  error: error.error
               });
            }
            componentsProperties = resultJsonGenerator.index;
         }

         await pMap(
            self.files,
            async(value) => {
               const fullPath = helpers.prettifyPath(value.dest);
               try {
                  const html = stripBOM((await fs.readFile(fullPath)).toString()),
                     original = html;

                  if (splittedCore) {
                     /**
                      * пишем сразу оригинал в .min файл. В случае успешной генерации .min будет перебит сгенеренным
                      * шаблоном. В случае ошибки мы на клиенте не будем получать 404х ошибок на плохие шаблоны,
                      * а разрабам сразу прилетит в консоль ошибка, когда шаблон будет генерироваться находу,
                      * как в дебаге.
                      */
                     await fs.writeFile(fullPath.replace(extFile, '.min$1'), html);
                  }

                  // relativePath должен начинаться с имени модуля
                  let relativePath = path.relative(resourcesRoot, fullPath);

                  // если ws монолитный, то его tmpl нужно обрабатывать особо
                  if (!splittedCore && relativePath.includes('..')) {
                     relativePath = path.relative(applicationRoot, fullPath);
                  }
                  const tmplObj = await processingTmpl.buildTmpl(original, relativePath, componentsProperties);
                  const templateOptions = {
                     fullPath,
                     currentNode: tmplObj.nodeName,
                     original,
                     data: tmplObj.text
                  };
                  await writeTemplate(templateOptions, nodes, splittedCore);
               } catch (error) {
                  logger.error({
                     message: 'An ERROR occurred while building template',
                     filePath: fullPath,
                     error
                  });
               }
            },
            {
               concurrency: 20
            }
         );

         mDeps.nodes = nodes;
         await fs.outputJSON(path.join(applicationRoot, 'resources', 'module-dependencies.json'), mDeps, {
            spaces: 2
         });
         logger.debug(`Duration: ${(Date.now() - start) / 1000} sec`);
      } catch (error) {
         logger.error({ error });
      }
      done();
   });

   grunt.registerMultiTask('xhtml-build', 'Generate static html from modules', async function xhtmlBuildTask() {
      // eslint-disable-next-line no-invalid-this
      const self = this,
         done = self.async();
      try {
         logger.debug('Запускается задача xhtml-build.');
         const start = Date.now();
         const { root, application } = self.data,
            applicationRoot = path.join(root, application),
            resourcesRoot = path.join(root, application, 'resources'),
            mDeps = await fs.readJSON(path.join(applicationRoot, 'resources', 'module-dependencies.json')),
            { nodes } = mDeps;

         await pMap(
            self.files,
            async(value) => {
               const fullPath = helpers.prettifyPath(value.dest);
               try {
                  const html = stripBOM(await fs.readFile(fullPath, 'utf8'));
                  const original = html;

                  if (splittedCore) {
                     /**
                      * пишем сразу оригинал в .min файл. В случае успешной генерации .min будет перебит
                      * сгенеренным шаблоном. В случае ошибки мы на клиенте не будем получать 404х ошибок
                      * на плохие шаблоны, а разрабам сразу прилетит в консоль ошибка, когда шаблон будет
                      * генерироваться находу, как в дебаге.
                      */
                     await fs.writeFile(fullPath.replace(extFile, '.min$1'), original);
                  }

                  // relativePath должен начинаться с имени модуля
                  let relativePath = path.relative(resourcesRoot, fullPath);

                  // если ws монолитный, то его tmpl нужно обрабатывать особо
                  if (!splittedCore && relativePath.includes('..')) {
                     relativePath = path.relative(applicationRoot, fullPath);
                  }
                  const xhtmlObj = processingXhtml.buildXhtml(html, relativePath);
                  const templateOptions = {
                     fullPath,
                     currentNode: xhtmlObj.nodeName,
                     original,
                     data: xhtmlObj.text
                  };

                  await writeTemplate(templateOptions, nodes, splittedCore);
               } catch (error) {
                  logger.error({
                     message: 'An ERROR occurred while building template',
                     filePath: fullPath,
                     error
                  });
               }
            },
            {
               concurrency: 20
            }
         );

         mDeps.nodes = nodes;
         await fs.outputJSON(path.join(applicationRoot, 'resources', 'module-dependencies.json'), mDeps, { spaces: 2 });

         logger.debug(`Duration: ${(Date.now() - start) / 1000} sec`);
      } catch (error) {
         logger.error({ error });
      }
      done();
   });
};
