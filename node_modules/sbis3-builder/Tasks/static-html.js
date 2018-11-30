/* eslint-disable promise/catch-or-return,promise/prefer-await-to-then,promise/always-return */
'use strict';

const path = require('path'),
   fs = require('fs-extra'),
   helpers = require('../lib/helpers'),
   processingTmpl = require('../lib/processing-tmpl'),
   parseJsComponent = require('../lib/parse-js-component'),
   logger = require('../lib/logger').logger(),
   generateStaticHtmlForJs = require('../lib/generate-static-html-for-js');

function convertTmpl(splittedCore, resourcesRoot, filePattern, componentsProperties, isMultiService, servicesPath, cb) {
   async function handleResult(newFullPath, res) {
      await fs.writeFile(newFullPath, res);

      const fileName = path.basename(newFullPath),
         relativePath = path.relative(resourcesRoot, newFullPath),
         moduleName = helpers.getFirstDirInRelativePath(relativePath),
         absoulteModuleName = path.join(resourcesRoot, moduleName),
         absoluteStaticTemplate = path.join(absoulteModuleName, 'static_templates.json');

      let staticTemplates;

      const isStaticTemplateExists = fs.pathExistsSync(absoluteStaticTemplate);
      if (isStaticTemplateExists) {
         // здесь специально синхронные readFileSync и writeFileSync, потому что все это гоняется в
         // helpers.recurse в несколько потоков,и если будет асихронно - есть вероятность что будет
         // последовательность "прочитать файл", "прочитать файл", "записать файл", "записать файл"
         // а так точно за считыванием файла последует запись в него, и файл всегда будет актуален
         staticTemplates = fs.readFileSync(absoluteStaticTemplate);
         staticTemplates = JSON.parse(staticTemplates);
      } else {
         staticTemplates = {};
      }

      staticTemplates[fileName] = helpers.prettifyPath(relativePath);

      fs.writeFileSync(absoluteStaticTemplate, JSON.stringify(staticTemplates, undefined, 2));
   }

   helpers.recurse(
      resourcesRoot,
      async(fullPath, callback) => {
         try {
            // фильтр по файлам .html.tmpl
            if (!helpers.validateFile(fullPath, filePattern)) {
               setImmediate(callback);
               return;
            }

            let tmplText;
            try {
               tmplText = await fs.readFile(fullPath);
            } catch (error) {
               logger.error({
                  message: 'Ошибка чтения файла',
                  filePath: fullPath,
                  error
               });
               setImmediate(callback);
               return;
            }

            // relativePath должен начинаться с имени модуля
            const relativePath = path.relative(resourcesRoot, fullPath);
            const htmlText = await processingTmpl.buildHtmlTmpl(
               tmplText,
               fullPath,
               relativePath,
               componentsProperties,
               splittedCore,
               isMultiService,
               servicesPath
            );
            const newFullPath = fullPath.replace(/\.html\.tmpl$/, '.html');
            await handleResult(newFullPath, htmlText);
         } catch (e) {
            logger.error({
               message: 'Ошибка при генерации статической html',
               error: e,
               filePath: fullPath
            });
         }
         callback();
      },
      cb
   );
}

module.exports = function register(grunt) {
   const servicesPath = (grunt.option('services_path') || '').replace(/["']/g, '');
   const userParams = grunt.option('user_params') || false;
   const globalParams = grunt.option('global_params') || false;
   const splittedCore = grunt.option('splitted-core');
   const multiService = grunt.option('multi-service') || false;

   grunt.registerMultiTask('html-tmpl', 'Generate static html from .html.tmpl files',

      /** @this grunt */
      function htmlTmplTask() {
         logger.debug('Запускается задача html-tmpl.');
         const start = Date.now(),
            done = this.async(),
            { root, application, filePattern } = this.data,
            applicationRoot = path.join(root, application),
            resourcesRoot = path.join(applicationRoot, 'resources'),
            componentsProperties = {};

         convertTmpl(splittedCore, resourcesRoot, filePattern, componentsProperties, multiService, servicesPath,
            (err) => {
               if (err) {
                  logger.error({ error: err });
               }

               logger.debug(`Duration: ${(Date.now() - start) / 1000} sec`);
               logger.correctExitCode();
               done();
            });
      });

   grunt.registerMultiTask('static-html', 'Generate static html from modules',

      /** @this grunt */
      function staticHtmlTask() {
         logger.debug('Запускается задача static-html.');
         const start = Date.now(),
            doneAsync = this.async(),
            { root, application } = this.data,
            applicationRoot = path.join(root, application),
            resourcesRoot = path.join(applicationRoot, 'resources'),
            patterns = this.data.src,
            oldHtml = grunt.file.expand({ cwd: applicationRoot }, this.data.html),
            modulesOption = (grunt.option('modules') || '').replace('"', ''),

            /*
          Даннный флаг определяет надо ли заменить в статических страничках конструкции типа %{FOO_PATH},
          на абсолютные пути.
          false - если у нас разделённое ядро и несколько сервисов.
          true - если у нас монолитное ядро или один сервис.
          */
            replacePath = true;

         const done = () => {
            logger.correctExitCode();
            doneAsync();
         };

         if (!modulesOption) {
            logger.error('Parameter "modules" not found');
            done();
            return;
         }
         const pathsModules = grunt.file.readJSON(modulesOption);
         if (!Array.isArray(pathsModules)) {
            logger.error('Parameter "modules" incorrect');
            done();
            return;
         }
         const modules = new Map();
         for (const pathModule of pathsModules) {
            modules.set(path.basename(pathModule), pathModule);
         }

         let contents = {};
         try {
            contents = grunt.file.readJSON(path.join(resourcesRoot, 'contents.json'));
         } catch (err) {
            logger.warning({
               message: 'Error while requiring contents.json',
               error: err
            });
         }

         if (oldHtml && oldHtml.length) {
            const startRemove = Date.now();
            oldHtml.forEach((file) => {
               const filePath = path.join(applicationRoot, file);
               try {
                  fs.unlinkSync(path.join(applicationRoot, file));
               } catch (err) {
                  logger.warning({
                     message: "Can't delete old html",
                     filePath,
                     error: err
                  });
               }
            });
            logger.debug(`Удаление ресурсов завершено(${(Date.now() - startRemove) / 1000} sec)`);
         }

         const config = {
            root,
            application,
            servicesPath,
            userParams,
            globalParams,
            urlServicePath: grunt.option('url-service-path') ? grunt.option('url-service-path') : application,
            wsPath: splittedCore ? 'resources/WS.Core/' : 'ws/'
         };

         helpers.recurse(
            applicationRoot,
            (file, callback) => {
               if (helpers.validateFile(path.relative(applicationRoot, file), patterns)) {
                  fs.readFile(file, (err, text) => {
                     if (err) {
                        logger.error({
                           error: err
                        });
                        callback();
                        return;
                     }
                     let componentInfo = {};
                     try {
                        componentInfo = parseJsComponent(text.toString());
                     } catch (error) {
                        logger.error({
                           message: 'Возникла ошибка при парсинге файла',
                           filePath: file,
                           error
                        });
                        callback();
                        return;
                     }

                     generateStaticHtmlForJs(file, componentInfo, contents, config, modules, replacePath, false).then(
                        (result) => {
                           if (result) {
                              let outputPath;
                              if (splittedCore) {
                                 const relativePath = path.relative(resourcesRoot, file),
                                    moduleName = helpers.getFirstDirInRelativePath(relativePath),
                                    absoulteModulePath = path.join(resourcesRoot, moduleName);
                                 outputPath = path.join(absoulteModulePath, result.outFileName);
                              } else {
                                 outputPath = path.join(applicationRoot, result.outFileName);
                              }

                              helpers.writeFile(outputPath, result.text, callback);
                           } else {
                              callback();
                           }
                        },
                        (error) => {
                           logger.error({
                              message: 'Ошибка при генерации статической html для JS',
                              filePath: file,
                              error
                           });
                           callback();
                        }
                     );
                  });
               } else {
                  callback();
               }
            },
            (err) => {
               if (err) {
                  logger.error({
                     error: err
                  });
               }

               try {
                  const sorted = helpers.sortObject(contents);

                  grunt.file.write(path.join(resourcesRoot, 'contents.json'), JSON.stringify(sorted, null, 2));
                  grunt.file.write(path.join(resourcesRoot, 'contents.js'), `contents=${JSON.stringify(sorted)}`);
               } catch (error) {
                  logger.error({
                     error
                  });
               }

               logger.debug(`Duration: ${(Date.now() - start) / 1000} sec`);
               done();
            }
         );
      });
};
