module.exports = function () {
	var cards = [];

	//kártyák
	for (var color = 0; color < 4; color += 1) {
		for (var value = 2; value < 15; value += 1) {
			cards.push({color: color, value: value});
		};
	};

	// jollyk
	cards.push({color: 4, value: 15});
	cards.push({color: 4, value: 15});
	cards.push({color: 4, value: 15});

	return cards;
}();