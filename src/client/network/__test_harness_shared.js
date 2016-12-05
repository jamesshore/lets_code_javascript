// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false, $:false */
(function() {
	"use strict";

	exports.endpoints = {
		IS_CONNECTED: "/is-connected",
		WAIT_FOR_SERVER_DISCONNECT: "/wait-for-server-disconnect",
		WAIT_FOR_POINTER_LOCATION: "/wait-for-pointer-location",
		SEND_POINTER_LOCATION: "/send-pointer-location",
		WAIT_FOR_DRAW_EVENT: "/wait-for-draw-event"
	};

	exports.PORT = "5030";

}());