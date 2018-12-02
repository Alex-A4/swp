let DBWorker = require('./DBWorker');

const https = require('https');

var root = process.cwd(),
   rootFixed = root.replace('\\', '/'),
   baseRequire = require,
   fs = require('fs'),
   path = require('path'),
   WebSocket = require('ws');



var global = (function () {
   return this || (0, eval)('this');
})();

var requirejs = require(path.join(root, 'node_modules', 'sbis3-ws', 'ws', 'ext', 'requirejs', 'r.js'));

global.requirejs = requirejs;

// Configuring requirejs
var createConfig = require(path.join(root, 'node_modules', 'sbis3-ws', 'ws', 'ext', 'requirejs', 'config.js'));
var config = createConfig(path.join(root, 'application'),
   path.join(root, 'application', 'WS.Core'),
   path.join(root, 'application'),
   { lite: true });
requirejs.config(config);


var express = require('express'),
   http = require('http'),
   //https = require('https'),
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
require(['Core/core-init'], function () {
   console.log('core init success');
}, function (err) {
   console.log(err);
   console.log('core init failed');
});



const wss = new WebSocket.Server({server});

/*wss.on('connection', function connection(ws) {
    ws.send('Hello');   
    ws.on('message', (data) => ws.send('Receive: ' + data));
});


wss = new WebSocket.Server({httpsServer: app, port: 8888 });
*/
let websockets = [];

wss.on('connection', (ws) => {
   websockets.push(ws);
   ws.on('close', function () {
      delete websockets[ws];
   });
})

function sendAll(method, ...args) {
   websockets.forEach((ws) => {
      ws.send(JSON.stringify({ method: method, args: args }));
   });
}
app.get("/api/list", (req, res) => {
   console.log(111111);
   DBWorker.list()
      .then((list) => res.send(list))
      .catch((err) => res.status(500) && res.send(err));
});

app.get("/api/read", (req, res) => {
   DBWorker.read(req.query.id.replace(/"/g, ''))
      .then((item) => res.send(item))
      .catch((err) => res.status(500) && res.send(err));
});

app.post("/api/delete", function (req, res) {
   DBWorker.delete(req.query.id.replace(/"/g, ''))
      .then((status) => {
           sendAll('delete', '"'+req.query.id.replace(/"/g, '')+'"', {});
   	   res.sendStatus(status);
      }).catch((err) => {
		res.status(500);
                res.send(err);
      });
});

app.post("/api/create", function (req, res) {
   DBWorker.create(JSON.parse(req.query.document))
      .then((status) => res.sendStatus(status) && sendAll('create', '', req.query.document))
      .catch((err) => res.status(500) && res.send(err));
});

app.post("/api/update", function (req, res) {
   DBWorker.update(req.query.id.replace(/"/g, ''), JSON.parse(req.query.document))
       .then((status) => {
             sendAll('update', req.query.id.replace(/"/g, ''), req.query.document);
	    res.sendStatus(status);})
      .catch((err) => { res.status(500); res.send(err); });
});

app.post("/api/sync",function (req, res) {
     console.log(JSON.parse(req.query.documents))
    DBWorker.sync(JSON.parse(req.query.documents))
    .then((status) => {
		res.sendStatus(status);
	})
    .catch((err) => {res.status(500); res.send(err);});
} );


app.get('/', function (req, res) {
   var cmp = 'EDM/Index';
   init(req, res, cmp);
});

/*server side render*/
app.get('/:moduleName/*', function (req, res) {
   var originalUrl = req.originalUrl;

   var path = req.originalUrl.split('/');
   var cmp = path ? path[1] : 'Index';
   cmp += '/Index';

   init(req, res, cmp);
});

function init(req, res, cmp) {
   req.compatible = false;
   if (!process.domain) {
      process.domain = {
         enter: function () { },
         exit: function () { }
      };
   }
   process.domain.req = req;

   var tpl = require('wml!Controls/Application/Route');

   try {
      require(cmp);
   } catch (e) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(e.message);
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
      html.addCallback(function (htmlres) {
         res.writeHead(200, { 'Content-Type': 'text/html' });
         res.end(htmlres);
      });
   } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
   }
}
