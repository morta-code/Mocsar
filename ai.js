module.exports = function () {
	require('./jsexpansion');

	return function (db, players) {

		var players = players;
		var aiPlayers = [];

		
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

			var onNewRound = function (neworder) {
				myCurrentIndex = neworder.indexOf(id);
				currentOrder = neworder;
				if (neworder.first() === id) {
					_iTribute();
				};
			};

			var onPut = function (fromId, cards) {
				_updateModel('put' ,fromId, cards);
				_ready();
			};

			var onTribute = function (tributes) {
				if (tributes.length > myCurrentIndex) {
					_iTributeBack(tributes[myCurrentIndex]);
				};
				_updateModel('tributes', tributes);
			};

			var onTributeBack = function () {
				_updateModel('tributeback');
				_ready();
			};

			return {

			};
		}



		return {
			newAiPlayer: null,
			aiPlayers: null

		};
	};
}();