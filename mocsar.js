module.exports = function () {

	var players = [];

	var newPlayer = function (params, callbackOK, callbackBad) {

		var player = {
			name: "player" + (players.length + 1),
			ai: false
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
			currentPlayer: ,

		};
	};


	return {
		players: players,
		newPlayer: newPlayer,

		currentRound
		startGame
		gameStarted
		readyFrom
	};
}();