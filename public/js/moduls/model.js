define(["jquery", "ko", "log"], function ($, ko, log) {

		this.userName       = ko.observable("");
		this.userId         = ko.observable("");
		this.aiNumbers      = ko.observable("5");
		this.badname        = ko.observable(false);
		this.players        = ko.observableArray([]);
		this.cards          = ko.observableArray([]);
		this.depositedCards = ko.observableArray([]);
		this.state          = ko.observable(0);
		this.isTributeState = ko.observable(false);
		this.messageCode	= ko.observable(false);
	
		var refreshPlayers = function(){
	      	var data = players().slice(0);
	       	players([]);
	       	players(data);
	   	};

	   	var refreshDepositedCards = function(){
	   		var data = depositedCards().slice(0);
	       	depositedCards([]);
	       	depositedCards(data);	
	   	};

	   	var refreshCards = function(){
	   		var data = cards().slice(0);
	       	cards([]);
	       	cards(data);	
	   	};
	
	   	var getPlayers = function(isTributePlayers){
			var tributeIs = isTributePlayers || false;
			var hossz = players().length;
			if(tributeIs){
				var lista = [];
				for (var i = 0; i < hossz; i++) {
					if(players()[i].order >= hossz/2)
						lista.push(players()[i]);
				};
				return lista;
			}
			return players();
		};
		var getCards = function(){
			return cards();
		};
		var getDepositedCards = function(){
			return depositedCards();
		};
		var isLogin = function(){
			return (this.userName() === "" || this.userId() === "") && this.state() == 0;
		};
		var isSettings = function(){
			return (this.userName() !== "" && this.userId() !== "") && this.state() == 1;
		};
		var isAdmin = function(){
			return this.userId() == "0";
		};
		var isInit = function(){
			return isLogin() || isSettings();
		};
		var isError = function(){
			return badname();
		};
		var isGameStarted = function(){
			return state() == 2;
		};
		var messageToUser = function(){
    		return "minta szöveg";
    	};
		var userList = function(){
			var html = "";
			for (var i = 0; i < players().length; i++) {
				html += ("<div>" + players()[i].name + "</div>");
			};
			log(html, 0);
			return html;
		};
  		var getUserObject = function(id){
  			id = id || userId();
  			log(id, 0);
  			return players().MgetObjectWithCustomEquals(id, function(a,b){
  				if(a == b.id)
  					return true;
  				return false;
  			});
  		};
		var getTributeData = function(){
    		if(isTributeState()){
    			if( players().length > 0 ){
	    			var userObject = getUserObject();
    				if( userObject ){
   						if( typeof userObject.order != "undefined" ){
    						return userObject.order;
	    				}
	    			}
    			}
    		}
      		return false;
    	};
    	var isYourNext = function(){
    		if( players().length > 0 )
    		{
    			var userObject = getUserObject();
    			if( userObject )
   					if( typeof userObject.active != "undefined" )
   						return userObject.active;
    		}
    		return false;
    	};

  		var setActivePlayer = function(id){
  			for (var i = 0; i < players().length; i++) {
  				players()[i].active = false;
  				if(players()[i].order == id)
  					players()[i].active = true;
  			};
  		};

  		var setError = function(code){
  			badname(code);
  		};

  		var getErrorCode = function(){
  			return badname;
  		};

  		var getSelectedCards = function(){
  			var c = [];
  			for (var i = 0; i < cards().length; i++) {
  				if(cards()[i].isSelected)
  					c.push({ color: cards()[i].color, value: cards()[i].value });
  			};
  			return c;
  		};

  		var getTributeAd = function(){
			var ad = [];
			for (var i = players().length - 1; i >= 0; i--) {
				if(players()[i].tribute > 0)
					ad.push(players()[i].tribute);
			};
			ad.sort(function(a,b){
				if(a == b) return 0;
				if(a >  b) return -1;
				return 1;
			});
			return ad;
  		};

  		var setPlayer = function(data){
  			//this.players.removeAll();
  			players(data);
  			this.players.valueHasMutated();
  			refreshPlayers();
  			logPlayer();
  		};
  		var setCards = function(data){
  			cards.removeAll();
  			cards(data);
  			cards.valueHasMutated();
  		};
  		var emptyDepositedCards = function(){
  			depositedCards.removeAll();
  		};
  		var setUserName = function(name){
  			userName(name);
  		};

  		var setUserId = function(id){
  			userId(id);
  		};

  		var nextState = function(){
  			state(state()+1);
  			log(state(), 1);
  		};

  		var toState = function(st){
  			state(st);
  			log(state(), 1);
  		};

  		var addElementToDepositedCards = function(element){
  			depositedCards.push(element);
  		};

  		var toLowerCardsNumById = function(id, num){
				var index = players().MindexOfObjectWithCustomEquals(id, function(a, b){
 				if(a == b.id)
 					return true;
 				return false;
 			});
 			players()[index].card -= num;
  		};

  		var logCard = function(){
			for (var i = 0; i < cards().length; i++) {
  				log(cards()[i], 2);
  			}
  		};

  		var logDepositedCards = function(){
			for (var i = 0; i < depositedCards().length; i++) {
  				log(depositedCards()[i], 2);
  			}
  		};

  		var logPlayer = function(){
  			log("LOGPLAYER", 2);
			for (var i = 0; i < players().length; i++) {
  				log(i + " -> ", 2);
  				log(players()[i], 2);
  			}
  		};

  		var removeAllfromPlayer = function(){
  			return players().slice(0);
  		};

  		var getUserId = function(){
  			return userId();
  		};

  		var isTributeAd = function(){};

		return {
			userName: 						userName, 
			userId: 						userId, 
			aiNumbers: 						aiNumbers,
			badname: 						badname, 
			players: 						players,
			cards: 							cards,
			depositedCards: 				depositedCards,
			state: 							state,
			isTributeState: 				isTributeState,
	

			refreshCards: 					refreshCards,
			refreshPlayers: 				refreshPlayers,
			refreshDepositedCards: 			refreshDepositedCards,

			logDepositedCards: 				logDepositedCards,
			logCard: 						logCard,
			logPlayer: 						logPlayer,

			setPlayer: 						setPlayer,
			setCards: 						setCards,
			setActivePlayer:				setActivePlayer,
			setError: 						setError,
			setUserId: 						setUserId,
			setUserName: 					setUserName,
	
			getUserId: 						getUserId,
			getErrorCode: 					getErrorCode,
			getPlayers: 					getPlayers,
			getCards: 						getCards,
			getDepositedCards: 				getDepositedCards,
			getUserObject: 					getUserObject,
			getTributeAd: 					getTributeAd,
			getTributeData: 				getTributeData,
			getSelectedCards: 				getSelectedCards,

			isYourNext: 					isYourNext,

			emptyDepositedCards: 			emptyDepositedCards,
			addElementToDepositedCards: 	addElementToDepositedCards,
			toLowerCardsNumById: 			toLowerCardsNumById,
			toState: 						toState,

			nextState: 						nextState,
			removeAllfromPlayer: 			removeAllfromPlayer,
			messageToUser: 					messageToUser,

			isSettings: 					ko.computed(isSettings,    this),
			isLogin: 						ko.computed(isLogin,       this),
			isAdmin: 						ko.computed(isAdmin,       this),
			isInit: 						ko.computed(isInit,        this),
			isError: 						ko.computed(isError,       this),			
			isGameStarted: 					ko.computed(isGameStarted, this),
			userList: 						ko.computed(userList,      this)

		};

});