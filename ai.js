module.exports = function () {
	require('./jsexpansion');
	var db = require('./db.json'),
		fs = require('fs');


	return function () {

		var aiPlayers = [],
		    callbacks,
			stratTree,
			callTree,
			putTree;


		function ID3_build (collection) {

			var node = {};

			function H (Set) {
				var sm = 0;
				Set.column(Set[0].length-1).uniq().forEach(function (a) {
					var p = Set.column(Set[0].length-1).numberOf(a) / Set.length;
					sm -= p*Math.log2(p);
				});
				return sm;
			}

			function G (Set, AttrIndex) {
				var res = H(Set);
				Set.column(AttrIndex).uniq().forEach(function (v) {
					res -= ( Set.column(AttrIndex).numberOf(v) / Set.length ) * H(Set.filter(function (element) {
						return element[AttrIndex] === v;
					}));
				});
				return res;
			}

			// Highest information gain
			var gains = [];
			(collection[0].length-1).times(function (i) {
				gains.push(G(collection, i));
			});
			node['param'] = gains.maxIndex();
			console.log("HIGHEST INFORMATION GAIN", node.param);
			// 3.
			collection.column(node.param).uniq().forEach(function (val) {
				node[val] = null;
				var filtered = collection.filter(function (element) {
					return element[node.param] === val;
				});
				if (filtered.column(filtered[0].length-1).uniq().length === 1) {
					node[val] = filtered.column(filtered[0].length-1).first();
				// } else if (filtered.length === 0) {
				// 	node[val] 
				} else {
					node[val] = ID3(filtered);
				}
			});



			return node;
		}


		function ID3_decision (node, datas) {
			var deref = node[datas[node.param]];
			if (typeof deref == 'object') return deref;
			return ID3_Choose(deref, datas);
		}



		////////////////////////////////////////////////////////////////////////////////

		function ChooseStrategy (rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high) {
			// collection: rank, cardsval, no_of_singles, no_of_high, strategy
			if (db["strategy"].length < 100) {
				return ['finishfirst', 'betterposition', 'keep', 'noswamp'][rndInt(0, 3)];
			};
			if (!stratTree) {stratTree = ID3_build(db["strategy"])};
			var strat = ID3_decision(stratTree, [rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high]);
			console.log("STRATEGY choosen:",strat);
			return strat;
		}

		function ChooseCall (strategy, cards_over, cards_under, put_jollies, put_highs, circles, circles_to_my_end) {
			// collection: strategy, cards_over, cards_under, put_jollies, put_highs, circles, circles_to_my_end, call_strat
			if (db["call"].length < 100) {
				return ['lowest', 'most', 'winn_the_circle'][rndInt(0, 2)];
			};
			if (!callTree) {callTree = ID3_build(db["call"])};
			var cstrat = ID3_decision(callTree, [strategy, cards_over, cards_under, put_jollies, put_highs, circles, circles_to_my_end]);
			return cstrat;
		}

		////////////////////////////////////////////////////////////////////////////////

		function CalcCards (cards) {
			var value = 0;
			var numOfCardValues = [0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //[2,3,4,5,6,7,8,9,10,J,Q,K,A,Y]
			cards.forEach(function (a) {
				numOfCardValues[a.value - 2] += 1;
			});
			numOfCardValues[13] += numOfCardValues[0];
			numOfCardValues.shift();
			numOfCardValues.forEach(function (a, i) {
				var current = i+3;
				if (a > 0) {
						 if (current === 3) {value -= 5;}
					else if (current === 4) {value -= 5;}
					else if (current === 5) {value -= 3;}
					else if (current === 6) {value -= 2;}
					else if (current === 7) {value -= 1;}
					else if (current === 8) {value += 1;}
					else if (current === 9) {value += 1;}
					else if (current === 10) {value += 2;}
					else if (current === 11) {value += 3;}
					else if (current === 12) {value += 3;}
					else if (current === 13) {value += 4;}
					else if (current === 14) {value += 5;}
					else if (current === 15) {value += 7;}

					if (a === 1) value -= 3;
					else value += a;
				};
			});
			if (value < 10 && value >= 1) {
				return 2;
			}
			if (value < 20 && value >= 10) {
				return 3;
			}
			if (value < 1 && value >= -10) {
				return 1;
			}
			if (value >= 20) {
				return 4;
			}
			if (value < -10) {
				return 0;
			}
		}

		function CalcRank (order, index) {
			if (index == 0) {return 0;};
			var lim = (order.length + 1) / 4;
			if (index < lim) {return 1};
			if (index < 2*lim) {return 2};
			if (index < 3*lim) {return 3};
			if (index < 4*lim) {return 4};
		}

		function CalcSingles (cards) {
			var values = cards.column("value");
			var num = 0;
			values.forEach(function (val) {
				if (values.numberOf(val) === 1) {
					num++;
				};
			});
			if (num < 1) {return 0;};
			if (num < 3) {return 1;};
			if (num < 6) {return 2;};
			if (num < 9) {return 3;};
			return 4;
		}

		function CalcPairs (cards) {
			var values = cards.column("value");
			var num = 0;
			values.forEach(function (val) {
				if (values.numberOf(val) === 2) {
					num++;
					values.remove(val);
				};
			});
			if (num < 1) {return 0;};
			if (num < 3) {return 1;};
			if (num < 5) {return 2;};
			return 3;
		}

		function CalcBig (cards) {
			var values = cards.column("value");
			var num = 0;
			values.forEach(function (val) {
				if (values.numberOf(val) > 2) {
					num++;
					values.remove(val, val, val);
				};
			});
			if (num < 1) {return 0;};
			if (num < 3) {return 1;};
			if (num < 5) {return 2;};
			return 3;
		}

		function CalcHigh (cards) {
			var values = cards.column("value");
			var num = 0;
			values.forEach(function (val) {
				if (val > 10) {
					num++;
				};
			});
			if (num < 2) {return 0;};
			if (num < 5) {return 1;};
			if (num < 7) {return 2;};
			return 3;
		}

		function saveDB () {
			fs.writeFileSync('db.json', JSON.stringify(db));
		}

		////////////////////////////////////////////////////////////////////////////////

		function getAiPlayers () {
			return aiPlayers;
		}

		function newAiPlayer (player, id) {
			aiPlayers.push(playerAI(player, id));
		}

		function setCallbacks (data) {
			callbacks = data;
		}

		
		function playerAI (player, id, players) {

			var myCurrentIndex,
				iSendTribute = false,
			    currentOrder,
			    rank,
			    cardsval,	// Húzott kártyák (adózás utáni) értéke
			    no_of_singles,
			    no_of_pairs,
			    no_of_big_groups,
			    no_of_high,
			    myStrategy;

			var _iCall = function () {
				if ((myStrategy === 'finishfirst' || myStrategy === "betterposition") &&
					function (ps, id_) {
						for (var i = ps.length - 1; i >= 0; i--) {
							if (ps[i].id === id_) continue;

						};
					}(players, id)) {};
				// TODO Ne a legelső lappal nyisson, hanem ésszel
				var cards = [];
				for (var i = 0; (i < player.cards.length); i++) {
					var c = player.cards[i];
					
					if (cards.length == 0) {
						cards.push(c);
					} else {
						if (cards[0].value != c.value && c.value != 2 && c.value != 15) break;
						cards.push(c);
					}
				};
				callbacks.put(id, function() {}, cards);
			};
			var _iPut = function () {
				// TODO Ne passzoljon, hanem ésszel
				var cards = [],
					num = callbacks.currentRound().cardsOnTable().last().cards.length,
					val = callbacks.currentRound().cardsOnTable().last().value;
				
				if (val == 15) {
					callbacks.put(id, function() {}, cards);
					return;
				};

				for (var i = 0; (i < player.cards.length); i++) {
					var c = player.cards[i];
					if (c.value != 2 && c.value <= val) continue;
					if (cards.length == 0) {
						cards.push(c);
					} else {
						if (cards[0].value != c.value && c.value != 2 && c.value != 15) cards.splice(0);
						cards.push(c);
					}
					if (cards.length == num) break;
				};
				if (cards.length !== num) cards.splice(0);
				callbacks.put(id, null, cards);
			};
			var _ready = function () {
				callbacks.ready(id);
			};
			var _updateModel = function () {
				// TODO
			};
			var _iTribute = function () {
				var a = rndInt(3, 5);
				var b = rndInt(2, a-1);
				var c = rndInt(1,b-1);
				callbacks.tributes(id, [a,b,c]);
			};
			var _iTributeBack = function (num) {
				// TODO ne a legelső numt, hanem értelmesen
				var cards = [];
				Number(num).downto(1, function (i) {
					cards.push(player.cards[i]);
				});
				callbacks.tributeback(id, null, cards);
			};

			var _calcVariables = function () {
				rank = CalcRank(currentOrder, myCurrentIndex);
				cardsval = CalcCards(player.cards);
				no_of_singles = CalcSingles(player.cards);
				no_of_pairs = CalcPairs(player.cards);
				no_of_big_groups = CalcBig(player.cards);
				no_of_high = CalcHigh(player.cards);
			}

			var _saveResults = function (neworder) {
				function save () {
					db["strategy"].push([rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high, myStrategy]);
					if (db["strategy"].length > 200) {
						db["strategy"].shift();
					};
				}
				var myO = neworder.indexOf(id);

				if (myStrategy == 'finishfirst') {
					if (myO == 0)
						save();
					return;
				}
				if (myStrategy == 'betterposition') {
					if (myO < myCurrentIndex)
						save();
					return;
				}
				if (myStrategy == 'keep') {
					if (myO <= myCurrentIndex+1)
						save();
					return;
				}
				if (myStrategy == 'noswamp') {
					if (myO !== neworder.length-1)
						save();
					return;
				}
			}

			////////////////////////////////////////////////////

			var onNext = function (nextid) {
				if (nextid === id) {
					_iPut();
				};
			};

			var onNextCircle = function (callid) {
				if (callid === id) {
					_iCall();
				};
			};

			var onNewRound = function (data) {
				if (myCurrentIndex) {
					_saveResults(data.order);
				}
				iSendTribute = false;
				currentOrder = data.order;
				myCurrentIndex = currentOrder.indexOf(id);
				if (data.democratic) {
					_calcVariables();
					myStrategy = ChooseStrategy(rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high);
					_ready();
				}
				if (currentOrder.first() === id && !data.democratic) {
					iSendTribute = true;
				};
			};

			var onPut = function (data) {
				_updateModel('put', data.from, data.cards);
				_ready();
			};

			var onTributes = function (tributes) {
				if (tributes.length > myCurrentIndex) {
					_iTributeBack(tributes[myCurrentIndex]);
				};
				_updateModel('tributes', tributes);
			};

			var onTributeBack = function () {
				_updateModel('tributeback');
				_ready();
			};

			var onTributeReady = function () {
				_calcVariables();
				myStrategy = ChooseStrategy(rank, cardsval, no_of_singles, no_of_pairs, no_of_big_groups, no_of_high);
				_ready();
			};

			var onNewPlayer = function (list) {
				// TODO
			};

			var getISendTribute = function () {
				return iSendTribute;
			}

			return {
				newplayer: onNewPlayer,
				newround: onNewRound,
				put: onPut,
				next: onNext,
				nextcircle: onNextCircle,
				tributes: onTributes,
				tributeback: onTributeBack,
				tributeready: onTributeReady,
				iSendTribute: getISendTribute,
				sendTribute: _iTribute
			};
		}





		return {
			newAiPlayer: newAiPlayer,
			aiPlayers: getAiPlayers,
			callbacks: setCallbacks,
			saveDB: saveDB
		};
	};
}();