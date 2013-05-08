
/////////////////////T//O//O//L//S/////////////////////

// Get random integer.
// If one param is given, the intervall will be 0 (incl) to param (incl)
// If two params are given, the intervall will be p1 (incl) to p2 (incl) 
(global ? global : window).rndInt = function () {
	if(arguments.length === 1){
		return Math.floor(Math.random() * (arguments['0'] + 1));
	}
	if(arguments.length === 2){
		return Math.floor(Math.random() * (arguments['1'] - arguments['0'] + 1)) + arguments['0'];
	}
}

/*
(global ? global : window).compareCards = function (a, b) {

//	if(typeof b === 'undefined'){
//		console.log("b is undefined");
//		return 1;
//	}

	if(typeof a !== "object" || typeof b !== "object")
		return 0;
	if (a.value === 2 && b.value !== 2) return 1;
	return a.value - b.value;
}
*/

/////////////////////A//R//R//A//Y/////////////////////


// Removes the all given items from the Array. It modifies the original array.
Array.prototype.remove = function () {
	var func = this;
	var values = [];
	for (var prop in arguments) {
		values.push(arguments[prop]);
	}

	values.forEach(function (act) {
		func.splice(func.indexOf(act), 1);
	});
};


// Removes the all given items (Array) from the Array. It modifies the original array.
Array.prototype.removeAll = function (items) {
	var func = this;

	items.forEach(function (act) {
		func.splice(func.indexOf(act), 1);
	});
};


// Returns a new array from original, but the items will be shaked
Array.prototype.shaked = function () {
	var ret = [],
		idxs = [];

	this.forEach(function (a, i) {
		idxs.push(i);
	});

	while (idxs.length !== 0) {
		ret.push(this[idxs.splice(rndInt(idxs.length-1),1)]);
	}

	return ret;
};


// Returns true if the array contains SOME of given arguments
Array.prototype.containsOne = function () {
	for (var prop in arguments) {
		if (this.indexOf(arguments[prop]) !== -1) return true;
	}
	return false;
};


// Returns true if the array contains ALL of given arguments (Array)
Array.prototype.containsAll = function (items) {
	var func = this;
	var ret = true;
	items.forEach(function (act) {
		if (func.indexOf(act) === -1) {ret = false;};
	});
	return ret;
};


// Returns true if the array contains ALL of given arguments
Array.prototype.contains = function () {
	for (var prop in arguments) {
		if (this.indexOf(arguments[prop]) === -1) return false;
	}
	return true;
};

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


// Returns a value from the Array for the given index. If the index is out of bounds, default value will be returned.
Array.prototype.fetch = function (idx, def) {
	var value = this[idx];
	if (value) {return value;} else {return def;}
};


// Returns the first value of the Array. If the array is empty, it will be undefinded.
Array.prototype.first = function () {
	return this[0];
};


// Returns the last value of the Array. If the array is empty, it will be undefinded.
Array.prototype.last = function () {
	if (this.length === 0) {return undefined;};
	return this[this.length-1];
};


// Returns a new array without of the duplicates of elements.
Array.prototype.uniq = function () {
	var arr = [];
	this.forEach(function (act) {
		if (arr.indexOf(act) === -1) arr.push(act); 
	});
	return arr;
};


// Returns the forty second item of the Array. It is undefined if the Array is shorter.
Array.prototype.fortyTwo = function () {
	return this[42];
};



////////////////////O//B//J//E//C//T///////////////////


// Returns the array of all keys of the object.
Object.prototype.keys = function () {
	var keys = [];
	for (var prop in this) {
		if (typeof this[prop] !== 'function') keys.push(prop);
	}
	return keys;
};


// Returns the array of all values of the object.
Object.prototype.values = function () {
	var values = [];
	for (var prop in this) {
		if (typeof this[prop] !== 'function') values.push(this[prop]);
	}
	return values;
};


// It iterates over all key-value pairs and call the parameter function.
Object.prototype.eachPair = function(cb) {
	for (var prop in this) {
		if (typeof this[prop] !== 'function'){
				var ret = cb(prop, this[prop]);
				if (ret === "break") {break;};
			}
	}
};


// Returns a value from the Object for the given key. If the key can’t be found, default value will be returned.
Object.prototype.fetch = function(key, def) {
	var value = this[key];
	if (value) {return value;} else {return def;};
};


// Returns true if the given key is present in the Object.
Object.prototype.hasKey = function(key) {
	for (var prop in this) {
		if (prop === key) {return true;};
	}
	return false;
};

// Returns true if the given value is present in the Object.
Object.prototype.hasValue = function(value) {
	for (var prop in this) {
		if (this[prop] === value) {return true;};
	}
	return false;
};

// Returns the key of the given value if it present in the Object. Otherwise it returns undefined.
Object.prototype.keyOf = function(value) {
	for (var prop in this) {
		if (this[prop] === value) {return prop;};
	}
	return undefined;
};


// Merge the given object to the current object.
Object.prototype.merge = function(otherObject) {
	for (var prop in otherObject) {
		this[prop] = otherObject[prop];
	}
};

////////////////////N//U//M//B//E//R///////////////////

Number.prototype.times = function (cb) {
	for(var i = 0; i < this; i++){
		var ret = cb(i, this);
		if (ret === "break") {break;};
	};
};

Number.prototype.upto = function (lim, cb) {
	for(var i = this | 0; i <= lim; i++){
		var ret = cb(i);
		if (ret === "break") {break;};
	};
};

Number.prototype.downto = function (lim, cb) {
	for(var i = this | 0; i >= lim; i--){
		var ret = cb(i);
		if (ret === "break") {break;};
	};
};

/////////////////F//U//N//C//T//I//O//N////////////////

Function.prototype.if = function (condition){
	if(condition){
		if (arguments.length == 1) {
			return this();
		} else {
			var args = [];
			for (var prop in arguments) {
				if(prop != 0) args.push(arguments[prop]);
			}
			return this.apply(this, args);
		};
	}
};

Function.prototype.unless = function (condition){
	if(!condition){
		if (arguments.length == 1) {
			return this();
		} else {
			var args = [];
			for (var prop in arguments) {
				if(prop != 0) args.push(arguments[prop]);
			}
			return this.apply(this, args);
		};
	}
};

 Function.prototype.while = function (condition){
 	if (arguments.length == 1) {
	 	while (condition){
	 		var ret = this();
	 		if (ret === "break") {break;};
	 	}
	} else {
		var args = [];
		for (var prop in arguments) {
			if (prop != 0) args.push(arguments[prop]);
		}
		while (condition){
	 		var ret = this.apply(this, args);
	 		if (ret === "break") {break;};
	 	}
	};
 };

 Function.prototype.until = function (condition){
 	if (arguments.length == 1) {
	 	while (!condition){
	 		var ret = this();
	 		if (ret === "break") {break;};
	 	}
	} else {
		var args = [];
		for (var prop in arguments) {
			if (prop != 0) args.push(arguments[prop]);
		}
		while (!condition){
	 		var ret = this.apply(this, args);
	 		if (ret === "break") {break;};
	 	}
	};
 };