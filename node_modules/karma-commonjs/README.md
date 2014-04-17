# karma-commonjs

> A Karma plugin that allows testing [CommonJS] modules in the browser. So if you are using [Browserify] for instance, you might find this plugin useful...

### Why not just using Browserify for testing ?

Creating a single bundle means "recompiling" the bundle anytime any file changes. On big project, this can significantly slow down the development. This plugin processes only files that changed.

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
When not specified the root folder default to the `karma.basePath/node_modules` configuration option.

For an example project, check out Karma's [client tests](https://github.com/karma-runner/karma/tree/master/test/client).

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
[CommonJS]: http://www.commonjs.org/
[Browserify]: https://github.com/substack/node-browserify
