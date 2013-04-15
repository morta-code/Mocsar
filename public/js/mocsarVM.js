define(["jquery", "ko"], function ($, ko) {
	return function(){
				this.userName  = ko.observable("");
				this.id 	   = ko.observable("");
				this.aiNumbers = ko.observable("0");
				this.badname   = ko.observable(false);
				this.players   = ko.observableArray([]);
				this.cards     = ko.observableArray([]);
				this.state     = ko.observable(0);
			
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
  					//sendData('startgame', this.aiNumbers());		
  					sendData('startgame', 10);	
  				}

  				var __newplayer = function (data) {
    				players.removeAll();
					for (var i = 0; i < data.length; i++) {
    					players.push(data[i]);
    				}
  				};

  				var __badname = function(data){
	  				badname(data.state);
	  				if(!data.state){	  					
	  					userName(data.name);
						id(data.id);
						state(state()+1);
					}
  				};

  				// TODO ide valami jobb módszer
  				var __mycards = function(data){
  					mycards.removeAll();
  					for (var i = 0; i < data.length; i++) {
  						mycards.push(data[i]);
  						console.log(data[i]);
  					}
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
  				}

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
  						players[i].cards = data.cards[i];
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

  					console.log(data);
  				};

  				var init = function(){
	  				socket.on('newplayer', __newplayer);
  					socket.on('badname', __badname);
  					socket.on('newround', __newround);
  					socket.on('mycards', __mycards);
  					socket.on('tributes', __tributes);
  					socket.on('tributeback', __tributeback);
  					socket.on('nextcircle', __nextcircle);
  					socket.on('put', __put);
  					socket.on('next', __next);
				};

				var connectToServer = function(){
					socket = io.connect('http://localhost');
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
					sendUserName: sendUserName,
					sendAi: sendAi,
					userList: userList
				};
			};
});