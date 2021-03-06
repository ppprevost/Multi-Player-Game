(function (window, io) {
    window.addEventListener('DOMContentLoaded', function () {

        var httpPort = 'http://192.168.104.177:3000' || ''
        /* var socket = io('http://ppprevost-javascript.herokuapp.com');*/
        var socket = io('http://192.168.1.77:3000')
        var game = document.getElementById('game');
        $('.explanation').click(function () {
            swal({
                title: "Let's get back to Texas!",
                imageUrl: 'images/truck.png',
                text: 'Drive and be Free but be careful to these boring trucks ! Wait for your opponent and win 600 points before him ! Good luck !'
            });
        })
        socket.on('connect', function () {
            // call the server-side function 'adduser' and send one parameter (value of prompt)

        });
        $('#validationName').on("submit", function (e) {

            e.preventDefault();


            if ($('#surname').val() == "") {
                swal('Hey What\'s your name?')

            } else {
                var name = $('#surname').val()
                var obj = {
                    prompt: name,
                    windowX: window.innerWidth,
                    windowY: window.innerHeight
                };
                socket.emit('adduser', obj);
                name = $('#surname').val('');
                $(".removeClass").fadeOut(1000, function () {
                    $(this).remove();
                });
                $('.introImage').hide("explode", {pieces: 16}, 2000, function () {
                    this.remove();
                    $('.explanation').remove();
                    $("#chat").fadeIn(1000)
                })
            }
        });

        //////////
        //Affichage //
        //////////

        socket.on('affichage', function (data) {
            console.log(data)

            $('#rooms').html('<p>' + data.room + '</p>');
            $('#users').html('');
            for (var i = 0; i < data.username.length; i++) {
                $('#users').append('<p>Moto' + [i + 1] + ': ' + data.username[i] + '</p>');
            }
            ;
        });

        socket.on('majScore', function (data) {
            $('#score').html('<p>Score : ' + data + '</p>')

        })

        socket.on('global', function (data) {
            $('#nameUtil').fadeIn(200, function () {
                $(this).html('<p> Le joueur : ' + data + 'a été touché !</p>').fadeOut();
            });
        });

        /////////
        //Chat //
        /////////

        // listener, whenever the server emits 'updatechat', this updates the chat body
        socket.on('updatechat', function (username, data) {
            $('#conversation').append('<b>' + username + ':</b> ' + data + '<br>');
        });

        // on load of page
        $(function () {
            // when the client clicks SEND
            $('#datasend').click(function () {
                var message = $('#data').val();
                // tell server to execute 'sendchat' and send along one parameter
                if ($('#data').val() != "") {
                    socket.emit('sendchat', message);
                }
                $('#data').val('');
            });
            // when the client hits ENTER on their keyboard
            $('#data').keypress(function (e) {
                if (e.which == 13) {
                    $(this).blur();
                    $('#datasend').focus().click();
                }
            });
        });

        ///////////
        //////////////
        ////Game // //
        //////////////
        ///////////

        //////////
        //Truck //
        //////////

        socket.on('newTruck', function (data) {
            // var CamionElement = document.getElementById(data.id);
            // console.log('test')
            var CamionElement = document.getElementById(data.id)
            if (!CamionElement) {
                var CamionElement = document.createElement('img');
                CamionElement.id = data.id;
                game.appendChild(CamionElement)
            }

            data.creation = function () {
                CamionElement.setAttribute('src', 'images/truck.png');
                CamionElement.style.top = data.y + "px";
                CamionElement.className = data.className;
                CamionElement.style.left = data.x + 'px';
                CamionElement.style.height = data.height + "px";
                CamionElement.style.width = data.width + "px";
                CamionElement.style.position = data.position;
            };

            data.creation();

            socket.on('majTruck', function (data, hh) {
                // var CamionElement = document.getElementById(data.id);
                CamionElement.style.left = data.x + 'px';
                CamionElement.style.top = data.y + 'px';
                CamionElement.style.width = data.width + 'px';
                CamionElement.style.height = data.height + 'px';

                socket.emit('newCoor');
            });

        });
        //////////
        //carre //
        //////////
        socket.on('creerLesAutresCarres', function (data) {
            for (var index in data) {

                var HTMLDivElement = window.document.getElementById(data[index].id);
                if (!HTMLDivElement) {
                    var HTMLDivElement = window.document.createElement('div');
                    HTMLDivElement.id = data[index].id;
                    game.appendChild(HTMLDivElement);
                }

                HTMLDivElement.style.top = data[index].top;
                HTMLDivElement.style.left = data[index].left;
                HTMLDivElement.style.width = data[index].width;
                HTMLDivElement.style.height = data[index].height;
                HTMLDivElement.style.position = data[index].position;
                HTMLDivElement.style.backgroundColor = data[index].backgroundColor;
                $(HTMLDivElement).append('<p>' + data[index].name + '</p>') // permet au premiers joueurs de voir le numéro des joueur qui se connectent après
            }

        });

        socket.on('detruireCarre', function (data, utilisateur) { // apres une déconnection
            var HTMLDivElement = window.document.getElementById(data.id);
            console.log(data)
            if (HTMLDivElement) {
                HTMLDivElement.remove();
            }
            ;
            $("#myModal").modal('show');
            var CamionElement = data ? document.getElementById(data.id) : null;
            if (CamionElement) {
                CamionElement.remove();
            }
            $('.modal-title').html('Sorry ' + data.name + ' has disconnected')
        });

        //creer n'importe quel carré
        socket.on('creerMonCarre', function (data, username, score) {

            var HTMLDivElement = window.document.getElementById(data.id);
            $(HTMLDivElement).append('<p>' + data.name + '</p>') // seul l'utilisateur voit ca

            if (!HTMLDivElement) {
                var HTMLDivElement = window.document.createElement('div');
                HTMLDivElement.id = data.id;
                game.appendChild(HTMLDivElement);
            }
            HTMLDivElement.style.top = data.top;
            HTMLDivElement.style.left = data.left;
            HTMLDivElement.style.width = data.width;
            HTMLDivElement.style.height = data.height;
            HTMLDivElement.style.position = data.position;
            HTMLDivElement.style.backgroundColor = data.backgroundColor;


            window.addEventListener('keydown', function (e) {
                // var motoGame = $('#' + data.id).position();
                switch (e.keyCode) {
                    case 39:
                        e.preventDefault();
                        HTMLDivElement.style.left = parseFloat(HTMLDivElement.style.left) + 10 + 'px';
                        if (HTMLDivElement.style.left >= '700px') {
                            HTMLDivElement.style.left = '700px'
                        }
                        break;
                    case 37:
                        e.preventDefault();
                        HTMLDivElement.style.left = parseFloat(HTMLDivElement.style.left) - 10 + 'px'
                        if (HTMLDivElement.style.left <= '500px') {
                            HTMLDivElement.style.left = '500px'
                        }
                        break;
                }

                socket.emit('changerPositionnementDeMonCarre', {
                    id: HTMLDivElement.id,
                    top: parseInt(HTMLDivElement.style.top),
                    left: parseInt(HTMLDivElement.style.left)
                });
            });

            setInterval(function () {
                socket.emit('collision', {
                    id: HTMLDivElement.id,
                    top: parseInt(HTMLDivElement.style.top),
                    left: parseInt(HTMLDivElement.style.left)
                });
            }, 250);

        });

        socket.on('creerSonCarre', function (data) {
            var HTMLDivElement = window.document.getElementById(data.id);
            if (!HTMLDivElement) {
                var HTMLDivElement = window.document.createElement('div');
                HTMLDivElement.id = data.id;
                game.appendChild(HTMLDivElement);
            }

            HTMLDivElement.style.top = data.top;
            HTMLDivElement.style.left = data.left;
            HTMLDivElement.style.width = data.width;
            HTMLDivElement.style.height = data.height;
            HTMLDivElement.style.position = data.position;
            HTMLDivElement.style.backgroundColor = data.backgroundColor;
            // $(HTMLDivElement).append('<p>' + data.name + '</p>') // seul l'utilisateur connecté après voit le pseudo des autres

        });

        socket.on('changerPositionnementDeSonCarre', function (data) {
            var HTMLDivElement = window.document.getElementById(data.id);
            if (HTMLDivElement) {
                HTMLDivElement.style.top = data.top;
                HTMLDivElement.style.left = data.left;
            }
        });
        /*  socket.on('deco', function(data,tab) {


         $("#myModal").modal('show');

         });*/

        socket.on('endOfGame', function (data, dd) {
            var CamionElement = document.getElementById(data.camion.id);
            if (CamionElement) CamionElement.remove();
            $("#myModal").modal('show');


            $('#winner').append(data.utilisateur + ' gagne la partie avec un score de ' + data.score);
        });

        socket.on('nameOftheWinner', function (data) {
            $('.modal-title').html('Congratulations ' + data.utilisateur + ', you\'re a Badass');
        })
    });
})(window, io);