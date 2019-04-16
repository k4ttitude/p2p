var P2P = require('socket.io-p2p');
var io = require('socket.io-client');
var socket = io();

var opts = { autoUpgrade: false, numClients: 10 };
var p2p = new P2P(socket, opts);

var username;
var priv = false;

p2p.on('ready', () => {
    // p2p.usePeerConnection = true;
    p2p.useSockets = true;
    p2p.emit('peer-obj', {peerId: peerId});
});

p2p.on('peer-msg', data => {
    console.log(data);
    let li = document.createElement('li');
    let b = document.createElement('b');
    b.append(`${data.username}: `);
    li.append(b);
    li.append(data.message);
    $("#chat-content").append(li);
});

p2p.on('go-private', data => {
    if (data.to == username || data.from == username) {
        goPrivate();
        let li = document.createElement('li');
        let b = document.createElement('b');
        let friendId = data.to == username ? data.from : data.to;
        b.append(`You and ${friendId} went private`);
        b.style.color = 'red';
        li.append(b);
        $("#chat-content").append(li);
    }
});

$(document).ready(() => {
    $('#send').click(() => {
        let msg = $('#msg').val();
        // if (priv)
            p2p.emit('peer-msg', { username: username, message: msg });
        // else
        //     socket.emit('peer-msg', { username: username, message: msg });
        $('#msg').val('');
    });

    $('#join').click(() => {
        username = $('#username').val();
        $('#username').prop('disabled', true);
        $('#join').prop('disabled', true);
    });

    $('#go-private').click(() => {
        let friendId = $('#friendId').val();
        socket.emit('go-private', { username: username, friendId: friendId });
        // goPrivate();
    });

    $('#create-room').click(() => {
        let roomId = $('#roomId').val();
        socket.emit('create-room', roomId);
    });

    $('#join-room').click(() => {
        let roomId = $('#roomId').val();
        socket.emit('join-room', roomId);
    });    
});

function goPrivate() {
    // p2p.upgrade();
    p2p.useSockets = false;
    priv = true;
    $("#go-private").prop('disabled', true);
    $("#friendId").prop('disabled', true);
}