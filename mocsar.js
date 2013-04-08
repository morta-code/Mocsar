module.exports = function () {

	var players = [];

	var playerlist = function () {
		var arr = [];
		players.forEach(function (act) {
			arr.push({name: act.name, ai: act.ai});
		});
		return arr;
	};

	var newPlayer = function (params, callbackOK, callbackBad) {

		var player = {
			name: "player" + (players.length + 1),
			ai: false,
			cards: [],
			getCardsAsTribute: null,
			giveCardsAsTribute: null
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

	return {
		players: players, // ok
		playerlist: playerlist, // ok
		newPlayer: newPlayer, // TODO
		aiPlayersNum: null,
		currentRound: null,
		startGame: null,
		gameStarted: null,
		readyFrom: null
	};
}();