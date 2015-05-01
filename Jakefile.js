// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*global desc, task, file, jake, rule, fail, complete, directory*/

(function() {
	"use strict";

	var startTime = Date.now();

	// We've put most of our require statements in functions (or tasks) so we don't have the overhead of
	// loading modules we don't need. At the time this refactoring was done, module loading took about half a
	// second, which was 10% of our desired maximum of five seconds for a quick build.
	// The require statements here are just the ones that are used to set up the tasks.
	var paths = require("./build/config/paths.js");

	var strict = !process.env.loose;
	if (strict) console.log("For more forgiving test settings, use 'loose=true'");

	//*** DIRECTORIES

	directory(paths.tempTestfileDir);
	directory(paths.buildDir);
	directory(paths.buildClientDir);
	directory(paths.incrementalDir);


	//*** GENERAL

	jake.addListener('complete', function () {
		var elapsedSeconds = (Date.now() - startTime) / 1000;
		console.log("\n\nBUILD OK (" + elapsedSeconds.toFixed(2) + "s)");
	});

	desc("Delete all generated files");
	task("clean", [], function() {
		jake.rmRf(paths.generatedDir);
	});

	desc("Lint and test everything");
	task("default", [ "clean", "quick", "smoketest" ]);

	desc("Incrementally lint and test fast targets");
	task("quick", [ "nodeVersion", "lint", "testServer", "testClient" ]);

	desc("Start Karma server for testing");
	task("karma", function() {
		karmaRunner().serve(paths.karmaConfig, complete, fail);
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
	task("lint", [ "lintLog", "incrementalLint" ], function() {
		console.log();
	});

	task("lintLog", function() { process.stdout.write("Linting JavaScript: "); });

	task("incrementalLint", paths.lintDirectories());
	task("incrementalLint", paths.lintOutput());
	createDirectoryDependencies(paths.lintDirectories());

	rule(".lint", determineLintDependency, function() {
		var lint = require("./build/util/lint_runner.js");
		var lintConfig = require("./build/config/jshint.conf.js");

		var passed = lint.validateFile(this.source, lintConfig.options, lintConfig.globals);
		if (passed) fs().writeFileSync(this.name, "lint ok");
		else fail("Lint failed");
	});


	//*** TEST

	desc("Test server code");
	incrementalTask("testServer", paths.serverTestTarget, [ paths.tempTestfileDir ], paths.serverFiles(),
		function(complete, fail) {
		console.log("Testing server code: ");
		mochaRunner().runTests({
			files: paths.serverTestFiles(),
			options: mochaConfig()
		}, complete, fail);
	});


	desc("Test client code");
	incrementalTask("testClient", paths.clientTestTarget, [], paths.clientFiles(), function(complete, fail) {
		console.log("Testing browser code: ");
		karmaRunner().runTests({
			configFile: paths.karmaConfig,
			browsers: require("./build/config/tested_browsers.js"),
			strict: strict
		}, complete, fail);
	}, { async: true });

	desc("End-to-end smoke tests");
	task("smoketest", [ "build" ], function() {
		console.log("Smoke testing app: ");
		mochaRunner().runTests({
			files: paths.smokeTestFiles(),
			options: mochaConfig()
		}, complete, fail);
	}, { async: true });


	//*** BUILD

	desc("Bundle and build code");
	task("build", [ "collateClientFiles", "bundleClientJs" ]);

	task("collateClientFiles", [ paths.buildClientDir ], function() {
		console.log("Collating client files: .");

		var fs = require("fs");
		var shell = require("shelljs");

		shell.rm("-rf", paths.buildClientDir + "/*");
		shell.cp(
			"-R",
			"src/client/*.html", "src/client/*.css", "src/client/images", "src/client/vendor",
			paths.buildClientDir
		);
	});

	task("bundleClientJs", [ paths.buildClientDir ], function() {
		process.stdout.write("Bundling client files with Browserify: ");

		var browserifyRunner = require("./build/util/browserify_runner.js");
		browserifyRunner.bundle({
			requires: [
				{ path: "./src/client/client.js", expose: "./client.js" },
				{ path: "./src/client/html_element.js", expose: "./html_element.js" }
			],
			outfile: paths.buildClientDir + "/bundle.js",
			options: { debug: true }
		}, complete, fail);
	}, {async: true});


	//*** CHECK VERSIONS

	task("nodeVersion", [], function() {
		console.log("Checking Node.js version: .");
		var version = require("./build/util/version_checker.js");

		version.check({
			name: "Node",
			expected: require("./package.json").engines.node,
			actual: process.version,
			strict: strict
		}, complete, fail);
	});


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

	function determineLintDependency(name) {
		var result = name.replace(/^generated\/incremental\/lint\//, "");
		return result.replace(/\.lint$/, "");
	}

	function incrementalTask(taskName, incrementalFile, otherDependencies, fileDependencies, action) {
		task(taskName, otherDependencies.concat(paths.incrementalDir, incrementalFile));
		file(incrementalFile, fileDependencies, function() {
			action(succeed, fail);
		}, {async: true});

		function succeed() {
			fs().writeFileSync(incrementalFile, "ok");
			complete();
		}
	}

	function createDirectoryDependencies(directories) {
		directories.forEach(function(lintDirectory) {
			directory(lintDirectory);
		});
	}


	//*** LAZY-LOADED MODULES

	function fs() {
		return require("fs");
	}

	function karmaRunner() {
		return require("./build/util/karma_runner.js");
	}

	function mochaRunner() {
		return require("./build/util/mocha_runner.js");
	}

	function mochaConfig() {
		return require("./build/config/mocha.conf.js");
	}

}());
