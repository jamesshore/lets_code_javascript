module.exports = function faultyPlugin () {
  throw new Error('a-module-with-babelrc: configuration from babelrc files in dependencies should not be read.')
}
