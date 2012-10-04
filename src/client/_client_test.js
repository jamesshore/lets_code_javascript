// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global describe, it, expect*/

(function () {
	"use strict";
//var assert = chai.assert;

	describe("Nothing", function () {

		it("should run", function () {
//		assert.equal("foo", "foo");
//		"foo".should.equal("foo");
//		expect.equal("foo", "foo");
			expect("foo").to.equal("foo");
		});

	});
}());
