define(["jquery", "connection", "gameMessages", "log", "model", "protocols"], 
	function ($, bridge, getMessage, log, model, protocols) {

	var ERROR = 0;
	var SIGNAL = 1;
	var TEST = 2;
	var INFO = 3;
	var ALL = 4;
	
	return function(){

		var sendUserName = function(){
  			bridge.sendData('myname', model.userName());	
  		};

  		var sendAi = function(){
  			bridge.sendData('startgame', model.aiNumbers());	
  		};

		// [{color: 0, value: 8}, {color: x, value: y}...]
  		var sendCards = function(){
			bridge.sendData("put", model.getSelectedCards());
  		};

  		var sendPassz = function(){
  			bridge.sendData("put", []);
  		};

  		var sendTribute = function(){
  			bridge.sendData('tributeback', model.getSelectedCards());
  		};

  		var sendTributeAd = function(){
			bridge.sendData('tributes', model.getTributeAd());
  		};

  		var cardsSort = function(a, b){
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

  		var __newplayer = function (data) {
  			log("SIGNAL NEWPLAYER", SIGNAL);
  			var lista = [];
			for (var i = 0; i < data.length; i++) {
				lista.push(protocols.Player(data[i], i));
    		}
    		model.setPlayer(lista);
    		model.logPlayer();
  		};

  		var __cardnums = function(data){
  			log("SIGNAL CARDNUMS", SIGNAL);
            var elemek = model.getPlayers().splice(0);
            
  			for (var i = 0; i < elemek.length && i < data.length; i++) {
  				elemek[i].setCardNums(data[i]);
  			};
  			model.setPlayer(elemek);
  		};

  		var __badname = function(data){
  			log("SIGNAL BADNAME", SIGNAL);
  			if(data.state)
  				model.setError("BADNAME");
  			else model.setError(false); 

	  		if(!data.state){	  					
	  			model.setUserName(data.name);
				model.setUserId(data.id);
				model.nextState();
			  }
  		};

  		var __mycards = function(data){
  			log("SIGNAL MYCARDS", SIGNAL);
  			for (var i = 0; i < data.length; i++) {
  				data[i].isSelected = false;
  			}

  			data.sort(cardsSort);
  			model.setCards(data);

  			bridge.sendData("cardnums", null);
  		};

  		var __nextcircle = function(data){
  			log("SIGNAL NEXTCIRCLE", SIGNAL);
  			log("TEST " + data, TEST);
  			model.emptyDepositedCards();
  			model.setActivePlayer(data);
  			// 	TODO 
  				// játéktér ürítése
  				// data id játékos jön
  				// bridge.sendData('put', cards);
  		};

 		var __put = function (data) {
 			log("SIGNAL PUT", SIGNAL);

 			var cardGroup = protocols.CardGroup();

 			if(model.getUserId() == data.from){				
 				for (var i = 0 ; i < data.cards.length; i++) {
 					var index = model.getCards().MindexOfObjectWithCustomEquals(data.cards[i], function(a,b){
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
	 					model.getCards().splice(index, 1);}
 				};		
 				model.refreshCards();
 			}
 			else{
 				for (var i = 0 ; i < data.cards.length; i++) {
 					cardGroup.values.push(data.cards[i].value);
	 				cardGroup.colors.push(data.cards[i].color);
	 				cardGroup.isActive = true;
 				}
 			}

 			if (cardGroup.isActive)
 					model.addElementToDepositedCards(cardGroup);
			
			model.refreshDepositedCards();
 			model.refreshPlayers(); 			
 			model.toLowerCardsNumById(data.from ,data.cards.length);

  			bridge.sendData('ready', null);
  		};

		var __next = function(data){
			log("SIGNAL NEXT", SIGNAL);
			log("TEST " + data, TEST);
			model.setActivePlayer(data);
			model.refreshPlayers();
			var hossz = model.getDepositedCards().length;
			if(model.getDepositedCards()[hossz-1].isLargestCard())
				sendPassz();
			// 	TODO 
				// INFO játéktér ürítése nincs, nem rakhat akármit
				// INFO data id játékos jön
				// INFO ha legfelül 2/joker van autopassz
				// INFO bridge.sendData('put', cards);
		};


		var __tributes = function(data){
			log("SIGNAL TRIBUTES", SIGNAL);
			// INFO mycards és cardnums emit
			bridge.sendData('mycards', null);
			bridge.sendData('cardnums', null);

			var myObject = getUserObject();
			// INFO rang ellenőrzése (felső vagy alsó n-ben)
			if(myObject().order < data.length) // INFO felső ha order 0, 1, 2 ...
			{
				isTributeState(true);
				//data[players()[userId()].order];
				// TODO ennyi lapot kell visszaadnom
				// INFO ha felső, akkor felület, mit adjunk vissza
			}
			else if(myObject().order >= players().length - data.length){ // INFO alsó ha n-1, n-2, n-3 ...
				// INFO ha alsó, akkor csak rendezés
				cards.sort(cardsSort);
			}
		};
		// TODO tributeback eseményt visszaküldeni cards paraméterrel. formátum: [{color: 0, value: 8}, {color: x, value: y}...]
		var __tributeback = function(data){
			log("SIGNAL TRIBUTEBACK", SIGNAL);

			if(typeof data == "undefined"){
				// INFO ready
				bridge.sendData('ready', null);
			}
			else if(data){
				// TODO kilép az adózási módból
			}
			else{
				// TODO alert
			}

			bridge.sendData('mycards', null);
			bridge.sendData('ready', null);
		};

		var __newround = function(data){
			log("SIGNAL NEWROUND", SIGNAL);
			model.emptyDepositedCards();

			var lista = model.getPlayers();
			for (var i = 0; i < lista.length && i < data.order.length; i++) {
				lista[data.order[i]].order = i;
			};
			lista.sort(function(a,b){
				if(a.order == b.order) return 0;
				else if(a.order < b.order) return -1;
				else return 1;
			});
			log("NEWROUND ORDER LOG", TEST);
			model.setPlayer(lista);
			model.logPlayer();

			bridge.sendData('mycards', null);
			if(data.democratic)
			{
				bridge.sendData('ready', null);
			}
			else{
				//	INFO itt nincs semmiképpen sem ready
				//  TODO adózás kihirdetése ha én vagyok az új nulla
			}
            model.toState(2);
		};

		var init = function(){
			bridge.registerSignal('newplayer',		__newplayer);
			bridge.registerSignal('badname', 		__badname);
			bridge.registerSignal('newround', 		__newround);
			bridge.registerSignal('mycards', 		__mycards);
			bridge.registerSignal('cardnums', 		__cardnums);
			bridge.registerSignal('tributes', 		__tributes);
			bridge.registerSignal('tributeback', 	__tributeback);
			bridge.registerSignal('nextcircle', 	__nextcircle);
			bridge.registerSignal('put', 			__put);
			bridge.registerSignal('next', 			__next);
        };

		var connectToServer = function(){
			bridge.connectToServer('http://localhost');
		};
		
    	var isTribute = function(){
    		if( model.getTributeData() )
    			if( model.getTributeData() > -1)
    				return true;
    		return false;
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
			userList: 			model.userList,

			//	tömbök elérése
			getPlayers: 		model.getPlayers,
			getCards: 			model.getCards,
			getDepositedCards: 	model.getDepositedCards,
			
			//	csak ideiglenes listázás
			logCard: 			model.logCard,
			logPlayer: 			model.logPlayer,
			logDepositedCards: 	model.logDepositedCards,

			isTribute: 	   		isTribute,
			sendUserName: 		sendUserName,
			sendPassz: 			sendPassz,
			sendCards: 			sendCards,
			sendAi: 			sendAi,
			sendTribute: 		sendTribute,
			sendTributeAd: 		sendTributeAd,
			
			getMessage: 		getMessage

		};
	};
});