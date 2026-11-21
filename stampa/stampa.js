/* ==========================================================================
   Invito da stampare. Riempie i testi da config.js e disegna le curve di
   livello come tracciati SVG (vettoriali: nitidi a qualsiasi risoluzione).
   Il rilievo è lo stesso generatore di varianti/topografica/topografica.js
   (stesso seme), esteso al formato verticale del foglio A5.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  if (!C) return;

  /* --- Testi ------------------------------------------------------------- */
  // fronte scelto: ?fronte=foto (o #foto), altrimenti topografico.
  // Il cambio avviene nella pagina, senza ricaricarla: funziona anche aprendo il file dal disco.
  var choices = document.querySelectorAll('[data-choice]');
  function setFront(front) {
    document.documentElement.setAttribute('data-fronte', front);
    choices.forEach(function (a) {
      if (a.getAttribute('data-choice') === front) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }
  setFront(/[?&]fronte=foto\b|#foto\b/.test(location.search + location.hash) ? 'foto' : 'topo');
  choices.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      setFront(a.getAttribute('data-choice'));
      try { history.replaceState(null, '', a.href); } catch (err) { /* su file:// alcuni browser non lo permettono */ }
    });
  });

  // uno stesso slot può comparire su entrambi i fronti
  function slot(name, text) {
    document.querySelectorAll('[data-slot="' + name + '"]').forEach(function (el) { el.textContent = text; });
  }
  var d = C.data.split('-').map(Number);
  var day = new Date(d[0], d[1] - 1, d[2]);
  var luogo = C.luoghi[0];
  // "Via ..., Monticello Brianza (LC)" -> "Monticello Brianza"
  var town = luogo.indirizzo.split(',').pop().replace(/\(.*\)/, '').trim();

  slot('phrase', C.copertina.frase.replace(/!$/, ''));
  slot('town', town);
  slot('names', C.coppia.nome1 + ' & ' + C.coppia.nome2);
  slot('weekday', day.toLocaleDateString('it-IT', { weekday: 'long' }));
  slot('date', day.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }));
  slot('time', 'ore ' + C.ora);
  slot('date-dots', C.data.split('-').reverse().join(' · '));
  document.querySelectorAll('[data-slot="names-lines"]').forEach(function (el) {
    [C.coppia.nome1, '&', C.coppia.nome2].forEach(function (t, k) {
      var s = document.createElement('span');
      if (k === 1) s.className = 'amp';
      s.textContent = t;
      el.append(s);
    });
  });
  slot('venue', luogo.nome);
  slot('address', luogo.indirizzo);

  var r = C.rsvp.scadenza.split('-').map(Number);
  var rDay = r[2] === 1 ? '1°' : String(r[2]);
  var rDate = rDay + ' ' + new Date(r[0], r[1] - 1, r[2]).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  slot('rsvp', 'Vi chiediamo di confermare la vostra presenza entro il ' + rDate + '.');

  var program = document.querySelector('[data-slot="program"]');
  if (C.programma && C.programma.attivo) {
    C.programma.tappe.forEach(function (t) {
      var li = document.createElement('li');
      var b = document.createElement('b'); b.textContent = t.ora;
      var s = document.createElement('span'); s.textContent = t.titolo;
      li.append(b, s);
      program.append(li);
    });
  } else if (program) {
    program.remove();
  }

  /* --- Curve di livello -------------------------------------------------- */
  var W = 600, H = 851; // proporzioni A5 (148 x 210)
  var seed = 20270611;
  function rnd() { // mulberry32
    seed = (seed + 0x6D2B79F5) | 0;
    var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  var perm = new Uint8Array(512), val = new Float32Array(256), i;
  for (i = 0; i < 256; i++) { perm[i] = i; val[i] = rnd(); }
  for (i = 255; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var tmp = perm[i]; perm[i] = perm[j]; perm[j] = tmp; }
  for (i = 0; i < 256; i++) perm[i + 256] = perm[i];

  function noise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var X = xi & 255, Y = yi & 255;
    var a = val[perm[perm[X] + Y]], b = val[perm[perm[X + 1] + Y]];
    var c = val[perm[perm[X] + Y + 1]], e = val[perm[perm[X + 1] + Y + 1]];
    return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v;
  }
  function fbm(x, y, oct) {
    var s = 0, amp = .5, f = 1;
    for (var o = 0; o < oct; o++) { s += amp * noise(x * f, y * f); f *= 2.03; amp *= .5; }
    return s;
  }
  function height(x, y) {
    var wx = x + 90 * (fbm(x / 240 + 3.1, y / 240 + 7.7, 3) - .5);
    var wy = y + 90 * (fbm(x / 240 + 11.3, y / 240 + 1.9, 3) - .5);
    return fbm(wx / 165, wy / 165, 4);
  }

  var STEP = 4, NX = Math.ceil(W / STEP) + 1, NY = Math.ceil(H / STEP) + 1;
  var F = new Float32Array(NX * NY), lo = Infinity, hi = -Infinity, gx, gy;
  for (gy = 0; gy < NY; gy++) {
    for (gx = 0; gx < NX; gx++) {
      var h = height(gx * STEP, gy * STEP);
      F[gy * NX + gx] = h;
      if (h < lo) lo = h;
      if (h > hi) hi = h;
    }
  }

  function f1(n) { return Math.round(n * 10) / 10; }
  // marching squares (lati: 0 alto, 1 destra, 2 basso, 3 sinistra)
  var CASES = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[0, 1], [3, 2]], [[0, 2]], [[0, 3]],
    [[0, 3]], [[0, 2]], [[0, 3], [2, 1]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []];
  var LEVELS = 26, minor = [], major = [];
  for (var lv = 1; lv < LEVELS; lv++) {
    var q = lo + (hi - lo) * lv / LEVELS, out = lv % 5 === 0 ? major : minor;
    for (gy = 0; gy < NY - 1; gy++) {
      for (gx = 0; gx < NX - 1; gx++) {
        var tl = F[gy * NX + gx], tr = F[gy * NX + gx + 1], br = F[(gy + 1) * NX + gx + 1], bl = F[(gy + 1) * NX + gx];
        var segs = CASES[(tl > q ? 8 : 0) | (tr > q ? 4 : 0) | (br > q ? 2 : 0) | (bl > q ? 1 : 0)];
        if (!segs.length) continue;
        var x0 = gx * STEP, y0 = gy * STEP;
        var p = [
          [x0 + STEP * (q - tl) / (tr - tl), y0],
          [x0 + STEP, y0 + STEP * (q - tr) / (br - tr)],
          [x0 + STEP * (q - bl) / (br - bl), y0 + STEP],
          [x0, y0 + STEP * (q - tl) / (bl - tl)]
        ];
        for (var k = 0; k < segs.length; k++) {
          var A = p[segs[k][0]], B = p[segs[k][1]];
          out.push('M' + f1(A[0]) + ' ' + f1(A[1]) + 'L' + f1(B[0]) + ' ' + f1(B[1]));
        }
      }
    }
  }

  var grid = '';
  for (i = 50; i < W; i += 50) grid += 'M' + i + ' 0V' + H;
  for (i = 50; i < H; i += 50) grid += 'M0 ' + i + 'H' + W;

  var craters = '';
  for (i = 0; i < 30; i++) {
    var cx = rnd() * W, cy = rnd() * H, rr = 2 + rnd() * 7, rings = 1 + Math.floor(rnd() * 3);
    for (k = 0; k < rings; k++) {
      var R = f1(rr + k * 2.6);
      craters += 'M' + f1(cx - R) + ' ' + f1(cy) + 'a' + R + ' ' + R + ' 0 1 0 ' + (2 * R) + ' 0a' + R + ' ' + R + ' 0 1 0 ' + (-2 * R) + ' 0';
    }
  }

  var art = '<path class="tp-grid" stroke="currentColor" d="' + grid + '"/>' +
    '<path class="tp-min" stroke="currentColor" d="' + minor.join('') + '"/>' +
    '<path class="tp-maj" stroke="currentColor" d="' + major.join('') + '"/>' +
    '<path class="tp-crater" stroke="currentColor" d="' + craters + '"/>';

  document.querySelectorAll('svg.topo').forEach(function (svgEl) {
    // il retro (data-mirror) è lo specchio del fronte: stessa carta, vista dall'altra parte
    svgEl.innerHTML = svgEl.hasAttribute('data-mirror') ? '<g transform="translate(' + W + ' 0) scale(-1 1)">' + art + '</g>' : art;
  });
})();
