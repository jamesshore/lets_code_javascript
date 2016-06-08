[![Build Status](https://travis-ci.org/karma-runner/karma-commonjs.svg?branch=master)](https://travis-ci.org/karma-runner/karma-commonjs)

# karma-commonjs

> A Karma plugin that allows testing [CommonJS] modules in the browser.

## Browserify

If you're using Browserify to compile your projects, you should consider [karma-browserify](https://github.com/Nikku/karma-browserify) which runs Browserify directly. The cost is slightly slower builds (but not too bad, thanks to an incremental loading algorithm) and somewhat messier stack traces. The benefit is support for the full Browserify API and automatic discovery of 'require'd files.

#### karma-commonjs
1. Provides a lightweight commonjs wrapper around your code
2. Supports Node's `require` algorithm
3. Only reloads files that change
4. Provides stack traces that point to your original files
5. Requires you to specify files in the Karma config file

#### karma-browserify
1. Creates a temporary bundle using Browserify
2. Supports the full Browserify API, including transforms, plugins, and shims for Node globals
3. Uses [watchify](https://github.com/substack/watchify) to perform incremental rebuilds
4. Can use source maps to provide useful stack traces
5. Automatically includes required files

## Installation

The easiest way is to keep `karma-commonjs` as a devDependency:

`npm install karma-commonjs --save-dev`

which should result in the following entry in your `package.json`:

```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-commonjs": "~0.2"
  }
}
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'commonjs'],
    files: [
      // your tests, sources, ...
    ],

    preprocessors: {
      '**/*.js': ['commonjs']
    }
  });
};
```
Additionally you can specify a root folder (relative to project's directory) which is used to look for required modules:
```
commonjsPreprocessor: {
  modulesRoot: 'some_folder'  
}
```
When not specified the root folder defaults to the `karma.basePath/node_modules` configuration option.

For an example project, check out Karma's [client tests](https://github.com/karma-runner/karma/tree/master/test/client).

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
[CommonJS]: http://www.commonjs.org/
[Browserify]: https://github.com/substack/node-browserify
