const express = require('express');
const app = express();
// Body Parser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
// Server
const server = require('http').Server(app);
const p2pserver = require('socket.io-p2p-server').Server;
const io = require('socket.io')(server);
const port = 2309;
io.use(p2pserver);
server.listen(port, () => console.log(`Server listening on port ${port}...`));
// Routing
const path = require('path');
global.appRoot = path.resolve(__dirname);
app.use(express.static(path.join(__dirname, 'dist')));

/* Socket.io */
io.on('connection', socket => {

    // clients[socket.id] = socket;
    // socket.join(roomName);
    // p2p(socket, null, room);

    socket.on('peer-msg', data => {
        // socket.broadcast.emit('message', { username: data.username, message: data.message });
        io.emit('peer-msg', { username: data.username, message: data.message });
        console.log(`${data.username} says: "${data.message}"`);
    });

    socket.on('go-private', data => {
        io.emit('go-private', { to: data.friendId, from: data.username });
        // socket.broadcast.emit('go-private', { to: data.friendId, from: data.username });
        console.log(`${data.friendId} & ${data.username} went private`);
    });
});

/* APIs */
app.get('/', (req, res) => {
    res.sendFile(`${appRoot}/dist/index.html`);
});