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

	var itonly = process.env.itonly;

	//*** DIRECTORIES

	directory(paths.tempTestfileDir);
	directory(paths.buildDir);
	directory(paths.buildServerDir);
	directory(paths.buildSharedDir);
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
	task("quick", [ "nodeVersion", "lint", "test" ]);

	desc("Start Karma server for testing");
	task("karma", function() {
		karmaRunner().start({
			configFile: paths.karmaConfig
		}, complete, fail);
	}, { async: true });

	desc("Start localhost server for manual testing");
	task("run", [ "build" ], function() {
		var runServer = require("./src/_run_server.js");

		console.log("Running server. Press Ctrl-C to stop.");
		runServer.runInteractively();
		// We never call complete() because we want the task to hang until the user presses 'Ctrl-C'.
	}, { async: true });


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

	desc("Test everything (except smoke tests)");
	task("test", [ "testServer", "testClient" ]);

	desc("Test client code");
	task("testClient", [ "testClientJavaScript", "testClientNetwork", "testClientCss" ]);

	desc("Test server code");
	incrementalTask("testServer", [ paths.tempTestfileDir ], paths.serverFiles(), function(complete, fail) {
		console.log("Testing server JavaScript: ");
		mochaRunner().runTests({
			files: paths.serverTestFiles(),
			options: mochaConfig()
		}, complete, fail);
	});

	incrementalTask("testClientJavaScript", [], paths.clientJsTestDependencies(), function(complete, fail) {
		console.log("Testing browser UI code: ");
		runKarmaOnTaggedSubsetOfTests("UI", complete, fail);
	});

	incrementalTask("testClientCss", [], paths.cssTestDependencies(), function(complete, fail) {
		console.log("Testing CSS:");
		runKarmaOnTaggedSubsetOfTests("CSS", complete, fail);
	});

	incrementalTask("testClientNetwork", [], paths.clientNetworkTestDependencies(), function(complete, fail) {
		console.log("Testing browser networking code: ");

		var networkHarness = require("./src/client/network/_network_test_harness.js");

		var io = networkHarness.startTestServer();
		runKarmaOnTaggedSubsetOfTests("NET", networkHarness.stopTestServerFn(io, complete), fail);
	});

	function runKarmaOnTaggedSubsetOfTests(tag, complete, fail) {
		karmaRunner().run({
			configFile: paths.karmaConfig,
			expectedBrowsers: testedBrowsers(),
			strict: strict,
			// We use Mocha's "grep" feature as a poor-man's substitute for proper test tagging and subsetting
			// (which Mocha doesn't have at the time of this writing). However, Mocha's grep option disables
			// Mocha's "it.only()" feature. So we don't use grep if the "itonly" option is set on the command
			// line.
			clientArgs: itonly ? [] : [ "--grep=" + tag + ":" ]
		}, complete, fail);
	}

	desc("End-to-end smoke tests");
	task("smoketest", [ "build" ], function() {
		console.log("Smoke testing app: ");
		mochaRunner().runTests({
			files: paths.smokeTestFiles(),
			options: mochaConfig()
		}, complete, fail);
	}, { async: true });


	//*** BUILD DISTRIBUTION DIRECTORY

	desc("Bundle and build code");
	task("build", [ "server", "client" ]);

	task("server", [ paths.buildServerDir, paths.buildSharedDir ], function() {
		console.log("Collating server files: .");

		shell().rm("-rf", paths.buildDir + "/server/*");
		shell().rm("-rf", paths.buildDir + "/shared/*");
		shell().cp(
			"-R",
			"src/server",
			"src/shared",
			paths.buildDir
		);
	});

	task("client", [ "cacheBust" ]);

	task("cacheBust", [ "collateClientFiles", "bundleClientJs" ], function() {
		process.stdout.write("Cache-busting CSS and JavaScript: ");

		var hashCatRunner = require("./build/util/hashcat_runner.js");
		hashCatRunner.go({
			files: [ paths.buildClientIndexHtml, paths.buildClient404Html ]
		}, removeUnwantedFiles, fail);

		function removeUnwantedFiles() {
			shell().rm(paths.buildIntermediateFilesToErase());
			complete();
		}

	}, { async: true });

	task("collateClientFiles", [ paths.buildClientDir ], function() {
		console.log("Collating client files: .");

		shell().rm("-rf", paths.buildClientDir + "/*");
		shell().cp(
			"-R",
			"src/client/content/*", "src/client/ui/vendor", "src/client/network/vendor", "src/shared/vendor",
			paths.buildClientDir
		);
	});

	task("bundleClientJs", [ paths.buildClientDir ], function() {
		process.stdout.write("Bundling client files with Browserify: ");

		var browserifyRunner = require("./build/util/browserify_runner.js");
		browserifyRunner.bundle({
			requires: [
				{ path: "./src/client/ui/client.js", expose: "./client.js" },
				{ path: "./src/client/ui/html_element.js", expose: "./html_element.js" }
			],
			outfile: paths.buildClientDir + "/bundle.js",
			options: { debug: true }
		}, complete, fail);
	}, { async: true });


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
	}, { async: true });


	//*** CHECKLISTS

	desc("Integration checklist");
	task("integrate", function() {
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

	desc("Deploy checklist");
	task("deploy", function() {
		console.log("To deploy to production:");
		console.log("1. Make sure `git status` is clean");
		console.log("2. Run full build (`jake`) and make sure it builds okay");
		console.log("3. Check in release code: `git add generated/dist -f && git commit`");
		console.log("4. Integrate");
		console.log("5. Deploy integrated code to staging: `git push staging integration:master`");
		console.log("6. Verify by visiting http://wwp-staging.herokuapp.com");
		console.log("7. Deploy integrated to production: `git push heroku integration:master`");
		console.log("8. Remove `generated/dist` from git");
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

	function incrementalTask(taskName, taskDependencies, fileDependencies, action) {
		var incrementalFile = paths.incrementalDir + "/" + taskName + ".task";

		task(taskName, taskDependencies.concat(paths.incrementalDir, incrementalFile));
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
		return require("simplebuild-karma");
	}

	function mochaRunner() {
		return require("./build/util/mocha_runner.js");
	}

	function mochaConfig() {
		return require("./build/config/mocha.conf.js");
	}

	function shell() {
		return require("shelljs");
	}

	function testedBrowsers() {
		return require("./build/config/tested_browsers.js");
	}

}());
