// Copyright (c) 2014-2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/*global desc, task, jake, fail, complete, directory*/
"use strict";

var jshint = require("simplebuild-jshint");
var mocha = require("./build/mocha_runner");
var karma = require("./src");

desc("Start Karma server (run this first!)");
task("karma", function() {
	karma.start({
		configFile: "./build/karma.conf.js"
	}, complete, fail);
}, { async: true });

desc("Validate code (lint and test)");
task("default", ["lint", "test"], function() {
	console.log("\n\nBUILD OK");
});

desc("Lint everything");
task("lint", function() {
	process.stdout.write("Linting JavaScript: ");
	jshint.checkFiles({
		files: [ "*.js", "src/**/*.js", "build/**/*.js" ],
		options: lintOptions(),
		globals: lintGlobals()
	}, complete, fail);
}, { async: true });

desc("Run tests");
task("test", function() {
	console.log("Testing JavaScript (be sure to start Karma server and capture Firefox first):");
	mocha.runTests({
		files: "src/**/_*_test.js",
		options: {
			ui: "bdd",
			reporter: "dot"
		}
	}, complete, fail);
}, {async: true});

function testFiles() {
	var files = new jake.FileList();
	files.include("src/**/_*_test.js");
	return files.toArray();
}

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
		beforeEach: false,
		afterEach: false,
		describe: false,
		it: false
	};
}
