define([], function () {
	
	var Player = function(obj, index){
		obj.card = 0;
		obj.active = false;
		obj.dignity = "";
		obj.order = index;
		obj.tribute = 0;
		obj.setCardNums = function(num){
			this.card = num;
		};
		obj.getHtmlClass = function(){
			if(this.order < 2) return "player-left-" + this.order;
			else if(this.order < 10) return "player-center-" + this.order;
			else return "player-right-" + this.order;
		};
		return obj;
	};

	var CardGroup = function(){
		var colors = [];
		var values = [];
		var isLargestCard = function(){
			var magas = true;
			for (var i = 0; i < values.length; i++) {
				if(values[i] != 15 && values[i] != 2){
					magas = false;
					break;
				}
			};
			return magas;
		};
		return {
			values: values,
			colors: colors,
			isActive: false,
			isLargestCard: isLargestCard
		};
	};

	return {
		Player: Player,
		CardGroup: CardGroup
	};
});