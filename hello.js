// Copyright (c) 2013 Titanium I.T. LLC. All rights reserved. See LICENSE.TXT for details.
(function() {
	"use strict";

	var page = require("webpage").create();

	console.log("Hello world");

	page.open("http://google.com", function(success) {
		console.log("Success: " + success);
		page.render("google.png");
		phantom.exit();
	});

}());