# Assertive Chai

[Chai.JS](http://chaijs.com/) without Expect or Should

## What?

This is just the [Assert API](http://chaijs.com/api/assert/) from
Chai.JS. When run in Node.JS, it depends on the built-in `assert`
module. When run in the browser, it depends on the [browser port of
those assertions](https://github.com/Jxck/assert).

The unit tests are stolen from Chai.JS in part.

## Why?

- [Chai.JS requires ECMAScript 5](https://github.com/chaijs/chai/issues/117),
  making it a poor choice for projects that need to span a wide variety of
  browsers

- I don't feel BDD-style assertions are worth the hassle of having to
  learn what is frequently an inconsistent API

- BDD makes more sense at the test framework level, and it's easy to
  integrate Chai.JS (and this library) with any test framework you like

## How?

### Browser

```sh
bower install assertive-chai --save-dev
```

```html
<script src="bower_components/node-assert/assert.js"></script>
<script src="bower_components/assertive-chai/assertive-chai.js"></script>
<script>
var assert = chai.assert;
</script>
```

### Node.JS

```sh
npm install assertive-chai --save-dev
```

```javascript
var assert = require('chai').assert;
```

