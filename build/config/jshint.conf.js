// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	exports.options = {
		bitwise: true,
		curly: false,
		eqeqeq: true,
		forin: true,
		immed: true,
		latedef: false,
		newcap: true,
		noarg: true,
		noempty: true,
		nonew: true,
		regexp: true,
		undef: true,
		strict: true,
		trailing: true,
		node: true,
		esversion: 6,
		browser: true
	};

	exports.globals = {
		// Browserify
		require: false,
		module: false,
		exports: false,

		// Mocha / expect.js
		describe: false,
		it: false,
		expect: false,
		dump: false,
		beforeEach: false,
		afterEach: false,
		before: false,
		after: false,

		// Browser
		console: false,
		TouchEvent: false,
		Touch: false
	};

}());