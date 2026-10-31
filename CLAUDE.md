# wedevite – Invito digitale per il matrimonio di Luisa e Riccardo

Sito statico di una pagina, pubblicato su GitHub Pages. Guida per utenti e pubblicazione: `README.md`.

## Decisioni prese

- **Repository pubblico sull'account personale**, non in `beta-biteam` (eccezione alla regola comune):
  progetto personale, e GitHub Pages gratis richiede un repository pubblico.
- **Nessun backend né servizio esterno** senza chiedere prima all'utente (niente Google Forms, Formspree, analytics).
  La conferma della presenza passa da un link WhatsApp con messaggio precompilato.
- **Leggerezza:** niente framework né build; font ospitati in `assets/fonts/`; foto ottimizzate con `tools/ottimizza-foto.py`.
- **Palette "Lago alpino"** (scelta dall'utente): avorio, petrolio `#1F5F63`, salvia, oro tenue, testo `#4A4A48` (mai nero).
  Coerente con l'invito cartaceo (foto del lago Moraine, nomi in corsivo).
- Sezione regalo **attiva** (l'invito cartaceo la prevede).

## Struttura

- `config.js`: tutti i contenuti (`window.WEDDING`). Le voci `SEGNAPOSTO` sono da completare.
- `index.html`: scheletro con `data-slot` riempiti da `assets/js/main.js`; il blocco Open Graph è statico (WhatsApp non esegue JS).
- Effetto "scroll reveal": attributo `data-reveal` + IntersectionObserver in `main.js`, disattivato con `prefers-reduced-motion`.
- `stats/` contiene originali e invito cartaceo: fuori da git.

## Attenzione

- Un `url()` dentro una variabile CSS si risolve rispetto a `style.css`: da JS passare percorsi assoluti.
- Lo shorthand `font:` azzera `font-variant-numeric`; per i numeri allineati di Cormorant si usa `font-feature-settings: "lnum"` su `body`.
