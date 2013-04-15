module.exports = function () {

	var players = [];

<<<<<<< HEAD
	var gameStarted = false;

=======
	/*	Játékoslista kliensoldali célokra
	*	A visszaadott tömb nem tartalmazza a nem publikus adatokat, pl. minden
	*/
>>>>>>> 5425463e5e0d8ea433e70a94b7d3635e3908709b
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
		var currentOrder = order;
		var currentPlayer = 0;
		var currentPlayerId = 0;

		return {
			currentPlayerId: currentPlayerId,
			putCards: null,
			readyFrom: null,
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
	var aiPlayersNum = function(param, callback){
		if (gameStarted) {return;};
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

	var startGame = function(callback_paramNeworderCardnums){
		gameStarted = true;
		callback_paramNeworderCardnums(null, 0);	// teszt
	};

	return {
		players: players, // ok
		playerlist: playerlist, // ok
		newPlayer: newPlayer, // ok
		aiPlayersNum: aiPlayersNum,
<<<<<<< HEAD
		startGame: startGame,
		currentRound: null,
		gameStarted: gameStarted,
=======
		currentRound: currentRound,
		startGame: null,
		gameStarted: null,
>>>>>>> 5425463e5e0d8ea433e70a94b7d3635e3908709b
		readyFrom: null
	};
}();