Code to reproduce client-side race condition in Socket.IO.

The issue:

1. Open a Socket.IO connection to the server
2. After the server connects, but before the client-side "connect" event has fired, close the client connection.
3. Socket.IO never tells the server that the connection has closed.
4. The code hangs rather than exiting cleanly because the server connection isn't closed.


To try it:

1. Run `node spikes/socket_io_client_close_race/run.js`
