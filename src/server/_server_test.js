// Copyright (c) 2012 Titanium I.T. LLC. All rights reserved. See LICENSE.txt for details.
"use strict";

var server = require("./server.js");

exports.testNothing = function(test) {
	test.equals(3, server.number(), "number");
	test.done();
};