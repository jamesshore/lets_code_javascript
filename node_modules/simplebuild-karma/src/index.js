// Copyright (c) 2012-2015 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

// Helper functions for running Karma

(function() {
	"use strict";

	var simplebuild = require("simplebuild");
	var path = require("path");
	var Server = require("karma").Server;
	var runner = require("karma").runner;

	exports.start = function(userOptions, success, fail) {
		try {
			var defaults = {};
			var types = { configFile: String };
			var options = simplebuild.normalizeOptions(userOptions, defaults, types);

			var config = {
				configFile: path.resolve(options.configFile)
			};

			karmaStart(config, function(exitCode) {
				if (exitCode !== 0) return fail("Karma server failed");
				else return success();
			});
		}
		catch (err) {
			return fail(err.message);
		}
	};

	exports.run = function(userOptions, success, fail) {
		try {
			var defaults = {
				expectedBrowsers: [],
				strict: true,
				capture: [],
				clientArgs: []
			};
			var types = {
				configFile: String,
				expectedBrowsers: Array,
				strict: Boolean,
				capture: Array,
				clientArgs: Array
			};
			var options = simplebuild.normalizeOptions(userOptions, defaults, types);

			var config = {
				configFile: path.resolve(options.configFile),
				browsers: options.capture,
				singleRun: options.capture.length > 0,
				clientArgs: options.clientArgs
			};

			var runKarma = runner.run.bind(runner);
			if (config.singleRun) runKarma = karmaStart;

			var stdout = new CapturedStdout();
			runKarma(config, function(exitCode) {
				stdout.restore();

				if (exitCode) return fail("Karma tests failed");
				var browserMissing = checkRequiredBrowsers(options.expectedBrowsers, stdout);
				if (browserMissing && options.strict) return fail("Karma did not test all browsers");
				if (stdout.capturedOutput.indexOf("TOTAL: 0 SUCCESS") !== -1) return fail("No Karma tests were run!");

				return success();
			});
		}
		catch (err) {
			return fail(err.message);
		}
	};

	function karmaStart(config, callback) {
		var server = new Server(config, callback);
		server.start();
	}

	function checkRequiredBrowsers(requiredBrowsers, stdout) {
		var browserMissing = false;
		requiredBrowsers.forEach(function(browser) {
			browserMissing = lookForBrowser(browser, stdout.capturedOutput) || browserMissing;
		});
		return browserMissing;
	}

	function lookForBrowser(browser, output) {
		var missing = output.indexOf(browser + ": Executed") === -1;
		if (missing) console.log("Warning: " + browser + " was not tested!");
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