define([], function () {
	var ERROR = 0;
	var SIGNAL = 1;
	var TEST = 2;
	var INFO = 3;
	var ALL = 4;
	
	var levelSzint = TEST;

	var log = function(data, level){
		var level = level || INFO;
		if(level <= levelSzint)
			console.log(data);
	};
	return log;
});