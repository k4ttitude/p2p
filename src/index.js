var io = require('socket.io-client');
var socket = io();

var username;
var _roomId;

socket.on('message', data => {
    console.log(data);
    let li = document.createElement('li');
    let b = document.createElement('b');
    b.append(`${data.username}: `);
    li.append(b);
    li.append(data.message);
    $("#chat-content").append(li);
});

socket.on('joined-room', roomId => {
    let li = document.createElement('li');
    let b = document.createElement('b');
    b.append(`You've joined room ${roomId}.`);
    li.append(b);
    $("#chat-content").append(li);
    _roomId = roomId;
    console.log(`joined room ${roomId}`);
});

$(document).ready(() => {
    $('#send').click(() => {
        let msg = $('#msg').val();
        if (_roomId && _roomId != null)
            socket.emit('message', { username: username, message: msg, roomId: _roomId });
        else
            socket.emit('message', { username: username, message: msg });
        $('#msg').val('');
    });

    $('#join').click(() => {
        username = $('#username').val();
        $('#username').prop('disabled', true);
        $('#join').prop('disabled', true);
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