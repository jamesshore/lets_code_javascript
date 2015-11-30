// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	// We use Proclaim rather than Chai because Chai doesn't support IE 8.
	// But Proclaim error messages are terrible, so we end up doing a lot ourselves.
	var assert = require("./vendor/proclaim-2.0.0.js");

	exports.fail = function(message) {
		assert.fail(null, null, message);
	};

	exports.defined = function(value, message) {
		message = message ? message + ": " : "";
		assert.isDefined(value, message + "expected any value, but was undefined");
	};

	exports.equal = function(actual, expected, message) {
		message = message ? message + ": " : "";
		var expectedType = typeof expected;
		var actualType = typeof actual;

		assert.strictEqual(
			actualType,
			expectedType,
			message + "expected " + expectedType + " '" + expected + "', but got " + actualType + " '" + actual + "'"
		);
		assert.strictEqual(
			actual,
			expected,
			message + "expected '" + expected + "', but got '" + actual + "'"
		);
	};

	exports.deepEqual = function(actual, expected, message) {
		message = message ? message + ": " : "";
		assert.deepEqual(
			actual,
			expected,
			message + "expected " + JSON.stringify(expected) + ", but got " + JSON.stringify(actual));
	};

	exports.matches = function(actual, expectedRegex, message) {
		message = message ? message + ": " : "";
		assert.match(
			actual,
			expectedRegex,
			message + "expected string to match " + expectedRegex + ", but got '" + actual + "'"
		);
	};

	exports.doesNotThrow = function(fn, message) {
		try {
			fn();
		}
		catch (e) {
			message = message ? message + ": " : "";
			exports.fail(message + "expected no exception, but got '" + e + "'");
		}
	};

	exports.throws = function(fn, expected, message) {
		message = message ? message + ": " : "";
		var noException = false;
		try {
			fn();
			noException = true;
		}
		catch (e) {
			if (typeof expected === "string") {
				assert.strictEqual(
					e.message,
					expected,
					message + "expected exception message to be '" + expected + "', but was '" + e.message + "'"
				);
			}
			else if (expected instanceof RegExp) assert.match(
				e.message,
				expected,
				message + "expected exception message to match " + expected + ", but was '" + e.message + "'"
			);
			else if (expected !== undefined) throw new Error("Unrecognized 'expected' parameter in assertion: " + expected);
		}
		if (noException) exports.fail(message + "expected exception");
	};

}());