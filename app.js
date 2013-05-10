var express = require('express');
var mongoose = require("mongoose");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var mocsar = require('./mocsar');


// mongoose.connect("mongodb://localhost/mocsar");
// var db = mongoose.connection;

// var mocsarSchema = mongoose.Schema({
// 	// TODO
// });

// var historySchema = mongoose.Schema({
// 	// TODO
// });


app.use(express.static("./public"));
server.listen(7500);

/////////////////////////////////////////////////

var broadcast = function (ev, data) {
	//////L//O//G//////
	console.log("BROADCAST: ----> " + ev, data);
	//////L//O//G//////
	io.sockets.emit(ev, data);
	mocsar.callAIs(ev, data);
};

/*	Játékos rak lapot (vagy passzol)
*		cards: [{color: 0-4 (pikk, kör, káró, treff, jolly), value: 2-15 (J=15)}]
*		passz esetén []
*	Ezután érvényes lapok esetén mindenki magkapja a kártyák értékeit. Mindenki 'ready'-t válaszol!
*	Érvénytelen lépés esetén 'badcards' üzenetet küld vissza	
*/
var onPut = function (playerid, socket, cards) {
	if (mocsar.currentRound().currentPlayerId() != playerid) return;
	mocsar.currentRound().putCards(cards, function () {
		broadcast('put', {from: playerid, cards: cards});
	}, function () {
		socket.emit('badcards');
	});
}

/*	Visszajelzés a laprakás/demokratikus kör indítása/adózás után
*	Ha mindenkitől beérkezett, akkor az utolsónál a megfelelő callback hívódik vissza
*		1. callback: Mindenkitől beérkezett, következő jön
*			nextid: A következő játékos azonosítója (eredeti sorrend alapján)
*		2. callback: Mindenkitől beérkezett, passz körbeért, utolsó lapot lerakó hív
*			callid: A nyitó játékos azonosítója (eredeti sorrend alapján)
*		3. callback: Mindenkitől beérkezett, új forduló, új sorrenddel
*			neworder: Játékosok sorrendje (egész tömb, pl.: [4,1,7,2,...])
*			cardnums: Játékosok kártyáinak számai (eredeti sorrendben, pl [14,14,...,16])
*/
var onReady = function (playerid) {
	mocsar.currentRound().readyFrom(playerid, function (nextid) {
		broadcast('next', nextid); // Erre mindenki tudni fogja, hogy ki jön. Aki jön, az ezzel kapja meg a „promptot”.
		}, function (callid) {
		broadcast('nextcircle', callid); // Erre mindenki tudni fogja, hogy a passz körbeért, és kiteszi (animációval) a középen lévő lapokat. A callid megkapja a promptot
	}, function (neworder) {
		mocsar.newRound(neworder);
		broadcast('newround', {order: neworder, democratic: false}); // Erre mindenki tudja, hogy vége, animációval átrendeződik a játéktér, és a lapok is kiosztásra kerülnek 
		// A kliensek kérdezzék le a kártyájukat 'mycards'-szal
		// Erre a király adózási törvényt hirdethet.
	});
}

/*	A király elküldi az adózási törvényt
*		tributes: Az adózási tételeket tartalmazó szig.mon.fogyó tömb pl.: [4,3,1]
*	Az adótételeket mindneki megkapja (ha érvényes, és sikeres az átadás)
*	Erre mindenki kérje le újra a lapjait
*	Akik pedig kaptak, adjanak vissza, amennyi jár, akkor automatikusan tovább lép a program
*/
var onTributes = function (playerid, tributes) {
	if (mocsar.currentRound().canTribute !== playerid || tributes.length > mocsar.players().length/2) {return;};
	mocsar.currentRound().tribute(tributes, function() {
		broadcast('tributes', tributes);
	});
}

/*	Akik lapot kaptak, visszaadnak megfelelő számút
*		cards: kártyák, amiket visszaadnak.
*	Sikeres és sikertelen esetben is kap a játékos visszajelzést 'tributeback' true/false üzenettel
*	Ha mindenki végrehajtotta a cserét, az utolsó callback hívódik, ami ezt a tényt kürtöli szét.
*	Erre mindenki kérdezze le a lapjait, majd válaszoljon 'ready'-vel.
*/
var onTributeBack = function (playerid, socket, cards) {
	if (mocsar.players()[playerid].toTributeBack !== cards.length) {
		socket.emit('tributeback', false);
		return;
	};
	mocsar.currentRound().tributeBack(playerid, cards, function() {
		socket.emit('tributeback', true);
	}, function () {
		broadcast('tributeback'); 
	});
}


io.sockets.on('connection', function (socket) {

	// Ha a játék kezdete után csatlakozik a kliens, kidobja.
	// TODO: Ha már csatlakozott/frissített játékos lép vissza, engedje be (addig automatikusan passzoljon)
	if (mocsar.gameStarted()){
		socket.emit('disconnect'); // -> erre a kliens kiírja, hogy a játékhoz nem tud csatlakozni
		return;
	};

	var playerid = null;


	/* 	Eseménykezelő új játékos bejelentkezésére.
	*		nam: játékos nickneve pl.: ""
	* 	
	* 	Létrehozza a játékost, és mindenki tudtára adja, hogy bejelentkezett.
	*/
	socket.on('myname', function (nam) {
		mocsar.newPlayer({name: nam}, function (playerid) {
			broadcast('newplayer', mocsar.playerlist()); 
			
			if (playerid === 0) {

				/* 	Játék indítása (csak admin)
				*		ainum: MI játékosok száma (egész szám)
				* 	
				* 	Létrehozza a MI játékosokat, ami automatikusan szétküldi az új listát.
				* 	Ezután elindítja a játékot, amely a következő paramétereket adja vissza:
				*		neworder: Játékosok sorrendje (egész tömb, itt [0,1,2,3,...] lesz)
				* 		cardnums: Játékosok kártyáinak számai (eredeti sorrendben, pl [14,14,14,...])
				* 	Ezeket küldi szét (kiegészítve a democratic információval) a klienseknek. Mindenki 'ready'-t válaszol
				*/
				socket.on('startgame', function (ainum) {
					if (playerid != 0) {return;};
				//	if (mocsar.gameStarted()) {return;};
					if (mocsar.players().length + ainum <= 6) {return;};
					mocsar.aiPlayersNum(ainum, function() {
						broadcast('newplayer', mocsar.playerlist());
					}, {
						put: onPut,
						ready: onReady,
						tributes: onTributes,
						tributeback: onTributeBack
					});

					mocsar.startGame(function (neworder) {
						broadcast('newround', {order: neworder, democratic: true}); // Nincs adózás, ready-t válaszolnak, ha kész.
					});
				});

			};


			/*	Kártyák lekérdezése
			*	Válaszként a játékos megkapja a saját kártyáinak listáját ilyen formátumban:
			*		[{color: c, value: v}]
			*	Pl.: [{color: 0, value: 8},{color: 5: value: 15},{color: 2, value: 11},..]
			*/
			socket.on('mycards', function () {
				socket.emit('mycards', mocsar.players()[playerid].cards);
			});

			/*	Kártyák számának lekérdezése
			*	Válaszként a játékos megkapja az összes játékos kártyáinak számát az eredeti (id) sorrendben
			*/
			socket.on('cardnums', function () {
				socket.emit('cardnums', mocsar.cardnums());
			});

			socket.on('put', function (cards) {
				onPut(playerid, socket, cards);
			});

			socket.on('ready', function () {
				onReady(playerid);
			});

			socket.on('tributes', function (tributes) {
				onTributes(playerid, tributes);
			});

			socket.on('tributeback', function (cards) {
				onTributeBack(playerid, socket, cards);
			});

			socket.emit('badname', {state: false, id: playerid, name: nam});
		}, function () {
			socket.emit('badname', {state: true});
		});
	});
});
