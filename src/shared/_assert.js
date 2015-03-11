// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var assert = require("assertive-chai").assert;

	exports.fail = function(message) {
		throw new Error("Assertion failed: " + message);
	};
	exports.equal = assert.strictEqual;
	exports.deepEqual = assert.deepEqual;
	exports.throws = assert.throws;

}());