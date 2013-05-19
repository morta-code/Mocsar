define(["jquery", "ko"], function ($, ko) {

		$(window).bind('contextmenu', function(event){
    		log(event, INFO);
     		return false;
		});

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

		var switchColor = function(color){
			switch(color){
				case 0: return "treff-";
				case 1: return "karo-";
				case 2: return "kor-";
				case 3: return "pikk-";
			};
			return "";
		};

		var switchValue = function(value){
			switch(value){
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
				case 10: return value;
				case 11: return "J";
				case 12: return "Q";
				case 13: return "K";
				case 14: return "asz";
				case 15: return "joker";
			};
			return 0;
		};

    ko.bindingHandlers.cardBindings = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        	var card = valueAccessor(), allBindings = allBindingsAccessor();       
      
        	var cardIndex = ko.utils.unwrapObservable( allBindings.cardIndex );
        	var eltolas =  -1 * cardIndex * 100;
        	
        	var theCard = "card-" + switchColor(card.color) + switchValue(card.value);
			
        	$(element).attr({class: theCard});
        	if(card.isSelected){
        		$(element).addClass("selected");
        	}
   
        	$(element).css("left", cardIndex * 50);
			
			$(element).bind('contextmenu', function(event){
    			log(event, INFO);
     			return false;
			});

        	$(element).click(function(event){
        		log(event);
        		card.isSelected = !card.isSelected;
				var osztaly = $(element).attr('class');

        		if(card.isSelected){
	       			osztaly = "selected-" + osztaly;
        		}
        		else{
        			var splitted = osztaly.split("-");
        			if(splitted[0]==="selected"){
	        			splitted.splice(0,1);
        				osztaly = splitted.join("-");
        			}
        		}
        		$(element).attr({class: osztaly});
        	});


        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        	var card = valueAccessor(), allBindings = allBindingsAccessor();       
        
         	if(card.isSelected){
        		$(element).addClass("selected");
        	}
    	}
    };

    ko.bindingHandlers.cardsDepositedBindings = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			var card = valueAccessor(), allBindings = allBindingsAccessor();       
        	var cardIndex = ko.utils.unwrapObservable( allBindings.cardIndex );
			
			var cardCount =  card.values.length;
			
			for(var i=cardCount-1;i>=0;i--){
				var theCard = "de-card-" + switchColor(card.colors[i]) + switchValue(card.values[i]);
				var elem = $(document.createElement('span'));
					elem.attr({
						class: (theCard + "_" + (cardCount - i - 1))
					});
				$(element).append(elem);
			}
        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        }
    };

	return function(){

		this.userName       = ko.observable("");
		this.userId 		    = ko.observable("");
		this.aiNumbers      = ko.observable("5");
		this.badname        = ko.observable(false);
		this.players        = ko.observableArray([]);
		this.cards          = ko.observableArray([]);
		this.depositedCards = ko.observableArray([]);
		this.state          = ko.observable(0);
		this.isTributeState = ko.observable(false);
			
		var socket = null;
		var nameError = "username is used";

		var isLogin = ko.computed(function(){
			return (this.userName() == "" || this.userId() == "") && this.state() == 0;
		}, this);

		var isSettings = ko.computed(function(){
			return (this.userName() !== "" && this.userId() !== "") && this.state() == 1;
		}, this);

		var isAdmin = ko.computed(function(){
			return this.userId() == "0";
		}, this);

		var isInit = ko.computed(function(){
			return isLogin() || isSettings();
		}, this);

		var isError = ko.computed(function(){
			return badname();
		}, this);			

		var isGameStarted = ko.computed(function(){
			return this.state() == 2;
		}, this);

		var sendData = function(name, data){
			if(socket==null){
				connectToServer();
				init();
			}
			log("SEND " + name.toUpperCase(), SIGNAL);
			socket.emit(name, data);
		};

		var sendUserName = function(){
  			sendData('myname', this.userName());	
  		};

  		var sendAi = function(){
  			sendData('startgame', aiNumbers());	
  		};

		// [{color: 0, value: 8}, {color: x, value: y}...]
  		var sendCards = function(){
  			var c = [];
  			for (var i = 0; i < cards().length; i++) {
  				if(cards()[i].isSelected)
  					c.push({ color: cards()[i].color, value: cards()[i].value });
  			};
			sendData("put", c);
			log(c, TEST);
  		};

  		var sendPassz = function(){
  			sendData("put", []);
  		};

  		var sendTribute = function(){
  			var c = [];
  			for (var i = 0; i < cards().length; i++) {
  				if(cards()[i].isSelected)
  					c.push({ color: cards()[i].color, value: cards()[i].value });
  			};
			log(c, TEST);
  			sendData('tributeback', c);
  		};

  		var sendTributeAd = function(){
  			log("sendtributead", TEST);
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
			log(ad, TEST);
			sendData('tributes', ad);
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

  		var updatePlayerClass = function(){
  		};

  		var getNumberOfCardsSelected = function(){

  		};

  		var getUserObject = function(id){
  			id = id || userId();
  			return players().MgetObjectWithCustomEquals(id, function(a,b){
  				if(a == b.id)
  					return true;
  				return false;
  			});
  		};

  		var __newplayer = function (data) {
  			log("SIGNAL NEWPLAYER", SIGNAL);
    		players.removeAll();
			for (var i = 0; i < data.length; i++) {
				data[i].card = 0;
				data[i].active = false;
				data[i].dignity = "";
				data[i].order = i;
				data[i].tribute = 0;
				data[i].getHtmlClass = function(){
					log("getHtmlClass", ERROR);
					if(this.order<2)
						return "player-left-" + this.order;
					else if(this.order<10)
						return "player-center-" + this.order;
					else
						return "player-right-" + this.order;
				};
    		}
            players(data);
  		};

  		var __cardnums = function(data){
  			log("SIGNAL CARDNUMS", SIGNAL);
  			log("__cardnums");
  			log(players().length);
  			log(data.length);
            var elemek = players.removeAll();
  			for (var i = 0; i < elemek.length && i < data.length; i++) {
  				elemek[i].card = data[i];
  				log(elemek[i].card);
  			};
            players(elemek);
  			log(players());
  			players.valueHasMutated();
  		};

  		var __badname = function(data){
  			log("SIGNAL BADNAME", SIGNAL);
	  		badname(data.state);
	  		if(!data.state){	  					
	  			userName(data.name);
				userId(data.id);
				state(state()+1);
			  }
  		};

  		var __mycards = function(data){
  			log("SIGNAL MYCARDS", SIGNAL);
  			cards.removeAll();
  			for (var i = 0; i < data.length; i++) {
  				data[i].isSelected = false;
  			}
            
            // ez csak log
            log(data);
  			for (var i = 0; i < data.length; i++) {
  				log(data[i]);
  			}
            
  			data.sort(cardsSort);

            cards(data);
  			sendData("cardnums", null);
  		};

  		var __nextcircle = function(data){
  			log("SIGNAL NEXTCIRCLE", SIGNAL);
  			log("TEST " + data, TEST);
  			depositedCards.removeAll();
  			setActivePlayer(data);
			players.valueHasMutated();
  			// 	TODO 
  				// játéktér ürítése
  				// data id játékos jön
  				// sendData('put', cards);
  		};

 		var __put = function (data) {
 			log("SIGNAL PUT", SIGNAL);
 			log(data, TEST);

 			var cardGroup = (function(){
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
 			}());

 			if(userId() == data.from){
 				log("ID STIMMEL", INFO);
 				
 				for (var i = 0 ; i < data.cards.length; i++) {
 					log("FOR", INFO);
 					var index = cards().MindexOfObjectWithCustomEquals(data.cards[i], function(a,b){
 						if(a.color == b.color && a.value == b.value)
 							return true;
 						return false;
 					});
 					log("INDEX", INFO);
 					log(index, INFO);
	 				if (index>-1) {
	 					log("REMOVE", INFO); 
	 					var kartya = cards()[index];
	 					cardGroup.values.push(kartya.value);
	 					cardGroup.colors.push(kartya.color);
	 					cardGroup.isActive = true;
	 					cards().splice(index, 1);}
 				};		
 				
 				refreshCards();
 			}
 			else{
 				for (var i = 0 ; i < data.cards.length; i++) {
 					cardGroup.values.push(data.cards[i].value);
	 				cardGroup.colors.push(data.cards[i].color);
	 				cardGroup.isActive = true;
 				}
 			}

 			if (cardGroup.isActive)
 					depositedCards().push(cardGroup);
			refreshDepositedCards();
 			var pIndex = players().MindexOfObjectWithCustomEquals(data.from, function(a, b){
 				if(a == b.id)
 					return true;
 				return false;
 			});
 			players()[pIndex].card -= data.cards.length;
 			refreshPlayers();
 			
 			
  			//	TODO  data = {from: playerid, cards: cards};
  			// grafikus

  			sendData('ready', null);
  		};

		var __next = function(data){
			log("SIGNAL NEXT", SIGNAL);
			log("TEST " + data, TEST);
			setActivePlayer(data);
			//players.valueHasMutated();
			refreshPlayers();
			var hossz = depositedCards().length;
			if(depositedCards()[hossz-1].isLargestCard())
				sendPassz();
			// 	TODO 
				// INFO játéktér ürítése nincs, nem rakhat akármit
				// INFO data id játékos jön
				// INFO ha legfelül 2/joker van autopassz
				// INFO sendData('put', cards);
		};


		var __tributes = function(data){
			log("SIGNAL TRIBUTES", SIGNAL);
			// INFO mycards és cardnums emit
			sendData('mycards', null);
			sendData('cardnums', null);

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
				sendData('ready', null);
			}
			else if(data){
				// TODO kilép az adózási módból
			}
			else{
				// TODO alert
			}

			sendData('mycards', null);
			sendData('ready', null);
		};

		var __newround = function(data){
			log("SIGNAL NEWROUND", SIGNAL);
			depositedCards.removeAll();

			var lista = players().slice(0);
			for (var i = 0; i < lista.length && i < data.order.length; i++) {
				lista[data.order[i]].order = i;
			};
			lista.sort(function(a,b){
				if(a.order == b.order) return 0;
				else if(a.order < b.order) return -1;
				else return 1;
			});
			log("NEWROUND ORDER LOG", TEST);
			log(lista[0].order, TEST);
			log(lista[0].id, TEST);
			players(lista);

			sendData('mycards', null);
			if(data.democratic)
			{
				sendData('ready', null);
			}
			else{
				//	INFO itt nincs semmiképpen sem ready
				//  TODO adózás kihirdetése ha én vagyok az új nulla
			}
            state(2);
			log(data);
		};
		var init = function(){
			socket.on('newplayer',		__newplayer);
			socket.on('badname', 		__badname);
			socket.on('newround', 		__newround);
			socket.on('mycards', 		__mycards);
			socket.on('cardnums', 		__cardnums);
			socket.on('tributes', 		__tributes);
			socket.on('tributeback', 	__tributeback);
			socket.on('nextcircle', 	__nextcircle);
			socket.on('put', 			__put);
			socket.on('next', 			__next);
        };

		var connectToServer = function(){
			//socket = io.connect('http://localhost');
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
			return cards;
		};
		
		var getDepositedCards = function(){
			return depositedCards;
		};

		var logCard = function(){
			for (var i = 0; i < cards().length; i++) {
  				log(cards()[i], TEST);
  			}
  		};

  		var logDepositedCards = function(){
			for (var i = 0; i < depositedCards().length; i++) {
  				log(depositedCards()[i], TEST);
  			}
  		};

  		var logPlayer = function(){
  			log("LOGPLAYER", TEST);
			for (var i = 0; i < players().length; i++) {
  				log(i + " -> ", TEST);
  				log(players()[i], TEST);
  			}
  		};
		
  		var setActivePlayer = function(id){
  			for (var i = 0; i < players().length; i++) {
  				players()[i].active = false;
  				if(players()[i].order == id)
  					players()[i].active = true;
  			};
  		};

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

    	var isTribute = function(){
    		log("ISTRIBUTE", TEST);
    		if(isTributeState()){
    			log("istribute_1", TEST);
    			if( players().length > 0 ){
    				log("istribute_2", TEST);
	    			var userObject = getUserObject();
    				if( typeof userId() != "undefined" )
    				{log("istribute_3", TEST);
	    				if( typeof userObject != "undefined" ){
	    					log("istribute_4", TEST);
    						if( typeof userObject.order != "undefined" ){
    							log("istribute_5", TEST);
	    						return userObject.order > -1;
	    					}
	    				}
	    			}
    			}
    		}
      		return false;
    	};

    	var isYourNext = function(){
    		log("ISYOURNEXT", TEST);
    		if( players().length > 0 )
    		{
    			var userObject = getUserObject();
    			if( typeof userId() != "undefined" )
    				if( typeof userObject != "undefined" )
    					if( typeof userObject.active != "undefined" )
    						return userObject.active;
    		}
    		return false;
    	};

		var userList = ko.computed(function(){
			var html = "";
			for (var i = 0; i < players().length; i++) {
				html += ("<div>" + players()[i].name + "</div>");
			};
			return html;
		}, this);

		connectToServer();
		init();
		
		return {
			userName: userName,
			nameError: nameError,
			badname: badname,

			isLogin: isLogin,
			isError: isError,
			isSettings: isSettings,
			isAdmin: isAdmin,
			isInit: isInit,
			isGameStarted: isGameStarted,
			isTribute: isTribute,
			isYourNext: isYourNext,

			players: players,
			getPlayers: getPlayers,
			getCards: getCards,
			getDepositedCards: getDepositedCards,
			logCard: logCard,
			logPlayer: logPlayer,
			logDepositedCards: logDepositedCards,

			sendUserName: sendUserName,
			sendPassz: sendPassz,
			sendCards: sendCards,
			sendAi: sendAi,
			sendTribute: sendTribute,
			sendTributeAd: sendTributeAd,

			userList: userList
		};
	};
});