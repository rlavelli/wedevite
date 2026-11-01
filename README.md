# Invito digitale – Luisa e Riccardo

Sito di una sola pagina che fa da invito al matrimonio: si apre dal link condiviso su WhatsApp.
È **statico** (HTML, CSS, JavaScript senza framework), non usa server, database, cookie o statistiche,
e si pubblica gratis su **GitHub Pages**.

## Cosa contiene

| File / cartella | A cosa serve |
|---|---|
| `config.js` | **L'unico file da modificare**: nomi, data, testi, luoghi, programma, informazioni, conferma, regalo, colori (l'IBAN no: vedi *IBAN protetto*) |
| `index.html` | Struttura della pagina. Da toccare solo per l'anteprima su WhatsApp (vedi sotto) |
| `assets/css/style.css` | Grafica |
| `assets/js/main.js` | Costruisce la pagina da `config.js`; conto alla rovescia, calendario, condivisione |
| `assets/img/` | Foto ottimizzate per il web |
| `assets/fonts/` | Caratteri (ospitati nel sito: nessuna chiamata a Google) |
| `og-image.jpg` | Immagine dell'anteprima quando il link viene condiviso |
| `favicon.svg` | Icona della scheda con le iniziali |
| `tools/ottimizza-foto.py` | Prepara le foto nuove nelle dimensioni giuste |

## Vedere il sito sul computer

Basta un doppio clic su `index.html`. Per provarlo come sarà online (consigliato):

```bash
python -m http.server 8000
```

e aprire <http://localhost:8000> nel browser. Per simulare lo smartphone: in Chrome premi `F12`, poi l'icona del telefono.

## Personalizzare

Apri `config.js` con un editor di testo (VS Code, Blocco note). Ogni voce ha una nota che la spiega.
Le voci con scritto **SEGNAPOSTO** sono da completare.

Regole per non rompere nulla:
- i testi stanno tra virgolette `"..."`; dopo ogni voce c'è una virgola;
- le date sono nel formato `AAAA-MM-GG` (es. `2027-06-11`), gli orari `HH:MM` (es. `16:00`);
- se dopo una modifica la pagina resta vuota, c'è un errore di scrittura in `config.js` (spesso una virgola o una virgoletta mancante).

### Accendere e spegnere le sezioni

In `config.js` le sezioni facoltative hanno `attivo: true` oppure `attivo: false`:
`programma`, `info`, `rsvp` (conferma), `regalo`.

### Cambiare le foto

1. Metti la foto originale in `stats/img/` (questa cartella non va online).
2. Dalla cartella del progetto lancia:
   ```bash
   python tools/ottimizza-foto.py "stats/img/nostra-foto.jpg" coppia 800 1600
   ```
   Crea `assets/img/coppia-800.webp`, `coppia-800.jpg`, `coppia-1600.webp`, `coppia-1600.jpg`.
   Serve Python con la libreria Pillow (`pip install pillow`).
3. In `config.js` scrivi `{ src: "assets/img/coppia", larghezze: [800, 1600] }` dove serve.

Per la copertina servono due foto: una **verticale** (smartphone) e una **orizzontale** (computer).
Per rifare l'immagine dell'anteprima aggiungi `--og` al comando: crea `og-image.jpg` (1200×630).

### Anteprima su WhatsApp

WhatsApp legge solo `index.html`, non `config.js`. Il blocco da modificare è in cima a `index.html`,
tra le righe `ANTEPRIMA SU WHATSAPP`: titolo, descrizione e indirizzo del sito
(oggi `https://rlavelli.github.io/wedevite/`).

WhatsApp ricorda l'anteprima di un link per giorni: **sistema titolo e immagine prima di mandare il link** agli invitati.

### Conferma della presenza

Non c'è un modulo online: il pulsante apre WhatsApp con un messaggio già impostato
(ci saremo sì/no, nomi, persone, allergie). In `config.js` → `rsvp.contatti` metti i numeri
con il prefisso internazionale e solo cifre, es. `"393331234567"`. Con il numero vuoto
l'invitato sceglie da WhatsApp a chi mandarlo.

### IBAN protetto (link con la chiave)

Il repository è pubblico, quindi l'IBAN **non si scrive in chiaro** in `config.js`: lo si cifra con uno script
e lo vede solo chi apre il sito dal **link con la chiave** (la parte dopo `#`, che non arriva mai a GitHub).
Chi apre l'indirizzo senza chiave non vede la sezione del regalo e non sa che esiste.

1. Dalla cartella del progetto, in un terminale: `node tools/cifra-iban.mjs`
2. Scrivi l'IBAN (anche con gli spazi). Lo script controlla che sia valido, lo cifra in `config.js` → `regalo.ibanCifrato`
   e stampa il link da mandare, per esempio `https://rlavelli.github.io/wedevite/#Xq7pL2vR9mT4wZ8nB3cF6h`.
3. Pubblica come al solito (vedi *Aggiornare il sito*) e manda **quel** link agli invitati.

Da sapere:

- La chiave è salvata in `privato/chiave-iban.txt`, **esclusa da git**: tienine una copia (senza, per cambiare l'IBAN
  serve una chiave nuova e i link già mandati smettono di mostrarlo).
- Rilanciare lo script riusa la stessa chiave: si può cambiare l'IBAN senza rimandare i link.
  `node tools/cifra-iban.mjs --nuova-chiave` crea una chiave nuova (da usare se il link è finito dove non doveva).
- Chi apre il link una volta lo ritrova anche riaprendo il sito senza chiave, nello stesso browser.
  Il pulsante *Condividi su WhatsApp* condivide l'indirizzo **senza** chiave.
- Chi ha il link può inoltrarlo: la protezione vale contro chi trova il sito per caso, non contro chi lo riceve da un invitato.

### Colori

In `config.js` → `tema`. Il grigio del testo resta scuro ma mai nero, per un aspetto morbido.

## Pubblicare su GitHub Pages

GitHub Pages è gratuito per i repository **pubblici**: il codice del sito (testi, indirizzi, programma)
sarà leggibile da chi trova il repository. La pagina chiede ai motori di ricerca di non indicizzarla,
ma non è protetta da password. Fa eccezione l'IBAN, che è cifrato (vedi *IBAN protetto*).

### 1. Creare l'account GitHub
Vai su <https://github.com/signup>, scegli un nome utente (finirà nel link: `nomeutente.github.io`) e conferma l'email.

### 2. Creare il repository
1. In alto a destra **+** → **New repository**.
2. **Repository name**: `wedevite` (il link sarà `https://nomeutente.github.io/wedevite/`).
3. Visibilità **Public**. Non aggiungere README, .gitignore o licenza (ci sono già).
4. **Create repository**.

### 3. Caricare il progetto
Dalla cartella del progetto, in un terminale:

```bash
git init -b main
git add .
git commit -m "Prima versione dell'invito"
git remote add origin https://github.com/nomeutente/wedevite.git
git push -u origin main
```

Al primo `push` si apre una finestra per accedere a GitHub.
In alternativa senza terminale: nella pagina del repository vuoto, **uploading an existing file**,
trascina tutti i file e le cartelle **tranne `stats/`**, poi **Commit changes**.

### 4. Attivare GitHub Pages
Nel repository: **Settings** → **Pages** → in *Build and deployment* scegli
**Source: Deploy from a branch**, **Branch: `main`**, cartella **`/ (root)`** → **Save**.

### 5. Ottenere il link
Dopo 1-2 minuti, nella stessa pagina compare *Your site is live at* `https://nomeutente.github.io/wedevite/`.
Aprilo dal telefono e controlla tutto, poi aggiorna `og:url` e `og:image` in `index.html` con questo indirizzo.

### 6. Aggiornare il sito
Modifica i file, poi:

```bash
git add .
git commit -m "Aggiornato il programma"
git push
```

Il sito si aggiorna da solo in 1-2 minuti (se non vedi la modifica, ricarica la pagina forzando: `Ctrl+F5`).

## Dominio personalizzato (in futuro)

1. Compra il dominio (es. `luisaericcardo.it`) da un registrar.
2. In **Settings → Pages → Custom domain** scrivi il dominio e salva: GitHub crea il file `CNAME`.
3. Dal pannello del registrar aggiungi i record DNS indicati nella guida GitHub
   (<https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site>).
4. Spunta **Enforce HTTPS** quando diventa disponibile.
5. Aggiorna `og:url` e `og:image` in `index.html`.

Il sito usa solo percorsi relativi, quindi funziona senza altre modifiche.
Con un dominio proprio diventa efficace anche `robots.txt` (su `nomeutente.github.io/wedevite/` vale solo il `noindex` di `index.html`).

## Accessibilità e prestazioni

- Testi alternativi su tutte le foto, navigazione da tastiera, contrasti leggibili.
- Con l'impostazione di sistema "riduci movimento" le animazioni si spengono.
- Prima schermata sullo smartphone: circa 100 KB di foto (WebP); le altre foto si caricano solo quando servono.
