// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global desc, task, file, jake, rule, fail, complete, directory*/

(function() {
	"use strict";

	var startTime = Date.now();

	var strict = !process.env.loose;
	if (strict) console.log("For more forgiving test settings, use 'loose=true'");

	var REQUIRED_BROWSERS = [
		"IE 8.0.0 (Windows 7)",
		"IE 9.0.0 (Windows 7)",
		"Firefox 35.0.0 (Mac OS X 10.10)",
		"Chrome 41.0.2272 (Mac OS X 10.10.2)",
		"Safari 8.0.3 (Mac OS X 10.10.2)",
		"Mobile Safari 7.0.0 (iOS 7.1)"
	];

	var GENERATED_DIR = "generated";
	var TEMP_TESTFILE_DIR = GENERATED_DIR + "/test";
	var BUILD_DIR = GENERATED_DIR + "/build";
	var BUILD_CLIENT_DIR = BUILD_DIR + "/client";
	var INCREMENTAL_DIR = "generated/incremental";
	var SERVER_TEST_TARGET = INCREMENTAL_DIR + "/server.test";
	var CLIENT_TEST_TARGET = INCREMENTAL_DIR + "/client.test";

	var KARMA_CONFIG = "./build/config/karma.conf.js";

	var MOCHA_CONFIG = {
		ui: "bdd",
		reporter: "dot"
	};

	//*** DIRECTORIES

	directory(TEMP_TESTFILE_DIR);
	directory(BUILD_DIR);
	directory(BUILD_CLIENT_DIR);
	directory(INCREMENTAL_DIR);


	//*** GENERAL

	desc("Delete all generated files");
	task("clean", [], function() {
		jake.rmRf(GENERATED_DIR);
	});

	desc("Lint and test everything");
	task("default", [ "clean", "quick", "smoketest" ], function() {
		buildOk();
	});

	desc("Incrementally lint and test fast targets");
	task("quick", [ "nodeVersion", "lint", "testServer", "testClient" ], function() {
		buildOk();
	});

	desc("Start Karma server for testing");
	task("karma", function() {
		karma().serve(KARMA_CONFIG, complete, fail);
	}, {async: true});

	desc("Start localhost server for manual testing");
	task("run", [ "build" ], function() {
		var runServer = require("./src/_run_server.js");

		console.log("Running server. Press Ctrl-C to stop.");
		runServer.runInteractively();
		// We never call complete() because we want the task to hang until the user presses 'Ctrl-C'.
	}, {async: true});


	//*** LINT

	desc("Lint everything");
	task("lint", lintDirectories());
	task("lint", lintOutput());

	createDirectoryDependencies(lintDirectories());

	rule(".lint", determineLintDependency, function() {
		var passed = lint().validateFile(this.source, lintOptions(), lintGlobals());
		if (passed) fs().writeFileSync(this.name, "lint ok");
		else fail("Lint failed");
	});


	//*** TEST

	desc("Test server code");
	task("testServer", [ INCREMENTAL_DIR, TEMP_TESTFILE_DIR, SERVER_TEST_TARGET ]);
	file(SERVER_TEST_TARGET, serverFiles(), function() {
		mocha().runTests({
			files: serverTestFiles(),
			options: MOCHA_CONFIG
		}, succeed, fail);

		function succeed() {
			fs().writeFileSync(SERVER_TEST_TARGET, "test ok");
			complete();
		}
	}, { async: true });

	desc("Test client code");
	task("testClient", [ INCREMENTAL_DIR, CLIENT_TEST_TARGET ]);
	file(CLIENT_TEST_TARGET, clientFiles(), function() {
		console.log("Testing browser code: ");
		karma().runTests({
			configFile: KARMA_CONFIG,
			browsers: REQUIRED_BROWSERS,
			strict: strict
		}, succeed, fail);

		function succeed() {
			fs().writeFileSync(CLIENT_TEST_TARGET, "test ok");
			complete();
		}
	}, { async: true });

	desc("End-to-end smoke tests");
	task("smoketest", [ "build" ], function() {
		mocha().runTests({
			files: smokeTestFiles(),
			options: MOCHA_CONFIG
		}, complete, fail);
	}, { async: true });

	//*** BUILD

	desc("Bundle and build code");
	task("build", [ BUILD_CLIENT_DIR ], function() {
		var fs = require("fs");
		var shell = require("shelljs");
		var browserify = require("browserify");

		shell.rm("-rf", BUILD_CLIENT_DIR + "/*");
		shell.cp(
			"-R",
			"src/client/*.html", "src/client/*.css", "src/client/images", "src/client/vendor",
			BUILD_CLIENT_DIR
		);

		console.log("Bundling client files with Browserify...");
		var b = browserify({ debug: true });
		b.require("./src/client/client.js", {expose: "./client.js"} );
		b.require("./src/client/html_element.js", {expose: "./html_element.js"} );
		b.bundle(function(err, bundle) {
			if (err) fail(err);
			fs.writeFileSync(BUILD_CLIENT_DIR + "/bundle.js", bundle);
			complete();
		});
	}, {async: true});


	//*** DEPLOY

	desc("Deploy to Heroku");
	task("deploy", function() {
		console.log("To deploy to production:");
		console.log("1. Integrate ('jake integrate')");

		// Correction: Use "git push heroku integration:master" to deploy from integration branch.
		// Thanks to Jüri A, http://www.letscodejavascript.com/v3/comments/live/32#comment-798947003 .
		console.log("2. 'git push heroku integration:master' (or 'git push staging integration:master')");
		console.log("3. 'jake test'");
		console.log();
		console.log("To deploy latest code to staging server:");
		console.log("1. Make sure 'git status' is clean.");
		console.log("2. 'git push staging master");
		console.log("3. Visit http://wwp-staging.herokuapp.com/");
	});


	//*** CHECK VERSIONS

//	desc("Ensure correct version of Node is present.");
	task("nodeVersion", [], function() {
		var versionChecker = require("./build/util/version_checker.js");

		var deployedVersion = "v" + require("./package.json").engines.node;
		versionChecker.check("Node", !process.env.loose, deployedVersion, process.version, fail);
	});


	//*** INTEGRATE

	desc("Integration checklist");
	task("integrate", [ "default" ], function() {
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


	//*** UTILITY FUNCTIONS

	function serverTestFiles() {
		return deglob("src/server/**/_*_test.js");
	}

	function clientFiles() {
		return deglob([
			"src/client/**/*.js",
			"src/client/**/*.html",
			"src/client/**/*.css",
			"src/shared/**/*.js",
			"src/client/vendor/**/*.js"
		]);
	}

	function serverFiles() {
		return deglob([
			"src/server/**/*.js",
			"src/shared/**/*.js",
			"src/client/vendor/**/*.js"
		]);
	}

	function smokeTestFiles() {
		return deglob("src/_*_test.js");
	}

	function lintFiles() {
		return deglob([
			"*.js",
			"build/util/*.js",
			"src/client/*.js",
			"src/server/**/*.js",
			"src/shared/**/*.js",
			"src/*.js"
		]);
	}

	function determineLintDependency(name) {
		var result = name.replace(/^generated\/incremental\/lint\//, "");
		return result.replace(/\.lint$/, "");
	}

	function lintOutput() {
		return lintFiles().map(function(pathname) {
			return "generated/incremental/lint/" + pathname + ".lint";
		});
	}

	function lintDirectories() {
		var path = require("path");

		var result = [];
		lintOutput().forEach(function(lintDependency) {
			result.push(path.dirname(lintDependency));
		});
		return result;
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
			node: true,
			browser: true
		};
	}

	function lintGlobals() {
		return {
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
			console: false
		};
	}

	function buildOk() {
		var elapsedSeconds = (Date.now() - startTime) / 1000;
		console.log("\n\nBUILD OK (" + elapsedSeconds.toFixed(2) + "s)");
	}

	function createDirectoryDependencies(directories) {
		directories.forEach(function(lintDirectory) {
			directory(lintDirectory);
		});
	}


	// We've factored our require statements into functions so we don't have the overhead of loading
	// modules we don't need. At the time this refactoring was done, module loading took about half a
	// second, which was 10% of our desired maximum of five seconds for a quick build.

	function lint() {
		return require("./build/util/lint_runner.js");
	}

	function karma() {
		return require("./build/util/karma_runner.js");
	}

	function fs() {
		return require("fs");
	}

	function mocha() {
		return require("./build/util/mocha_runner.js");
	}

	function deglob(patterns) {
		var glob = require("glob");

		var globPattern = patterns;
		if (Array.isArray(patterns)) globPattern = "{" + patterns.join(",") + "}";

		return glob.sync(globPattern);
	}


}());
