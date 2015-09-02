// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var sh = require("./sh.js");
	var hashcat = require("hashcat/lib/libhashcat.js");

	exports.go = function(config, success, failure) {
		try {
			config.files.forEach(function(file) {
				process.stdout.write(".");
				hashcat.hashcatify({
					htmlFile: file,
					outputHtmlFile: file
				});
			});
			process.stdout.write("\n");
			return success();
		}
		catch(err) {
			return failure(err);
		}
	};

}());