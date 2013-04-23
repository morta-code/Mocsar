module.exports = function () {

	Number.prototype.times = function (cb) {for(var i = 0; i < this; i++){cb(i)};};

	var cards = [];

	//kártyák
	// for (var color = 0; color < 4; color += 1) {
	// 	for (var value = 2; value < 15; value += 1) {
	// 		cards.push({color: color, value: value});
	// 	};
	// };

	(4).times(function(color) {
		(13).times(function(value) {
			cards.push({color: color, value: value+2});
		});
	});

	// jollyk
	cards.push({color: 4, value: 15});
	cards.push({color: 4, value: 15});
	cards.push({color: 4, value: 15});

	return cards;
}();