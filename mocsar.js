module.exports = function () {
	require('./jsexpansion');
	var ai = require('./ai');
	var pack = require("./cards");
	var players = [];
	var gameStarted = false;
	var currentRound;
	var ais = []; // collection of ids


	/*	Játékoslista kliensoldali célokra
	*	A visszaadott tömb nem tartalmazza a nem publikus adatokat, pl. minden
	*/
	var playerlist = function () {
		var arr = [];
		players.forEach(function (act, index) {
			arr.push({name: act.name, ai: act.ai, id: index});
		});
		return arr;
	};

	var cardnums = function () {
		var arr = [];
		players.forEach(function (act) {
			arr.push(act.cards.length);
		});
		return arr;
	};


	/* 	Új játékos hozzáadása
	*	params: játékos tulajdonságai (pl. name)
	* 	callbackOK: Akkor hívódik meg, ha sikerers, paraméterként az új játékos azonosítóját kapja
	*	callbackBad: Akkor hívódik meg, ha sikertelen
	*/
	var newPlayer = function (params, callbackOK, callbackBad) {
		if (gameStarted) {return;};
		var player = {
			name: "player" + (players.length + 1),
			ai: false,
			cards: [],
			toTributeBack: null,
			toTributeBackFor: null
		};

		if (params) {
			for(var prop in params){
				player[prop] = params[prop];
			};
			for (var i = players.length - 1; i >= 0; i--) {
				if (players[i].name == player.name){
					callbackBad();
					return;
				};
			};
		};

		players.push(player);
		callbackOK(players.length-1);
	}


	function Round (order, democratic) {
		//////L//O//G//////
		console.log("ROUND " + order);
		//////L//O//G//////
		var currentOrder = order; 					// [] Játékosok sorrendje a fordulóban
		var currentPlayerOrder = 0;					// A soron következő játékos a sorban
		var currentPlayerId = order[0];				// A soron következő játékos ID-je
		var readies = [];							// Beérkezett 'ready' flag-ek
		var rdyCb = {cb: 1, param: currentPlayerId};// Utolsó 'ready'-ra adandó válasz

		var circles = [];							// A forduló körei. Object-eket tartalmaz (egyfajta history)

		var nobids = [];							// Az egymást követő passzok.
		var cardsOnTable = [];						// Az asztalon lévő kártyák: {id: i, value: v, cards: c}
		var neworder = [];							// A következő kör sorrendje (folyamatosan töltődik)

		var whoCanTribute = (democratic ? null : currentOrder[0]);// Tárolja a király id-jét, amíg nem hirdet adózást
		var needsTributeBack = 0;					// Ennyi játékosnak kell még lapot visszaadni


		// De facto konstruktor (osztás), TODO demokratikus kör esetén mindenkinek egyenlően
		function __deal (p) {
			//////L//O//G//////
			console.log("DEAL");
			//////L//O//G//////

			var oID = currentOrder.length-1;
			function nxt (o) {
				if (!o)	{
					return currentOrder.length-1;
				}
				return o -= 1;
			};

			(currentOrder.length < 9 ? 2 : 3).times(function () {
				pack.shaked().forEach(function (card) {
					 p[currentOrder[oID]].cards.push(card);
					oID = nxt(oID);
				});
			});
		}(players);
		

		var __next = function () {
			if (currentPlayerOrder == order.length-1) {
				currentPlayerOrder = 0;
			} else {
				currentPlayerOrder++;
			};
			currentPlayerId = order[currentPlayerOrder];
			rdyCb.cb = 0;
			rdyCb.param = currentPlayerId;
		};

		var __goodput = function (cards) {
			var putValue = 0;
			for (var i = cards.length - 1; i >= 0; i--) {
				if (players[currentPlayerId].cards.indexOf(cards[i]) === -1) {return;};
				if (putValue === 0) {putValue = cards[i].value; continue;};
				if ((putValue === 15 || putValue === 2) && (cards[i].value !== 15 && cards[i].value !== 2)) {putValue = cards[i].value; continue;};
				if ((putValue !== 15 && putValue !== 2 && cards[i].value !== 15 && cards[i].value !== 2) && cards[i].value !== putValue) {return;};
			};
			if (putValue === 2) {putValue = 15;};
			if (cardsOnTable.length > 0 && putValue <= cardsOnTable[cardsOnTable.length-1].value) {return;};
			return putValue;
		};

		// A legjobb lapok kivétele a pakliból, és visszaadása
		var __bestCards = function (player, num) {

			var bests = [];
			num.times(function () {
				var idx = -1;

				idx = player.cards.indexOfKeyValue('value', 15);
				if (idx === -1) idx = player.cards.indexOfKeyValue('value', 2);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 14);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 13);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 12);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 11);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 10);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 9);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 8);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 7);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 6);
				else if (idx === -1) idx = player.cards.indexOfKeyValue('value', 5);

				bests.push(player.cards.splice(idx, 1));
			});
			return bests;
		}

		var putCards = function (cards, callbackOK, callbackBad) {
			//////L//O//G//////
			console.log("PUT CARDS: " + currentPlayerId + " " + cards);
			//////L//O//G//////


			if (cards.length === 0) {
				// Passzolás

				nobids.push(currentPlayerId);

				if (nobids.length < order.length) {		
					// Nem ért körbe a passz
					__next();
				} else {								
					// Körbeért a passz
					currentPlayerId = cardsOnTable[cardsOnTable.length-1].id;
					while (order.indexOf(currentPlayerId) === -1) {
						currentPlayerId = nobids.shift();
					};
					currentPlayerOrder = order.indexOf(currentPlayerId);
					rdyCb.cb = 1;
					rdyCb.param = currentPlayerId;
				};

			} else {
				// Lépés

				var putValue = __goodput(cards);
				if (!putValue) {
					// Helytelen lépés
					callbackBad();
					return;
				};
				cardsOnTable.push({id: currentPlayerId, value: putValue, cards: cards});
				nobids.splice(0);
				// TODO putValue === 15 esetén nextcircle
				if (players[currentPlayerId].cards.length === 0) {
					// elfogyott

					neworder.push(order.splice(currentPlayerOrder, 1));

					if (order.length == 1) {
						// vége van
						players[currentPlayerId].cards.splice(0); // TODO betenni a history-ba
						neworder.push(order.splice(0,1));
						rdyCb.cb = 2;
						rdyCb.param = {order: neworder};

					} else {
						// nincs vége
						if (currentPlayerOrder == order.length) {
							currentPlayerOrder = 0;					
						};
						currentPlayerId = order[currentPlayerOrder];
						rdyCb.cb = 0;
						rdyCb.param = currentPlayerId;
					};

				} else {
					// nem fogyott el
					__next();
				};

			};

			readies.splice(0);
			callbackOK();
		};


		var readyFrom = function (id, cbNext, cbNextCircle, cbNextRound) {
			//////L//O//G//////
			console.log("READY from", players[id].name);
			//////L//O//G//////
			if (readies.indexOf(id) === -1) {
				readies.push(id);
			} else {
				return;
			};
			if (readies.length === players.length) {
				if (rdyCb.cb === 0) {cbNext(rdyCb.param); return;};
				if (rdyCb.cb === 1) {cbNextCircle(rdyCb.param); return;};
				if (rdyCb.cb === 2) {
					cbNextRound(rdyCb.param.order);
					neworder.splice(0);
					return;
				};
			};
		};


		var tribute = function (tributes, callback) {
			//////L//O//G//////
			console.log("TRIBUTE " + tributes);
			//////L//O//G//////

			tributes.forEach(function(t, i) {
				//////L//O//G//////
				console.log("TRIBUTE ", players[currentOrder[i]].name, players[currentOrder[currentOrder.length-(1+i)]]);
				//////L//O//G//////
				players[currentOrder[i]].toTributeBack = t;
				players[currentOrder[i]].toTributeBackFor = currentOrder[currentOrder.length-(1+i)];

				players[currentOrder[i]].cards = players[currentOrder[i]].cards.concat(
					__bestCards(players[currentOrder[currentOrder.length-(1+i)]], t));
			});
			needsTributeBack = tributes.length;
			canTribute = null;
		};


		var tributeBack = function (id, cards, callbackOK, callbackReady) {
			//////L//O//G//////
			console.log("TRIBUTEBACK ", players[id], cards);
			//////L//O//G//////

			var fromCards = players[id].cards;
			var forCards = players[ players[id].toTributeBackFor ].cards;
			cards.forEach(function (c, i) {
				forCards.push(fromCards.splice(fromCards.indexOf(c), 1));
			});

			needsTributeBack--;
			callbackOK();
			// Ha az utolsó is visszaadta, callbackReady
			if (needsTributeBack === 0) {
				callbackReady();
			};
		}

		return {
			currentPlayerId: currentPlayerId, // ok
			putCards: putCards,	// ok
			readyFrom: readyFrom, // ok
			canTribute: whoCanTribute, // ok 
			tribute: tribute,	// ok
			tributeBack: tributeBack // ok
		};
	};



	/*	MI játékosok hozzáadása
	*		param: MI játékosok száma
	*	(ettől függetlenül nem adódik hozzá több, mint amennyi a maximum)
	*		callback: ha kész, visszahívódik
	*/
	var aiPlayersNum = function (param, callback, funcs){
		for (var i = 0; i < param && players.length < 12; i++) {
			players.push({
				name: "player_" + i,
				ai: true,
				cards: []
			});
			players.last().id = players.length-1;
			ais.push(players.length-1);
			ai.newAiPlayer(players.last(), players.length-1);
		};
		ai.callbacks(funcs);
		//////L//O//G//////
		console.log("AIs added ", param);
		//////L//O//G//////
		callback();
	};


	/*	Új játék létrehozása, egyúttal currentRound beállítása
	*		callback: ha kész, visszahívódik a sorrenddel és a lapok számával
	*/
	var startGame = function (callback){
		if (players.length < 6) return;
		var order = [];
		players.forEach(function (act, index) {
			order.push(index);
		});
		currentRound = Round(order, true);
		gameStarted = true;
		//////L//O//G//////
		console.log("GAME STARTED", currentRound);
		//////L//O//G//////
		callback(order);
	};

	var newRound = function (order) {
		currentRound = Round(order, false);
		//////L//O//G//////
		console.log("ROUND STARTED", currentRound);
		//////L//O//G//////
	};

	var getCurrentRound = function(){
		return currentRound;
	}
	var getGameStarted = function(){
		return gameStarted;
	}
	var getPlayers = function(){
		return players;
	}

	var callAIs = function (ev, data) {
		ais.forEach(function (a, i) {
			(ai.aiPlayers[i])[ev](data);
		});
	}

	return {
		players: getPlayers, // ok
		playerlist: playerlist, // ok
		newPlayer: newPlayer, // ok
		aiPlayersNum: aiPlayersNum, 
		startGame: startGame, // ok
		newRound: newRound, // ok
		gameStarted: getGameStarted, // ok
		currentRound: getCurrentRound, // ok
		cardnums: cardnums,
		callAIs: callAIs,

	};
}();

// TODO optimalizálás (számításra)