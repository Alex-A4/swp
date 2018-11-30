/* eslint-disable no-console */

var
   global = (function() { return this || (0,eval)('this') })(),
   logger = global.requirejs('Core/IoC').resolve('ILogger'),
   modPacker;


function parseRequest(req) {
   var config = {};

   try {
      config.modules = (req.query.modules ? JSON.parse(req.query.modules) : []).sort();
      config.exclude = (req.query.exclude ? JSON.parse(req.query.exclude) : []).sort();
      config.include = (req.query.include ? JSON.parse(req.query.include) : []).sort();
      config.includeCore = (req.query.includeCore ? req.query.includeCore : undefined);
   } catch (err) {
      var message = 'Query parse error: ' + err.message;
      logger.error('Custom packer error', message, err);
      return res.status(500).send(message);
   }

   return config;
}

function presentationImpl() {
   modPacker = modPacker || require('wsmodPacker');
   return function (req, res) {
      var config = parseRequest(req);
      modPacker.customCollectDependencies(config.modules, config.include, config.exclude, function (err, files) {
         if (err) {
            logger.error('Custom packer error', err.message, err);
            res.status(500).send(err.message);
         } else {
            res.json({js: files.js, css: files.css});
         }
      });
   }
}

module.exports = function(Component, Service) {
   var impl = presentationImpl(Component, Service);
   return {
      "/get_package": function (req, res) {
         impl(req, res);
      }
   };
}
