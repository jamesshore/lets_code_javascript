// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
/*globals desc, task */

"use strict";

var jakeify = require("./examples/extensions/simplebuild-ext-jakeify.js")
	.map("../examples/mappers/simplebuild-map-header.js")
	.map;

var jshint = jakeify("../examples/tasks/simplebuild-jshint.js");
var mocha = jakeify("../examples/tasks/simplebuild-mocha.js");


task("default", ["lint", "test"], function() {
	console.log("\n\nBUILD OK");
});

desc("Lint everything");
jshint.validate.task("lint", {
	files: [ "**/*.js", "!node_modules/**/*" ],
	options: lintOptions(),
	globals: lintGlobals()
});

desc("Test everything");
mocha.runTests.task("test", [], {
	files: [ "**/_*_test.js", "!node_modules/**/*" ]
});


function lintOptions() {
	return {
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
		node: true
	};
}

function lintGlobals() {
	return {
		// Mocha
		describe: false,
		it: false,
		before: false,
		after: false,
		beforeEach: false,
		afterEach: false,
	};
}
