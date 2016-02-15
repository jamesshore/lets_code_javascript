// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	var socket;

	exports.connect = function(port, callback) {
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + port;
		socket = io(origin);

		socket.on("connect", function() {
			return callback(socket.id);
		});
	};

	exports.disconnect = function(callback) {
		socket.on("disconnect", function() {
			return callback();
		});
		socket.close();
	};

}());