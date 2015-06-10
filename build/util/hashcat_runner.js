// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var hashcat = require("hashcat/lib/libhashcat.js");
	var sh = require("./sh.js");

	exports.go = function(config, success, failure) {
		sh.run("node node_modules/hashcat/bin/hashcat.js " + config.indexFile, success, failure);
	};



}());