// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";

	var Server = require("./server.js");

	var CONTENT_DIR = "./generated/dist/client";

	var port = process.argv[2];
	new Server().start(CONTENT_DIR, "404.html", port, function() {
		console.log("Server started");
	});
}());