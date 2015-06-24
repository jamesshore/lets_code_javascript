// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var sh = require("./sh.js");

	exports.go = function(config, success, failure) {
		var options = { suppressOutput: true };
		sh.run("node node_modules/hashcat/bin/hashcat.js " + config.indexFile, checkHashcatOutput, failure, options);

		function checkHashcatOutput(stdout) {
			if (stdout.indexOf("Hashcat complete") !== -1) {
				return success();
			}
			else {
				console.log(stdout);
				return failure("Hashcat failed");
			}
		}
	};

}());