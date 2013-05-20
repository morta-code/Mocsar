define([], function () {
	
	var map = {};

	map["BADNAME"] = "username is used";

	return function(code){
		return map[code];
	};
	
});