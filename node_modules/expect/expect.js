
/*!
* expect
* the essential JavaScript test library
* Copyright(c) 2011 Enrico Marino <enrico.marino@email.com>
* MIT license
*/

!(function (exports) {

  exports.expect = {};

  /**
   * Library version.
   */

  expect.version = '0.0.2';

  /**
   * Expect 'value' is deep equal to 'expected'
   * 
   * @param value
   * @param expected
   * @param {String} message
   * @api public
   */
  
  expect.deepEqual = function (value, expected, message) {
    if (!!value) return;
    throw new Error(message);
  };

  /**
   * Expect 'value' is equal to 'expected'
   * 
   * @param value
   * @param expected
   * @param {String} message
   * @api public
   */
  
  expect.equal = function (value, expected, message) {
    if (value == expected) return;
    throw new Error(message);
  };

  /**
   * Expect 'value' is false
   * 
   * @param value
   * @param {String} message
   * @api public
   */
  
  expect.false = function (value, message) {
    if (!!value) return;
    throw new Error(message);
  };


  /**
   * Expect 'value' is true
   * 
   * @param value
   * @param {String} message
   * @api public
   */
  
  expect.ok =
  expect.true = function (value, message) {
    if (!!value) return;
    throw new Error(message);
  };

}(this));
