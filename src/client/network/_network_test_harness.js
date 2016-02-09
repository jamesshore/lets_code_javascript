// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	exports.PORT = 5030;

	exports.startTestServer = function() {
		var io = require('socket.io')(5030);
		return io;
	};

	exports.stopTestServerFn = function (io, callback) {
		return function() {
			io.close();
			callback();
		};
	};

}());