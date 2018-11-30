'use strict';

const path = require('path');
const runMinifyXhtmlAndHtml = require('../lib/run-minify-xhtml-and-html');

module.exports = function register(grunt) {
   grunt.registerMultiTask('xhtmlmin', 'minify xhtml and html',

      /** @this grunt */
      function xhtmlminTask() {
         grunt.log.ok(`${grunt.template.today('hh:MM:ss')}: Запускается задача xhtmlmin.`);

         const applicationRoot = this.data.cwd,
            files = grunt.file.expand({ cwd: applicationRoot }, this.data.src);

         files.forEach((file) => {
            let data = grunt.file.read(path.join(applicationRoot, file), { encoding: 'utf8' });
            data = runMinifyXhtmlAndHtml(data);
            grunt.file.write(file, data);
         });

         grunt.log.ok(`${grunt.template.today('hh:MM:ss')}: Задача xhtmlmin выполнена.`);
      });
};
