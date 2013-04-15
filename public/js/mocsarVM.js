define(["jquery", "ko"], function ($, ko) {
	return function(){
				this.userName  = ko.observable("");
				this.id 	   = ko.observable("");
				this.aiNumbers = ko.observable("0");
				this.badname   = ko.observable(false);
				this.players   = ko.observableArray([]);
				this.state     = ko.observable(0);
			
				var socket = null;
				var nameError = "username is used";
/*
				var isLoggedIn = function(){
					return (this.userName() != "" && this.id() != "");
				};
*/
				var isLogin = ko.computed(function(){
					return (this.userName() == "" || this.id() == "") && this.state() == 0;
				}, this);

				var isSettings = ko.computed(function(){
					return (this.userName() != "" && this.id() != "") && this.state() == 1;
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

  				var __newround = function(data){
  					//if(!isLoggedIn()) return null;
  					console.log(data);
  					//state(2);
  				};

  				var init = function(){
	  				socket.on('newplayer', __newplayer);
  					socket.on('badname', __badname);
  					socket.on('newround', __newround);
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