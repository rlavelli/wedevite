/* ==========================================================================
   Bussola: i due timbri scelti (proposte 1 e 6 di varianti/bussola/).
   Riempie gli elementi con data-bussola="timbro" (nomi per intero) o
   data-bussola="sigillo" (iniziali), con nomi e data da config.js.
   Colore: quello del testo (currentColor); --paper è il colore del fondo,
   usato per le parti "vuote" delle punte.
   ========================================================================== */
(function () {
  'use strict';
  var C = window.WEDDING;
  if (!C) return;
  var N1 = C.coppia.nome1, N2 = C.coppia.nome2;
  var d = C.data.split('-');
  var DATE = d[2] + ' · ' + d[1] + ' · ' + d[0];
  var uid = 0;

  function r2(n) { return Math.round(n * 100) / 100; }
  // angoli in gradi, in senso orario dal nord
  function pol(r, a) { a = (a - 90) * Math.PI / 180; return r2(r * Math.cos(a)) + ' ' + r2(r * Math.sin(a)); }

  // una punta = due metà: 'ink' piena, 'hatch' tratteggiata, 'paper' vuota
  function half(path, kind, id) {
    if (kind === 'ink') return '<path d="' + path + '" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>';
    var s = '<path d="' + path + '" style="fill:var(--paper)" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>';
    if (kind === 'hatch') s += '<path d="' + path + '" fill="url(#bs-h' + id + ')"/>';
    return s;
  }
  function point(a, L, w, kinds, id) {
    var l = 'M0 0L' + (-w) + ' ' + (-w) + 'L0 ' + (-L) + 'Z', r = 'M0 0L' + w + ' ' + (-w) + 'L0 ' + (-L) + 'Z';
    return '<g transform="rotate(' + a + ')">' + half(l, kinds[0], id) + half(r, kinds[1], id) + '</g>';
  }
  function rose(o, id) {
    var s = '', a;
    o.rings.forEach(function (r) { s += '<circle r="' + r + '" class="bs-ln"/>'; });
    s += '<circle r="' + o.ticks + '" class="bs-tk"/>';
    if (o.axes) s += '<path class="bs-ln bs-thin" d="M0 ' + (-o.axes) + 'V' + o.axes + 'M' + (-o.axes) + ' 0H' + o.axes + '"/>';
    if (o.dots) for (a = 22.5; a < 360; a += 45) s += '<circle r="1.8" fill="currentColor" transform="translate(' + pol(o.dots, a).replace(' ', ',') + ')"/>';
    for (a = 22.5; a < 360; a += 45) s += point(a, o.Li, o.wi, ['paper', 'paper'], id);
    for (a = 45; a < 360; a += 90) s += point(a, o.Ld, o.wd, ['hatch', 'paper'], id);
    for (a = 0; a < 360; a += 90) s += point(a, o.L, o.w, ['ink', 'hatch'], id);
    return s + '<circle r="4.5" style="fill:var(--paper)" class="bs-ln"/><circle r="1.7" fill="currentColor"/>';
  }
  function arrow(a, r) {
    return '<path transform="rotate(' + a + ')" d="M0 ' + (-r) + 'L-7 ' + (17 - r) + 'L0 ' + (13 - r) + 'L7 ' + (17 - r) + 'Z" style="fill:var(--paper)" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>';
  }
  function fletch(a, r) {
    var b = r - 18;
    return '<path transform="rotate(' + a + ')" class="bs-ln" d="M0 ' + (-b) + 'L-7 ' + (-b - 8) + 'M0 ' + (-b) + 'L7 ' + (-b - 8) +
      'M0 ' + (-b - 8) + 'L-7 ' + (-b - 16) + 'M0 ' + (-b - 8) + 'L7 ' + (-b - 16) + '"/>';
  }
  function text(x, y, cls, t, style) {
    return '<text class="' + cls + '" x="' + x + '" y="' + y + '" text-anchor="middle"' + (style ? ' style="' + style + '"' : '') + '>' + t + '</text>';
  }
  // testo su arco: sweep 1 = orario (lettere verso l'esterno), 0 = antiorario (verso il centro)
  function arc(id, r, a0, a1, sweep, cls, t) {
    var pid = 'bs-a' + id + '-' + (uid++);
    return '<path id="' + pid + '" fill="none" d="M' + pol(r, a0) + 'A' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + pol(r, a1) + '"/>' +
      '<text class="' + cls + '"><textPath href="#' + pid + '" startOffset="50%" text-anchor="middle">' + t + '</textPath></text>';
  }

  var DRAW = {
    // 1 · Timbro: punte lunghe fino al bordo puntinato, nomi in basso a sinistra, data in alto a destra
    timbro: function (id) {
      return '<circle r="190" class="bs-dots"/>' +
        rose({ rings: [92, 50], ticks: 88, axes: 182, dots: 118, L: 150, w: 16, Ld: 100, wd: 11, Li: 62, wi: 6 }, id) +
        arrow(0, 190) + arrow(90, 190) + fletch(270, 190) +
        '<text class="bs-card" x="14" y="-168">N</text>' + text(174, 22, 'bs-card', 'E') + text(-176, -10, 'bs-card', 'O') +
        arc(id, 170, 300, 150, 0, 'bs-script', N1 + ' e ' + N2) + arc(id, 156, -28, 118, 1, 'bs-date', DATE);
    },
    // 6 · Sigillo: rosa piccola, iniziali e data sotto
    sigillo: function (id) {
      return '<g transform="translate(0 -58)">' +
        rose({ rings: [56], ticks: 52, L: 108, w: 13, Ld: 70, wd: 9, Li: 44, wi: 4.5 }, id) + arrow(0, 122) + '</g>' +
        '<path class="bs-ln bs-thin" d="M-158 110H-98M98 110H158"/>' +
        text(0, 125, 'bs-script', N1.charAt(0) + ' <tspan class="bs-amp" dx="7">&amp;</tspan> ' + N2.charAt(0), 'font-size:58px') +
        text(0, 176, 'bs-date', DATE, 'font-size:19px');
    },
    // solo la rosa del sigillo, senza scritte (centro in 0,0, raggio circa 125)
    rosa: function (id) {
      return rose({ rings: [56], ticks: 52, L: 108, w: 13, Ld: 70, wd: 9, Li: 44, wi: 4.5 }, id) + arrow(0, 122);
    }
  };
  var VIEW = { timbro: '-200 -200 400 400', sigillo: '-200 -200 400 400', rosa: '-126 -126 252 252' };

  document.querySelectorAll('[data-bussola]').forEach(function (box) {
    var kind = box.getAttribute('data-bussola'), id = ++uid;
    if (!DRAW[kind]) return;
    var defs = '<defs><pattern id="bs-h' + id + '" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)">' +
      '<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width=".9"/></pattern></defs>';
    // dentro un disegno SVG (es. la mappa): il gruppo ospite decide posizione e scala
    if (box instanceof SVGElement) { box.innerHTML = defs + DRAW[kind](id); return; }
    box.innerHTML = '<svg class="bussola" viewBox="' + VIEW[kind] + '" aria-hidden="true" focusable="false">' + defs + DRAW[kind](id) + '</svg>';
  });
})();
