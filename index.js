// Setting up express server
var express=require('express');
var app=express();
var path=require('path');
var server=require('http').createServer(app);
var io=require('socket.io')(server);
var port=process.env.PORT || 3000;
var fs=require('fs');


// Listening
server.listen(port, function() {
	console.log("Serving at %d.", port);
	fs.writeFile(__dirname+'/start.log', 'started');
});

// Routes
app.use(express.static(path.join(__dirname, 'public')));


// Chat Room
var numUsers=0;

io.on('connection', function(socket) {
	var addedUser=false;

	socket.on('new message', function (data) {
		socket.broadcast.emit('new message', {
			username: socket.username,
			message: data
		});
	});

	socket.on('add user', function (username) {
		if (addedUser) return;

		socket.username=username;
		++numUsers;
		addedUser=true;
		socket.emit('login', {numUsers: numUsers});
		socket.broadcast.emit('user joined', {
			username: socket.username,
			numUsers: numUsers
		});
	});

	socket.on('typing', function() {
		socket.broadcast.emit('typing', {
			username: socket.username
		});
	});

	socket.on('stop typing', function () {
		socket.broadcast.emit('stop typing', {
			username: socket.username
		});
	});

	socket.on('disconnect', function () {
		if (addedUser) {
			--numUsers;

			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers
			});
		}
	});
});
