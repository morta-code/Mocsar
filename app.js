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
// TODO ha lesz idő, titkosítás

io.sockets.on('connection', function (socket) {

	// Ha a játék kezdete után csatlakozik a kliens, kidobja.
	// TODO: Ha már csatlakizott játékos lép vissza, engedje be (addig automatikusan passzoljon)
	if (mocsar.gameStarted){
		socket.emit('disconnect'); // -> erre a kliens kiírja, hogy a játékhoz nem tud csatlakozni
		return;
	};

	//socket.emit('newplayer', mocsar.playerlist()); // Erre frissül (itt először) a játékoslista TODO normáis players modell!!!

	var playerid = null;

	// Az új játékos bejelentkezik, és erről a többiek értesítést kapnak. Ha nem sikerült, hibaüzenetet kap.
	socket.on('myname', function (nam) {
		mocsar.newPlayer({name: nam}, function (id) {
			io.sockets.emit('newplayer', mocsar.playerlist()); // Erre minenkinél frissül a játékoslista TODO normáis players modell!!!
			playerid = id;
			socket.emit('badname', {state: false, id: id, name: nam});
		}, function () {
			socket.emit('badname', {state: true}); // Erre az üzenetre új nevet kér (valószínűleg a kliensoldali ellenőrzés miatt nem lesz rá szükség)
		});
	});

	// Az admin (0. játékos) elindíthatja a játékot és megadhatja, hány MI játékos vesz részt
	
	socket.on('startgame', function (ainum) {
		if (playerid != 0) {return;};
		if (mocsar.gameStarted) {return;};
		mocsar.aiPlayersNum(ainum, function() {
			io.sockets.emit('newplayer', mocsar.playerlist());
		});
		// TODO
		mocsar.startGame(function (neworder, cardnums) {
			io.sockets.emit('newround', {order: neworder, democratic: true, cards: cardnums}); // Nincs adózás, ready-t válaszolnak, ha kész. (Kérdezzék le a lapjukat)
		});
	});


	socket.on('mycards', function () {
		socket.emit('mycards', mocsar.players[playerid].cards);
	});

	// Játékos rak lapot (vagy passzol)
	/*
		cards: [{color: 0-5 (pikk, kör, káró, treff, jolly), value: 2-15 (J=15)}]
		passz: null
	*/
	socket.on('put', function (cards) {
		if (mocsar.currentRound.currentPlayerId != playerid) {return;};
		mocsar.currentRound.putCards(cards, function () {
			io.sockets.emit('put', {from: playerid, cards: cards}); // Erre az üzenetre mindenki látja, hogy ki mit rakott. Az aktuális rakónál is ez jelenti a nyugtát
		}, function () {
			socket.emit('badcards'); // Ez a válasz akkor küldődik, ha hibás lapokat akart küldeni.
		}); // TODO Első callback ok, második bad.
	});

	// Visszajelzés a játékosoktól, ha kész az animáció
	// Callback, ha az utolsó játékostól is beérkezett.
	/*
		1. callback: Mindenkitől beérkezett, következő jön
		2. callback: Mindenkitől beérkezett, passz körbeért, utolsó hív
		3. callback: Mindenkitől beérkezett, új forduló, új sorrenddel
	*/
	socket.on('ready', function () {
		mocsar.currentRound.readyFrom(playerid, function (nextid) {
			io.sockets.emit('next', nextid); // Erre mindenki tudni fogja, hogy ki jön. Aki jön, az ezzel kapja meg a „promptot”.
 		}, function (callid) {
			io.sockets.emit('nextcircle', callid); // Erre mindenki tudni fogja, hogy a passz körbeért, és kiteszi (animációval) a középen lévő lapokat. A callid megkapja a promptot
		}, function (neworder, cardnums) {
			io.sockets.emit('newround', {order: neworder, democratic: false, cards: cardnums}); // Erre mindenki tudja, hogy vége, animációval átrendeződik a játéktér, és a lapok is kiosztásra kerülnek cards: [kártyák száma]
			// A kliensek kérdezzék le a kártyájukat 'mycards'-szal
			// Erre a király adózási törvényt hirdethet.
		}); // TODO. callbackek
	});

	// A király elküldi az adózási törvényt (pl: [4, 3, 1]), és ha minden rendben van, a rendszer szétküldi
	socket.on('tributes', function (tributes) {
		if (mocsar.currentRound.canTribute != playerid || tributes.length > mocsar.players.length/2) {return;}; // TODO
		mocsar.currentRound.tribute(tributes, function() {
			io.sockets.emit('tributes', tributes); // Erre mindenki tudja, hogy ki mennyit adózik, de az adás automatikus. Mindenki kérdezze le a saját lapjait!
		}); // TODO
	});

	// Nemes játékosok kiválasztott kártyákat adnak vissza. Callback akkor hívódik, ha mindenki visszaadta, és kezdődhet a kör.
	
	socket.on('tributeback', function (cards) {
		if (mocsar.players[playerid].toTributeBack != cards.length) {
			socket.emit('tributeback', false);
		};
		mocsar.currentRound.tributeBack(playerid, cards, function() {
			socket.emit('tributeback', true); // Sikeres átadás esetén fut le
		}, function () {
			io.sockets.emit('tributeback'); // Akkor hívódik meg, ha minenkinél lezárult a lapcsere
			// Erre mindenki ready-t válaszol (Az pedig nextcircle-t ad)
		});
	});
	
	// TODO MI eseménykezelése
});
