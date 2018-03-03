var assert = require('assert')
var browserify = require('browserify')
var vm = require('vm')

browserify()
  .require('./index.js', { expose: 'test' })
  .bundle(function (err, src) {
    assert(!err)

    vm.runInNewContext(src + '; require("test")(assert)', {
      assert: {
        equal: function (a, b) {
          console.log('equal', a, b)
          assert.equal(a, b)
        }
      }
    })
  })
