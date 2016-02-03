// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var glob = require("glob");
	var path = require("path");

	exports.generatedDir = "generated";
	exports.tempTestfileDir = "generated/test";
	exports.incrementalDir = "generated/incremental";

	exports.buildDir = "generated/dist";
	exports.buildServerDir = "generated/dist/server";
	exports.buildSharedDir = "generated/dist/shared";
	exports.buildClientDir = "generated/dist/client";
	exports.buildClientIndexHtml = "generated/dist/client/index.html";
	exports.buildClient404Html = "generated/dist/client/404.html";
	exports.buildIntermediateFilesToErase = function() {
		return deglob([
			"./generated/dist/client/_*",
			"./generated/dist/client/bundle.js",
			"./generated/dist/client/screen.css"
		]);
	};

	exports.karmaConfig = "./build/config/karma.conf.js";

	exports.serverTestFiles = function() {
		return deglob("src/server/**/_*_test.js");
	};

	exports.cssTestDependencies = function() {
		return deglob([
			"src/client/content/**/*",
			"src/shared/**/*"
		]);
	};

	exports.clientJsTestDependencies = function() {
		return deglob([
			"src/client/ui/**/*",
			"src/shared/**/*"
		]);
	};

	exports.clientNetworkTestDependencies = function() {
		return deglob([
			"src/client/network/**/*.js",
			"src/shared/**/*"
		]);
	};

	exports.serverFiles = function() {
		return deglob([
			"src/server/**/*.js",
			"src/shared/**/*.js"
		]);
	};

	exports.smokeTestFiles = function() {
		return deglob("src/_*_test.js");
	};

	exports.lintFiles = function() {
		return deglob([
			"*.js",
			"build/**/*.js",
			"src/**/*.js"
		], [
			"**/vendor/*.js"
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

	function deglob(patternsToFind, patternsToIgnore) {
		var globPattern = patternsToFind;
		if (Array.isArray(patternsToFind)) {
			if (patternsToFind.length === 1) {
				globPattern = patternsToFind[0];
			}
			else {
				globPattern = "{" + patternsToFind.join(",") + "}";
			}
		}

		return glob.sync(globPattern, { ignore: patternsToIgnore });
	}

}());