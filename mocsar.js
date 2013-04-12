module.exports = function () {

	var players = [];

	var playerlist = function () {
		var arr = [];
		players.forEach(function (act, index) {
			arr.push({name: act.name, ai: act.ai, id: index});
		});
		return arr;
	};

	/* Új játékos hozzáadása
	*	params: játékos tulajdonságai (pl. name)
	* 	callbackOK: Akkor hívódik meg, ha sikerers, paraméterként az új játékos azonosítóját kapja
	*	callbackBad: Akkor hívódik meg, ha sikertelen
	*/
	var newPlayer = function (params, callbackOK, callbackBad) {
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

	var round = function () {

		return {
			currentPlayer: null
		};
	};

	var aiPlayersNum = function(param, callback){
		for (var i = 0; i < param; i++) {
			players.push({
				name: "player_" + i,
				id: players.length,
				ai: true,
				cards: []
			});
		};
		callback();
	};

	return {
		players: players, // ok
		playerlist: playerlist, // ok
		newPlayer: newPlayer, // TODO
		aiPlayersNum: aiPlayersNum,
		currentRound: null,
		startGame: null,
		gameStarted: null,
		readyFrom: null
	};
}();