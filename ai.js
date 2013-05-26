module.exports = function () {
	require('./jsexpansion');
	var db = require('./db.json'),
		fs = require('fs');

	function AIFuzzyCards (cards) {
		var value = 0;
		var numOfCardValues = [0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //[2,3,4,5,6,7,8,9,10,J,Q,K,A,Y]
		cards.forEach(function (a) {
			numOfCardValues[a.value - 2] += 1;
		});
		numOfCardValues[13] += numOfCardValues[0];
		numOfCardValues.shift();
		numOfCardValues.forEach(function (a, i) {
			var current = i+3;
			if (a > 0) {
					 if (current === 3) {value -= 5;}
				else if (current === 4) {value -= 5;}
				else if (current === 5) {value -= 3;}
				else if (current === 6) {value -= 2;}
				else if (current === 7) {value -= 1;}
				else if (current === 8) {value += 1;}
				else if (current === 9) {value += 1;}
				else if (current === 10) {value += 2;}
				else if (current === 11) {value += 3;}
				else if (current === 12) {value += 3;}
				else if (current === 13) {value += 4;}
				else if (current === 14) {value += 5;}
				else if (current === 15) {value += 7;}

				if (a === 1) value -= 3;
				else value += a;
			};
		});
																						console.log(value);
	}

	function ChooseStrategy (collection, rank, cardsval, no_of_singles, no_of_high) {
		// collection: rank, cardsval, no_of_singles, no_of_high, strategy
	}

	function ChooseTributeBack () {
		// TODO
	}

	function saveDB () {
		fs.writeFileSync('db.json', JSON.stringify(db));
	}

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
				iSendTribute = false,
			    currentOrder,
			    cardsval,	// Húzott kártyák (adózás utáni) értéke
			    no_of_singles,
			    no_of_high,
			    myStrategy; // 'finishfirst', 'betterposition', 'keep', 'noswamp'

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
				callbacks.put(id, null, cards);
			};
			var _ready = function () {
				callbacks.ready(id);
			};
			var _updateModel = function () {
				// TODO
			};
			var _iTribute = function () {
				var a = rndInt(3, 5);
				var b = rndInt(2, a-1);
				var c = rndInt(1,b-1);
				callbacks.tributes(id, [a,b,c]);
			};
			var _iTributeBack = function (num) {
				// TODO ne a legelső numt, hanem értelmesen
				var cards = [];
				Number(num).downto(1, function (i) {
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
				iSendTribute = false;
				currentOrder = data.order;
				myCurrentIndex = currentOrder.indexOf(id);
				if (data.democratic) {
					_ready();
				}
				if (currentOrder.first() === id && !data.democratic) {
					iSendTribute = true;
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

			var onTributeReady = function () {
				_ready();
			};

			var onNewPlayer = function (list) {
				// TODO
			};

			var getISendTribute = function () {
				return iSendTribute;
			}

			return {
				newplayer: onNewPlayer,
				newround: onNewRound,
				put: onPut,
				next: onNext,
				nextcircle: onNextCircle,
				tributes: onTributes,
				tributeback: onTributeBack,
				tributeready: onTributeReady,
				iSendTribute: getISendTribute,
				sendTribute: _iTribute
			};
		}





		return {
			newAiPlayer: newAiPlayer,
			aiPlayers: getAiPlayers,
			callbacks: setCallbacks,
			saveDB: saveDB
		};
	};
}();