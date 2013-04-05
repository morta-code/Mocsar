var express = require('express');
var mongoose = require("mongoose");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var mocsar = require('./mocsar');

mongoose.connect("mongodb://localhost/mocsar");
var db = mongoose.connection;

var mocsarSchema = mongoose.Schema({
	// TODO
});

var historySchema = mongoose.Schema({
	// TODO
});


app.use(express.static("./public"));

server.listen(7500);

/////////////////////////////////////////////////


io.sockets.on('connection', function (socket) {

	// Ha a játék kezdete után csatlakozik a kliens, kidobja.
	// TODO: Ha már csatlakizott játékos lép vissza, engedje be (addig automatikusan passzoljon)
	if (mocsar.gameStarted){
		socket.emit('disconnect');
		return;
	};

	var playerid = null;

	// Az új játékos bejelentkezik, és erről a többiek értesítést kapnak. Ha nem sikerült, hibaüzenetet kap.
	socket.on('myname', function (data) {
		mocsar.newPlayer(data, function (id) {
			io.sockets.emit('newplayer', mocsar.players);
			playerid = id;
		}, function() {
			socket.emit('badname');
		});
	});

	// Az admin (0. játékos) elindíthatja a játékot
	socket.on('startgame', function () {
		if (playerid != 0) {return;};
		if (mocsar.gameStarted) {return;};
		mocsar.startGame // TODO, és valamilyen callback
	});

	// Játékos rak lapot (vagy passzol)
	/*
		cards: [{color: 0-5 (pikk, kör, káró, treff, jolly), value: 2-15 (J=15)}]
		passz: null
	*/
	socket.on('put', function(cards) {
		if (mocsar.currentRound.currentPlayerId != playerid) {return;};
		mocsar.currentRound.putCards(cards, function() {
			io.sockets.emit('put', {from: playerid, cards: cards});
		}, function() {
			socket.emit('badcards');
		}); // TODO Első callback ok, második bad.
	});

	// Visszajelzés a játékosoktól, ha kész az animáció
	socket.on('ready', function() {
		mocsar.currentRound.readyFrom(playerid, function() {
			mocsar.currentRound.nextPlayer();
			io.socket.emit('next', mocsar.currentRound.currentPlayerId);
		}); // TODO. Callback, ha az utolsó játékostól is beérkezett.
	});


	// TODO passz körbeér
	// TODO forduló vége
	// TODO adózás (oda-vissza)
	// TODO MI hozzáadása
	// TODO MI eseménykezelése
	// TODO új forduló


  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });





});