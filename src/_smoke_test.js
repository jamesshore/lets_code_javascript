// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
/*jshint regexp:false*/

(function() {
	"use strict";

	var child_process = require("child_process");
	var http = require("http");
	var phantomjs = require("phantomjs");
	var firefox = require("selenium-webdriver/firefox");

	var runServer = require("./_run_server.js");

	var HOME_PAGE_URL = "http://localhost:5000";

	var serverProcess;
	var driver;

	exports.test_setupOnce = function(test) {
		runServer.runProgrammatically(function(process) {
			serverProcess = process;

			driver = new firefox.Driver();

			test.done();
		});
	};

	exports.test_canGetHomePage = function(test) {
		httpGet(HOME_PAGE_URL, function(response, receivedData) {
			var foundHomePage = receivedData.indexOf("WeeWikiPaint home page") !== -1;
			test.ok(foundHomePage, "home page should have contained test marker");
			test.done();
		});
	};

	exports.test_canGet404Page = function(test) {
		httpGet(HOME_PAGE_URL + "/nonexistant.html", function(response, receivedData) {
			var foundHomePage = receivedData.indexOf("WeeWikiPaint 404 page") !== -1;
			test.ok(foundHomePage, "404 page should have contained test marker");
			test.done();
		});
	};

	exports.test_userCanDrawOnPage = function(test) {
		driver.get(HOME_PAGE_URL);

		driver.executeScript(function() {
			var client = require("./client.js");
			var HtmlElement = require("./html_element.js");

			var drawingArea = HtmlElement.fromId("drawing-area");
			drawingArea.triggerMouseDown(10, 20);
			drawingArea.triggerMouseMove(50, 60);
			drawingArea.triggerMouseUp(50, 60);

			return client.drawingAreaCanvas.lineSegments();
		}).then(function(lineSegments) {
			test.deepEqual(lineSegments, [[ "10", "20", "50", "60" ]]);
		});

		driver.controlFlow().execute(test.done);
	};

	exports.test_webFontsAreLoaded = function(test) {
		driver.get(HOME_PAGE_URL);



		driver.controlFlow().execute(test.done);
	};

	//exports.test_userCanDrawOnPage = function(test) {
	//	var phantomJsProcess = child_process.spawn(phantomjs.path, ["src/_phantomjs.js"], { stdio: "inherit" });
	//	phantomJsProcess.on("exit", function(code) {
	//		test.equals(code, 0, "PhantomJS test failures");
	//		test.done();
	//	});
	//};

	var tearDownNow = false;
	exports.test_tearDownOnce = function(test) {
		tearDownNow = true;
		test.done();
	};
	exports.tearDown = function(done) {
		if (!tearDownNow) return done();
		if (!serverProcess) return done();

		serverProcess.on("exit", function(code, signal) {
			driver.quit().then(done);
		});
		serverProcess.kill();
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