Code to reproduce client-side race condition in Socket.IO.

The issue:

1. Open a Socket.IO connection to the server
2. After the server connects, but before the client-side "connect" event has fired, close the client connection.
3. Socket.IO never shuts down the connection.


To try it:

1. Run `node spikes/socket_io_client_close_race/run.js`


Reported on socketio/socket.io-client GitHub as issue #1133:
https://github.com/socketio/socket.io-client/issues/1133