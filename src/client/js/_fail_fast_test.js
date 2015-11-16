// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	var failFast = require("./fail_fast.js");
	var FailFastException = failFast.FailFastException;
	var assert = require("../../shared/_assert.js");

	describe("Fail Fast module", function() {

		it("uses custom exception", function() {
			try {
				throw new FailFastException("foo");
			}
			catch (e) {
				assert.equal(e.name, "FailFastException");
				assert.equal(e.constructor, FailFastException);
				assert.equal("" + e, "FailFastException");
			}
		});

		it("checks if variable is defined", function() {
			assert.doesNotThrow(unlessDefined("foo"));
			assert.doesNotThrow(unlessDefined(null));
			assert.throws(unlessDefined(undefined), /^Required variable was not defined$/);
			assert.throws(unlessDefined(undefined, "myVariable"), /^Required variable \[myVariable\] was not defined$/);

			function unlessDefined(variable, variableName) {
				return function() {
					failFast.unlessDefined(variable, variableName);
				};
			}
		});

		it("checks if expression is true", function() {
			assert.doesNotThrow(unlessTrue(true));
			assert.throws(unlessTrue(false), /^Expected condition to be true$/);
			assert.throws(unlessTrue(false, "a message"), /^a message$/);
			assert.throws(unlessTrue("foo"), /^Expected condition to be true or false$/);
			assert.throws(unlessTrue("foo", "ignoredMessage"), /^Expected condition to be true or false$/);

			function unlessTrue(variable, message) {
				return function() {
					failFast.unlessTrue(variable, message);
				};
			}
		});

		it("fails when statement is unreachable", function() {
			assert.throws(unreachable(), /^Unreachable code executed$/);
			assert.throws(unreachable("foo"), /^foo$/);

			function unreachable(message) {
				return function() {
					failFast.unreachable(message);
				};
			}
		});
	});

}());