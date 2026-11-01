/* ==========================================================================
   CONFIGURAZIONE DEL SITO
   È l'unico file da modificare per cambiare testi, date, luoghi, foto e colori.

   Regole per non rompere nulla:
   - i testi vanno tra virgolette "..." ; se nel testo serve una virgoletta usa ’ o \"
   - dopo ogni voce c'è una virgola
   - le righe che iniziano con // sono note e non vengono lette
   - SEGNAPOSTO = testo di esempio da sostituire con quello vero
   ========================================================================== */

window.WEDDING = {

  /* --- Gli sposi ------------------------------------------------------- */
  coppia: {
    nome1: "Luisa",
    nome2: "Riccardo",
    iniziali: "L&R"          // usate nel piè di pagina
  },

  /* --- Data e ora ------------------------------------------------------ */
  // Formato data: AAAA-MM-GG    Formato ora: HH:MM (ora italiana)
  data: "2027-06-11",
  ora: "16:00",              // SEGNAPOSTO: orario della cerimonia
  durataOre: 9,              // durata dell'evento nel calendario (.ics)

  /* --- Copertina ------------------------------------------------------- */
  copertina: {
    frase: "Ci sposiamo!",
    // Foto: percorso senza "-800.webp"; le larghezze sono quelle create da tools/ottimizza-foto.py
    fotoVerticale:   { src: "assets/img/lago-verticale",   larghezze: [800, 1200] },  // smartphone
    fotoOrizzontale: { src: "assets/img/lago-orizzontale", larghezze: [1200, 1920] }, // tablet e computer
    alt: "Il lago Moraine tra le montagne, con acqua turchese e pini in primo piano"
  },

  /* --- Il nostro matrimonio (messaggio agli invitati) ------------------ */
  intro: {
    titolo: "Il nostro matrimonio",
    // Ogni elemento è un paragrafo. SEGNAPOSTO
    paragrafi: [
      "Dopo tanti sentieri percorsi insieme, abbiamo deciso di intraprendere il più bello.",
      "Ci farebbe felici avervi accanto nel giorno in cui diremo il nostro sì: una giornata semplice, tra le persone che amiamo, da vivere senza fretta."
    ],
    firma: "Luisa e Riccardo",
    foto: { src: "assets/img/lago-orizzontale", larghezze: [1200, 1920] },
    alt: "Il lago tra i pini sotto un cielo di nuvole"
  },

  /* --- Conto alla rovescia --------------------------------------------- */
  countdown: {
    titolo: "Manca poco",
    messaggioDopo: "Ci siamo sposati! Grazie di cuore a chi ha condiviso con noi questa giornata."
  },

  /* --- Luoghi ---------------------------------------------------------- */
  // Un elemento per ogni luogo. Se cerimonia e ricevimento sono nello stesso posto, basta un elemento.
  // mapsLink: lascia "" per generarlo dall'indirizzo, oppure incolla il link "Condividi" di Google Maps.
  // foto: lascia null se non c'è una foto del luogo, altrimenti { src: "...", larghezze: [800, 1600] }.
  luoghi: [
    {
      etichetta: "Cerimonia e ricevimento",
      nome: "Trattoria Il Portico",
      indirizzo: "Via Luciano Manara, Monticello Brianza (LC)",
      orari: [
        { ora: "16:00", cosa: "Cerimonia" },   // SEGNAPOSTO
        { ora: "17:30", cosa: "Ricevimento" }  // SEGNAPOSTO
      ],
      mapsLink: "",
      foto: null,
      alt: ""
    }
  ],

  /* --- Programma della giornata ---------------------------------------- */
  programma: {
    attivo: true,
    titolo: "Il programma",
    // SEGNAPOSTO
    tappe: [
      { ora: "16:00", titolo: "Cerimonia", testo: "Il nostro sì." },
      { ora: "17:30", titolo: "Aperitivo", testo: "Un brindisi all'aperto." },
      { ora: "19:30", titolo: "Cena",      testo: "A tavola tutti insieme." },
      { ora: "22:30", titolo: "Festa",     testo: "Si balla!" }
    ]
  },

  /* --- Informazioni utili ---------------------------------------------- */
  // icona: parcheggio | strada | hotel | abito | info
  info: {
    attivo: true,
    titolo: "Informazioni utili",
    // SEGNAPOSTO
    voci: [
      { icona: "parcheggio", titolo: "Parcheggio",    testo: "Parcheggio per gli ospiti vicino alla trattoria." },
      { icona: "strada",     titolo: "Come arrivare", testo: "Indicazioni stradali e mezzi pubblici: da completare." },
      { icona: "hotel",      titolo: "Dove dormire",  testo: "Vi segnaleremo alcune strutture nei dintorni." },
      { icona: "abito",      titolo: "Dress code",    testo: "Elegante ma comodo." }
    ]
  },

  /* --- Conferma della presenza ----------------------------------------- */
  // Nessun modulo online: il pulsante apre WhatsApp con un messaggio già scritto.
  // numero: con prefisso internazionale, solo cifre (es. "393331234567").
  // Se il numero è vuoto, l'invitato sceglie da WhatsApp a chi mandarlo.
  rsvp: {
    attivo: true,
    titolo: "Ci sarete?",
    scadenza: "2027-05-01",
    testo: "Fateci sapere se ci sarete, segnalando eventuali allergie o intolleranze alimentari.",
    contatti: [
      { nome: "Luisa",    numero: "" },  // SEGNAPOSTO
      { nome: "Riccardo", numero: "" }   // SEGNAPOSTO
    ],
    messaggio: "Ciao! Vi rispondo per il matrimonio.\nCi saremo: sì / no\nNomi: \nPersone: \nAllergie o intolleranze: "
  },

  /* --- Regalo di nozze ------------------------------------------------- */
  regalo: {
    attivo: true,
    titolo: "Un pensiero",
    testo: "La vostra presenza sarà il regalo più bello ma, se lo desiderate, potete contribuire alla nostra prossima avventura.",
    intestatario: "Luisa e Riccardo",              // SEGNAPOSTO
    // IBAN cifrato: non si scrive qui a mano, lo genera  node tools/cifra-iban.mjs  (vedi README).
    // Si vede solo aprendo il sito dal link con la chiave; senza, la sezione regalo non compare.
    ibanCifrato: "",
    causale: "Regalo di nozze Luisa e Riccardo"
  },

  /* --- Piè di pagina e condivisione ------------------------------------ */
  footer: {
    grazie: "Grazie di far parte della nostra storia."
  },
  condivisione: {
    testo: "Luisa e Riccardo si sposano! Ecco l'invito:"
  },

  /* --- Colori ---------------------------------------------------------- */
  tema: {
    fondo:    "#F8F5EF",   // avorio
    fondoAlt: "#FFFDF9",   // bianco caldo
    accento:  "#1F5F63",   // petrolio (titoli, pulsanti)
    salvia:   "#9AAE9C",   // linee e dettagli
    oro:      "#B89B5E",   // filetti e numeri
    testo:    "#4A4A48"    // grigio caldo, mai il nero
  }
};
