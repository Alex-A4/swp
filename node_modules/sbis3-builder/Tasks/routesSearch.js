'use strict';

const path = require('path'),
   logger = require('../lib/logger').logger(),
   helpers = require('../lib/helpers'),
   processingRoutes = require('../lib/processing-routes');

module.exports = function register(grunt) {
   grunt.registerMultiTask('routsearch', 'Searching routes paths',

      /** @this grunt */
      function routsearchTask() {
         logger.debug(`${grunt.template.today('hh:MM:ss')}: Запускается поиск путей роутинга.`);

         const { root, application } = this.data,
            applicationRoot = path.join(root, application),
            sourceFiles = grunt.file.expand({ cwd: applicationRoot }, this.data.src),
            sourcePath = path.join(applicationRoot, 'resources', 'routes-info.json'),
            contentsPath = path.join(applicationRoot, 'resources', 'contents.json'),
            routesSource = {};

         let jsModules = [];

         try {
            const tmp = grunt.file.readJSON(contentsPath);
            jsModules = Object.keys(tmp.jsModules);
         } catch (error) {
            logger.error({
               message: 'Некорректный файл contents.json',
               error
            });
         }

         sourceFiles.forEach((route) => {
            const routePath = path.join(applicationRoot, route),
               text = grunt.file.read(routePath);

            if (text) {
               try {
                  routesSource[path.relative(root, routePath)] = processingRoutes.parseRoutes(text);
               } catch (error) {
                  logger.error({
                     message: 'Ошибка парсинга файла роутинга',
                     error,
                     filePath: routePath
                  });
               }
            }
         });

         processingRoutes.prepareToSave(routesSource, jsModules);
         grunt.file.write(sourcePath, JSON.stringify(helpers.sortObject(routesSource), null, 2));
         logger.debug(`${grunt.template.today('hh:MM:ss')}: Поиск путей роутинга завершен.`);
      });
};
