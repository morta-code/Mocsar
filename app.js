var express = require('express');
var mongoose = require("mongoose");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

mongoose.connect("mongodb://localhost/mocsar");
var db = mongoose.connection;

var mocsarSchema = mongoose.Schema({
	
});

var historySchema = mongoose.Schema({
	
});

server.listen(7500);

