'use strict'

var isArray = require('isarray')

module.exports = function castArray (value) {
  return isArray(value) ? value : [value]
}
