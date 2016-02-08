# Simplebuild-Karma

A simple library for automating Karma.

[Karma](http://karma-runner.github.io) is a test runner for JavaScript. It’s useful for automated cross-browser testing. This library provides a simple interface to Karma that's convenient to use with task automation tools such as [Grunt](http://gruntjs.com/) or [Jake](https://github.com/mde/jake).


## Installation

This is a Node.js library. Install Node, then:

`npm install simplebuild-karma` (add `--save` or `--save-dev` if you want)

Note that this library uses your existing Karma installation. (Karma will be installed if needed.)


## Usage

This library provides these functions:

* `start`: Start the Karma server.
* `run`: Run Karma.

There are two main ways to use Karma: launch Karma and test browsers once and leave them running ("development" workflow), or start Karma and the browsers every time you test ("CI server" workflow).

To use the development workflow, call `start`, manually capture your test browsers, then call `run` every time you want to run your tests. (To make Karma capture your test browsers automatically, use the `browsers` option in the [Karma config file](http://karma-runner.github.io/0.13/config/browsers.html).)

To use the CI server workflow, call `run` with the `capture` option set. Karma will launch, capture your browsers, run your tests, then automatically shut down.


### `start(options, success, failure)`

Start the Karma server and leave it running.

* `options`: an object containing the following properties:
    * `configFile` (string): path to the Karma config file.

* `success()`: a function to call if the server exits successfully.

* `failure(message)`: a function to call if the server does not exit successfully. A simple error message is provided in the `message` parameter, but detailed error messages are provided by Karma to stdout (or stderr).


### `run(options, success, failure)`

Run Karma tests. You need to call `start` first unless you use the `capture` option. 

* `options`: an object containing the following properties:
    * `configFile` (string): path to the Karma config file.
    * `expectedBrowsers` (optional array of strings, default `[]`): a list of test browsers. A warning is printed to stdout for each browser in the list that isn't tested. The string must exactly match the string displayed by Karma (e.g., "Chrome 42.0.2311 (Mac OS X 10.10.3)").
    * `strict` (optional boolean, default `true`): causes the tests to fail if `expectedBrowsers` results in any warnings.
    * `capture` (optional array of strings, default `[]`): if present, automatically starts Karma, captures the provided browsers, and shuts them down when done. (Equivalent to using `karma start configFile --browsers XX,YY --single-run`.)
    * `clientArgs` (optional array of strings, default `[]`): options to pass through to your test adapter. For example, when using Mocha, providing `[ "--grep=SOMETHING" ]` will cause Mocha to only run tests containing the string "SOMETHING." The behavior of this parameter depends on your test adapter. It's equivalent to the `client.args` option in [the Karma configuration file](http://karma-runner.github.io/0.13/config/configuration-file.html).
    
* `success()`: a function to call if the tests succeed.

* `failure(message)`: a function to call if the tests fail. A simple error message is provided in the `message` parameter, but detailed error messages are provided by Karma to stdout (or stderr).


## Examples

This library is designed to be easy to integrate with any task automation tool:

### Grunt

```javascript
var karma = require("simplebuild-karma");

module.exports = function(grunt) {
    grunt.initConfig({
        karma: {
            configFile: "karma.conf.js",
            expectedBrowsers: [
                "Chrome 42.0.2311 (Mac OS X 10.10.3)",
                "Firefox 37.0.0 (Mac OS X 10.10)"
            ]
        }
    });

    grunt.registerTask("karma", "Start Karma server", function() {
        karma.start(grunt.config("karma"), this.async(), grunt.warn);
    });
    
    grunt.registerTask("test", "Run tests", function() {
        karma.run(grunt.config("karma"), this.async(), grunt.warn);
    });

    grunt.registerTask("default", [ "test" ]);
};
```

### Jake

```javascript
var karma = require("simplebuild-karma");

task("default", [ "test" ]);

desc("Start Karma server");
task("karma", function() {
    karma.start({
        configFile: "karma.conf.js"
    }, complete, fail);
}, { async: true });

desc("Run tests");
task("test", function() {
    karma.run({
        configFile: "karma.conf.js",
        expectedBrowsers: [
            "Chrome 42.0.2311 (Mac OS X 10.10.3)",
            "Firefox 37.0.0 (Mac OS X 10.10)"
        ]
    }, complete, fail);
}, { async: true });
```

### Plain JavaScript

```javascript
var karma = require("simplebuild-karma");

karma.run({
    configFile: "karma.conf.js",
    expectedBrowsers: [
        "Chrome 42.0.2311 (Mac OS X 10.10.3)",
        "Firefox 37.0.0 (Mac OS X 10.10)"
    ],
    capture: [ "Chrome", "Firefox" ]
}, function() {
    console.log("OK");
}, function(message) {
    console.log(message);
});
```

## About Simplebuild

This library is a simplebuild module. In addition to being used as a standalone library (as described above), it can also be used with simplebuild extensions and mappers. For more information about simplebuild, see [the Simplebuild GitHub page](https://github.com/jamesshore/simplebuild).


## Version History

__1.0.0:__ Added `clientArgs` pass-through
__0.8.1:__ Fix: Corrected API naming error (`start` was misnamed)
__0.8.0:__ Initial release.


## Contributors

Created by James Shore.

### Release Process

1. Update version history in readme and check in
2. Ensure clean build: 
    1. `./jake.sh karma`
    2. Capture firefox: `http://localhost:9876`
    3. `./jake.sh`
3. Update npm version: `npm version [major|minor|patch]`
4. Release to npm: `npm publish`
5. Release to github: `git push && git push --tags`


## License

The MIT License (MIT)

Copyright (c) 2012-2016 James Shore

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

