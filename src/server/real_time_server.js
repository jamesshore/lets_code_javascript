// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var io = require('socket.io');
	var ClientPointerEvent = require("../shared/client_pointer_event.js");
	var ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	var ClientDrawEvent = require("../shared/client_draw_event.js");
	var ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");
	var EventRepository = require("./event_repository.js");
    var EventEmitter = require("../client/network/vendor/emitter-1.2.1.js");

	// Consider Jay Bazuzi's suggestions from E494 comments (direct connection from client to server when testing)
	// http://disq.us/p/1gobws6  http://www.letscodejavascript.com/v3/comments/live/494

	var RealTimeServer = module.exports = function RealTimeServer() {
		this._socketIoConnections = {};
	};

    RealTimeServer.prototype = Object.create(EventEmitter.prototype);

	RealTimeServer.prototype.start = function(httpServer) {
		this._ioServer = io(httpServer);

		trackSocketIoConnections(this._socketIoConnections, this._ioServer, this);
		handleSocketIoEvents(this, this._ioServer);
	};

	RealTimeServer.prototype.handleClientEvent = function(clientEvent, clientId) {
		var serverEvent = processClientEvent(this, clientEvent, clientId);
		this._ioServer.emit(serverEvent.name(), serverEvent.toSerializableObject());
	};

	RealTimeServer.prototype.numberOfActiveConnections = function() {
		return Object.keys(this._socketIoConnections).length;
	};

	function trackSocketIoConnections(connections, ioServer, self) {
		// Inspired by isaacs https://github.com/isaacs/server-destroy/commit/71f1a988e1b05c395e879b18b850713d1774fa92
		ioServer.on("connection", function(socket) {
			var key = socket.id;
			connections[key] = socket;
            socket.on("disconnect", function() {
				delete connections[key];

                if (self.numberOfActiveConnections() === 0)
                    self.emit('disconnect_all');
			});
		});
	}

	function processClientEvent(self, clientEvent, clientId) {
		var serverEvent = clientEvent.toServerEvent(clientId);
		self._eventRepo.store(serverEvent);
		return serverEvent;
	}

	function handleSocketIoEvents(self, ioServer) {
		self._eventRepo = new EventRepository();

		ioServer.on("connect", function(socket) {
			replayPreviousEvents(self, socket);
			handleClientEvents(self, socket);
		});
	}

	function replayPreviousEvents(self, socket) {
		self._eventRepo.replay().forEach(function(event) {
			socket.emit(event.name(), event.toSerializableObject());
		});
	}

	function handleClientEvents(self, socket) {
		var supportedEvents = [
			ClientPointerEvent,
			ClientRemovePointerEvent,
			ClientDrawEvent,
			ClientClearScreenEvent
		];

		supportedEvents.forEach(function(eventConstructor) {
			socket.on(eventConstructor.EVENT_NAME, function(eventData) {
				var clientEvent = eventConstructor.fromSerializableObject(eventData);
				var serverEvent = processClientEvent(self, clientEvent, socket.id);
				socket.broadcast.emit(serverEvent.name(), serverEvent.toSerializableObject());
			});
		});
	}

}());