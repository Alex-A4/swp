var root = process.cwd(),
   fs = require('fs'),
   path = require('path');

/**
 * Look ma, it cp -R.
 * @param {string} src The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
var copyRecursiveSync = function(src, dest) {
   var exists = fs.existsSync(src);
   var stats = exists && fs.statSync(src);
   var isDirectory = exists && stats.isDirectory();
   if (exists && isDirectory) {
      if (!fs.existsSync(dest)) {
         fs.mkdirSync(dest);
      }
      fs.readdirSync(src).forEach(function(childItemName) {
         copyRecursiveSync(path.join(src, childItemName),
            path.join(dest, childItemName));
      });
   } else {
      if (!fs.existsSync(dest)) {
         try {
            fs.linkSync(src, dest);
         }catch(e){}
      }
   }
};


var gultConfig = JSON.stringify(require('./buildTemplate.json'));
gultConfig = gultConfig.replace(/%cd%/ig, root).replace(/\\/ig, '/');

if (!fs.existsSync(path.join(root, 'application'))) {
   fs.mkdirSync(path.join(root, 'application'));
}
if (!fs.existsSync(path.join(root, 'application', 'resources'))) {
   fs.mkdirSync(path.join(root, 'application', 'resources'));
}

fs.writeFile(path.join(root, 'builderCfg.json'), gultConfig, function(){
   const { spawn } = require('child_process');

   const child = spawn('node',[
      root+'/node_modules/gulp/bin/gulp.js',
      '--gulpfile', root+'/node_modules/sbis3-builder/gulpfile.js',
      'build',
      '--config='+root+'/builderCfg.json',
      '-LLLL'
   ]);

   child.stdout.on('data', (data) => {
         console.log(`${data}`);
   });

      child.stderr.on('data', (data) => {
         console.log(`ERROR: ${data}`);
   });


   child.on('exit', function (code, signal) {
      console.log('child process exited with ' +
         `code ${code} and signal ${signal}`);


      copyRecursiveSync(path.join(root, 'application', 'ws', 'core'), path.join(root, 'application', 'Core'));

      gultConfig = JSON.parse(gultConfig);
      gultConfig.modules.forEach((one) => {

         let oldName = one.path.split('/');
         oldName = oldName[oldName.length - 1];
         if (one.name !== oldName) {
            //fs.symlinkSync(path.join(one.path), path.join(root, 'application', one.name), 'dir');
            fs.renameSync(path.join(root, 'application', oldName), path.join(root, 'application', 'tempName'));
            fs.renameSync(path.join(root, 'application', 'tempName'), path.join(root, 'application', one.name));
         }
      });

      copyRecursiveSync(path.join(root, 'cdn'), path.join(root, 'application', 'cdn'));

      var alljson = {links: {}, nodes: {}};
      var contents = { buildMode: '', modules: {} };
      var bundles = {};

      gultConfig.modules.forEach((one) => {
         if (one.name.indexOf('WS.Core') === -1) {
            let fileName = path.join(root, 'application', one.name, 'module-dependencies.json');
            if (fs.existsSync(fileName)) {
               let oneJson = require(fileName);

               for (var i in oneJson.links) {
                  alljson.links[i] = oneJson.links[i];
               }

               for (var j in oneJson.nodes) {
                  alljson.nodes[j] = oneJson.nodes[j];
               }
            }
         }

         let contentsFn = path.join(root, 'application', one.name, 'contents.json');
         if (fs.existsSync(contentsFn)) {
            let oneJson = require(contentsFn);
            contents.buildMode = oneJson.buildMode;
            for (let i in oneJson.modules){
               contents.modules[i] = oneJson.modules[i];
            }
         }

         let bundlesFN = path.join(root, 'application', one.name, 'bundles.json');
         if (fs.existsSync(bundlesFN)) {
            let oneJson = require(bundlesFN);
            for (let i in oneJson){
               bundles[i] = oneJson[i];
            }
         }
      });

      fs.writeFileSync(path.join(root, 'application', 'contents.js'),
         'contents = ' + JSON.stringify(contents, '', 3)+';' );
      fs.linkSync(path.join(root, 'application', 'contents.js'), path.join(root, 'application', 'contents.min.js'));
      fs.writeFileSync(path.join(root, 'application', 'bundles.js'),
         'bundles = ' + JSON.stringify(bundles, '', 3)+';' );

      if (!fs.existsSync(path.join(root, 'application', 'resources'))) {
         fs.mkdirSync(path.join(root, 'application', 'resources'));
      }

      fs.writeFileSync(path.join(root, 'application', 'resources', 'module-dependencies.json'),
         JSON.stringify(alljson, '', 3).replace(/ws\/core/ig, 'WS.Core/core').replace(/resources\//i, ''));

      const childAnother = spawn('node', [path.join(root, 'pack.js')]);  

      childAnother.on('exit', function (code, signal) {
         console.log('child process exited with ' +
            `code ${code} and signal ${signal}`);
      });
         
      fs.copyFileSync(path.join(root, 'sw.js'), path.join(root, 'application', 'sw.js'));
      fs.copyFileSync(path.join(root, 'manifest.json'), path.join(root, 'application', 'manifest.json'));
   });

});
