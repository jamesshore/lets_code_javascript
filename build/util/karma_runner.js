// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var path = require("path");
	var sh = require("./sh.js");
	var runner = require("karma").runner;

	var KARMA = "node node_modules/karma/bin/karma";
	var CONFIG = { configFile: path.resolve("build/karma.conf.js") };

	exports.serve = function(configFile, success, fail) {
		sh.run(KARMA + " start " + configFile, success, function() {
			fail("Could not start Karma server");
		});
	};

	exports.runTests = function(requiredBrowsers, success, fail) {
		var stdout = new CapturedStdout();

		runner.run(CONFIG, function(exitCode) {
			stdout.restore();

			if (exitCode) fail("Client tests failed (to start server, run 'jake karma')");
			var browserMissing = checkRequiredBrowsers(requiredBrowsers, stdout);
			if (browserMissing && !process.env.loose) fail("Did not test all supported browsers (use 'loose=true' to suppress error)");
			if (stdout.capturedOutput.indexOf("TOTAL: 0 SUCCESS") !== -1) fail("No tests were run!");

			success();
		});
	};

	function checkRequiredBrowsers(requiredBrowsers, stdout) {
		var browserMissing = false;
		requiredBrowsers.forEach(function(browser) {
			browserMissing = lookForBrowser(browser, stdout.capturedOutput) || browserMissing;
		});
		return browserMissing;
	}

	function lookForBrowser(browser, output) {
		var missing = output.indexOf(browser + ": Executed") === -1;
		if (missing) console.log(browser + " was not tested!");
		return missing;
	}

	function CapturedStdout() {
		var self = this;
		self.oldStdout = process.stdout.write;
		self.capturedOutput = "";

		process.stdout.write = function(data) {
			self.capturedOutput += data;
			self.oldStdout.apply(this, arguments);
		};
	}

	CapturedStdout.prototype.restore = function() {
		process.stdout.write = this.oldStdout;
	};

}());