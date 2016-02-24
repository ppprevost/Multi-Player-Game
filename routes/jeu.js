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
		var Camion = {
			y: 200,
			step: Math.round(Math.random() + 1),
			x: 520,
			id: 'elCamionDeLaMuerte',
			width: 40,
			className: 'camion',
			height: 40,
			position: 'absolute',
			animationCamion: function() {
				var that = this;
				setInterval(function() {
					that.y + 10;
					that.x + that.tabPosition[that.choice];
					that.height = that.height + 0.9;
          that.width = that.width + 1;
          io.sockets.in(socket.room.name).emit('majTruck',that)
					if (that.y + that.height >= 600) { // position basse de la div jeu
						that.y = 200;
						that.width = 40;
						that.height = 40;
						that.x = 520;
					}
				}, 16);
			},
			tabPosition: [-1, 0, 1, 2],
			choice: Math.round(Math.random() * 4)
		};
		console.log('connéecté');
		// ObjCamion.creation().moveObstacle();
		socket.on('adduser', function(data) {
			// store the username in the socket session for this client
			socket.username = data.prompt;
			socket.screenHeight = data.windowX;
			socket.screenWidth = data.windowY;
			socket.score = data.score = 0;
			// store the room name in the socket session for this client
			// socket.room;
			// add the client's username to the global list
			usernames[socket.username] = data.prompt;

			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].profil.length < 2) {
					rooms[i].profil.push(data.prompt);
					socket.room = rooms[i];

					break;
				}
			}
			// send client to room 1
			socket.join(socket.room.name);
			//launch the party
			// var messageWait = 'En attente';
			// io.sockets.in(socket.room.name).emit('global',messageWait);
			if (socket.room.profil.length == 2) {
				// messageWait ='GO GO GO' ;
				io.sockets.in(socket.room.name).emit('newTruck', Camion);
				Camion.animationCamion()
				// socket.emit('global',messageWait);
			}

			// echo to client they've connected
			socket.emit('updatechat', 'Server', 'you have connected to ' + socket.room.name, socket.room.name);
			// echo to room 1 that a person has connected to their room
			socket.broadcast.to(socket.room.name).emit('updatechat', 'Server', socket.username + ' has connected to this room');
			var randomColor = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";

			var carre = {
				top: 500,
				left: 480,
				id: socket.id,
				score: socket.score,
				name: socket.username,
				width: 70,
				height: 100,
				position: 'absolute',
				backgroundColor: randomColor,
			};

			carres[carre.id] = carre;

			// mon carré
			socket.emit('creerMonCarre', carre, socket.username, socket.score);
			//celui de tout ceux connécté
			io.sockets.in(socket.room.name).emit('creerLesAutresCarres', carres);
			//envoyé mon carré a tous ceux connecté
			socket.broadcast.to(socket.room.name).emit('creerSonCarre', carre);
			// enregisntre les dernieres positions de tous les carré
			socket.on('changerPositionnementDeMonCarre', function(data) {
				if (carres[data.id]) {
					carres[data.id].top = data.top;
					carres[data.id].left = data.left;
				}
				socket.broadcast.to(socket.room.name).emit('changerPositionnementDeSonCarre', data);
			});

			socket.on('collision', function(data) {
				if (carres[data.id]) {
					carres[data.id].top = data.top;
					carres[data.id].left = data.left;
				}
				console.log(carres[data.id].left)
				var checkCollision = function() {
					var colisionData = {
						collisionUsername: socket.username,
						message: 'New Collision Man ! ',
						score: -10
					}

					if (carres[data.id].top + carres[data.id].height >= Camion.y + Camion.height && carres[data.id].top <= Camion.y + Camion.height && carres[data.id].left + carres[data.id].width >= Camion.x && carres[data.id].left + carres[data.id].width <= Camion.x + Camion.width) {
						io.sockets.in(socket.room.name).emit('updatechat', socket.username, 'collision');

					}
				};
				// setInterval(checkCollision, 500);
				checkCollision();
			});

			socket.on('majTruck', function(data) {
				Camion.x = data.x;
				Camion.y = data.y;
				Camion.width = data.width;
				Camion.height = data.height;
				Camion.random = Math.round(Math.random() * 4)

			});

		}); // connection

		socket.on('sendchat', function(data) {
			// we tell the client to execute 'updatechat' with 2 parameters
			io.sockets.in(socket.room.name).emit('updatechat', socket.username, data);
		});

		//when the user disconnects.. perform this
		socket.on('disconnect', function() {
			console.log('passé par déconnection')
			if (socket.room) {
				for (var i = 0; i < 2; i++) {
					if (socket.username == socket.room.profil[i]) {
						socket.room.profil.splice(i, 1);
					}
				}
			}
			for (index in carres) {
				if (!io.sockets.connected[carres[index].id]) {
					io.emit('detruireCarre', carres[index]);
					delete carres[index];
				}
			}
			// remove the username from global usernames list

			socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
			// socket.leave(socket.room.name);
			// delete usernames[socket.username];
			// update list of users in chat, client-side
			delete socket.username;
		});

	});

	return router; // pour express do not touch
}