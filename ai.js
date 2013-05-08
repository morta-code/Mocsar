module.exports = function () {
	require('./public/js/jsexpansion');

	return function (db, players) {
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
				cards.push(player.cards.first());
				callbacks.put(id, function() {}, cards);
			};
			var _iPut = function () {
				// TODO Ne passzoljon, hanem ésszel
				var cards = [];
				callbacks.put(id, function() {}, cards);
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
				callbacks.tributeback(id, function() {}, cards);
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
				currentOrder = data.order;
				myCurrentIndex = currentOrder.indexOf(id);
				if (currentOrder.first() === id && !data.democratic) {
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