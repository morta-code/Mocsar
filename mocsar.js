module.exports = function () {
	require('./jsexpansion');
	var aiModule = (require('./ai'))(),
		pack = require("./cards"),
		players = [],
		gameStarted = false,
		currentRound,
		ais = []; // collection of ids. Length: num of ais, content: player index of ai


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

	var getCardnums = function () {
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
		var currentPlayerOrder = 0 | 0,					// A soron következő játékos a sorban
			currentPlayerId = -1 | 0,				// A soron következő játékos ID-je
			readies = [],							// Beérkezett 'ready' flag-ek
			rdyCb = {cb: 1, param: order[0]},		// Utolsó 'ready'-ra adandó válasz
			circles = [],							// A forduló körei. Object-eket tartalmaz (egyfajta history)
			nobids = [],							// Az egymást követő passzok.
			cardsOnTable = [],						// Az asztalon lévő kártyák: {id: i, value: v, cards: c}
			neworder = [],							// A következő kör sorrendje (folyamatosan töltődik)
			whoCanTribute = (democratic ? null : order[0]) | 0,// Tárolja a király id-jét, amíg nem hirdet adózást
			needsTributeBack = 0 | 0;				// Ennyi játékosnak kell még lapot visszaadni


		// De facto konstruktor (osztás). Nem demokratikus kör esetén a hátsóknak több lapja lesz.
		var __deal = function (p) {
			//////L//O//G//////
			console.log("DEAL - DEAL - DEAL - DEAL - DEAL");
			//////L//O//G//////
			var shakedPck = [];
			(order.length < 9 ? 2 : 3).times(function () {
				shakedPck.push.apply(shakedPck, pack.shaked());
			});
			shakedPck = shakedPck.shaked().shaked();

			while ((!democratic && shakedPck.length > 0) || (shakedPck.length >= order.length)) {
				for (var i = order.length - 1; i >= 0; i--) {
					if (shakedPck.length > 0) p[order[i]].cards.push(shakedPck.shift());
				};
			}

			p.forEach(function (actP) {
				actP.cards.sort(function(a, b){
	  				if(a.value == 2 || b.value == 2){
	  					if(a.value == 2 && b.value != 2) return  1;
	  					if(a.value != 2 && b.value == 2) return -1;
	  					if(a.value == 2 && b.value == 2) {
		  					if(a.color <  b.color) return -1;
	  						if(a.color >  b.color) return  1;
	  						if(a.color == b.color) return  0;
	  					}
	  				}
	  				else{
		  				if(a.value <  b.value) return -1;
	  					if(a.value >  b.value) return  1;
	  					if(a.value == b.value){
		  					if(a.color <  b.color) return -1;
	  						if(a.color >  b.color) return  1;
	  						if(a.color == b.color) return  0;
	   					}
	   				}
	   				return 0;
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
				if (players[currentPlayerId].cards.indexOfObject(cards[i]) === -1) return;
				if (putValue === 0) {putValue = cards[i].value; continue;};
				if ((putValue === 15 || putValue === 2) && (cards[i].value !== 15 && cards[i].value !== 2)) {putValue = cards[i].value; continue;};
				if ((putValue !== 15 && putValue !== 2 && cards[i].value !== 15 && cards[i].value !== 2) && cards[i].value !== putValue) {return;};
			};
			if (putValue === 2) putValue = 15;
			if (cardsOnTable.length > 0 && (putValue <= cardsOnTable.last().value || cardsOnTable.last().cards.length !== cards.length)) return;
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

				bests.push(player.cards.splice(idx, 1)[0]);
			});
			return bests;
		}

		var putCards = function (cards, callbackOK, callbackBad) {

			if (cards.length === 0) {
				// Passzolás
				if (cardsOnTable.length === 0) {
					callbackBad();
					return;
				};

				nobids.push(currentPlayerId);

				if (nobids.length < order.length) {		
					// Nem ért körbe a passz
					__next();
				} else {								
					// Körbeért a passz
					currentPlayerId = cardsOnTable.last().id;
					while (order.indexOf(currentPlayerId) === -1) {
						currentPlayerId = nobids.shift();
					};
					currentPlayerOrder = order.indexOf(currentPlayerId);
					rdyCb.cb = 1;
					rdyCb.param = currentPlayerId;
					cardsOnTable.splice(0);
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
				cards.forEach(function (a, i) {
					players[currentPlayerId].cards.splice(players[currentPlayerId].cards.indexOfObject(a),1);
				});
				nobids.splice(0);

				if (players[currentPlayerId].cards.length === 0) {
					// elfogyott

					neworder.push(order.splice(currentPlayerOrder, 1)[0]);
					console.log('SOMEBODY EXITED, NEW NUM OF PLAYERS:', order.length);
					if (order.length == 1) {
						// vége van
						// TODO betenni a history-ba
						players.forEach(function (a) {
							a.cards.splice(0);
						});
						neworder.push(order.splice(0,1)[0]);
						rdyCb.cb = 2;
						rdyCb.param = {order: neworder};
						cardsOnTable.splice(0);

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
			if (readies.indexOf(id) === -1) {
				readies.push(id);
			} else {
				return;
			};
			if (readies.length === players.length) {
				if (rdyCb.cb === 0) {
					currentPlayerId = rdyCb.param;
					cbNext(rdyCb.param); 
					return;
				};
				if (rdyCb.cb === 1) {
					currentPlayerId = rdyCb.param;
					cbNextCircle(rdyCb.param); 
					return;}
					;
				if (rdyCb.cb === 2) {
					cbNextRound(rdyCb.param.order);
					neworder.splice(0);
					return;
				};
			};
		};


		var tribute = function (tributes) {
			//////L//O//G//////
			console.log("TRIBUTE " + tributes);
			//////L//O//G//////

			tributes.forEach(function(t, i) {
				players[order[i]].toTributeBack = t;
				players[order[i]].toTributeBackFor = order[order.length-(1+i)];

				players[order[i]].cards = players[order[i]].cards.concat(
					__bestCards(players[order[order.length-(1+i)]], t));
			});
			needsTributeBack = tributes.length;
			canTribute = null;
		};


		var tributeBack = function (id, cards, callbackOK, callbackReady) {
			var fromCards = players[id].cards;
			var forCards = players[ players[id].toTributeBackFor ].cards;
			cards.forEach(function (c, i) {
				forCards.push(fromCards.splice(fromCards.indexOf(c), 1)[0]);
			});

			needsTributeBack--;
			callbackOK();
			// Ha az utolsó is visszaadta, callbackReady
			if (needsTributeBack === 0) {
				callbackReady();
			};
		}

		var getCurrentPlayerId = function () {
			return currentPlayerId;
		}

		var getCardsOnTable = function () {
			return cardsOnTable;
		}

		return {
			currentPlayerId: getCurrentPlayerId, // ok
			putCards: putCards,	// ok
			readyFrom: readyFrom, // ok
			canTribute: whoCanTribute, // ok 
			tribute: tribute,	// ok
			tributeBack: tributeBack, // ok
			cardsOnTable: getCardsOnTable
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
			aiModule.newAiPlayer(players.last(), players.length-1);
		};
		aiModule.callbacks(funcs.merge({players: getPlayers, currentRound: getCurrentRound}));
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
		callback(order);
	};

	var newRound = function (order) {
		currentRound = Round(order, false);
		//////L//O//G//////
		console.log("ROUND STARTED");
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
			(aiModule.aiPlayers()[i])[ev](data);
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
		cardnums: getCardnums,
		callAIs: callAIs,
		ranks: {
			'd':['Polgár'],
			'6':['Király','Nádor','Nemes','Polgár','Paraszt','Mocsár'],
			'7':['Király','Nádor','Nemes','Polgár','Paraszt','Jobbágy','Mocsár'],
			'8':['Király','Nádor','Ispán','Nemes','Polgár','Paraszt','Jobbágy','Mocsár'],
			'9':['Király','Nádor','Ispán','Nemes','Polgár','Paraszt','Jobbágy','Zsellér','Mocsár'],
			'10':['Király','Nádor','Ispán','Alispán','Nemes','Polgár','Paraszt','Jobbágy','Zsellér','Mocsár'],
			'11':['Király','Nádor','Ispán','Alispán','Nemes','Polgár','Módos gazda','Paraszt','Jobbágy','Zsellér','Mocsár'],
			'12':['Király','Nádor','Ispán','Alispán','Nemes','Dzsentri','Polgár','Módos gazda','Paraszt','Jobbágy','Zsellér','Mocsár']
		}
	};
}();

// TODO optimalizálás (számításra)
