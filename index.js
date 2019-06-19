'use strict';
global.__basedir = __dirname
const express = require('express');
const app = express();
const path = require('path');
const logger = require('./lib/logger')
const config = require('./lib/config')
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mongodb = require('./lib/mongoose-connection')
global.dbConnection = mongodb.connect(config.mongoose.dbUrl, config.mongoose.options)
const Message = require('./models/message');

app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => {
	console.log(`Internal server error - request-id: ${req.id} - Error: ${err.stack}`)
	res.status(500).json({
		error: 'Internal Server Error',
		message: err.message
	})
})

server.listen(config.PORT, () => console.log(`App listening on port ${config.PORT}!`))

var numUsers = 0;
var userLists = {};

io.on('connection', (socket) => {
	var addedUser = false;

	// when the client emits 'new message', this listens and executes
	socket.on('new message', (data) => {
		console.log('new message')

		let msg = new Message();
		msg.username = socket.username;
		msg.send_to = data.send_to;
		msg.message = data.message;
		msg.save();
		console.log('data', data)
		
		// we tell the client to execute 'new message'
		// socket.broadcast.emit('new message', {
		// 	username: socket.username,
		// 	message: data.message
		// });

		//send message to target user
		socket.broadcast.to(userLists[data.send_to].socket_id).emit('new message', {
			username: socket.username,
			message: data.message
		});
	});

	// when the client emits 'add user', this listens and executes
	socket.on('add user', (username) => {
		if (addedUser) return;

		// we store the username in the socket session for this client
		socket.username = username;
		++numUsers;

		console.log('username', username)
		console.log('socket ID', socket.id)
		if ( Object.keys(userLists).indexOf(username) == -1) {
			userLists[username] = {
				socket_id: socket.id
			}
		}
		
		addedUser = true;
		socket.emit('login', {
			numUsers: numUsers,
			userLists: userLists
		});
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('user joined', {
			username: socket.username,
			numUsers: numUsers,
			userLists: userLists
		});
	});

	socket.on('chat to', async (send_to) => {
		console.log('chat to', send_to)
		let data = await Message.find({ $or : [
				{username: socket.username, send_to: send_to},
				{username: send_to, send_to: socket.username}
			]}).sort({create_at: 1}).exec();
		console.log('data', data);
		console.log('socket_id', socket.id)
		//send history message to user
		socket.emit('history', data);
	});

	// when the client emits 'typing', we broadcast it to others
	socket.on('typing', () => {
		socket.broadcast.emit('typing', {
			username: socket.username
		});
	});

	// when the client emits 'stop typing', we broadcast it to others
	socket.on('stop typing', () => {
		socket.broadcast.emit('stop typing', {
			username: socket.username
		});
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', () => {
		if (addedUser) {
			--numUsers;

			logger.info('disconnect::' + socket.username)

			console.log('userLists', userLists)
			if(Object.keys(userLists).indexOf(socket.username) != -1) {
				delete userLists[socket.username];
			}
			console.log('userLists', userLists)

			// echo globally that this client has left
			socket.broadcast.emit('user left', {
				username: socket.username,
				numUsers: numUsers,
				userLists: userLists
			});
		}
	});
});