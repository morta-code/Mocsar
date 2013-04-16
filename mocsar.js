module.exports = function () {

	var players = [];

	var gameStarted = false;


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
			toTributesBack: null
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
		callbackOK(players.length - 1);
	}


	function Round (order) {
		//////L//O//G//////
		console.log("ROUND " + order);
		//////L//O//G//////
		var currentOrder = order; 					// [] Játékosok sorrendje a fordulóban
		var currentPlayerOrder = 0;					// A soron következő játékos a sorban
		var currentPlayerId = order[0];				// A soron következő játékos ID-je
		var readies = [];							// Beérkezett 'ready' flag-ek
		var rdyCb = {cb: 1, param: currentPlayerId};// Utolsó 'ready'-ra adandó válasz

		var circles = [];							// A forduló körei. Object-eket tartalmaz (egyfajta history)
		var currentCircle = {						// A jelenlegi kör
			cardsOnTable: [],						// Az asztalon lévő kártyák: {id: i, value: v, cards: c}
			nobids: []								// Az egymást követő passzok.
		};
		var neworder = [];							// A következő kör sorrendje (folyamatosan töltődik)


		var putCards = function (cards, callbackOK, callbackBad) {
			// játékos passzolt -> readies és rdyCb beállítása
			if (cards.length === 0) {
				readies.splice(0);
				currentCircle.nobids.push(currentPlayerId);
				
				// Nem ért körbe a passz
				if (currentCircle.nobids.length <= order.length) {
					if (currentPlayerOrder == order.length-1) {
						currentPlayerOrder = 0;
					} else {
						currentPlayerOrder++;
					};
					currentPlayerId = order[currentPlayerOrder];
					rdyCb.cb = 0;
				} else {
					rdyCb.cb = 1;
					currentPlayerId = currentCircle.cardsOnTable[cardsOnTable.length-1].id;
					// Kiment már a játékos? Ha igen, az utána következő (első passzoló hív)
					while (order.indexOf(currentPlayerId) === -1) {
						currentPlayerId = currentCircle.nobids.shift();
					};
					currentPlayerOrder = order.indexOf(currentPlayerId);
				}

				rdyCb.param = currentPlayerId;
				callbackOK();
				return;
			};

			nobids.splice(0);
			// kártyák kivétele a kézből
			var cardsToTable = [];
			var putValue = 0;
			for (var i = cards.length - 1; i >= 0; i--) {
				var c_id = players[currentPlayerId].cards.indexOf(cards[i]);
				if (c_id === -1) {
					callbackBad();
					return;
				};
				cardsToTable.push(players[currentPlayerId].cards.splice(c_id, 1));
			};

			// kártyák ellenőrzése
			for (var i = cardsToTable.length - 1; i >= 0; i--) {
				if (putValue === 0) {putValue = cardsToTable[i].value; continue;};
				if ((putValue === 15 || putValue === 2) && (cardsToTable[i].value !== 15 && cardsToTable[i].value !== 2)) {putValue = cardsToTable[i].value; continue;};
				if ((putValue !== 15 && putValue !== 2 && cardsToTable[i].value !== 15 && cardsToTable[i].value !== 2) && cardsToTable[i].value !== putValue) {
					players[currentPlayerId].cards = players[currentPlayerId].cards.concat(cardsToTable);
					callbackBad();
					return;
				};
			};
			if (putValue === 2) {putValue = 15;};
			// Überelt?
			if (putValue <= currentCircle.cardsOnTable[cardsOnTable.length-1].value) {
				players[currentPlayerId].cards = players[currentPlayerId].cards.concat(cardsToTable);
				callbackBad();
				return;
			};

			// kártyák betétele a kör közepére
			currentCircle.cardsOnTable.push({id: currentPlayerId, value: putValue, cards: cardsToTable});

			// readies beállítása + ready reakció beállítása
			// Kiment a játékos?
			if (players[currentPlayerId].cards.length === 0) {
				neworder.push(order.splice(currentPlayerOrder, 1));
				if (currentPlayerOrder == order.length) {
					currentPlayerOrder = 0;					
				};
				currentPlayerId = order[currentPlayerOrder];
			} else {
				if (currentPlayerOrder == order.length-1) {
					currentPlayerOrder = 0;
				} else {
					currentPlayerOrder++;
				};
				currentPlayerId = order[currentPlayerOrder];
			};

			// Már csak egy játékos maradt?
			if (order.length == 1) {
				// Mocsár
				players[currentPlayerId].cards.splice(0); // TODO betenni a history-ba
				neworder.push(order.splice(0,1));
				// TODO osztás
				rdyCb.cb = 2;
				rdyCb.param = {order: neworder};
			} else {
				rdyCb.param = currentPlayerId;
			};

			// callback
			readies.splice(0);
			callbackOK();
			return;
		};


		var readyFrom = function (id, cbNext, cbNextCircle, cbNextRound) {
			if (readies.indexOf(id) === -1) {
				readies.push(id);
			} else {
				return;
			};
			if (readies.length === players.length) {
				if (rdyCb.cb === 0) {cbNext(rdyCb.param); return;};
				if (rdyCb.cb === 1) {cbNextCircle(rdyCb.param); return;};
				// TODO osztás
				if (rdyCb.cb === 2) {cbNextRound(rdyCb.param.order, rdyCb.param.cardnums); return;};
			};
		};


		return {
			currentPlayerId: currentPlayerId, // ok
			putCards: putCards,	// ok
			readyFrom: readyFrom, // ok
			canTribute: null,
			tribute: null,
			tributeBack: null
		};
	};

	var currentRound = null;


	/*	MI játékosok hozzáadása
	*		param: MI játékosok száma
	*	(ettől függetlenül nem adódik hozzá több, mint amennyi a mayximum)
	*		callback: ha kész, visszahívódik
	*/
	var aiPlayersNum = function (param, callback){
		for (var i = 0; i < param && players.length < 12; i++) {
			players.push({
				name: "player_" + i,
				id: players.length,
				ai: true,
				cards: []
			});
		};
		callback();
	};


	/*	Új játék létrehozása, egyúttal currentRound beállítása
	*		callback: ha kész, visszahívódik a sorrenddel és a lapok számával
	*/
	var startGame = function (callback){
		var order = [];
		players.forEach(function (act, index) {
			order.push(index);
		});
		currentRound = new Round(order);
		gameStarted = true;
		callback(order, 0);
	};

	return {
		players: players, // ok
		playerlist: playerlist, // ok
		newPlayer: newPlayer, // ok
		aiPlayersNum: aiPlayersNum, // TODO AI vezérlés, eseménykezelés
		startGame: startGame,
		gameStarted: gameStarted,
		currentRound: currentRound
	};
}();