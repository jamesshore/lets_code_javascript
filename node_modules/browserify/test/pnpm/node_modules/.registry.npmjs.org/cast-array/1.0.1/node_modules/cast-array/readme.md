# cast-array [![Build Status](https://travis-ci.org/bendrucker/cast-array.svg?branch=master)](https://travis-ci.org/bendrucker/cast-array)

> Ensure a value is an array and wrap it if it is not an array


## Install

```
$ npm install --save cast-array
```


## Usage

```js
var castArray = require('cast-array')

castArray('input')
//=> ['input']

castArray(['input'])
//=> ['input']
```

## API

#### `castArray(value)` -> `array`

##### value

*Required*  
Type: `array` / `any`

A value to wrap in an array (unless it's already an array).


## License

MIT © [Ben Drucker](http://bendrucker.me)
