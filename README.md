# Bestia Salta

Un prototipo web ironico e assurdo di runner a evoluzione: clicca al momento giusto per far saltare un cavallino di media qualita, farlo evolvere o rovinarne completamente la carriera animale.

Apri `index.html` in un browser. Premi Space, Arrow Up, W, clicca o tocca per saltare. `P` mette in pausa, `R` ricomincia.

La demo include:
- livelli chiamati Livello 1, Livello 2, Livello 3, Livello 4 e Livello 5, con qualita grafica crescente;
- evoluzione e regressione dell'animale con nomi volutamente ridicoli;
- ostacoli con finestra di timing;
- trappole mortali dopo i salti;
- punteggio, vite e record locale.
- musiche procedurali diverse per mondo, passo dell'animale, salto e fanfara di cambio mondo.
- grafica progressiva: parallax nei livelli bassi, cartoon HD nel livello 3, livello 4 con atmosfera fantasy evoluta, livello 5 piu cinematografico.
- sagome animali piu realistiche nei mondi evoluti: quadrupedi articolati, ali, corna, spine e draghi piu riconoscibili.
- circuito di jumping stile Grand Prix, con pista, staccionate, tribune, tabellone e ostacoli a barriere colorate.

La prima demo parte in pixel art anni 80, con scanline, colori saturi e atmosfera da cabinato agricolo improbabile.

## Pacchetto Facebook Instant Games

Il pacchetto preparato per Meta/Facebook e in `release/bestia-salta-facebook.zip`.

Contiene:
- `index.html`, `styles.css`, `app.js`;
- `fbapp-config.json` con orientamento `LANDSCAPE`;
- `privacy.html` e `terms.html`;
- `social-preview.png`.

Nel dashboard Meta for Developers:
1. crea/configura l'app come gioco o Instant Game;
2. imposta Privacy Policy e Terms usando URL pubblici;
3. carica `release/bestia-salta-facebook.zip` nella sezione hosting/build del gioco;
4. aggiungi tester e prova il gioco prima della review;
5. aggiorna testi, icone, screenshot e categoria richiesti da Meta.

La build funziona anche fuori da Facebook: se `FBInstant` non e disponibile, il gioco continua come web app normale.
