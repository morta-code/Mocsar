module.exports = function () {
	require('./jsexpansion');

	return function () {
		var aiPlayers = [],
		    callbacks;

		function getAiPlayers () {
			return aiPlayers;
		}

		function newAiPlayer (player, id) {
			aiPlayers.push(playerAI(player, id));
		}

		function setCallbacks (data) {
			callbacks = data;
		}

		
		function playerAI (player, id) {

			var myCurrentIndex,
			    currentOrder;

			var _iCall = function () {
				// TODO Ne a legelső lappal nyisson, hanem ésszel
				var cards = [];
				for (var i = 0; (i < player.cards.length); i++) {
					var c = player.cards[i];
					
					if (cards.length == 0) {
						cards.push(c);
					} else {
						if (cards[0].value != c.value && c.value != 2 && c.value != 15) break;
						cards.push(c);
					}
				};
				callbacks.put(id, function() {}, cards);
			};
			var _iPut = function () {
				// TODO Ne passzoljon, hanem ésszel
				var cards = [],
					num = callbacks.currentRound().cardsOnTable().last().cards.length,
					val = callbacks.currentRound().cardsOnTable().last().value;
				
				if (val == 15) {
					callbacks.put(id, function() {}, cards);
					return;
				};

				for (var i = 0; (i < player.cards.length); i++) {
					var c = player.cards[i];
					if (c.value != 2 && c.value <= val) continue;
					if (cards.length == 0) {
						cards.push(c);
					} else {
						if (cards[0].value != c.value && c.value != 2 && c.value != 15) cards.splice(0);
						cards.push(c);
					}
					if (cards.length == num) break;
				};
				if (cards.length !== num) cards.splice(0);
				console.log('I PUT', cards);
				callbacks.put(id, null, cards);
			};
			var _ready = function () {
				callbacks.ready(id);
			};
			var _updateModel = function () {
				// TODO
			};
			var _iTribute = function () {
				// TODO valami okosság
				callbacks.tributes(id, [4,2,1]);
			};
			var _iTributeBack = function (num) {
				// TODO ne a legelső numt, hanem értelmesen
				var cards = [];
				num.downto(1, function (i) {
					cards.push(player.cards[i]);
				});
				callbacks.tributeback(id, null, cards);
			};

			////////////////////////////////////////////////////

			var onNext = function (nextid) {
				if (nextid === id) {
					_iPut();
				};
			};

			var onNextCircle = function (callid) {
				if (callid === id) {
					_iCall();
				};
			};

			var onNewRound = function (data) {
				console.log("ONNEWROUND", data);
				currentOrder = data.order;
				myCurrentIndex = currentOrder.indexOf(id);
				console.log("ONNEWROUND index", myCurrentIndex);
				if (data.democratic) _ready();
				if (currentOrder.first() === id && !data.democratic) {
				console.log("ONNEWROUND", "I WILL TRIBUTE");
					_iTribute();
				};
			};

			var onPut = function (data) {
				_updateModel('put', data.from, data.cards);
				_ready();
			};

			var onTributes = function (tributes) {
				if (tributes.length > myCurrentIndex) {
					_iTributeBack(tributes[myCurrentIndex]);
				};
				_updateModel('tributes', tributes);
			};

			var onTributeBack = function () {
				_updateModel('tributeback');
				_ready();
			};

			var onNewPlayer = function (list) {
				// TODO
			};

			return {
				newplayer: onNewPlayer,
				newround: onNewRound,
				put: onPut,
				next: onNext,
				nextcircle: onNextCircle,
				tributes: onTributes,
				tributeback: onTributeBack
			};
		}





		return {
			newAiPlayer: newAiPlayer,
			aiPlayers: getAiPlayers,
			callbacks: setCallbacks
		};
	};
}();