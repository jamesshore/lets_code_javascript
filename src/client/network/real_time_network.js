// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	exports.connect = function(port, callback) {
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + port;
		var socket = io(origin);

		socket.on("connect", function() {
			callback(socket.id);
		});
	};

}());