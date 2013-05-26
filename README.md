# Mocsar

## TODO

#### Kliens
* Animáció kártyák kirakásakor; ready az animáció végén
* index.html a /public-ba
* Adózás
* Nextcircle esetén még mindig előfordul, hogy kártya marad középen
* FONTOS! A cardnums-ra a lapok számát az id sorrendjében küldi ki, nem az aktuális sorrendben!!! 
* FONTOS! A nextid a játékos id-et küldi ki, nem pedig az aktuális sorrendbeli számot! Tehát a 0 továbbra is a személyi játékos
* Adóztatás után azt írja: „Kérlek adj vissza x lapot”, tehát nem írja ki a pontos számot
* Nem engedi visszaadni a lapokat
* io.sockets.emit('serverdown'); Amikor a szerver kilép
* socket.emit('accessdenied'); // -> erre a kliens kiírja, hogy a játékhoz nem tud csatlakozni

* username max hossz jelenleg 12 karakter 

#### Szerver
* Lépés kiválasztása
* Stratégia kiválasztása
* Adatbázisba mentés
