/* Copyright (c) 2014 Titanium I.T. LLC - See LICENSE.txt for license */
"use strict";

var fs = require("fs");
var path = require("path");
var browserify = require("browserify");

exports.bundle = function(config, success, failure) {
	var b = browserify(config.options);

	config.requires.forEach(function(oneRequire) {
		process.stdout.write(".");
		b.require(oneRequire.path, { expose: oneRequire.expose });
	});

	b.bundle(function(err, bundle) {
		if (err) failure(err);
		fs.writeFileSync(config.outfile, bundle);
		console.log();
		success();
	});
};