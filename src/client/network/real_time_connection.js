// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false */
(function() {
	"use strict";

	var failFast = require("fail_fast");
	var ServerPointerEvent = require("../../shared/server_pointer_event.js");
	var ClientPointerEvent = require("../../shared/client_pointer_event.js");

	var _isNull = false;

	var Connection = module.exports = function() {
		this._connectCalled = false;
		this._socket = null;
	};

	Connection.createNull = function() {
		var connection = new Connection();
		connection._isNull = true;
		return connection;
	};

	Connection.prototype.connect = function(port, callback) {
		this._connectCalled = true;
		if (this._isNull) return callback(null);

		var origin = window.location.protocol + "//" + window.location.hostname + ":" + port;
		this._socket = io(origin);

		if (callback !== undefined) this._socket.on("connect", function() {
			return callback(null);
		});
	};

	Connection.prototype.disconnect = function(callback) {
		failFastUnlessConnectCalled(this);
		if (this._isNull) return callback(null);

		this._socket.on("disconnect", function() {
			return callback(null);
		});
		this._socket.close();
	};

	Connection.prototype.sendPointerLocation = function(x, y) {
		failFastUnlessConnectCalled(this);
		this._socket.emit(ClientPointerEvent.EVENT_NAME, new ClientPointerEvent(x, y).toSerializableObject());
	};

	Connection.prototype.onPointerLocation = function(handler) {
		failFastUnlessConnectCalled(this);
		this._socket.on(ServerPointerEvent.EVENT_NAME, function(eventData) {
			return handler(ServerPointerEvent.fromSerializableObject(eventData));
		});
	};

	Connection.prototype.getSocketId = function() {
		failFastUnlessConnectCalled(this);
		if (this._isNull) return "NullConnection";

		return this._socket.id;
	};

	Connection.prototype.isConnected = function() {
		return this._socket !== null && this._socket.connected;
	};

	function failFastUnlessConnectCalled(self) {
		failFast.unlessTrue(self._connectCalled, "Connection used before connect() called");
	}

}());