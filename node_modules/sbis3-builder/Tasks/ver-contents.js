'use strict';

const path = require('path');
const helpers = require('../lib/helpers');
const logger = require('../lib/logger').logger();

module.exports = function register(grunt) {
   grunt.registerMultiTask('ver-contents', 'versionize contents.[js|json]',

      /** @this grunt */
      function verContentsTask() {
         grunt.log.ok(`${grunt.template.today('hh:MM:ss')}: Запускается задача ver-contents.`);

         const resourcesPath = path.join(this.data.cwd, 'resources');
         let contents = {};

         try {
            contents = grunt.file.readJSON(path.join(resourcesPath, 'contents.json'));
         } catch (err) {
            logger.warning({
               message: 'Error while requiring contents.json',
               error: err
            });
         }

         try {
            contents.buildnumber = this.data.ver;
            contents = helpers.sortObject(contents);
            grunt.file.write(path.join(resourcesPath, 'contents.json'), JSON.stringify(contents, null, 2));
            grunt.file.write(path.join(resourcesPath, 'contents.js'), `contents=${JSON.stringify(contents)}`);
         } catch (err) {
            logger.error({
               error: err
            });
         }
      });
};
