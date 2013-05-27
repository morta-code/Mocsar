define([], function () {
	
	var map = {};

	map["BADNAME"] = "username is used";
	map["TRIBUTEBACK"] = "Kérlek adj vissza %0 lapot";
	map["BADTRIBUTEBACK"] = "Hibás kártya visszaadás. Kérlek próbáld meg újra";
	map["BADCARDS"] = "Hibás lerakás. Próbáld újra.";
	map["TRIBUTEAD"] = "Adózás kihirdetése. Kérlek adj meg egy csökkenő sorozatot.";
	map["ACCESSDENIED"] = "A játék már elkezdődött. Nem Tudsz csatlakozni.";

	return function(code){
		return map[code];
	};
	
});