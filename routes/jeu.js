module.exports = function(io) {
	var app = require('express');
	var router = app.Router();
	var carres = {};
	router.get('/', function(req, res, next) {
		res.render('jeu', {
			title: 'Un test'
		})
	});
	// usernames which are currently connected to the chat
	var usernames = {};
	// rooms which are currently available in chat
	var rooms = [{
		name: 'room1',
		profil: []
	}, {
		name: 'room2',
		profil: []
	}, {
		name: 'room3',
		profil: []
	}];
	var carres = {};

	io.sockets.on('connection', function(socket) {
		console.log('connéecté');
		// ObjCamion.creation().moveObstacle();
		socket.on('adduser', function(username, screenWidth, screenHeight, score) {

			// store the username in the socket session for this client
			socket.username = username;
			socket.screenHeight = screenHeight;
			socket.screenWidth = screenWidth;

			socket.score = score = 0;
			// store the room name in the socket session for this client
			socket.room;
			// add the client's username to the global list
			usernames[username] = username;

			var Camion = {
				y: 200,
				step: Math.round(Math.random()+1),
				x: 520,
				id: socket.id,
				width: 40,
				className:'camion',
				height: 40,
				position: 'absolute',
			};

			socket.on('majTruck', function(data){
				Camion.x = data.x;
				Camion.y = data.y;
				Camion.width = data.width;
				Camion.height = data.height;
				//apelez une fonction de check collision
			})

			var checkCollision = function(){
if (carres[data.id].left + carres[data.id].width >= Camion.x && carres[data.id].left + carres[data.id].width <= Camion.x + Camion.width) {
	io.sockets.in(socket.room.name).emit('collision', 'new collision')
}

			};

			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].profil.length < 2) {
					rooms[i].profil.push(username)
					socket.room = rooms[i];
					break;
				}
			}
			// send client to room 1
			socket.join(socket.room.name);
			//launch the party
			var messageWait = 'En attente d\'un autre joueur';
			io.sockets.in(socket.room.name).emit('global',messageWait);
			if (socket.room.profil.length == 2) {
				messageWait ='Let\'s Go' ;
				io.sockets.in(socket.room.name).emit('newTruck', Camion);
				// io.sockets.in(socket.room.name).emit('global',messageWait);
			} 

			console.log(socket.room.name + socket.room.profil.length)
			// echo to client they've connected
			socket.emit('updatechat', 'SERVER', 'you have connected to ' + socket.room.name, socket.room.name);
			// echo to room 1 that a person has connected to their room
			socket.broadcast.to(socket.room.name).emit('updatechat', 'SERVER', username + ' has connected to this room');
			var randomColor = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";

			var carre = {
				top: 500,
				left: 480,
				id: 'moto-'+socket.username,
				score: socket.score,
				name: socket.username,
				width: '70px',
				height: '100px',
				position: 'absolute',
				backgroundColor: randomColor,
			};

			carres[carre.id] = carre;

			// mon carré
			socket.emit('creerMonCarre', carre, socket.username, socket.score);
			//celui de tout ceux connécté
			socket.emit('creerLesAutresCarres', carres);
			//envoyé mon carré a tous ceux connecté
			socket.broadcast.to(socket.room.name).emit('creerSonCarre', carre);
			// enregisntre les dernieres positions de tous les carré
			socket.on('changerPositionnementDeMonCarre', function(data) {
				if (carres[data.id]) {
					carres[data.id].top = data.top;
					carres[data.id].left = data.left;
				}
				console.log(data)

				socket.broadcast.to(socket.room.name).emit('changerPositionnementDeSonCarre', data);
			});

		});

		socket.on('sendchat', function(data) {

			// we tell the client to execute 'updatechat' with 2 parameters
			io.sockets.in(socket.room.name).emit('updatechat', socket.username, data);
		});

		// when the user disconnects.. perform this
		socket.on('disconnect', function() {
			// remove the username from global usernames list
			io.sockets.emit('updateusers', usernames);
			// echo globally that this client has left
			socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
			socket.leave(socket.room);
			// delete usernames[socket.username];
			// update list of users in chat, client-side

			for (var i = 0; i < socket.room.profil.length; i++) {
				socket.room.profil.splice(i, 1);
			}
			console.log(socket.room)
			setInterval(function() {
				for (index in carres) {
					if (!io.sockets.connected[carres[index].id]) {
						io.emit('detruireCarre', carres[index]);
						delete carres[index];
					};
				}
			}, 1000);
		});

	});

	return router; // pour express do not touch
}