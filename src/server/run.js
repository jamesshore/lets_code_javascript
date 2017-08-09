// Copyright (c) 2012-2017 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(async function() {
	"use strict";

	var Server = require("./server.js");

	var CONTENT_DIR = "./generated/dist/client";

	var port = process.argv[2];
	let server = new Server();
	await server.start(CONTENT_DIR, "404.html", port);
	console.log("Server started");

}());