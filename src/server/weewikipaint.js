// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function() {
	"use strict";


	var server = require("./server.js");
	var port = process.argv[2];
	server.start("src/server/content/homepage.html", "src/server/content/404.html", port, function() {
		console.log("Server started");
	});
}());