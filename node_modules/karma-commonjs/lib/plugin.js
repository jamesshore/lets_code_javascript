var path = require('path');
var os = require('os');

var BRIDGE_FILE_PATH = path.normalize(__dirname + '/../client/commonjs_bridge.js');

var initCommonJS = function(/* config.files */ files) {

  // Include the file that resolves all the dependencies on the client.
  files.push({
    pattern: BRIDGE_FILE_PATH,
    included: true,
    served: true,
    watched: false
  });
};

var createPreprocesor = function(logger, config, basePath) {
  var log = logger.create('preprocessor.commonjs');
  var modulesRootPath = path.resolve(config && config.modulesRoot ? config.modulesRoot : path.join(basePath, 'node_modules'));
  //normalize root path on Windows
  if (process.platform === 'win32') {
    modulesRootPath = modulesRootPath.replace(/\\/g, '/');
  }

  log.debug('Configured root path for modules "%s".', modulesRootPath);

  return function(content, file, done) {

    if (file.originalPath === BRIDGE_FILE_PATH) {
      return done(content);
    }

    log.debug('Processing "%s".', file.originalPath);

    if (path.extname(file.originalPath) === '.json') {
      return done('window.__cjs_module__["' + file.path + '"] = ' + content + ';' + os.EOL);
    }

    var output =
      'window.__cjs_modules_root__ = "' + modulesRootPath + '";' +
      'window.__cjs_module__ = window.__cjs_module__ || {};' +
      'window.__cjs_module__["' + file.path + '"] = function(require, module, exports, __dirname, __filename) {' +
      content + os.EOL +
      '}';

    done(output);
  };
};
createPreprocesor.$inject = ['logger', 'config.commonjsPreprocessor', 'config.basePath'];

// PUBLISH DI MODULE
module.exports = {
  'framework:commonjs': ['factory', initCommonJS],
  'preprocessor:commonjs': ['factory', createPreprocesor]
};
