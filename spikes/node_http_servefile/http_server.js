// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

// This spike demonstrates how to serve a static file.
//
// It's not robust and it reflects a very basic understanding of node; use it
// as a starting point, not a production-quality example.
"use strict";

var http = require("http");
var fs = require("fs");

var server = http.createServer();

server.on("request", function(request, response) {
	console.log("Received request");

	fs.readFile("file.html", function (err, data) {
		if (err) throw err;
		response.end(data);
	});
});

server.listen(8080);

console.log("Server started");