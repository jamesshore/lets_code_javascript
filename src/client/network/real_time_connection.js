// Copyright (c) 2015 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	var socket;

	var Connection = exports.Connection = function Connection() {
	};

	Connection.prototype.connect = function connect(port, callback) {
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + port;
		socket = io(origin);

		socket.on("connect", function() {
			return callback(socket.id);
		});
	};

	Connection.prototype.disconnect = function disconnect(callback) {
		socket.on("disconnect", function() {
			return callback();
		});
		socket.close();
	};

	Connection.prototype.sendPointerLocation = function sendPointerLocation(x, y) {
		socket.emit("mouse", { x: x, y: y });
	};

}());