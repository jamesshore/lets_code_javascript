// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

let eslint = require("eslint");
let linter = new (eslint).Linter();
let fs = require("fs");

exports.validateSource = function(sourceCode, options, globals, description) {
	description = description ? description + " " : "";

	var messages = linter.verify(sourceCode, {});
	var pass = (messages.length === 0);

	if (pass) {
		process.stdout.write(".");
	}
	else {
		console.log("\n" + description + "failed");
		messages.forEach(function(error) {
			var code = eslint.SourceCode.splitLines(sourceCode)[error.line - 1];
			console.log(error.line + ": " + code.trim());
			console.log("   " + error.message);
		});
	}
	return pass;
};

exports.validateFile = function(filename, options, globals) {
	var sourceCode = fs.readFileSync(filename, "utf8");
	return exports.validateSource(sourceCode, options, globals, filename);
};

exports.validateFileList = function(fileList, options, globals) {
	var pass = true;
	fileList.forEach(function(filename) {
		pass = exports.validateFile(filename, options, globals) && pass;
	});
	return pass;
};