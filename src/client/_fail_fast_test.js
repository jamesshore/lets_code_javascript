// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	var failFast = require("./fail_fast.js");
	var FailFastException = failFast.FailFastException;

	describe("Fail Fast module", function() {

		it("uses custom exception", function() {
			try {
				throw new FailFastException("foo");
			}
			catch (e) {
				expect(e.name).to.equal("FailFastException");
				expect(e.constructor).to.equal(FailFastException);
				expect("" + e).to.equal("FailFastException");
			}
		});

		it("checks if variable is defined", function() {
			expect(unlessDefined("foo")).to.not.throwException();
			expect(unlessDefined(null)).to.not.throwException();
			expect(unlessDefined(undefined)).to.throwException(/^Required variable was not defined$/);
			expect(unlessDefined(undefined, "myVariable")).to.throwException(/^Required variable \[myVariable\] was not defined$/);

			function unlessDefined(variable, variableName) {
				return function() {
					failFast.unlessDefined(variable, variableName);
				};
			}
		});

		it("checks if expression is true", function() {
			expect(unlessTrue(true)).to.not.throwException();
			expect(unlessTrue(false)).to.throwException(/^Expected condition to be true$/);
			expect(unlessTrue(false, "a message")).to.throwException(/^a message$/);
			expect(unlessTrue("foo")).to.throwException(/^Expected condition to be true or false$/);
			expect(unlessTrue("foo", "ignoredMessage")).to.throwException(/^Expected condition to be true or false$/);

			function unlessTrue(variable, message) {
				return function() {
					failFast.unlessTrue(variable, message);
				};
			}
		});

		it("fails when statement is unreachable", function() {
			expect(unreachable()).to.throwException(/^Unreachable code executed$/);
			expect(unreachable("foo")).to.throwException(/^foo$/);

			function unreachable(message) {
				return function() {
					failFast.unreachable(message);
				};
			}
		});
	});

}());