# Mocsar

## TODO

#### Kliens
* Animáció kártyák kirakásakor; ready az animáció végén
* index.html a /public-ba
* Adózás
* Nextcircle esetén még mindig előfordul, hogy kártya marad középen
* Adóztatás után azt írja: „Kérlek adj vissza x lapot”, tehát nem írja ki a pontos számot
* Nem engedi visszaadni a lapokat

* username max hossz jelenleg 12 karakter 

#### Szerver
* Lépés kiválasztása
* Stratégia kiválasztása
* Adatbázisba mentés


BROADCAST: ----> next 2
BROADCAST: ----> put { from: 2, cards: [] }
BROADCAST: ----> nextcircle 2


* Szerver elhal játék közben:

/home/quiga/workspace/Mocsar/ai.js:249	for (var i = ps.length - 1; i >= 0; i--) {
						               
                                       
TypeError: Cannot read property 'length' of undefined (ps.length)
    at /home/quiga/workspace/Mocsar/ai.js:249:22
    at _iCall (/home/quiga/workspace/Mocsar/ai.js:253:7)
    at Object.onNextCircle [as nextcircle] (/home/quiga/workspace/Mocsar/ai.js:364:6)
    at /home/quiga/workspace/Mocsar/mocsar.js:380:33
    at Array.forEach (native)
    at Object.module.exports.callAIs (/home/quiga/workspace/Mocsar/mocsar.js:379:7)
    at broadcast (/home/quiga/workspace/Mocsar/app.js:23:9)
    at mocsar.currentRound.readyFrom.broadcast.order (/home/quiga/workspace/Mocsar/app.js:61:3)
    at Object.Round.readyFrom (/home/quiga/workspace/Mocsar/mocsar.js:256:6)
    at onReady (/home/quiga/workspace/Mocsar/app.js:52:24)
