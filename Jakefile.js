// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

/*global desc, task, jake, fail, complete, directory*/
(function() {
	"use strict";

	if (!process.env.loose) console.log("For more forgiving test settings, use 'loose=true'");

	var lint = require("./build/lint/lint_runner.js");
	var nodeunit = require("nodeunit").reporters["default"];
	var path = require("path");

	var NODE_VERSION = "v0.8.10";
	var SUPPORTED_BROWSERS = [
		"IE 8.0",
		"IE 9.0",
		"Firefox 16.0",
		"Chrome 23.0",
		"Mac Safari 6.0",
		"iOS Safari 6.0"
	];

	var GENERATED_DIR = "generated";
	var TEMP_TESTFILE_DIR = GENERATED_DIR + "/test";

	directory(TEMP_TESTFILE_DIR);

	desc("Delete all generated files");
	task("clean", [], function() {
		jake.rmRf(GENERATED_DIR);
	});

	desc("Build and test");
	task("default", ["lint", "test"], function() {
		console.log("\n\nOK");
	});

	desc("Start Testacular server for testing");
	task("testacular", function() {
		sh("node", ["node_modules/testacular/bin/testacular", "start", "build/testacular.conf.js"],
			"Could not start Testacular server", complete);
	}, {async: true});

	desc("Lint everything");
	task("lint", ["lintNode", "lintClient"]);

	task("lintNode", ["nodeVersion"], function() {
		var passed = lint.validateFileList(nodeFiles(), nodeLintOptions(), {});
		if (!passed) fail("Lint failed");
	});

	task("lintClient", function() {
		var passed = lint.validateFileList(clientFiles(), browserLintOptions(), {});
		if (!passed) fail("Lint failed");
	});

	desc("Test everything");
	task("test", ["testNode", "testClient"]);

	desc("Test server code");
	task("testNode", ["nodeVersion", TEMP_TESTFILE_DIR], function() {
		nodeunit.run(nodeTestFiles(), null, function(failures) {
			if (failures) fail("Tests failed");
			complete();
		});
	}, {async: true});

	desc("Test client code");
	task("testClient", function() {
		var config = {};

		var output = "";
		var oldStdout = process.stdout.write;
		process.stdout.write = function(data) {
			output += data;
			oldStdout.apply(this, arguments);
		};

		require("testacular/lib/runner").run(config, function(exitCode) {
			process.stdout.write = oldStdout;

			if (exitCode) fail("Client tests failed (to start server, run 'jake testacular')");
			var browserMissing = false;
			SUPPORTED_BROWSERS.forEach(function(browser) {
				browserMissing = checkIfBrowserTested(browser, output) || browserMissing;
			});
			if (browserMissing && !process.env.loose) fail("Did not test all supported browsers (use 'loose=true' to suppress error)");
			if (output.indexOf("TOTAL: 0 SUCCESS") !== -1) fail("Client tests did not run!");

			complete();
		});
	}, {async: true});

	function checkIfBrowserTested(browser, output) {
		var missing = output.indexOf(browser + ": Executed") === -1;
		if (missing) console.log(browser + " was not tested!");
		return missing;
	}

	desc("Deploy to Heroku");
	task("deploy", ["default"], function() {
		console.log("1. Make sure 'git status' is clean.");
		console.log("2. 'git push heroku master'");
		console.log("3. 'jake test'");
	});

//	desc("Ensure correct version of Node is present.");
	task("nodeVersion", [], function() {
		function failWithQualifier(qualifier) {
			fail("Incorrect node version. Expected " + qualifier +
				" [" + expectedString + "], but was [" + actualString + "].");
		}

		var expectedString = NODE_VERSION;
		var actualString = process.version;
		var expected = parseNodeVersion("expected Node version", expectedString);
		var actual = parseNodeVersion("Node version", actualString);

		if (!process.env.loose) {
			if (actual[0] !== expected[0] || actual[1] !== expected[1] || actual[2] !== expected[2]) {
				failWithQualifier("exactly");
			}
		}
		else {
			if (actual[0] < expected[0]) failWithQualifier("at least");
			if (actual[0] === expected[0] && actual[1] < expected[1]) failWithQualifier("at least");
			if (actual[0] === expected[0] && actual[1] === expected[1] && actual[2] < expected[2]) failWithQualifier("at least");
		}
	});

	desc("Integration checklist");
	task("integrate", ["default"], function() {
		console.log("1. Make sure 'git status' is clean.");
		console.log("2. Build on the integration box.");
		console.log("   a. Walk over to integration box.");
		console.log("   b. 'git pull'");
		console.log("   c. 'npm rebuild'");
		console.log("   d. Check status for files that need to be .gitignore'd");
		console.log("   e. 'jake'");
		console.log("   f. If jake fails, stop! Try again after fixing the issue.");
		console.log("3. 'git checkout integration'");
		console.log("4. 'git merge master --no-ff --log'");
		console.log("5. 'git checkout master'");
	});

	desc("End-of-episode checklist");
	task("episode", [], function() {
		console.log("1. Save recording.");
		console.log("2. Double-check sound and framing.");
		console.log("3. Commit source code.");
		console.log("4. Check Windows compatibility");
		console.log("   a. Switch to Windows VM");
		console.log("   b. 'git pull'");
		console.log("   c. 'npm rebuild'");
		console.log("   d. Check status for files that need to be .gitignore'd");
		console.log("   e. 'jake'");
		console.log("5. Tag episode: 'git tag -a episodeXX -m \"End of episode XX\"'");
	});

	function parseNodeVersion(description, versionString) {
		var versionMatcher = /^v(\d+)\.(\d+)\.(\d+)$/;    // v[major].[minor].[bugfix]
		var versionInfo = versionString.match(versionMatcher);
		if (versionInfo === null) fail("Could not parse " + description + " (was '" + versionString + "')");

		var major = parseInt(versionInfo[1], 10);
		var minor = parseInt(versionInfo[2], 10);
		var bugfix = parseInt(versionInfo[3], 10);
		return [major, minor, bugfix];
	}

	function sh(command, args, errorMessage, callback) {
		console.log("> " + command + " " + args.join(" "));

		// Not using jake.createExec as it adds extra line-feeds into output as of v0.3.7
		var child = require("child_process").spawn(command, args, { stdio: "pipe" });

		// redirect stdout
		var stdout = "";
		child.stdout.setEncoding("utf8");
		child.stdout.on("data", function(chunk) {
			stdout += chunk;
			process.stdout.write(chunk);
		});

		// redirect stderr
		var stderr = "";
		child.stderr.setEncoding("utf8");
		child.stderr.on("data", function(chunk) {
			stderr += chunk;
			process.stderr.write(chunk);
		});

		// handle process exit
		child.on("exit", function(exitCode) {
			if (exitCode !== 0) fail(errorMessage);
		});
		child.on("close", function() {      // 'close' event can happen after 'exit' event
			callback(stdout, stderr);
		});
	}

	function nodeFiles() {
		var javascriptFiles = new jake.FileList();
		javascriptFiles.include("*.js");
		javascriptFiles.include("src/server/**/*.js");
		javascriptFiles.include("src/_smoke_test.js");
		return javascriptFiles.toArray();
	}

	function nodeTestFiles() {
		var testFiles = new jake.FileList();
		testFiles.include("src/server/**/_*_test.js");
		testFiles.include("src/_*_test.js");
		testFiles = testFiles.toArray();
		return testFiles;
	}

	function clientFiles() {
		var javascriptFiles = new jake.FileList();
		javascriptFiles.include("src/client/**/*.js");
		return javascriptFiles.toArray();
	}

	function nodeLintOptions() {
		var options = globalLintOptions();
		options.node = true;
		return options;
	}

	function browserLintOptions() {
		var options = globalLintOptions();
		options.browser = true;
		return options;
	}

	function globalLintOptions() {
		var options = {
			bitwise: true,
			curly: false,
			eqeqeq: true,
			forin: true,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			noempty: true,
			nonew: true,
			regexp: true,
			undef: true,
			strict: true,
			trailing: true
		};
		return options;
	}

}());
