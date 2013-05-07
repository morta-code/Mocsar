Mocsar
======

Mocsár kártyajáték

	// Returns the index of value in the array of objects. Otherwise -1
	Array.prototype.indexOfKeyValue = function (key, value) {
		for (var i = 0; i < this.length; i++) {
			for (var prop in this[i]) {
				if (prop !== key) continue;
				if ((this[i])[prop] === value) return i;
			}
		};
		return -1;
	};