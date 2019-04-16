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
// Logs
const CoreLogger = require('core-logger');
var logger = new CoreLogger({ label: "socket.io-p2p-room-server" });

const maxRoomClients = 5;

/* Socket.io */
io.on('connection', socket => {

    socket.on('create-room', roomId => {
        logger.info('createdRoom', { roomId: roomId });
        p2pserver(socket, {}, { name: roomId });
        socket.emit('createdRoom', {roomId: roomId});
    });

    socket.on('join-room', roomId => {
        logger.info('attemping to join room', { userId: socket.id, roomId: roomId });
        if (roomId in io.sockets.adapter.rooms) {
            var room = io.sockets.adapter.rooms[roomId];
            var numClients = Object.keys(room).length;
            if (numClients >= maxRoomClients) {
                logger.info('room is full', { userId: socket.id, roomId: roomId });
                socket.emit('full-room');
            } else {
                socket.join(room);
                p2pserver(socket, null, { name: roomId });
                logger.info('room joined', {
                    userId: socket.id,
                    roomId: roomId,
                    numClients: numClients
                });
            }
        } else {
            socket.emit('invalid-room');
        }
    });

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