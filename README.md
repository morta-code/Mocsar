# Mocsar

## TODO

#### Kliens
* Animáció kártyák kirakásakor; ready az animáció végén

#### Szerver
* Tanulóhalmaz építése
* Nem engedi visszaadni a lapokat
* Kilépés esetén lehessen visszalépni

/home/quiga/workspace/Mocsar/ai.js:117
            console.log("CALL choosen:",cStrat);
                                        ^
ReferenceError: cStrat is not defined
    at ChooseCall (/home/quiga/workspace/Mocsar/ai.js:117:32)
    at _iCall (/home/quiga/workspace/Mocsar/ai.js:389:17)
    at Object.onNextCircle [as nextcircle] (/home/quiga/workspace/Mocsar/ai.js:588:6)
    at /home/quiga/workspace/Mocsar/mocsar.js:394:33
    at Array.forEach (native)
    at Object.module.exports.callAIs (/home/quiga/workspace/Mocsar/mocsar.js:393:7)
    at broadcast (/home/quiga/workspace/Mocsar/app.js:23:9)
    at mocsar.currentRound.readyFrom.broadcast.order (/home/quiga/workspace/Mocsar/app.js:61:3)
    at Object.Round.readyFrom (/home/quiga/workspace/Mocsar/mocsar.js:270:6)
    at onReady (/home/quiga/workspace/Mocsar/app.js:52:24)
