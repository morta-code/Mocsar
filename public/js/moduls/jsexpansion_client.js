define([], function () {
	console.log("JSEXPANSION CLIENT LOADED");

/*
/////////////////////A//R//R//A//Y/////////////////////
*/

// Removes the all given items from the Array. It modifies the original array.
Array.prototype.Mremove = function () {
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
Array.prototype.MremoveAll = function (items) {
	var func = this;

	items.forEach(function (act) {
		func.splice(func.indexOf(act), 1);
	});
};


// Returns a new array from original, but the items will be shaked
Array.prototype.Mshaked = function () {
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
Array.prototype.McontainsOne = function () {
	for (var prop in arguments) {
		if (this.indexOf(arguments[prop]) !== -1) return true;
	}
	return false;
};


// Returns true if the array contains ALL of given arguments (Array)
Array.prototype.McontainsAll = function (items) {
	var func = this;
	var ret = true;
	items.forEach(function (act) {
		if (func.indexOf(act) === -1) {ret = false;};
	});
	return ret;
};


// Returns true if the array contains ALL of given arguments
Array.prototype.Mcontains = function () {
	for (var prop in arguments) {
		if (this.indexOf(arguments[prop]) === -1) return false;
	}
	return true;
};

// Returns the index of value in the array of objects. Otherwise -1
Array.prototype.MindexOfKeyValue = function (key, value) {
	for (var i = 0; i < this.length; i++) {
		for (var prop in this[i]) {
			if (prop != key) continue;
			if ((this[i])[prop] == value) return i;
		}
	};
	return -1;
};

// Returns the index of given object in the array of objects. Otherwise -1
Array.prototype.MindexOfObject = function (obj) {
	for (var i = this.length - 1; i >= 0; i--) {
		var it = true;
		for (var prop in this[i]) {
			if (obj[prop] != this[i][prop]) {
				it = false;
				break;
			}
		}
		for (var prop in obj) {
			if (obj[prop] != this[i][prop]) {
				it = false;
				break;
			}
		}
		if (it) return i;
	};
	return -1;
};

// Returns the index of given object in the array of objects. Otherwise -1
Array.prototype.MindexOfObjectWithCustomEquals = function (obj, eq) {

	eq = eq || function(a,b){
		var it = true;
		for (var prop in b) {
			if (a[prop] != b[prop]) {
				it = false;
				break;
			}
		}
		for (var prop in a) {
			if (a[prop] != b[prop]) {
				it = false;
				break;
			}
		}
		if (it) return true;
		return false;
	}

	for (var i = this.length - 1; i >= 0; i--) {
		if( eq(obj, this[i]) ) 
			return i;
	};
	return -1;
};

Array.prototype.MgetObjectWithCustomEquals = function (obj, eq) {

	eq = eq || function(a,b){
		var it = true;
		for (var prop in b) {
			if (a[prop] != b[prop]) {
				it = false;
				break;
			}
		}
		for (var prop in a) {
			if (a[prop] != b[prop]) {
				it = false;
				break;
			}
		}
		if (it) return true;
		return false;
	}

	for (var i = this.length - 1; i >= 0; i--) {
		if( eq(obj, this[i]) ) 
			return this[i];
	};
	return null;
};

// Returns a value from the Array for the given index. If the index is out of bounds, default value will be returned.
Array.prototype.Mfetch = function (idx, def) {
	var value = this[idx];
	if (value) {return value;} else {return def;}
};


// Returns the first value of the Array. If the array is empty, it will be undefinded.
Array.prototype.Mfirst = function () {
	return this[0];
};


// Returns the last value of the Array. If the array is empty, it will be undefinded.
Array.prototype.Mlast = function () {
	if (this.length === 0) {return undefined;};
	return this[this.length-1];
};


// Returns a new array without of the duplicates of elements.
Array.prototype.Muniq = function () {
	var arr = [];
	this.forEach(function (act) {
		if (arr.indexOf(act) === -1) arr.push(act); 
	});
	return arr;
};


// Returns the forty second item of the Array. It is undefined if the Array is shorter.
Array.prototype.MfortyTwo = function () {
	return this[42];
};


Number.prototype.Mtimes = function (cb) {
	for(var i = 0; i < this; i++){
		var ret = cb(i, this);
		if (ret === "break") {break;};
	};
};

Number.prototype.Mupto = function (lim, cb) {
	for(var i = this | 0; i <= lim; i++){
		var ret = cb(i);
		if (ret === "break") {break;};
	};
};

Number.prototype.Mdownto = function (lim, cb) {
	for(var i = this | 0; i >= lim; i--){
		var ret = cb(i);
		if (ret === "break") {break;};
	};
};

/////////////////F//U//N//C//T//I//O//N////////////////

Function.prototype.Mif = function (condition){
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

Function.prototype.Munless = function (condition){
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

 Function.prototype.Mwhile = function (condition){
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

 Function.prototype.Muntil = function (condition){
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



});