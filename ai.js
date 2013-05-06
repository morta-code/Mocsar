module.exports = function () {
	require('./jsexpansion');

	return function (db, players) {
		var aiPlayers = [];
		var callbacks;

		function getAiPlayers () {
			return aiPlayers;
		};

		function newAiPlayer (player, id) {
			aiPlayers.push(playerAI(player, id));
		};

		function setCallbacks (data) {
			callbacks = data;
		}

		
		function playerAI (player, id) {

			var myCurrentIndex;
			var currentOrder

			var _iCall = function () {
				// body...
			};
			var _iPut = function () {
				// body...
			};
			var _ready = function () {
				// body...
			};
			var _updateModel = function () {
				// body...
			};
			var _iTribute = function () {
				// body...
			};
			var _iTributeBack = function (num) {
				// body...
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
				if (currentOrder.first() === id) {
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
		};





		return {
			newAiPlayer: newAiPlayer,
			aiPlayers: getAiPlayers,
			callbacks: setCallbacks
		};
	};
}();