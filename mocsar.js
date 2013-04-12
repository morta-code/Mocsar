module.exports = function () {

	var players = [];

	var gameStarted = false;

	var playerlist = function () {
		var arr = [];
		players.forEach(function (act) {
			arr.push({name: act.name, ai: act.ai, id: act.id});
		});
		return arr;
	};

	var newPlayer = function (params, callbackOK, callbackBad) {

		var player = {
			name: "player" + (players.length + 1),
			id: players.length,
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

	var aiPlayersNum = function(param, callback){
		for (var i = 0; i < param; i++) {
			players.push({
				name: "player_" + i,
				id: players.length,
				ai: true,
				cards: [],
				getCardsAsTribute: null,
				giveCardsAsTribute: null
			});
		};
		callback();
	};

	var startGame = function(callback_paramNeworderCardnums){
		gameStarted = true;
		callback_paramNeworderCardnums(null, 0);	// teszt
	};

	return {
		players: players, // ok
		playerlist: playerlist, // ok
		newPlayer: newPlayer, // TODO
		aiPlayersNum: aiPlayersNum,
		startGame: startGame,
		currentRound: null,
		gameStarted: gameStarted,
		readyFrom: null
	};
}();