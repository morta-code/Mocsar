define(["socket.io", "log"], function (io, log) {
	
	var socket;
	var connectToServer = function(url){
		socket = io.connect(url);
	};
	var registerSignal = function(signal, cb){
		socket.on(signal, cb);
	};
	var sendData = function(signal, data){
		if(socket==null)
			return null;
		log("SENDED DATA, SIGNAL " + signal, 1);
		log(data, 1);
		socket.emit(signal, data);
		return true;
	};

	return {
		connectToServer: connectToServer,
		registerSignal: registerSignal,
		sendData: sendData
	};
	
});