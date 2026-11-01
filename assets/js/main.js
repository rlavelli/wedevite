/* ==========================================================================
   Costruisce la pagina a partire da config.js (window.WEDDING).
   Nessuna chiamata a servizi esterni: tutto avviene nel browser.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  if (!C) {
    document.body.insertAdjacentHTML('afterbegin', '<p class="noscript">config.js non trovato o con un errore di scrittura.</p>');
    return;
  }

  var TZ = 'Europe/Rome';
  var PAGE_URL = location.href.split('#')[0];
  var COUPLE = C.coppia.nome1 + ' e ' + C.coppia.nome2;

  /* --- Utilità ---------------------------------------------------------- */
  function slot(name) { return document.querySelector('[data-slot="' + name + '"]'); }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function removeSection(name) {
    document.querySelectorAll('[data-section="' + name + '"]').forEach(function (node) { node.remove(); });
  }

  // <picture> con WebP e JPG nelle larghezze create da tools/ottimizza-foto.py
  function picture(foto, alt, sizes, eager) {
    var srcset = function (ext) {
      return foto.larghezze.map(function (w) { return foto.src + '-' + w + '.' + ext + ' ' + w + 'w'; }).join(', ');
    };
    var pic = el('picture');
    var source = el('source');
    source.type = 'image/webp';
    source.srcset = srcset('webp');
    source.sizes = sizes;
    var img = el('img');
    img.src = foto.src + '-' + foto.larghezze[0] + '.jpg';
    img.srcset = srcset('jpg');
    img.sizes = sizes;
    img.alt = alt || '';
    img.decoding = 'async';
    if (eager) img.setAttribute('fetchpriority', 'high');
    else img.loading = 'lazy';
    pic.append(source, img);
    return pic;
  }

  // Converte data e ora italiane in un istante preciso (gestisce l'ora legale).
  function romeTime(dateStr, timeStr) {
    var d = dateStr.split('-').map(Number);
    var t = (timeStr || '00:00').split(':').map(Number);
    var guess = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1]);
    var offset = function (ts) {
      var p = {};
      new Intl.DateTimeFormat('en-US', {
        timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).formatToParts(new Date(ts)).forEach(function (x) { p[x.type] = +x.value; });
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ts;
    };
    return new Date(guess - offset(guess - offset(guess)));
  }

  function formatDate(dateStr, options) {
    var d = dateStr.split('-').map(Number);
    return new Intl.DateTimeFormat('it-IT', Object.assign({ timeZone: 'UTC' }, options))
      .format(new Date(Date.UTC(d[0], d[1] - 1, d[2], 12)));
  }
  var LONG = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

  function mapsUrl(place) {
    return place.mapsLink || 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent(place.nome + ', ' + place.indirizzo);
  }

  var ICONS = {
    parcheggio: '<path d="M7 20V4h6a5 5 0 0 1 0 10H7"/>',
    strada: '<path d="M8 3 4 21M16 3l4 18M12 4v3M12 11v3M12 18v2"/>',
    hotel: '<path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11.5" r="2"/>',
    abito: '<path d="M8 3h8l-1.5 5L19 21H5l4.5-13L8 3z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    mappa: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
    whatsapp: '<path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6z"/><path d="M9.2 8.6c.3 2.6 2.3 4.9 5.2 5.6l.9-1.3-1.7-.9-.7.7a4.4 4.4 0 0 1-2.4-2.4l.7-.7-.9-1.7z"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || ICONS.info) + '</svg>';
  }
  function iconLink(className, href, iconName, label) {
    var a = el('a', className);
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = icon(iconName);
    a.append(label);
    return a;
  }

  /* --- Tema ------------------------------------------------------------- */
  var themeVars = { fondo: '--fondo', fondoAlt: '--fondo-alt', accento: '--accento', salvia: '--salvia', oro: '--oro', testo: '--testo' };
  Object.keys(themeVars).forEach(function (key) {
    if (C.tema && C.tema[key]) document.documentElement.style.setProperty(themeVars[key], C.tema[key]);
  });
  var themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor && C.tema && C.tema.accento) themeColor.content = C.tema.accento;

  /* --- Copertina -------------------------------------------------------- */
  (function hero() {
    var cov = C.copertina;
    var pic = picture(cov.fotoVerticale, cov.alt, '100vw', true);
    var wide = el('source');
    wide.media = '(min-width: 48rem) and (orientation: landscape)';
    wide.type = 'image/webp';
    wide.srcset = cov.fotoOrizzontale.larghezze.map(function (w) { return cov.fotoOrizzontale.src + '-' + w + '.webp ' + w + 'w'; }).join(', ');
    wide.sizes = '100vw';
    pic.prepend(wide);
    slot('hero-media').append(pic);

    slot('hero-phrase').textContent = cov.frase;
    var names = slot('hero-names');
    names.append(C.coppia.nome1, el('span', 'amp', 'e'), C.coppia.nome2);
    slot('hero-date').textContent = formatDate(C.data, { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  /* --- Il nostro matrimonio --------------------------------------------- */
  (function intro() {
    var i = C.intro;
    slot('intro-title').textContent = i.titolo;
    var text = slot('intro-text');
    i.paragrafi.forEach(function (p) {
      var node = el('p', null, p);
      node.setAttribute('data-reveal', '');
      text.append(node);
    });
    slot('intro-signature').textContent = i.firma;
    var fig = slot('intro-photo');
    if (i.foto) fig.append(picture(i.foto, i.alt, '(min-width: 48rem) 40vw, 90vw'));
    else fig.remove();
  })();

  /* --- Conto alla rovescia e calendario --------------------------------- */
  var start = romeTime(C.data, C.ora);
  var end = new Date(start.getTime() + (C.durataOre || 8) * 3600e3);
  var mainPlace = C.luoghi[0] || { nome: '', indirizzo: '' };
  var eventTitle = 'Matrimonio di ' + COUPLE;
  var eventPlace = mainPlace.nome + ', ' + mainPlace.indirizzo;

  (function countdown() {
    slot('countdown-title').textContent = C.countdown.titolo;
    slot('countdown-date').textContent = formatDate(C.data, LONG) + (C.ora ? ' · ore ' + C.ora : '');

    var box = slot('countdown');
    box.setAttribute('role', 'timer');
    var units = [['giorni', 86400], ['ore', 3600], ['minuti', 60], ['secondi', 1]].map(function (u) {
      var wrap = el('div', 'countdown__unit');
      var value = el('span', 'countdown__value', '0');
      wrap.append(value, el('span', 'countdown__label', u[0]));
      box.append(wrap);
      return { value: value, size: u[1] };
    });

    var timer;
    function tick() {
      var left = Math.floor((start - Date.now()) / 1000);
      if (left <= 0) {
        clearInterval(timer);
        box.replaceChildren(el('p', 'countdown__done', C.countdown.messaggioDopo));
        box.style.display = 'block';
        box.removeAttribute('role');
        var actions = box.nextElementSibling;
        if (actions) actions.remove();
        return;
      }
      units.forEach(function (u) {
        var n = Math.floor(left / u.size);
        left -= n * u.size;
        var txt = u.size === 86400 ? String(n) : String(n).padStart(2, '0');
        if (u.value.textContent !== txt) u.value.textContent = txt;
      });
    }
    timer = setInterval(tick, 1000);
    tick();
  })();

  function icsStamp(date) { return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function icsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }

  (function calendar() {
    var gcal = slot('gcal');
    if (!gcal) return;
    gcal.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(eventTitle) +
      '&dates=' + icsStamp(start) + '/' + icsStamp(end) +
      '&location=' + encodeURIComponent(eventPlace) +
      '&details=' + encodeURIComponent(PAGE_URL);

    document.querySelector('[data-action="ics"]').addEventListener('click', function () {
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invito matrimonio//IT', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:' + icsStamp(start) + '-' + C.coppia.nome1.toLowerCase() + '-' + C.coppia.nome2.toLowerCase() + '@invito',
        'DTSTAMP:' + icsStamp(new Date()),
        'DTSTART:' + icsStamp(start),
        'DTEND:' + icsStamp(end),
        'SUMMARY:' + icsText(eventTitle),
        'LOCATION:' + icsText(eventPlace),
        'DESCRIPTION:' + icsText(PAGE_URL),
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText(eventTitle), 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');

      // iPhone/iPad: il link data: apre direttamente la schermata "Aggiungi al calendario"
      if (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
        location.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
        return;
      }
      var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      var a = el('a');
      a.href = url;
      a.download = 'matrimonio-' + C.coppia.nome1.toLowerCase() + '-' + C.coppia.nome2.toLowerCase() + '.ics';
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  })();

  /* --- Luoghi ----------------------------------------------------------- */
  (function places() {
    var box = slot('places');
    if (C.luoghi.length === 1) box.classList.add('places--single');
    else document.getElementById('places-title').textContent = 'I luoghi';

    C.luoghi.forEach(function (p) {
      var card = el('article', 'place');
      card.setAttribute('data-reveal', '');
      if (p.foto) {
        var fig = el('figure', 'place__photo');
        fig.style.margin = '0';
        fig.append(picture(p.foto, p.alt, '(min-width: 48rem) 34rem, 100vw'));
        card.append(fig);
      }
      var body = el('div', 'place__body');
      body.append(el('p', 'eyebrow', p.etichetta), el('h3', 'place__name', p.nome), el('p', 'place__address', p.indirizzo));
      if (p.orari && p.orari.length) {
        var list = el('ul', 'place__times');
        p.orari.forEach(function (o) {
          var li = el('li');
          li.append(el('span', 'place__time', o.ora), el('span', 'place__what', o.cosa));
          list.append(li);
        });
        body.append(list);
      }
      var actions = el('div', 'actions');
      actions.append(iconLink('btn btn--ghost', mapsUrl(p), 'mappa', 'Apri su Google Maps'));
      body.append(actions);
      card.append(body);
      box.append(card);
    });
  })();

  /* --- Programma -------------------------------------------------------- */
  (function program() {
    var p = C.programma;
    if (!p || !p.attivo || !p.tappe.length) return removeSection('programma');
    slot('program-title').textContent = p.titolo;
    var list = slot('timeline');
    p.tappe.forEach(function (t) {
      var li = el('li', 'timeline__item');
      li.setAttribute('data-reveal', '');
      var time = el('time', 'timeline__time', t.ora);
      time.dateTime = t.ora;
      var text = el('div');
      text.append(el('h3', 'timeline__title', t.titolo));
      if (t.testo) text.append(el('p', 'timeline__text', t.testo));
      li.append(time, text);
      list.append(li);
    });
  })();

  /* --- Informazioni utili ----------------------------------------------- */
  (function info() {
    var inf = C.info;
    if (!inf || !inf.attivo || !inf.voci.length) return removeSection('info');
    slot('info-title').textContent = inf.titolo;
    var grid = slot('info');
    inf.voci.forEach(function (v) {
      var item = el('div', 'info-item');
      item.setAttribute('data-reveal', '');
      item.innerHTML = icon(v.icona);
      item.append(el('h3', null, v.titolo), el('p', null, v.testo));
      grid.append(item);
    });
  })();

  /* --- Conferma della presenza (via WhatsApp, nessun modulo online) ----- */
  (function rsvp() {
    var r = C.rsvp;
    if (!r || !r.attivo) return removeSection('rsvp');
    slot('rsvp-title').textContent = r.titolo;
    slot('rsvp-deadline').append('Entro ', el('strong', 'rsvp-deadline', formatDate(r.scadenza, LONG)));
    slot('rsvp-text').textContent = r.testo;

    var text = encodeURIComponent(r.messaggio);
    var actions = slot('rsvp-actions');
    var withNumber = (r.contatti || []).filter(function (c) { return c.numero; });
    if (withNumber.length) {
      withNumber.forEach(function (c, i) {
        actions.append(iconLink(i ? 'btn btn--ghost' : 'btn', 'https://wa.me/' + c.numero.replace(/\D/g, '') + '?text=' + text, 'whatsapp', 'Scrivi a ' + c.nome));
      });
    } else {
      actions.append(iconLink('btn', 'https://wa.me/?text=' + text, 'whatsapp', 'Rispondi su WhatsApp'));
    }
  })();

  /* --- IBAN cifrato ----------------------------------------------------- */
  // L'IBAN in config.js è cifrato (AES-GCM, tools/cifra-iban.mjs). La chiave è nel link mandato
  // agli invitati, dopo il # (quella parte non arriva mai al server): si toglie dalla barra degli
  // indirizzi e si conserva nel browser come chiave non esportabile, per le visite successive.
  var KEY_IN_LINK = /^#([A-Za-z0-9_-]{22})$/;

  function fromBase64url(text) {
    var s = text.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); });
  }

  function keyStore(value) {
    return new Promise(function (resolve, reject) {
      var open = indexedDB.open('invito', 1);
      open.onupgradeneeded = function () { open.result.createObjectStore('chiavi'); };
      open.onerror = function () { reject(open.error); };
      open.onsuccess = function () {
        var store = open.result.transaction('chiavi', value ? 'readwrite' : 'readonly').objectStore('chiavi');
        var op = value ? store.put(value, 'iban') : store.get('iban');
        op.onsuccess = function () { resolve(op.result); };
        op.onerror = function () { reject(op.error); };
      };
    });
  }

  function openIban(sealed) {
    var subtle = window.crypto && window.crypto.subtle;
    var parts = (sealed || '').split('.');
    if (!subtle || !window.indexedDB || parts.length !== 3 || parts[0] !== 'v1') return Promise.reject(new Error('IBAN non disponibile'));
    var decrypt = function (key) {
      if (!key) throw new Error('nessuna chiave');
      return subtle.decrypt({ name: 'AES-GCM', iv: fromBase64url(parts[1]) }, key, fromBase64url(parts[2]));
    };
    var stored = function () { return keyStore().then(decrypt); };
    var match = KEY_IN_LINK.exec(location.hash);
    var result;
    if (match) {
      history.replaceState(null, '', location.pathname + location.search);
      result = subtle.importKey('raw', fromBase64url(match[1]), 'AES-GCM', false, ['decrypt']).then(function (key) {
        // si conserva solo una chiave che ha funzionato; se quella del link è sbagliata si prova quella salvata
        return decrypt(key).then(function (plain) {
          keyStore(key).catch(function () {});
          return plain;
        });
      }).catch(stored);
    } else {
      result = stored();
    }
    return result.then(function (plain) { return new TextDecoder().decode(plain); });
  }

  /* --- Regalo ----------------------------------------------------------- */
  (function gift() {
    var g = C.regalo;
    if (!g || !g.attivo) return removeSection('regalo');
    slot('gift-title').textContent = g.titolo;
    slot('gift-text').textContent = g.testo;
    slot('gift-holder').textContent = g.intestatario;
    slot('gift-reason').textContent = g.causale;
    // senza la chiave giusta la sezione non compare: chi non ha il link non sa che esiste
    var ibanText = '';
    openIban(g.ibanCifrato).then(function (value) {
      ibanText = value;
      slot('gift-iban').textContent = value;
    }, function () { removeSection('regalo'); });

    var feedback = slot('gift-feedback');
    var done = function (ok) {
      feedback.textContent = ok ? 'IBAN copiato negli appunti.' : 'Tieni premuto sull’IBAN per copiarlo.';
      setTimeout(function () { feedback.textContent = ''; }, 4000);
    };
    function fallbackCopy(value) {
      var area = el('textarea');
      area.value = value;
      area.setAttribute('readonly', '');
      area.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.append(area);
      area.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      area.remove();
      return ok;
    }
    document.querySelector('[data-action="copy-iban"]').addEventListener('click', function () {
      var iban = ibanText.replace(/\s+/g, '');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(iban).then(function () { done(true); }, function () { done(fallbackCopy(iban)); });
      } else {
        done(fallbackCopy(iban));
      }
    });
  })();

  /* --- Piè di pagina e condivisione ------------------------------------- */
  (function footer() {
    slot('footer-initials').textContent = C.coppia.iniziali;
    slot('footer-names').textContent = COUPLE;
    slot('footer-date').textContent = formatDate(C.data, { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, ' · ');
    slot('footer-thanks').textContent = C.footer.grazie;
    var share = slot('share');
    share.href = 'https://wa.me/?text=' + encodeURIComponent(C.condivisione.testo + ' ' + PAGE_URL);
    share.innerHTML = icon('whatsapp');
    share.append('Condividi su WhatsApp');
  })();

  /* --- Sfondo del conto alla rovescia: caricato solo quando serve ------- */
  var countdownSection = document.getElementById('countdown');
  var bgFoto = C.copertina.fotoOrizzontale;
  function loadCountdownBg() {
    var w = bgFoto.larghezze;
    var size = window.innerWidth * (window.devicePixelRatio || 1) > w[0] ? w[w.length - 1] : w[0];
    // percorso assoluto: un url() relativo dentro una variabile CSS verrebbe letto rispetto a style.css
    var abs = new URL(bgFoto.src + '-' + size + '.webp', document.baseURI).href;
    countdownSection.style.setProperty('--countdown-bg', 'url("' + abs + '")');
  }

  /* --- Comparsa allo scorrimento (scroll reveal) ------------------------ */
  var items = document.querySelectorAll('[data-reveal]');
  items.forEach(function (node) {
    var siblings = Array.prototype.filter.call(node.parentElement.children, function (n) { return n.hasAttribute('data-reveal'); });
    node.style.setProperty('--reveal-delay', Math.min(siblings.indexOf(node), 4) * 0.12 + 's');
  });

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (node) { node.classList.add('is-visible'); });
    loadCountdownBg();
    return;
  }
  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach(function (node) { revealer.observe(node); });

  var bgLoader = new IntersectionObserver(function (entries) {
    if (!entries[0].isIntersecting) return;
    loadCountdownBg();
    bgLoader.disconnect();
  }, { rootMargin: '600px 0px' });
  bgLoader.observe(countdownSection);
})();
