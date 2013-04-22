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

		var nobids = [];							// Az egymást követő passzok.
		var cardsOnTable = [];						// Az asztalon lévő kártyák: {id: i, value: v, cards: c}
		var neworder = [];							// A következő kör sorrendje (folyamatosan töltődik)

		var whoCanTribute = null;					// Tárolja a király id-jét, amíg nem hirdet adózást TODO

		function __next () {
			if (currentPlayerOrder == order.length-1) {
				currentPlayerOrder = 0;
			} else {
				currentPlayerOrder++;
			};
			currentPlayerId = order[currentPlayerOrder];
			rdyCb.cb = 0;
			rdyCb.param = currentPlayerId;
		};

		function __goodput (cards) {
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

		function __newround () {
			// Osztás, rdyCb.param.cardnums beállítás
			// TODO

			whoCanTribute = neworder[0];
		}

		var putCards = function (cards, callbackOK, callbackBad) {
			//////L//O//G//////
			console.log("PUT CARDS: " + currentPlayerId + " " + cards);
			//////L//O//G//////


			if (cards.length === 0) {
				// Passzolás

				nobids.push(currentPlayerId);

				if (nobids.length < order.length) {		// Nem ért körbe a passz
					__next();
				} else {								// Körbeért a passz
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
			if (readies.indexOf(id) === -1) {
				readies.push(id);
			} else {
				return;
			};
			if (readies.length === players.length) {
				if (rdyCb.cb === 0) {cbNext(rdyCb.param); return;};
				if (rdyCb.cb === 1) {cbNextCircle(rdyCb.param); return;};
				if (rdyCb.cb === 2) {
					__newround();
					cbNextRound(rdyCb.param.order, rdyCb.param.cardnums);
					neworder.splice(0);
					return;
				};
			};
		};


		return {
			currentPlayerId: currentPlayerId, // ok
			putCards: putCards,	// ok
			readyFrom: readyFrom, // ok
			canTribute: whoCanTribute,	// TODO 
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
		startGame: startGame, // TODO minimális játékosszám megléte?
		gameStarted: gameStarted,
		currentRound: currentRound
	};
}();