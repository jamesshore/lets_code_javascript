// Copyright (c) 2015-2016 Titanium I.T. LLC. All rights reserved. For license, see "README" or "LICENSE" file.
/* global io:false, $:false */
(function() {
	"use strict";

	exports.endpoints = {
		IS_CONNECTED: "/is-connected",
		WAIT_FOR_SERVER_DISCONNECT: "/wait-for-server-disconnect",

		SEND_EVENT: "/send-event",
		WAIT_FOR_EVENT: "/wait-for-event",

		// obsolete
		WAIT_FOR_POINTER_LOCATION: "/wait-for-pointer-location"
	};

	exports.PORT = "5030";

}());