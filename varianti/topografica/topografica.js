/* ==========================================================================
   Variante "Topografica". Va caricato dopo main.js. Nasce dalla variante E:
   1. Curve di livello: un rilievo inventato (rumore con seme fisso, quindi lo
      stesso a ogni visita) tagliato a quote regolari e disegnato su un canvas;
      l'immagine fa da sfondo alla mappa, alla sua copertina e al piè di pagina.
   2. Percorso lungo la pagina, come nella E, ma l'aereo non salta più allo
      scorrimento: insegue la sua posizione con un movimento smorzato, lungo la
      linea, e anche la rotazione si gira con morbidezza.
   3. Mappa d'apertura: si apre al tocco, l'aereo vola alla destinazione,
      poi la mappa si allontana e compare la copertina.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  if (!C) return;

  var NS = 'http://www.w3.org/2000/svg';
  var PLANE = 'M12 2c.8 0 1.3.9 1.3 2v5.2l7.2 4.3v1.9l-7.2-2.2v4.6l2 1.5v1.6l-3.3-1-3.3 1v-1.6l2-1.5v-4.6l-7.2 2.2v-1.9l7.2-4.3V4c0-1.1.5-2 1.3-2z';
  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function svg(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.append(n);
    return n;
  }
  function angleOf(a, b) { return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90; } // l'aereo disegnato punta in alto
  // avvicina l'angolo a quello voluto passando dal lato più corto
  function turn(from, to, k) { return from + ((((to - from) % 360) + 540) % 360 - 180) * k; }

  /* --- 1. Curve di livello ------------------------------------------------ */
  function topography(done) {
    var seed = 20270611;
    function rnd() { // mulberry32
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    var perm = new Uint8Array(512), val = new Float32Array(256), i;
    for (i = 0; i < 256; i++) { perm[i] = i; val[i] = rnd(); }
    for (i = 255; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    for (i = 0; i < 256; i++) perm[i + 256] = perm[i];

    function noise(x, y) {
      var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
      var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      var X = xi & 255, Y = yi & 255;
      var a = val[perm[perm[X] + Y]], b = val[perm[perm[X + 1] + Y]];
      var c = val[perm[perm[X] + Y + 1]], d = val[perm[perm[X + 1] + Y + 1]];
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    }
    function fbm(x, y, oct) {
      var s = 0, amp = .5, f = 1;
      for (var o = 0; o < oct; o++) { s += amp * noise(x * f, y * f); f *= 2.03; amp *= .5; }
      return s;
    }
    // quota nel punto (x, y) della mappa (0-600): rumore "piegato" per avere creste sinuose
    function height(x, y) {
      var wx = x + 90 * (fbm(x / 240 + 3.1, y / 240 + 7.7, 3) - .5);
      var wy = y + 90 * (fbm(x / 240 + 11.3, y / 240 + 1.9, 3) - .5);
      return fbm(wx / 165, wy / 165, 4);
    }

    var STEP = 4, N = 600 / STEP + 1;
    var H = new Float32Array(N * N), lo = Infinity, hi = -Infinity;
    for (var gy = 0; gy < N; gy++) {
      for (var gx = 0; gx < N; gx++) {
        var h = height(gx * STEP, gy * STEP);
        H[gy * N + gx] = h;
        if (h < lo) lo = h;
        if (h > hi) hi = h;
      }
    }

    // 1280 px bastano su telefono; su schermi più grandi 1600
    var SIZE = Math.min(window.innerWidth, window.innerHeight) < 600 ? 1280 : 1600, K = SIZE / 600;
    var canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    var ctx = canvas.getContext('2d');
    ctx.lineCap = ctx.lineJoin = 'round';

    // griglia leggera, come nelle carte
    ctx.strokeStyle = 'rgba(255, 253, 249, .07)';
    ctx.lineWidth = .7 * K;
    ctx.beginPath();
    for (i = 50; i < 600; i += 50) { ctx.moveTo(i * K, 0); ctx.lineTo(i * K, SIZE); ctx.moveTo(0, i * K); ctx.lineTo(SIZE, i * K); }
    ctx.stroke();

    // marching squares: per ogni quota, un segmento in ogni cella che la attraversa
    // (lati: 0 alto, 1 destra, 2 basso, 3 sinistra; indice = alto-sx·8 + alto-dx·4 + basso-dx·2 + basso-sx)
    var CASES = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[0, 1], [3, 2]], [[0, 2]], [[0, 3]],
      [[0, 3]], [[0, 2]], [[0, 3], [2, 1]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []];
    var LEVELS = 26;
    for (var lv = 1; lv < LEVELS; lv++) {
      var q = lo + (hi - lo) * lv / LEVELS;
      var major = lv % 5 === 0;
      ctx.strokeStyle = major ? 'rgba(255, 253, 249, .42)' : 'rgba(255, 253, 249, .2)';
      ctx.lineWidth = (major ? 1.15 : .7) * K;
      ctx.beginPath();
      for (gy = 0; gy < N - 1; gy++) {
        for (gx = 0; gx < N - 1; gx++) {
          var tl = H[gy * N + gx], tr = H[gy * N + gx + 1], br = H[(gy + 1) * N + gx + 1], bl = H[(gy + 1) * N + gx];
          var idx = (tl > q ? 8 : 0) | (tr > q ? 4 : 0) | (br > q ? 2 : 0) | (bl > q ? 1 : 0);
          var segs = CASES[idx];
          if (!segs.length) continue;
          var x0 = gx * STEP, y0 = gy * STEP;
          var pts = [
            [x0 + STEP * (q - tl) / (tr - tl), y0],
            [x0 + STEP, y0 + STEP * (q - tr) / (br - tr)],
            [x0 + STEP * (q - bl) / (br - bl), y0 + STEP],
            [x0, y0 + STEP * (q - tl) / (bl - tl)]
          ];
          segs.forEach(function (sg) {
            ctx.moveTo(pts[sg[0]][0] * K, pts[sg[0]][1] * K);
            ctx.lineTo(pts[sg[1]][0] * K, pts[sg[1]][1] * K);
          });
        }
      }
      ctx.stroke();
    }

    // piccoli crateri ad anelli, come nel riferimento
    ctx.strokeStyle = 'rgba(255, 253, 249, .26)';
    ctx.lineWidth = .6 * K;
    for (i = 0; i < 26; i++) {
      var cx = rnd() * 600, cy = rnd() * 600, r = 2 + rnd() * 7, rings = 1 + Math.floor(rnd() * 3);
      for (var k = 0; k < rings; k++) {
        ctx.beginPath();
        ctx.arc(cx * K, cy * K, (r + k * 2.6) * K, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (canvas.toBlob) {
      // WebP: più veloce da produrre e più leggero del PNG (dove non c'è, il browser fa PNG)
      canvas.toBlob(function (blob) { done(blob ? URL.createObjectURL(blob) : canvas.toDataURL()); }, 'image/webp', .9);
    } else {
      done(canvas.toDataURL());
    }
  }

  function applyTopography(url) {
    var img = document.getElementById('map-topo');
    if (img) img.setAttribute('href', url);
    html.style.setProperty('--topo', 'url("' + url + '")');
  }

  // Con la mappa d'apertura le curve si disegnano subito, prima di tutto il resto, e la mappa
  // si mostra solo quando l'immagine è pronta e decodificata: così compaiono insieme.
  var topoReady = null;
  if (html.classList.contains('map-pending') && document.getElementById('mapcover')) {
    topoReady = new Promise(function (resolve) {
      topography(function (url) {
        applyTopography(url);
        var probe = new Image();
        probe.src = url;
        var ok = function () { resolve(url); };
        if (probe.decode) probe.decode().then(ok, ok); else { probe.onload = probe.onerror = ok; }
      });
    });
  }

  /* --- 2. Percorso lungo la pagina ------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));

  // numero romano davanti ai sopratitoli (il conto alla rovescia ha la data, resta senza)
  var n = 0;
  sections.forEach(function (s) {
    var eb = s.querySelector('.eyebrow');
    if (eb && s.id !== 'countdown') eb.setAttribute('data-stop', ROMAN[n++] || '');
  });

  var root = svg('svg', { class: 'route', 'aria-hidden': 'true', focusable: 'false' });
  var clipRect = svg('rect', { x: 0, y: 0, width: 0, height: 0 },
    svg('clipPath', { id: 'route-clip', clipPathUnits: 'userSpaceOnUse' }, svg('defs', {}, root)));
  var base = svg('path', { class: 'route__base' }, root);
  var done = svg('path', { class: 'route__done', 'clip-path': 'url(#route-clip)' }, root);
  var stopsLayer = svg('g', {}, root);
  var plane = svg('g', { class: 'route__plane' }, root);
  var medal = svg('circle', { r: 18 }, plane);
  var heading = svg('g', {}, plane);
  var planeIcon = svg('path', { d: PLANE, transform: 'translate(-12 -12)' }, heading);
  document.body.append(root);

  var monogram = document.querySelector('.footer__monogram');
  var lutStep = 3;    // distanza fra i punti del percorso (circa 3 px di lunghezza)
  var lut = [];       // la y cresce sempre: per y si trova la lunghezza, per lunghezza il punto
  var stops = [];
  var cur = null;     // posizione mostrata { l: lunghezza, a: angolo }
  var target = 0;     // lunghezza voluta in base allo scorrimento

  function curve(a, b) {
    var m = (a.y + b.y) / 2;
    return ' C' + a.x + ' ' + m + ' ' + b.x + ' ' + m + ' ' + b.x + ' ' + b.y;
  }

  // posizione nella pagina senza contare le trasformazioni (la comparsa sposta i testi di 18px)
  function pageTop(node) {
    var y = 0;
    for (; node; node = node.offsetParent) y += node.offsetTop;
    return y;
  }

  function pointAt(l) {
    var f = Math.min(lut.length - 1, Math.max(0, l / lutStep));
    var i = Math.min(lut.length - 2, Math.floor(f));
    var k = f - i, a = lut[i], b = lut[i + 1];
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
  }
  function lengthAtY(y) {
    var lo = 0, hi = lut.length - 1;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (lut[mid].y < y) lo = mid + 1; else hi = mid;
    }
    if (lo === 0) return 0;
    var a = lut[lo - 1], b = lut[lo];
    var k = b.y > a.y ? Math.min(1, Math.max(0, (y - a.y) / (b.y - a.y))) : 1;
    return (lo - 1 + k) * lutStep;
  }
  function totalLength() { return (lut.length - 1) * lutStep; }

  function build() {
    var W = html.clientWidth;
    var H = document.body.getBoundingClientRect().height;
    var sy = window.scrollY;
    var rem = parseFloat(getComputedStyle(html).fontSize) || 16;
    var probe = document.querySelector('main .container');
    var gutter = probe ? parseFloat(getComputedStyle(probe).paddingLeft) : 2 * rem;
    // a metà fra il bordo dello schermo e il testo (riferimento: il contenitore largo, 68rem)
    var xL = Math.round(Math.max(0, (W - Math.min(W, 68 * rem)) / 2) + gutter / 2);
    var xR = W - xL;
    var small = W < 768;

    var hero = document.getElementById('hero').getBoundingClientRect();
    var prev = { x: W / 2, y: hero.bottom + sy - (small ? 3.4 : 4) * rem };
    var d = 'M' + prev.x + ' ' + prev.y;
    stops = [];

    sections.forEach(function (sec) {
      if (!sec.isConnected) return; // sezioni tolte da main.js (es. regalo senza chiave)
      var box = sec.querySelector('.container').getBoundingClientRect();
      if (!box.height) return;
      var x = stops.length % 2 ? xR : xL;
      var top = box.top + sy;
      var bottom = box.bottom + sy;
      d += curve(prev, { x: x, y: top }) + ' L' + x + ' ' + bottom;
      var eb = sec.querySelector('.eyebrow');
      var ey = eb ? pageTop(eb) + eb.offsetHeight / 2 : top;
      stops.push({ x: x, y: Math.max(ey, top + 6) });
      prev = { x: x, y: bottom };
    });

    var mono = monogram.getBoundingClientRect();
    var end = { x: W / 2, y: mono.top + sy - (small ? 1.6 : 2) * rem };
    d += curve(prev, end);

    root.setAttribute('width', W);
    root.setAttribute('height', H);
    root.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    base.setAttribute('d', d);
    done.setAttribute('d', d);
    clipRect.setAttribute('width', W);

    // passo uniforme (circa 3 px) fino alla fine esatta del percorso
    var total = base.getTotalLength();
    var count = Math.max(1, Math.ceil(total / 3));
    lutStep = total / count;
    lut = [];
    for (var c = 0; c <= count; c++) {
      var p = base.getPointAtLength(c * lutStep);
      lut.push({ x: p.x, y: p.y });
    }

    stopsLayer.replaceChildren();
    stops.forEach(function (s) {
      s.node = svg('circle', { class: 'route__stop', cx: s.x, cy: s.y, r: small ? 4 : 5 }, stopsLayer);
    });

    medal.setAttribute('r', small ? 10.5 : 18);
    planeIcon.setAttribute('transform', (small ? 'scale(.64) ' : '') + 'translate(-12 -12)');

    // dopo un ricalcolo il vecchio percorso non vale più: l'aereo si rimette subito al suo posto
    cur = null;
    onScroll();
  }

  // lunghezza del percorso dove deve stare l'aereo con lo scorrimento attuale
  function scrollTarget() {
    var vh = window.innerHeight;
    var sy = window.scrollY;
    var endY = lut[lut.length - 1].y;
    if (reduce) return totalLength(); // percorso già tutto disegnato, aereo nascosto
    // l'aereo sta a metà schermo; nell'ultima schermata scivola verso il punto d'arrivo
    var max = Math.max(1, html.scrollHeight - vh);
    var fEnd = Math.min(.95, Math.max(.2, (endY - max) / vh));
    var t = Math.min(1, Math.max(0, (sy - (max - vh)) / vh));
    t = t * t * (3 - 2 * t);
    return lengthAtY(sy + vh * (.5 + (fEnd - .5) * t));
  }

  function draw() {
    var p = pointAt(cur.l);
    plane.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ')');
    heading.setAttribute('transform', 'rotate(' + cur.a.toFixed(2) + ')');
    plane.style.display = reduce ? 'none' : '';
    clipRect.setAttribute('height', Math.max(0, p.y).toFixed(1));
    stops.forEach(function (s) { s.node.classList.toggle('is-reached', s.y <= p.y + 1); });
    monogram.classList.toggle('is-arrived', cur.l >= totalLength() - 2);
  }

  function wantedAngle(l) {
    // direzione presa su un tratto di 36 px: nelle curve l'aereo gira prima e con più dolcezza
    return angleOf(pointAt(l - 18), pointAt(l + 18));
  }

  // movimento smorzato: a ogni fotogramma l'aereo copre una parte della distanza che manca,
  // in proporzione al tempo trascorso (uguale a 60 o 120 Hz)
  var running = false, lastT = 0;
  function frame(now) {
    var dt = Math.min(.05, (now - lastT) / 1000 || .016);
    lastT = now;
    var kPos = 1 - Math.exp(-dt * 5.5);
    var kRot = 1 - Math.exp(-dt * 8);
    cur.l += (target - cur.l) * kPos;
    if (Math.abs(target - cur.l) < .2) cur.l = target;
    var want = wantedAngle(cur.l);
    cur.a = turn(cur.a, want, kRot);
    draw();
    var still = cur.l === target && Math.abs(turn(cur.a, want, 1) - cur.a) < .1;
    if (still) { running = false; return; }
    requestAnimationFrame(frame);
  }

  function onScroll() {
    if (!lut.length) return;
    target = scrollTarget();
    if (!cur || reduce) {
      cur = { l: target, a: wantedAngle(target) };
      draw();
      return;
    }
    if (!running) {
      running = true;
      lastT = performance.now();
      requestAnimationFrame(frame);
    }
  }

  var pending = false;
  function rebuild() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; build(); });
  }

  build();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
  // l'altezza cambia quando main.js toglie una sezione o arrivano le foto
  if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(document.body);

  /* --- 3. Mappa d'apertura --------------------------------------------- */
  var cover = document.getElementById('mapcover');
  if (!cover || !topoReady) {
    if (cover) cover.remove();
    // senza mappa le curve servono solo al piè di pagina: si disegnano quando il browser è libero
    (window.requestIdleCallback || function (fn) { setTimeout(fn, 600); })(function () { topography(applyTopography); });
    return;
  }
  var ready = false;
  function showMap() {
    if (ready) return;
    ready = true;
    cover.classList.add('is-ready');
  }
  topoReady.then(showMap);
  setTimeout(showMap, 2500); // se il disegno non riesce, la mappa compare comunque
  // la mappa si chiude sempre sulla copertina, anche ricaricando a metà pagina
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  var names = cover.querySelector('[data-cover="names"]');
  names.append(C.coppia.nome1);
  var amp = document.createElement('span');
  amp.className = 'amp';
  amp.textContent = 'e';
  names.append(amp, C.coppia.nome2);
  cover.querySelector('[data-cover="date"]').textContent = C.data.split('-').reverse().join(' · ');
  var place = (C.luoghi[0] && C.luoghi[0].indirizzo) || '';
  cover.querySelector('[data-cover="town"]').textContent = place.split(',').pop().replace(/\(.*?\)/g, '').trim();

  var map = cover.querySelector('.map');
  var btn = cover.querySelector('.mapcover__btn');
  var routeSvg = cover.querySelector('.map__route');
  var path = document.getElementById('map-path');
  var maskPath = document.getElementById('map-mask-path');
  var mapPlane = document.getElementById('map-plane');
  var mapPlaneRot = mapPlane.firstElementChild;
  var len = path.getTotalLength();
  var state = 'closed';
  var raf = 0;
  var timers = [];

  maskPath.style.strokeDasharray = len;
  maskPath.style.strokeDashoffset = len;

  // tappe sulla mappa: tante quante le sezioni con un numero
  var mapStops = [];
  var count = document.querySelectorAll('[data-stop]').length || 6;
  for (var s = 1; s <= count; s++) {
    var at = len * s / (count + 1);
    var pt = path.getPointAtLength(at);
    mapStops.push({ at: at, node: svg('circle', { class: 'mr-stop', cx: pt.x, cy: pt.y, r: 4.5 }, document.getElementById('map-stops')) });
  }

  function mapAngle(l) {
    return angleOf(path.getPointAtLength(Math.max(0, l - 10)), path.getPointAtLength(Math.min(len, l + 10)));
  }
  var mapAng = mapAngle(0);
  function placeMapPlane(l, kRot) {
    var p = path.getPointAtLength(l);
    mapAng = turn(mapAng, mapAngle(l), kRot);
    mapPlane.setAttribute('transform', 'translate(' + p.x.toFixed(2) + ' ' + p.y.toFixed(2) + ')');
    mapPlaneRot.setAttribute('transform', 'rotate(' + mapAng.toFixed(2) + ')');
  }
  placeMapPlane(0, 1);

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function fly() {
    if (state !== 'opening') return;
    state = 'flying';
    var t0 = performance.now(), prevT = t0;
    var DUR = 3200;
    (function frameMap(now) {
      var t = Math.min(1, (now - t0) / DUR);
      var dt = Math.min(.05, (now - prevT) / 1000 || .016);
      prevT = now;
      var e = -(Math.cos(Math.PI * t) - 1) / 2; // partenza e arrivo dolci (sinusoide)
      var l = len * e;
      maskPath.style.strokeDashoffset = (len - l).toFixed(2);
      placeMapPlane(l, 1 - Math.exp(-dt * 10));
      mapStops.forEach(function (st) { st.node.classList.toggle('is-reached', st.at <= l); });
      if (t < 1) { raf = requestAnimationFrame(frameMap); return; }
      cover.classList.add('is-landed');
      later(leave, 1100);
    })(t0);
  }

  function leave() {
    if (state === 'leaving') return;
    var fromOpen = state === 'flying';
    state = 'leaving';
    cancelAnimationFrame(raf);
    timers.forEach(clearTimeout);
    // lo zoom va verso la destinazione (se la mappa è già aperta)
    if (fromOpen) {
      var m = routeSvg.getScreenCTM();
      var r = map.getBoundingClientRect();
      if (m) {
        var pin = routeSvg.createSVGPoint();
        pin.x = 430; pin.y = 190;
        pin = pin.matrixTransform(m);
        map.style.transformOrigin = (pin.x - r.left).toFixed(0) + 'px ' + (pin.y - r.top).toFixed(0) + 'px';
      }
    }
    cover.classList.add('is-leaving');
    html.classList.remove('map-pending');
    try { sessionStorage.setItem('topografica-mappa', '1'); } catch (e) { /* navigazione privata: pazienza */ }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); // lo scroll-behavior smooth del sito qui non serve
    rebuild();
    setTimeout(function () { cover.remove(); }, 1500);
  }

  btn.addEventListener('click', function () {
    if (!ready) return; // la mappa non è ancora comparsa
    if (state === 'closed') {
      state = 'opening';
      cover.classList.add('is-open');
      btn.setAttribute('aria-label', 'Entra nell\'invito');
      later(fly, 1500);
    } else {
      leave(); // un secondo tocco salta l'animazione
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && cover.isConnected) leave();
  });
})();
