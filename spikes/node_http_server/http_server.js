// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.

// This is a simple spike of Node's HTTP module. The goal was to show
// how to serve a very simple HTML page using Node.
// It's not robust and it reflects a very basic understanding of node; use it
// as a starting point, not a production-quality example.
"use strict";

var http = require("http");

var server = http.createServer();

server.on("request", function(request, response) {
	console.log("Received request");

	var body = "<html><head><title>Node HTTP Spike</title></head>" +
			"<body><p>This is a spike of Node's HTTP server.</p></body></html>";

	// The following two approaches are equivalent:
	// The verbose way...
//	response.statusCode = 200;
//	response.write(body);
//	response.end();

	// The concise way...
	response.end(body);
});

server.listen(8080);

console.log("Server started");