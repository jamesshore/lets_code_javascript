'use strict';
var path = require('path');

//
// Forked from: https://github.com/yeoman/grunt-usemin/tree/master/lib
// Deleted a few methods.  Some functionality is retained but not used (CSS, RequireJS)
//
// Returns an array object of all the directives for the given html.
// Each item of the array has the following form:
//
//
//     {
//       type: 'js',
//       dest: 'app-min.js',
//       src: [
//         'first.js',
//         'second.js'
//       ],
//       raw: [
//         '    <!-- #cat app-min.js -->',
//         '    <script src="first.js">',
//         '    <script src="second.js">',
//         '    <!-- endcat -->'
//       ]
//     }

// Note also that dest is expressed relatively from the root
var getBlocks = function (dest, dir, content) {
  // start build pattern: will match
  //  * <!-- #cat output -->

  var regbuild = /<!--\s*#cat (?:\(([^\)]+)\))?\s*([^\s]+)\s*-->/i;
  // end build pattern -- <!-- endbuild -->
  var regend = /<!--\s*endcat\s*-->/i;

  var lines = content.replace(/\r\n/g, '\n').split(/\n/),
    block = false,
    sections = [],
    last;

  var originDir = dir;

  lines.forEach(function (l) {
    var indent = (l.match(/^\s*/) || [])[0];
    var build = l.match(regbuild);
    var endbuild = regend.test(l);
    var startFromRoot = false;

    // discard empty lines
    if (build) {
      block = true;
      // Handle absolute path (i.e. with respect to the server root)
      if (build[2][0] === '/') {
        startFromRoot = true;
        build[2] = build[2].substr(1);
      }
      if (build[1]) {
        // Alternate search path
        originDir = build[1];
      }
      last = {
        type: build[2].indexOf('.css')>0 ? 'css':'js',
        dest: path.join(dest, build[2]),
        relativeDest: build[2],
        startFromRoot: startFromRoot,
        indent: indent,
        src: [],
        raw: []
      };
    }

    // switch back block flag when endbuild
    if (block && endbuild) {
      last.raw.push(l);
      sections.push(last);
      block = false;
      originDir = dir;
    }

    if (block && last) {
      var asset = l.match(/(href|src)=["']([^'"]+)["']/);
      if (asset && asset[2]) {
        last.src.push(path.join(originDir, asset[2]));
        // RequireJS uses a data-main attribute on the script tag to tell it
        // to load up the main entry point of the amp app
        //
        // If we find one, we must record the name of the main entry point,
        // as well the name of the destination file, and treat
        // the furnished requirejs as an asset (src)
        var main = l.match(/data-main=['"]([^'"]+)['"]/);
        if (main) {
          last.requirejs = last.requirejs || {};
          last.requirejs.dest = last.dest;
          last.requirejs.baseUrl = path.join(originDir, path.dirname(main[1]));
          last.requirejs.name = path.basename(main[1]);
          last.requirejs.src = last.src.pop();
          var req = l.match(/src=['"]([^'"]+)['"]/);
          if (req) {
            last.requirejs.origScript = req[1];
          } else {
            // For whatever reason ...
            last.requirejs.origScript = 'scripts/vendor/require.js';
          }
          last.requirejs.srcDest = path.join(dest, last.requirejs.origScript);
          last.src.push(last.dest);
        }

        // preserve media attribute
        var media = l.match(/media=['"]([^'"]+)['"]/);
        if (media) {
          last.media = media[1];
        }

        // preserve defer attribute
        var defer = /defer/.test(l);
        if (defer && last.defer === false || last.defer && !defer) {
          throw 'Error: You are not suppose to mix deferred and non-deferred scripts in one block.';
        } else if (defer) {
          last.defer = true;
        } else {
          last.defer = false;
        }
      }
      last.raw.push(l);
    }
  });

  return sections;
};

//
// HTMLProcessor takes care, and processes HTML files.
// It is given:
//   - A base directory, which is the directory under which to look at references files
//   - A destination directory, which is the directory under which will be generated the files
//   - A file content to be processed
//   - a file replacement locator
//   - an optional log callback that will be called as soon as there's something to log
//
var HTMLProcessor = module.exports = function (src, dest, content) {
  // FIXME: Check consistency of the file object
  this.src = src;
  this.dest = dest || src;
  this.content = content;
  this.relativeSrc = path.relative(process.cwd(), src);

  this.linefeed = /\r\n/g.test(this.content) ? '\r\n' : '\n';
  this.blocks = getBlocks(this.dest, this.relativeSrc, this.content);

};



//
// Return the string that will replace the furnished block
//
HTMLProcessor.prototype.replaceWith = function replaceWith(block) {
  var result;
  var backslash = /\\/g;

  // Determine the relative path from the destination to the source
  // file
  var dest = path.relative(this.relativeSrc, block.dest);

  if (block.startFromRoot) {
    dest = '/' + dest;
  }

  // fix windows style paths. Dirty but works.
  dest = dest.replace(backslash, '/');

  if (block.type === 'css') {
    var media = block.media ? ' media="' + block.media + '"' : '';
    result = block.indent + '<link rel="stylesheet" href="' + dest + '"' + media + ' />';
  } else if (block.requirejs !== undefined) {
    var dataMain = path.relative(this.relativeSrc, block.requirejs.dest);
    dataMain = dataMain.replace(backslash, '/');
    var requireSrc = path.relative(this.relativeSrc, block.requirejs.srcDest);
    requireSrc = requireSrc.replace(backslash, '/');
    if (block.startFromRoot) {
      dataMain = '/' + dataMain;
      requireSrc = '/' + requireSrc;
    }
    result = block.indent + '<script data-main="' + dataMain + '" src="' + requireSrc + '"><\/script>';
  } else if (block.defer) {
    result = block.indent + '<script defer src="' + dest + '"><\/script>';
  } else if (block.type === 'js') {
    result = block.indent + '<script src="' + dest + '"><\/script>';
  } else {
    result = '';
  }

  var conditionalEnd = /<!\[endif\]-->/;
  // Test conditional comment regex here: http://refiddle.com/gqz
  var conditionalBegin = /<!--\[if\ (gt|lt|gte|lte)?\ ?\!?IE\ ?[0-9\.]*\]>/;
  var isConditionalBlock = block.raw.length >= 5 && conditionalEnd.test(block.raw[block.raw.length - 2]) && conditionalBegin.test(block.raw[1]);

  if (!!result && isConditionalBlock) {
    result = block.indent + block.raw[1].trim() + '\n' + result + '\n' + block.indent + block.raw[block.raw.length - 2].trim();
  }

  return result;
};

