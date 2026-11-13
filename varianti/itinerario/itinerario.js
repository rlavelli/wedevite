/* ==========================================================================
   Variante "Itinerario". Va caricato dopo main.js.
   1. Percorso: una linea tratteggiata scende lungo la pagina, alternando il lato
      a ogni sezione e attraversando lo spazio fra una sezione e l'altra.
      L'aereo sta sul percorso all'altezza di metà schermo e lo segue scorrendo;
      alla fine della pagina atterra sul monogramma del piè di pagina.
   2. Mappa d'apertura: si apre al tocco, l'aereo vola alla destinazione,
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

  /* --- 1. Percorso lungo la pagina ------------------------------------- */
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
  var lut = [];     // punti del percorso ogni 4 px: la y cresce sempre, quindi si cerca per y
  var stops = [];

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

    var total = base.getTotalLength();
    lut = [];
    for (var l = 0; l < total; l += 4) {
      var p = base.getPointAtLength(l);
      lut.push({ x: p.x, y: p.y });
    }
    var last = base.getPointAtLength(total);
    lut.push({ x: last.x, y: last.y });

    stopsLayer.replaceChildren();
    stops.forEach(function (s) {
      s.node = svg('circle', { class: 'route__stop', cx: s.x, cy: s.y, r: small ? 4 : 5 }, stopsLayer);
    });

    medal.setAttribute('r', small ? 10.5 : 18);
    planeIcon.setAttribute('transform', (small ? 'scale(.64) ' : '') + 'translate(-12 -12)');
    update();
  }

  function update() {
    ticking = false;
    if (!lut.length) return;
    var vh = window.innerHeight;
    var sy = window.scrollY;
    var endPt = lut[lut.length - 1];

    var y;
    if (reduce) {
      y = endPt.y; // percorso già tutto disegnato, aereo nascosto (vedi sotto)
    } else {
      // l'aereo sta a metà schermo; nell'ultima schermata scivola verso il punto d'arrivo
      var max = Math.max(1, html.scrollHeight - vh);
      var fEnd = Math.min(.95, Math.max(.2, (endPt.y - max) / vh));
      var t = Math.min(1, Math.max(0, (sy - (max - vh)) / vh));
      t = t * t * (3 - 2 * t);
      y = sy + vh * (.5 + (fEnd - .5) * t);
    }

    // primo punto con y >= quella cercata
    var lo = 0, hi = lut.length - 1;
    while (lo < hi) {
      var mid = (lo + hi) >> 1;
      if (lut[mid].y < y) lo = mid + 1; else hi = mid;
    }
    var i = lo;
    var p = lut[i];
    if (i > 0 && y > lut[0].y && y < p.y) { // fra due punti: si interpola
      var a = lut[i - 1];
      var k = (y - a.y) / (p.y - a.y || 1);
      p = { x: a.x + (p.x - a.x) * k, y: y };
    }
    var ang = angleOf(lut[Math.max(0, i - 3)], lut[Math.min(lut.length - 1, i + 3)]);

    plane.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')');
    heading.setAttribute('transform', 'rotate(' + ang.toFixed(1) + ')');
    plane.style.display = reduce ? 'none' : '';
    clipRect.setAttribute('height', Math.max(0, p.y).toFixed(1));
    stops.forEach(function (s) { s.node.classList.toggle('is-reached', s.y <= p.y + 1); });
    monogram.classList.toggle('is-arrived', i >= lut.length - 1 && y >= endPt.y - 2);
  }

  var ticking = false;
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
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

  /* --- 2. Mappa d'apertura --------------------------------------------- */
  var cover = document.getElementById('mapcover');
  if (!cover) return;
  if (!html.classList.contains('map-pending')) { cover.remove(); return; }
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

  function placeMapPlane(l) {
    var pt = path.getPointAtLength(l);
    var a = path.getPointAtLength(Math.max(0, l - 3));
    var b = path.getPointAtLength(Math.min(len, l + 3));
    mapPlane.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')');
    mapPlaneRot.setAttribute('transform', 'rotate(' + angleOf(a, b).toFixed(1) + ')');
  }
  placeMapPlane(0);

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function fly() {
    if (state !== 'opening') return;
    state = 'flying';
    var t0 = performance.now();
    var DUR = 2400;
    (function frame(now) {
      var t = Math.min(1, (now - t0) / DUR);
      var e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      var l = len * e;
      maskPath.style.strokeDashoffset = (len - l).toFixed(1);
      placeMapPlane(l);
      mapStops.forEach(function (st) { st.node.classList.toggle('is-reached', st.at <= l); });
      if (t < 1) { raf = requestAnimationFrame(frame); return; }
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
    try { sessionStorage.setItem('itinerario-mappa', '1'); } catch (e) { /* navigazione privata: pazienza */ }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); // lo scroll-behavior smooth del sito qui non serve
    rebuild();
    setTimeout(function () { cover.remove(); }, 1500);
  }

  btn.addEventListener('click', function () {
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
