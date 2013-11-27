// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
(function () {
	"use strict";

	var http = require("http");
	var fs = require("fs");
	var assert = require("assert");
	var send = require("send");

	var server;

	var CONTENT_DIR = "generated/test";

	var INDEX_PAGE = "index.html";
	var NOT_FOUND_PAGE = "test404.html";

	var INDEX_PAGE_DATA = "This is index page file";

	var PORT = 5020;
	var BASE_URL = "http://localhost:" + PORT;

	exports.unifiedTestCase = function (test) {
		server = http.createServer();
		server.on("request", function(request, response) {
			send(request, request.url).
					root(CONTENT_DIR).
					on("error", handleError).
					pipe(response);

			function handleError(err) {
				if (err.status === 404) serveErrorFile(response, 404, CONTENT_DIR + "/" + NOT_FOUND_PAGE);
				else throw err;
			}
		});
		server.listen(PORT, function() {

			var path = CONTENT_DIR + "/" + INDEX_PAGE;
			fs.writeFileSync(path, INDEX_PAGE_DATA);

			httpGet(BASE_URL + "/" + INDEX_PAGE, function (response, responseData) {
				fs.unlinkSync(path);
				//			fs.unlink(path, function() {
				fs.writeFileSync(path, INDEX_PAGE_DATA);
				test.done();
				//			});
			});


		});

	};

	function httpGet(url, callback) {
		http.get(url, function (response) {
			var receivedData = "";
			response.setEncoding("utf8");

			response.on("data", function (chunk) {
				receivedData += chunk;
			});
			response.on("error", function (err) {
				console.log("ERROR", err);
			});
			response.on("end", function () {
				server.close(function() {
					callback(response, receivedData);
				});
			});
		});
	}


	function serveErrorFile(response, statusCode, file) {
		response.statusCode = statusCode;
		fs.readFile(file, function(err, data) {
			if (err) throw err;
			response.end(data);
		});
	}


}());