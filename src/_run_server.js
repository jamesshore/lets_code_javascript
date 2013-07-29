// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	var child_process = require("child_process");
	var fs = require("fs");
	var procfile = require("procfile");

	exports.runInteractively = function() {
		return run("inherit");
	};

	exports.runProgrammatically = function(callback) {
		var serverProcess = run(["pipe", "pipe", process.stderr]);

		serverProcess.stdout.setEncoding("utf8");
		serverProcess.stdout.on("data", function(chunk) {
			if (chunk.trim().indexOf("Server started") !== -1) callback(serverProcess);
		});
	};

	function run(stdioOptions) {
		var commandLine = parseProcFile();
		return child_process.spawn(commandLine.command, commandLine.options, {stdio: stdioOptions });
	}

	function parseProcFile() {
		var fileData = fs.readFileSync("Procfile", "utf8");
		var webCommand = procfile.parse(fileData).web;
		webCommand.options = webCommand.options.map(function(element) {
			if (element === "$PORT") return "5000";
			else return element;
		});
		return webCommand;
	}

}());