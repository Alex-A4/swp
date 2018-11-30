define('Controls/Popup/Compatible/ShowDialogHelper', ['require', 'Core/Deferred', 'Core/moduleStubs', 'Core/helpers/isNewEnvironment'],
   function(require, Deferred, moduleStubs, isNewEnvironment) {
      var _private = {
         prepareDeps: function(config) {
            var dependencies = ['Controls/Popup/Opener/BaseOpener'];
            if (config.isStack === true) {
               dependencies.push('Controls/Popup/Opener/Stack/StackController');
               config._type = 'stack';
            } else if (config.target) {
               dependencies.push('Controls/Popup/Opener/Sticky/StickyController');
               config._type = 'sticky';
            } else {
               dependencies.push('Controls/Popup/Opener/Dialog/DialogController');
               config._type = 'dialog';
            }
            config._popupComponent = 'floatArea';
            dependencies.push(config.template);
            return dependencies;
         }
      };

      var DialogHelper = {
         open: function(path, config) {
            var result = moduleStubs.requireModule(path).addCallback(function(Component) {
               if (isNewEnvironment()) {
                  var dfr = new Deferred();
                  var deps = _private.prepareDeps(config);
                  requirejs(['Controls/Popup/Compatible/Layer'], function(CompatiblePopup) {
                     CompatiblePopup.load().addCallback(function() {
                        require(deps, function(BaseOpener, Strategy) {
                           var CoreTemplate = require(config.template);
                           config._initCompoundArea = function(compoundArea) {
                              dfr && dfr.callback(compoundArea);
                              dfr = null;
                           };
                           BaseOpener.showDialog(CoreTemplate, config, Strategy);
                        });
                     });
                  });
                  return dfr;
               }
               return new Component[0](config);
            });
            return result;
         }
      };
      DialogHelper._private = _private;

      return DialogHelper;

   });
