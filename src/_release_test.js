// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*jshint regexp:false*/

(function() {
	"use strict";

	var jake = require("jake");
	var child_process = require("child_process");
	var http = require("http");
	var fs = require("fs");
	var procfile = require("procfile");
	var child;

	exports.test_isOnWeb = function(test) {
		httpGet("http://weewikipaint.herokuapp.com", function(response, receivedData) {
			var foundHomePage = receivedData.indexOf("WeeWikiPaint home page") !== -1;
			test.ok(foundHomePage, "home page should have contained test marker");
			test.done();
		});
	};

	function httpGet(url, callback) {
		var request = http.get(url);
		request.on("response", function(response) {
			var receivedData = "";
			response.setEncoding("utf8");

			response.on("data", function(chunk) {
				receivedData += chunk;
			});
			response.on("end", function() {
				callback(response, receivedData);
			});
		});
	}

}());