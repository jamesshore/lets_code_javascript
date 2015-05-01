// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var glob = require("glob");
	var path = require("path");

	exports.generatedDir = "generated";
	exports.tempTestfileDir = "generated/test";

	exports.buildDir = "generated/build";
	exports.buildClientDir = "generated/build/client";

	exports.incrementalDir = "generated/incremental";
	exports.serverTestTarget = "generated/incremental/server.test";
	exports.clientTestTarget = "generated/incremental/client.test";

	exports.karmaConfig = "./build/config/karma.conf.js";

	exports.serverTestFiles = function() {
		return deglob("src/server/**/_*_test.js");
	};

	exports.clientFiles = function() {
		return deglob([
			"src/client/**/*.js",
			"src/client/**/*.html",
			"src/client/**/*.css",
			"src/shared/**/*.js",
			"src/client/vendor/**/*.js"
		]);
	};

	exports.serverFiles = function() {
		return deglob([
			"src/server/**/*.js",
			"src/shared/**/*.js",
			"src/client/vendor/**/*.js"
		]);
	};

	exports.smokeTestFiles = function() {
		return deglob("src/_*_test.js");
	};

	exports.lintFiles = function() {
		return deglob([
			"*.js",
			"build/**/*.js",
			"src/client/*.js",
			"src/server/**/*.js",
			"src/shared/**/*.js",
			"src/*.js"
		]);
	};

	exports.lintOutput = function() {
		return exports.lintFiles().map(function(pathname) {
			return "generated/incremental/lint/" + pathname + ".lint";
		});
	};

	exports.lintDirectories = function() {
		return exports.lintOutput().map(function(lintDependency) {
			return path.dirname(lintDependency);
		});
	};

	function deglob(patterns) {
		var globPattern = patterns;
		if (Array.isArray(patterns)) globPattern = "{" + patterns.join(",") + "}";

		return glob.sync(globPattern);
	}

}());