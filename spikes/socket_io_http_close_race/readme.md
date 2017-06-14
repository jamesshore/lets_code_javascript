Code to reproduce client-side race condition in Socket.IO.

The issue:

1. Open a Socket.IO connection to the server
2. Immediately after the client-side "connect" event has fired, close the connection
3. Immediately shutdown the server using httpServer.close().
4. Socket.IO opens several HTTP connections, but doesn't close them all, causing server to hang

To try it:

1. Run `node spikes/socket_io_http_close_race/run.js`

