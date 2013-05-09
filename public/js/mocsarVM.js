define(["jquery", "ko"], function ($, ko) {

    ko.bindingHandlers.cardBindings = {
        init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        	var card = valueAccessor(), allBindings = allBindingsAccessor();       
        
        	var cardIndex = ko.utils.unwrapObservable( allBindings.cardIndex );
        	var eltolas =  -1 * cardIndex * 100;
        	
        	var theCard = "card-";
			switch(card.color){
				case 0: theCard+="treff-"; break;
				case 1: theCard+="karo-"; break;
				case 2: theCard+="kor-"; break;
				case 3: theCard+="pikk-"; break;
			};

			switch(card.value){
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 9:
				case 10: theCard+=card.value; break;
				case 11: theCard+="J"; break;
				case 12: theCard+="Q"; break;
				case 13: theCard+="K"; break;
				case 14: theCard+="asz"; break;
				case 15: theCard+="joker"; break;
			};
			
        	$(element).attr({class: theCard});
        	if(card.isSelected){
        		$(element).addClass("selected");
        	}
   
        	$(element).css("left", cardIndex * 50);
			
			$(element).bind('contextmenu', function(event){
    			console.log(event);
    			card.isSelected = false;
        		var osztaly = $(element).attr('class');
        		var splitted = osztaly.split("-");
        		if(splitted[0]==="selected"){
        			splitted.splice(0,1);
        			osztaly = splitted.join("-");
        		}
        		$(element).attr({class: osztaly});
     			return false;
			});

        	$(element).click(function(event){
        		console.log(event);
        		card.isSelected = true;

        		var cl = $(element).attr('class');
        		$(element).attr({class: "selected-" + cl});
        	});


        },
        update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        	var card = valueAccessor(), allBindings = allBindingsAccessor();       
        
         	if(card.isSelected){
        		$(element).addClass("selected");
        	}
    	}
    };

	return function(){
		this.userName       = ko.observable("");
		this.id 	        = ko.observable("");
		this.aiNumbers      = ko.observable("5");
		this.badname        = ko.observable(false);
		this.players        = ko.observableArray([]);
		this.cards          = ko.observableArray([]);
		this.depositedCards = ko.observableArray([]);
		this.state          = ko.observable(0);
			
		var socket = null;
		var nameError = "username is used";

		var isLogin = ko.computed(function(){
			return (this.userName() == "" || this.id() == "") && this.state() == 0;
		}, this);

		var isSettings = ko.computed(function(){
			return (this.userName() !== "" && this.id() !== "") && this.state() == 1;
		}, this);

		var isAdmin = ko.computed(function(){
			return this.id() == "0";
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
			socket.emit(name, data);
		};

		var sendUserName = function(){
  			sendData('myname', this.userName());	
  		};

  		var sendAi = function(){
  			sendData('startgame', aiNumbers());	
  		}

  		var __newplayer = function (data) {
    		players.removeAll();
			for (var i = 0; i < data.length; i++) {
				data[i].card = 0;
				data[i].htmlClass = "player-" + ((i % 3 > 0) ? ((i % 3 > 1) ? "left" : "center" ) : "right" );
    		}
            players(data);
  		};

  		var __cardnums = function(data){
  			console.log("__cardnums");
  			console.log(players().length);
  			console.log(data.length);
            var elemek = players.removeAll();
  			for (var i = 0; i < elemek.length && i < data.length; i++) {
  				elemek[i].card = data[i];
  				console.log(elemek[i].card);
  			};
            players(elemek);
  			console.log(players());
  			players.valueHasMutated();
  		};

  		var __badname = function(data){
	  		badname(data.state);
	  		if(!data.state){	  					
	  			userName(data.name);
				  id(data.id);
				  state(state()+1);
			  }
  		};

  		var __mycards = function(data){
  			cards.removeAll();
  			for (var i = 0; i < data.length; i++) {
  				data[i].isSelected = false;
  			}
            
            // ez csak log
            console.log(data);
  			for (var i = 0; i < data.length; i++) {
  				console.log(data[i]);
  			}
            
            cards(data);
  			sendData("cardnums", null);
  		};

  		var __nextcircle = function(data){
  			// 	TODO 
  				// játéktér ürítése
  				// data id játékos jön
  				// sendData('put', cards);
  		};

 		var __put = function (data) {
  			//	TODO  data = {from: playerid, cards: cards};
  			// grafikus
  			sendData('ready', null);
  		};

		var __next = function(data){
			// 	TODO 
				// játéktér ürítése nincs, nem rakhat akármit
				// data id játékos jön
				// sendData('put', cards);
		};


		var __tributes = function(data){
			sendData('mycards', null);
			if(players[this.id()].order<data.length)
			{
				data[players[this.id()].order];
				// 	TODO   ennyi lapot kell visszaadnom
			}
		};
		// TODO tributeback eseményt visszaküldeni cards paraméterrel. formátum: [{color: 0, value: 8}, {color: x, value: y}...]
		var __tributeback = function(){
			sendData('mycards', null);
			sendData('ready', null);
		};
		var __newround = function(data){
			for (var i = 0; i < players.length && i < data.order.length; i++) {
				players[data.order[i]].order = i;
				// TODO ne egyesével mozgassa az embereket
			};
			sendData('mycards', null);
			if(data.democratic)
			{
				sendData('ready', null);
			}
			else{
				//	TODO
			}
                state(2);
			console.log(data);
		};
		var init = function(){
			socket.on('newplayer', __newplayer);
			socket.on('badname', __badname);
			socket.on('newround', __newround);
			socket.on('mycards', __mycards);
			socket.on('cardnums', __cardnums);
			socket.on('tributes', __tributes);
			socket.on('tributeback', __tributeback);
			socket.on('nextcircle', __nextcircle);
			socket.on('put', __put);
			socket.on('next', __next);
        };

		var connectToServer = function(){
			socket = io.connect('http://localhost');
		};

		var getPlayers = function(){
			return players;
		};

		var getCards = function(){
			return cards;
		};

		var logg = function(){
			for (var i = 0; i < cards().length; i++) {
  				console.log(cards()[i]);
  			}
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

			players: players,
			getPlayers: getPlayers,
			getCards: getCards,
			logg: logg,

			sendUserName: sendUserName,
			sendAi: sendAi,
			userList: userList
		};
	};
});