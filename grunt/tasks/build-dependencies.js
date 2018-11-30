/* global module: false, global: false, JSON: false */
module.exports = function(grunt) {
   'use strict';

   var fs = require('fs'),
       path = require('path');

   grunt.registerTask('build-dependencies', function() {
      var
         newPath,
         jsModules = {},
         gruntFilePath = path.resolve(),
         componentsDir = path.join(gruntFilePath, 'components'),
         dirWalker = function(dir) {
            var pattern = /\.module\.js$/,
               files = fs.readdirSync(dir);
            for (var i = 0; i < files.length; i++) {
               newPath = path.join(dir, files[i]);
               if (fs.statSync(newPath).isDirectory()) {
                  dirWalker(newPath);
               } else {
                  if (pattern.test(files[i])) {
                     require(newPath);
                  }
               }
            }
         };

      var restoreDefine = global.define;
      global.define = function(name){
         jsModules[name.replace(/js!/,'')] = '/' + path.relative(componentsDir, newPath).replace(/\\/g,'/');
      };
      dirWalker(componentsDir);
      global.define = restoreDefine;

      var jsModulesJsonString = JSON.stringify({jsModules: jsModules}, null, 3);
      fs.writeFileSync(path.join(gruntFilePath, '/contents.json'), jsModulesJsonString);
      fs.writeFileSync(path.join(gruntFilePath, '/contents.js'), 'contents = ' + jsModulesJsonString + ';');
      grunt.log.writeln('Contents files are built.');
   });
};