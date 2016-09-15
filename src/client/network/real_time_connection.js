// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	var failFast = require("../../shared/fail_fast.js");
	var NetworkPointerEvent = require("../../shared/network_pointer_event.js");

	var Connection = module.exports = function RealTimeConnection() {
		this._connectCalled = false;
		this._socket = null;
	};

	Connection.prototype.connect = function connect(port, callback) {
		this._connectCalled = true;
		var origin = window.location.protocol + "//" + window.location.hostname + ":" + port;
		this._socket = io(origin);

		if (callback !== undefined) this._socket.on("connect", function() {
			return callback(null);
		});
	};

	Connection.prototype.disconnect = function disconnect(callback) {
		failFastUnlessConnectCalled(this);

		this._socket.on("disconnect", function() {
			return callback(null);
		});
		this._socket.close();
	};

	Connection.prototype.sendPointerLocation = function sendPointerLocation(x, y) {
		failFastUnlessConnectCalled(this);
		this._socket.emit("mouse", { x: x, y: y });
	};

	Connection.prototype.onPointerLocation = function onPointerLocation(handler) {
		failFastUnlessConnectCalled(this);
		this._socket.on(NetworkPointerEvent.EVENT_NAME, function(eventData) {
			return handler(NetworkPointerEvent.fromObject(eventData));
		});
	};

	Connection.prototype.getSocketId = function getSocketId() {
		failFastUnlessConnectCalled(this);
		return this._socket.id;
	};

	Connection.prototype.isConnected = function isConnected() {
		return this._socket !== null && this._socket.connected;
	};

	function failFastUnlessConnectCalled(self) {
		failFast.unlessTrue(self._connectCalled, "Connection used before connect() called");
	}

}());