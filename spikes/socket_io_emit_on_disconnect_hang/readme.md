An attempt to reproduce a client-side hang with Socket.IO.

The issue was that our tests were failing to exit. This code was an attempt to reproduce the issue. Although we *did* find a "didn't exit" problem, it isn't the same as the one we were seeing in our tests. In fact, I think it may be the same as the `socket_io_client_close_race` spike, reported as https://github.com/socketio/socket.io-client/issues/1133.

Ultimately, we fixed our tests by having it open sockets sequentially rather than in parallel.