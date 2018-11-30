'use strict';

var path = require('path');
var DepGraph = require('./DependenciesGraph');
var cache = {};
var smartCache = {};

module.exports = function (Component, Service) {
    var
       IoC = global.requirejs('Core/IoC'),
       fn;
    try {
        var
            resourceRoot = Service.getResourcesRoot(),
            modDeps = global.requirejs('json!resources/module-dependencies'),
            dg = new DepGraph();

        dg.fromJSON(modDeps);

        var sendResult = function(req, res, value) {
           if (typeof req.query.v !== 'undefined') {
              res.set('Cache-Control', 'public, max-age=315360000, immutable');
           }
           res.json(value);
        }

        fn = function (req, res) {
            try {
                var
                    modules = JSON.parse(req.query.modules).sort(),
                    lightload = req.query.lightload,
                    smartCollect = !!req.query.smartcollect || !!req.query.smartCollect,
                    key = modules.join('') + ' | ' + !!lightload,
                    value;


                value = smartCollect ? smartCache[key] : cache[key];
                if (value) {
                   sendResult(req, res, value);
                } else {


                    if (lightload && !smartCollect) {
                        dg.getNodesToLoad(modules, ["html!SBIS3.*", "css!SBIS3.*", "Core/*", "Transport/*"]);
                    }
                    if (smartCollect) {
                        dg.firstLevelReached = false;
                        res.json(smartCache[key] = dg.getLoadOrder(modules, null, smartCollect));
                        if (dg.smartNodes && dg.smartNodes.length) {
                            dg.smartNodes.forEach(function(smartNode) {
                                delete(dg._nodes[smartNode]);
                            });

                        }

                    }
                    else {
                         if (dg.smartNodes && dg.smartNodes.length) {
                            dg.smartNodes.forEach(function(smartNode) {
                                delete(dg._nodes[smartNode]);
                            });
                        }
                        sendResult(req, res, cache[key] = dg.getLoadOrder(modules, null, smartCollect));
                    }
                }
            } catch (err) {
                IoC.resolve('ILogger').error('DependenciesResolver.routes.js', err.message, err );
                res.status(500).send(err.message);
            }
        };
    } catch (err) {
        IoC.resolve('ILogger').error('DependenciesResolver.routes.js', err.message, err );
        fn = function (req, res) {
            res.status(500).send(err.message);
        };
    }

    return {
        '/depresolver/': fn
    }
};
