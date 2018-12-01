
let DBWorker = require('./DBWorker');
var root = process.cwd(),
   rootFixed = root.replace('\\', '/'),
   baseRequire = require,
   fs = require('fs'),
   path = require('path');

var global = (function() {
   return this || (0, eval)('this');
})();

var requirejs = require(path.join(root, 'node_modules', 'sbis3-ws', 'ws', 'ext', 'requirejs', 'r.js'));

global.requirejs = requirejs;

// Configuring requirejs
var createConfig = require(path.join(root, 'node_modules', 'sbis3-ws', 'ws', 'ext', 'requirejs', 'config.js'));
var config = createConfig(path.join(root,'application'),
   path.join(root, 'application','WS.Core'),
   path.join(root, 'application'),
   { lite: true });
requirejs.config(config);


var express = require('express'),
   http = require('http'),
   https = require('https'),
   spawn = require('child_process').spawn,
   app = express();

var resourcesPath = path.join('', 'application');
app.use(express.static(resourcesPath));


var port = process.env.PORT || 777;
var server = app.listen(port);

console.log('app available on port ' + port);


console.log('path rjs');

global.require = global.requirejs = require = requirejs;

console.log('start init');
require(['Core/core-init'], function(){
   console.log('core init success');
}, function(err){
   console.log(err);
   console.log('core init failed');
});


app.get("/api/list", (req, res) => {
    console.log(111111);
    DBWorker.list()
        .then((list) => res.send(list))
        .catch((err) => res.status(500) && res.send(err));
});

app.get("/api/read", (req, res) => {
    DBWorker.read(req.query.id)
        .then((item) => res.send(item))
        .catch((err) => res.status(500) && res.send(err));
});

app.post("/api/delete", function (req, res) {
    DBWorker.delete(req.query.id)
        .then((status) => res.sendStatus(status))
        .catch((err) => res.status(500) && res.send(err));
});

app.post("/api/create", function (req, res) {
    DBWorker.create(JSON.parse(req.query.document))
        .then((status) => res.sendStatus(status))
        .catch((err) => res.status(500) && res.send(err));
});

app.post("/api/update", function (req, res) {
    DBWorker.update(req.query.id, JSON.parse(req.query.document))
        .then((status) => res.sendStatus(status))
        .catch((err) => res.status(500) && res.send(err));
}); 




app.get('/', function(req, res, path) {
   req.compatible=false;
   if (!process.domain) {
      process.domain = {
         enter: function(){},
         exit: function(){}
      };
   }
   process.domain.req = req;

   var tpl = require('wml!Controls/Application/Route');
  
   var cmp = 'EDM/Index';

   try {
      require(cmp);
   } catch(e){
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('');
      return;
   }
   var html = tpl({
      lite: true,
      wsRoot: '/WS.Core/',
      resourceRoot: '/',
      application: cmp,
      appRoot: '/'
   });

   if (html.addCallback) {
      html.addCallback(function(htmlres){
         res.writeHead(200, {'Content-Type': 'text/html'});
         res.end(htmlres);
      });
   } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(html);
   }
});

/*server side render*/
app.get('/:moduleName/*', function(req, res){
console.log(1);
   req.compatible=false;
   if (!process.domain) {
      process.domain = {
         enter: function(){},
         exit: function(){}
      };
   }
   process.domain.req = req;

   var tpl = require('wml!Controls/Application/Route');
   var originalUrl = req.originalUrl;

   var path = req.originalUrl.split('/');
   var cmp = path?path[1]:'Index';
   cmp += '/Index';

   try {
      require(cmp);
   } catch(e){
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('');
      return;
   }
   var html = tpl({
      lite: true,
      wsRoot: '/WS.Core/',
      resourceRoot: '/',
      application: cmp,
      appRoot: '/'
   });

   if (html.addCallback) {
      html.addCallback(function(htmlres){
         res.writeHead(200, {'Content-Type': 'text/html'});
         res.end(htmlres);
      });
   } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(html);
   }
});
