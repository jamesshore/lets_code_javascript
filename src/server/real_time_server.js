// Copyright (c) 2017 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
(function() {
	"use strict";

	var io = require('socket.io');
	var ClientPointerEvent = require("../shared/client_pointer_event.js");
	var ClientRemovePointerEvent = require("../shared/client_remove_pointer_event.js");
	var ClientDrawEvent = require("../shared/client_draw_event.js");
	var ClientClearScreenEvent = require("../shared/client_clear_screen_event.js");
	var EventRepository = require("./event_repository.js");

	var RealTimeServer = module.exports = function RealTimeServer() {};

	RealTimeServer.prototype.start = function(httpServer) {
		this._ioServer = io(httpServer);
		handleSocketIoEvents(this, this._ioServer);
	};

	function handleSocketIoEvents(self, ioServer) {
		self._eventRepo = new EventRepository();

		ioServer.on("connect", function(socket) {
			replayPreviousEvents(self, socket);
			reflectClientEventsWithId(self, socket);
			reflectClientEventsWithoutId(self, socket);
		});
	}

	function replayPreviousEvents(self, socket) {
		self._eventRepo.replay().forEach(function(event) {
			socket.emit(event.name(), event.toSerializableObject());
		});
	}

	function reflectClientEventsWithId(self, socket) {
		var supportedEvents = [
			ClientPointerEvent,
			ClientRemovePointerEvent
		];

		supportedEvents.forEach(function(eventConstructor) {
			socket.on(eventConstructor.EVENT_NAME, function(eventData) {
				var clientEvent = eventConstructor.fromSerializableObject(eventData);
				var serverEvent = clientEvent.toServerEvent(socket.id);
				self._eventRepo.store(serverEvent);
				socket.broadcast.emit(serverEvent.name(), serverEvent.toSerializableObject());
			});
		});
	}

	function reflectClientEventsWithoutId(self, socket) {
		var supportedEvents = [
			ClientDrawEvent,
			ClientClearScreenEvent
		];

		supportedEvents.forEach(function(eventConstructor) {
			socket.on(eventConstructor.EVENT_NAME, function(eventData) {
				var clientEvent = eventConstructor.fromSerializableObject(eventData);
				var serverEvent = clientEvent.toServerEvent();
				self._eventRepo.store(serverEvent);
				socket.broadcast.emit(serverEvent.name(), serverEvent.toSerializableObject());
			});
		});
	}

}());