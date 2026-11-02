# Prossimi passi

Aggiornato al 2/11/2026. In ordine: ogni passo dipende da quelli prima.

## 1. Dominio `riccardoeluisa.it`

Il dominio è su **IONOS** (nameserver `ui-dns`). Il 2/11/2026 il sito risponde su `https://riccardoeluisa.it/`
(server GitHub, certificato valido); `www` e `rlavelli.github.io/wedevite/` reindirizzano lì.

- [x] DNS nel pannello IONOS (Domini → riccardoeluisa.it → DNS), tolti i record di parcheggio di IONOS:

  | Tipo | Nome | Valore |
  |---|---|---|
  | A | `@` | `185.199.108.153` |
  | A | `@` | `185.199.109.153` |
  | A | `@` | `185.199.110.153` |
  | A | `@` | `185.199.111.153` |
  | AAAA | `@` | `2606:50c0:8000::153` |
  | AAAA | `@` | `2606:50c0:8001::153` |
  | AAAA | `@` | `2606:50c0:8002::153` |
  | AAAA | `@` | `2606:50c0:8003::153` |
  | CNAME | `www` | `rlavelli.github.io` |

- [x] Controllo: `https://riccardoeluisa.it/` e `https://riccardoeluisa.it/varianti/` si aprono.
- [x] Su GitHub: Settings → Pages → **Enforce HTTPS** (senza HTTPS il browser non decifra e l'IBAN non compare).

## 2. Anteprima WhatsApp e link dell'IBAN

- [x] In `index.html` portati `og:url` e `og:image` da `https://rlavelli.github.io/wedevite/` a `https://riccardoeluisa.it/`
  (`tools/cifra-iban.mjs` stampa il link da mandare leggendo `og:url`).

## 3. IBAN vero (lo fa l'utente, nel proprio terminale, non nella chat)

- [ ] Solo dopo i passi 1 e 2: `node tools/cifra-iban.mjs`, poi pubblicare `config.js`.
- Fino ad allora `ibanCifrato` è vuoto e online la sezione regalo non compare.
- La chiave ricordata dal browser (IndexedDB) vale per un solo dominio: chi apre il link su github.io e poi su
  `riccardoeluisa.it` deve riaprire il link con la chiave. Per questo il link va generato col dominio definitivo.
- `privato/` non va mai su GitHub (lo script si ferma se git non lo ignora).

## 4. Contenuti

- [ ] Completare le voci `SEGNAPOSTO` in `config.js`: orario, programma, informazioni, testo di benvenuto, numeri WhatsApp.

## 5. Qualità della foto di copertina (proposta fatta, non applicata)

- [ ] Larghezze maggiori: verticale 800/1200/1800, orizzontale 1200/1920/2560.
- [ ] WebP qualità 82-85.
- [ ] Correggere `sizes`, ad esempio `(max-aspect-ratio: 2/3) 67vh, 100vw`.

## 6. Scelta della variante

- [ ] Provare A, B, C, D da `/varianti/` (anche su iPhone/Safari) e decidere quale diventa il sito principale.
- Non ancora provato: Safari iOS (IndexedDB, navigazione privata) e la copia dell'IBAN su un telefono vero.

## 7. Fuori da questo repository

- [ ] Commit di `metodo-rl/progetti.md` con la riga di wedevite (altro repository, serve l'ok).

## 8. Chiusura dopo il matrimonio (11/6/2027)

Il sito serve solo per l'invito. Dopo la festa:

- [ ] **Dominio, decidere prima della scadenza:** un `.it` scaduto torna libero e chiunque può ricomprarlo;
  i link restano nelle chat WhatsApp degli invitati e porterebbero al sito di qualcun altro, con i vostri nomi.
  Lasciarlo scadere sapendolo, oppure tenerlo un anno in più (il rinnovo IONOS costa di solito più del primo anno).
- [ ] **IONOS:** disattivare il rinnovo automatico; controllare che non ci siano servizi email o altri a pagamento.
- [ ] **GitHub:** togliere il dominio in Settings → Pages, poi cancellare il repository
  (o renderlo privato: Pages si spegne, sull'account gratuito funziona solo con repository pubblici).
  L'IBAN cifrato resta illeggibile senza chiave, ma cancellare è la soluzione più pulita.
- [ ] **Locale:** cancellare `privato/` (chiave dell'IBAN) e, se non servono più, la cartella del progetto e `stats/`.
- [ ] **metodo-rl/progetti.md:** segnare il progetto come chiuso (o spostarlo in `personale/old`).

Fino ad allora, per restare fuori dagli obblighi GDPR: pubblicare solo dati vostri, mai dati o foto
di altri senza consenso (lista invitati, tavoli, galleria della festa); niente cookie, analytics o contenuti incorporati da terzi.
