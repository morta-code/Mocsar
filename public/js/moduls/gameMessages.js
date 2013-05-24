define([], function () {
	
	var map = {};

	map["BADNAME"] = "username is used";
	map["TRIBUTEBACK"] = "Kérlek adj vissza x lapot";
	map["BADTRIBUTEBACK"] = "Hibás kártya visszaadás. Kérlek próbáld meg újra";
	map["BADCARDS"] = "Hibás lerakás. Próbáld újra.";

	return function(code){
		return map[code];
	};
	
});