/*
Cifra l'IBAN, lo scrive in config.js (regalo.ibanCifrato) e stampa il link da mandare agli invitati.

Uso (dalla cartella del progetto):
    node tools/cifra-iban.mjs                  chiede l'IBAN e usa la chiave già salvata
    node tools/cifra-iban.mjs --nuova-chiave   crea una chiave nuova: i link inviati prima smettono di mostrare l'IBAN

La chiave sta in privato/chiave-iban.txt, esclusa da git: senza di lei l'IBAN non si legge.
Si riusa a ogni esecuzione, così cambiare l'IBAN non rompe i link già inviati.
Cifratura: AES-GCM con chiave casuale da 128 bit e IV casuale nuovo a ogni esecuzione.
*/
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// CHIAVE_IBAN: solo per le prove, per non toccare la chiave vera
const KEY_FILE = process.env.CHIAVE_IBAN || join(ROOT, 'privato', 'chiave-iban.txt');
const CONFIG = join(ROOT, 'config.js');

function fail(message) {
  console.error('\n' + message);
  process.exit(1);
}

// Controllo dell'IBAN (ISO 13616): prime 4 lettere in fondo, lettere -> numeri, resto della divisione per 97 = 1
function validIban(iban) {
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const digits = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const d of digits) rest = (rest * 10 + Number(d)) % 97;
  return rest === 1;
}

// La chiave non deve mai finire su GitHub: se git non la ignora, ci si ferma
function checkIgnored(file) {
  if (!file.startsWith(ROOT)) return;
  try {
    execFileSync('git', ['check-ignore', '-q', relative(ROOT, file)], { cwd: ROOT });
  } catch {
    fail(`${relative(ROOT, file)} non è escluso da git: aggiungi "privato/" a .gitignore e riprova.`);
  }
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const typed = (await rl.question('IBAN (anche con gli spazi): ')).toUpperCase().replace(/\s+/g, '');
rl.close();
if (!validIban(typed)) fail('IBAN non valido: controlla di averlo scritto bene (il codice di controllo non torna).');
const display = typed.replace(/(.{4})/g, '$1 ').trim();

checkIgnored(KEY_FILE);
let rawKey;
if (existsSync(KEY_FILE) && !process.argv.includes('--nuova-chiave')) {
  rawKey = Buffer.from(readFileSync(KEY_FILE, 'utf8').trim(), 'base64url');
  if (rawKey.length !== 16) fail(`La chiave in ${KEY_FILE} non è valida: rigenerala con --nuova-chiave.`);
} else {
  rawKey = Buffer.from(crypto.getRandomValues(new Uint8Array(16)));
  mkdirSync(dirname(KEY_FILE), { recursive: true });
  writeFileSync(KEY_FILE, rawKey.toString('base64url') + '\n');
  console.log(`Chiave nuova salvata in ${relative(ROOT, KEY_FILE) || KEY_FILE}`);
}

const key = await crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt']);
const iv = crypto.getRandomValues(new Uint8Array(12));
const sealed = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(display));
const value = ['v1', Buffer.from(iv).toString('base64url'), Buffer.from(sealed).toString('base64url')].join('.');

const config = readFileSync(CONFIG, 'utf8');
if (!/ibanCifrato:\s*"[^"]*"/.test(config)) fail('In config.js manca la voce ibanCifrato: "" dentro regalo.');
writeFileSync(CONFIG, config.replace(/ibanCifrato:\s*"[^"]*"/, `ibanCifrato: "${value}"`));

// L'indirizzo del sito è quello dell'anteprima WhatsApp in index.html
const site = (readFileSync(join(ROOT, 'index.html'), 'utf8').match(/property="og:url" content="([^"]+)"/) || [])[1] || '<indirizzo del sito>/';
console.log(`\nIBAN ${display} cifrato e scritto in config.js.`);
console.log('Link da mandare agli invitati (chi lo apre vede anche l\'IBAN):\n');
console.log(`    ${site}#${rawKey.toString('base64url')}\n`);
console.log('Poi pubblica config.js su GitHub come al solito.');
