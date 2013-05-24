define(["jquery", "connection", "log", "model", "protocols"], 
	function ($, bridge, log, model, protocols) {

	var ERROR = 0;
	var SIGNAL = 1;
	var TEST = 2;
	var INFO = 3;
	var ALL = 4;
	
	return function(){

  		var cardsSortByValue = function(a, b){
  			if(a.value == 2 || b.value == 2){
  				if(a.value == 2 && b.value != 2) return  1;
  				if(a.value != 2 && b.value == 2) return -1;
  				if(a.value == 2 && b.value == 2) {
	  				if(a.color <  b.color) return -1;
  					if(a.color >  b.color) return  1;
  					if(a.color == b.color) return  0;
  				}
  			}
  			else{
	  			if(a.value <  b.value) return -1;
  				if(a.value >  b.value) return  1;
  				if(a.value == b.value){
	  				if(a.color <  b.color) return -1;
  					if(a.color >  b.color) return  1;
  					if(a.color == b.color) return  0;
   				}
   			}
   			return 0;
  		};

  		var playersSortByOrder = function(a, b){
			if(a.order == b.order) 
				return 0;
			else if(a.order < b.order) 
				return -1;
			return 1;
		};

	/* Adatok küldése a szervernek */  		

		var sendUserName = function(){
  			bridge.sendData('myname', model.UserName.get());	
  		};
  		var sendAi = function(){
  			bridge.sendData('startgame', model.aiNumbers());	
  		};
  		var sendCards = function(){		// INFO [{color: 0, value: 8}, {color: x, value: y}...]
			bridge.sendData("put", model.SelectedCards.get());
  		};
  		var sendPassz = function(){
  			bridge.sendData("put", []);
  		};
  		var sendTribute = function(){
  			bridge.sendData('tributeback', model.SelectedCards.get());
  		};
  		var sendTributeAd = function(){
			bridge.sendData('tributes', model.TributeAd.get());
			model.TributeState.set(false);	// bár lehetne "T" is
  		};
  	
  	/* Adatok fogadása a szervertől */

    	var isTribute = function(){
    		if( model.getTributeData() )
    			if( model.getTributeData() > -1)
    				return true;
    		return false;
    	};
  		var __badname = function(data){
  			log("SIGNAL BADNAME", SIGNAL);
  			if(data.state)
  				model.Error.set("BADNAME");
  			else model.Error.set(false); 

	  		if(!data.state){	  					
	  			model.UserName.set(data.name);
				model.UserId.set(data.id);
				model.State.next();
			  }
  		};
  		var __cardnums = function(data){
  			log("SIGNAL CARDNUMS", SIGNAL);
            var elemek = model.Players.get().splice(0);
            
  			for (var i = 0; i < elemek.length && i < data.length; i++) {
  				elemek[i].setCardNums(data[i]);
  			};
  			model.Players.set(elemek);
  		};
  		var __mycards = function(data){
  			log("SIGNAL MYCARDS", SIGNAL);
  			for (var i = 0; i < data.length; i++) {
  				log(data[i], 1);
  			}
			log("SIGNAL MYCARDS2", SIGNAL);

  			for (var i = 0; i < data.length; i++) {
  				data[i].isSelected = false;
  			}

  			data.sort(cardsSortByValue);
  			model.Cards.set(data);

  			bridge.sendData("cardnums", null);
  		};
  		var __newplayer = function (data) {
  			log("SIGNAL NEWPLAYER", SIGNAL);
  			var lista = [];
			for (var i = 0; i < data.length; i++) {
				lista.push(protocols.Player(data[i], i));
    		}
    		model.Players.set(lista);
    		model.Players.log();
  		};
		var __next = function(data){
			log("SIGNAL NEXT", SIGNAL);
			log("TEST " + data, TEST);
			// INFO játéktér ürítése nincs, nem rakhat akármit
			// INFO data id játékos jön
			model.ActivePlayer.set(data);
			model.Players.refresh();
			// INFO ha legfelül 2/joker van autopassz
			var hossz = model.DepositedCards.get().length;
			if(model.DepositedCards.get()[hossz-1].isLargestCard())
				sendPassz();
			// INFO bridge.sendData('put', cards);
		};
		var __newround = function(data){
			log("SIGNAL NEWROUND", SIGNAL);
			model.DepositedCards.empty();

			var lista = model.Players.get();
			for (var i = 0; i < lista.length && i < data.order.length; i++) {
				var item = lista.MgetObjectWithCustomEquals(data.order[i], function(a,b){
  					if(a == b.id)
	  					return true;
  					return false;
  				});
  				item.order = i;
  				item.dignity = data.ranks[i];
			};
			lista.sort(playersSortByOrder);
			model.Players.set(lista);
			model.Players.log();

			bridge.sendData('mycards', null);
			if(data.democratic)	bridge.sendData('ready', null);
			else if(lista[0].id == model.UserId.get()) //	INFO itt nincs semmiképpen sem ready
				model.TributeState.set("AD");
            model.State.set(2);
		};
  		var __nextcircle = function(data){
  			log("SIGNAL NEXTCIRCLE", SIGNAL);
  			log("TEST " + data, TEST);
  			// INFO játéktér ürítése
  			model.DepositedCards.empty();
  			// INFO data id játékos jön
  			model.ActivePlayer.set(data);
  			// INFO játékosok frissítése
  			model.Players.refresh();
  		};
 		var __put = function (data) {
 			log("SIGNAL PUT", SIGNAL);

 			var cardGroup = protocols.CardGroup();

 			if(model.UserId.get() == data.from){				
 				for (var i = 0 ; i < data.cards.length; i++) {
 					var index = model.Cards.get().MindexOfObjectWithCustomEquals(data.cards[i], function(a,b){
 						a.isSelected = false;
 						b.isSelected = false;
 						if(a.color == b.color && a.value == b.value)
 							return true;
 						return false;
 					});
	 				if (index>-1) {
	 					var kartya = cards()[index];
	 					cardGroup.values.push(kartya.value);
	 					cardGroup.colors.push(kartya.color);
	 					cardGroup.isActive = true;
	 					model.Cards.get().splice(index, 1);}
 				};		
 				model.Cards.refresh();
 			}
 			else{
 				for (var i = 0 ; i < data.cards.length; i++) {
 					cardGroup.values.push(data.cards[i].value);
	 				cardGroup.colors.push(data.cards[i].color);
	 				cardGroup.isActive = true;
 				}
 			}

 			if (cardGroup.isActive)
 					model.DepositedCards.add(cardGroup);
			
			model.DepositedCards.refresh();
 			model.Players.refresh(); 			
 			model.UserObject.get(data.from).toLowerCardsNum(data.cards.length);
 			
  			bridge.sendData('ready', null);
  		};
		var __tributes = function(data){
			log("SIGNAL TRIBUTES", SIGNAL);
			log(data, SIGNAL);
			// INFO mycards és cardnums emit
			bridge.sendData('mycards', null);
			bridge.sendData('cardnums', null);

			var myObject = model.UserObject.get();
			// INFO rang ellenőrzése (felső vagy alsó n-ben)
			if(myObject.isTributeHigh(data.length)) // INFO felső ha order 0, 1, 2 ...
			{
				model.TributeState.set("T");
				model.Message.set("TRIBUTEBACK");
				// TODO ennyi lapot kell visszaadnom
				// INFO ha felső, akkor felület, mit adjunk vissza
			}
			else if(myObject.isTributeLow(players().length - data.length)){ // INFO alsó ha n-1, n-2, n-3 ...
				// INFO ha alsó, akkor csak rendezés
				cards.sort(cardsSortByValue);
			}
		};
		var __tributeback = function(data){
			log("SIGNAL TRIBUTEBACK", SIGNAL);

			if(data)
				model.TributeState.set(false);
			else
				model.Message.set("BADTRIBUTEBACK");
		};

		var __tributeready = function(){
			bridge.sendData('mycards', null);
			bridge.sendData('cardnums', null);
			bridge.sendData('ready', null);
		};

		var init = function(){
			bridge.registerSignal('newplayer',		__newplayer);
			bridge.registerSignal('badname', 		__badname);
			bridge.registerSignal('newround', 		__newround);
			bridge.registerSignal('mycards', 		__mycards);
			bridge.registerSignal('cardnums', 		__cardnums);
			bridge.registerSignal('tributes', 		__tributes);
			bridge.registerSignal('tributeback', 	__tributeback);
			bridge.registerSignal('tributeready',	__tributeready);
			bridge.registerSignal('nextcircle', 	__nextcircle);
			bridge.registerSignal('put', 			__put);
			bridge.registerSignal('next', 			__next);
        };

		var connectToServer = function(){
			bridge.connectToServer('http://localhost');
		};

		connectToServer();
		init();
		
		return {
			userName: 			model.userName,
			badname: 			model.badname,
			aiNumbers: 			model.aiNumbers,

			isLogin: 			model.isLogin,
			isError: 			model.isError,
			isSettings: 		model.isSettings,
			isAdmin: 			model.isAdmin,
			isInit: 	   		model.isInit,
			isGameStarted: 		model.isGameStarted,
			isYourNext: 		model.isYourNext,
			isTributeStateAD: 	model.isTributeStateAD,

			//	tömbök elérése
			getPlayers: 		model.Players.get,
			getCards: 			model.Cards.get,
			getDepositedCards: 	model.DepositedCards.get,
			
			//	csak ideiglenes listázás
			logCard: 			model.Cards.log,
			logPlayer: 			model.Players.log,
			logDepositedCards: 	model.DepositedCards.log,

			isTribute: 	   		isTribute,
			sendUserName: 		sendUserName,
			sendPassz: 			sendPassz,
			sendCards: 			sendCards,
			sendAi: 			sendAi,
			sendTribute: 		sendTribute,
			sendTributeAd: 		sendTributeAd,
			
			getMessage: 		model.getMessage,
			getMessageToUser: 	model.Message.get

		};
	};
});