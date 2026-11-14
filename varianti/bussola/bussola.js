/* Proposte per il timbro con la bussola: ogni proposta è un SVG costruito qui,
   con i nomi e la data presi da config.js. Angoli in gradi, in senso orario dal nord. */
(function () {
  'use strict';
  var C = window.WEDDING;
  var N1 = C.coppia.nome1, N2 = C.coppia.nome2, I1 = N1.charAt(0), I2 = N2.charAt(0);
  var d = C.data.split('-');
  var DATE = d[2] + ' · ' + d[1] + ' · ' + d[0];
  var uid = 0;

  function r2(n) { return Math.round(n * 100) / 100; }
  function pol(r, a) { a = (a - 90) * Math.PI / 180; return r2(r * Math.cos(a)) + ' ' + r2(r * Math.sin(a)); }

  /* --- Rosa dei venti ---------------------------------------------------- */
  // una punta = due metà (sinistra/destra), ognuna 'ink' (piena), 'hatch' (tratteggiata) o 'paper' (vuota)
  function half(path, kind, id) {
    var s = '<path d="' + path + '" style="fill:var(--paper)" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>';
    if (kind === 'ink') return '<path d="' + path + '" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>';
    if (kind === 'hatch') s += '<path d="' + path + '" fill="url(#h' + id + ')"/>';
    return s;
  }
  function point(a, L, w, kinds, id) {
    var l = 'M0 0L' + (-w) + ' ' + (-w) + 'L0 ' + (-L) + 'Z', r = 'M0 0L' + w + ' ' + (-w) + 'L0 ' + (-L) + 'Z';
    return '<g transform="rotate(' + a + ')">' + half(l, kinds[0], id) + half(r, kinds[1], id) + '</g>';
  }
  function rose(o, id) {
    var s = '', a;
    (o.rings || []).forEach(function (r) { s += '<circle r="' + r + '" class="ln"/>'; });
    if (o.ticks) s += '<circle r="' + o.ticks + '" class="tk"/>';
    if (o.axes) s += '<path class="ln thin" d="M0 ' + (-o.axes) + 'V' + o.axes + 'M' + (-o.axes) + ' 0H' + o.axes + '"/>';
    if (o.dots) for (a = 22.5; a < 360; a += 45) s += '<circle r="1.8" fill="currentColor" transform="translate(' + pol(o.dots, a).replace(' ', ',') + ')"/>';
    if (o.Li) for (a = 22.5; a < 360; a += 45) s += point(a, o.Li, o.wi, ['paper', 'paper'], id);
    if (o.Ld) for (a = 45; a < 360; a += 90) s += point(a, o.Ld, o.wd, ['hatch', 'paper'], id);
    for (a = 0; a < 360; a += 90) s += point(a, o.L, o.w, ['ink', 'hatch'], id);
    s += '<circle r="4.5" style="fill:var(--paper)" class="ln"/><circle r="1.7" fill="currentColor"/>';
    return s;
  }

  /* --- Dettagli ------------------------------------------------------------ */
  function arrow(a, r) { // punta di freccia vuota sull'asse
    return '<path transform="rotate(' + a + ')" d="M0 ' + (-r) + 'L-7 ' + (17 - r) + 'L0 ' + (13 - r) + 'L7 ' + (17 - r) + 'Z" style="fill:var(--paper)" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/>';
  }
  function fletch(a, r) { // impennaggio della freccia
    var b = r - 18;
    return '<path transform="rotate(' + a + ')" class="ln" d="M0 ' + (-b) + 'L-7 ' + (-b - 8) + 'M0 ' + (-b) + 'L7 ' + (-b - 8) +
      'M0 ' + (-b - 8) + 'L-7 ' + (-b - 16) + 'M0 ' + (-b - 8) + 'L7 ' + (-b - 16) + '"/>';
  }
  function star(a, r, s) { // piccolo rombo a quattro punte come separatore
    return '<path transform="translate(' + pol(r, a).replace(' ', ',') + ') scale(' + s + ')" fill="currentColor" d="M0-6L1.4-1.4 6 0 1.4 1.4 0 6-1.4 1.4-6 0-1.4-1.4z"/>';
  }
  function text(x, y, cls, t, anchor) {
    return '<text class="' + cls + '" x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '">' + t + '</text>';
  }
  // testo su un arco: sweep 1 = orario (lettere verso l'esterno), 0 = antiorario (lettere verso il centro)
  function arc(id, r, a0, a1, sweep, cls, t) {
    var pid = 'a' + id + '-' + (uid++);
    var large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    return '<path id="' + pid + '" fill="none" d="M' + pol(r, a0) + 'A' + r + ' ' + r + ' 0 ' + large + ' ' + sweep + ' ' + pol(r, a1) + '"/>' +
      '<text class="' + cls + '"><textPath href="#' + pid + '" startOffset="50%" text-anchor="middle">' + t + '</textPath></text>';
  }

  /* --- Proposte -------------------------------------------------------------- */
  var CLASSIC = { rings: [92, 50], ticks: 88, axes: 182, dots: 118, L: 150, w: 16, Ld: 100, wd: 11, Li: 62, wi: 6 };
  function classicFrame(id) {
    return '<circle r="190" class="dots"/>' + rose(CLASSIC, id) +
      arrow(0, 190) + arrow(90, 190) + fletch(270, 190) +
      text(14, -168, 't-card', 'N', 'start') + text(174, 22, 't-card', 'E') + text(-176, -10, 't-card', 'O');
  }

  var DESIGNS = [
    { group: 'nomi', title: '1 · Timbro',
      note: 'Come il riferimento: nomi in corsivo lungo l\'arco in basso a sinistra, data in alto a destra.',
      draw: function (id) {
        return classicFrame(id) + arc(id, 170, 300, 150, 0, 't-script', N1 + ' &amp; ' + N2) + arc(id, 156, -28, 118, 1, 't-date', DATE);
      } },
    { group: 'nomi', title: '2 · Timbro in maiuscolo',
      note: 'Stessa composizione, nomi in maiuscoletto Cormorant: più vicino al timbro della foto.',
      draw: function (id) {
        return classicFrame(id) + arc(id, 172, 302, 148, 0, 't-caps', N1 + ' &amp; ' + N2) + arc(id, 156, -28, 118, 1, 't-date', DATE);
      } },
    { group: 'nomi', title: '3 · Anello',
      note: 'Rosa dentro un anello: nomi in basso, data in alto, due stelline ai lati. Più ordinato e simmetrico.',
      draw: function (id) {
        return '<circle r="190" class="dots"/><circle r="182" class="ln thin"/><circle r="140" class="ln"/>' +
          rose({ rings: [78], ticks: 74, dots: 104, L: 128, w: 14, Ld: 86, wd: 10, Li: 52, wi: 5 }, id) +
          arc(id, 172, 268, 92, 0, 't-script', N1 + ' &amp; ' + N2) + arc(id, 152, 272, 88, 1, 't-date', DATE) +
          star(270, 161, 1) + star(90, 161, 1);
      } },
    { group: 'iniziali', title: '4 · Medaglione',
      note: 'Le punte lunghe arrivano al bordo; al centro un medaglione con le iniziali.',
      draw: function (id) {
        return '<circle r="190" class="dots"/><circle r="181" class="ln thin"/>' +
          rose({ rings: [124], ticks: 120, L: 176, w: 21, Ld: 124, wd: 14, Li: 84, wi: 7 }, id) +
          '<circle r="64" style="fill:var(--paper)" class="ln"/><circle r="58" class="ln thin"/>' +
          text(0, 13, 't-script" style="font-size:40px', I1 + '&amp;' + I2);
      } },
    { group: 'iniziali', title: '5 · Punti cardinali',
      note: 'Il nord resta, ma a ovest e a est ci sono L e R. Data piccola al posto del sud.',
      draw: function (id) {
        return '<circle r="190" class="dots"/>' +
          rose({ rings: [88, 50], ticks: 84, dots: 112, L: 128, w: 15, Ld: 88, wd: 10, Li: 56, wi: 5.5 }, id) +
          text(0, -146, 't-card" style="font-size:17px', 'N') +
          text(-160, 14, 't-script" style="font-size:44px', I1) + text(160, 14, 't-script" style="font-size:44px', I2) +
          text(0, 160, 't-date" style="font-size:12px', DATE);
      } },
    { group: 'iniziali', title: '6 · Sigillo',
      note: 'Solo la rosa, piccola, con le iniziali e la data sotto: per piè di pagina, segnaposto, etichette.',
      draw: function (id) {
        return '<g transform="translate(0 -58)">' +
          rose({ rings: [56], ticks: 52, L: 108, w: 13, Ld: 70, wd: 9, Li: 44, wi: 4.5 }, id) +
          arrow(0, 122) + '</g>' +
          '<path class="ln thin" d="M-158 110H-98M98 110H158"/>' +
          text(0, 125, 't-script" style="font-size:58px', I1 + ' &amp; ' + I2) +
          text(0, 172, 't-date" style="font-size:13px', DATE);
      } }
  ];

  DESIGNS.forEach(function (dsg, i) {
    var id = i + 1;
    var fig = document.createElement('figure');
    fig.className = 'stamp';
    fig.innerHTML =
      '<svg viewBox="-200 -200 400 400" role="img" aria-label="' + dsg.title + '">' +
        '<defs><pattern id="h' + id + '" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)">' +
        '<line x1="0" y1="0" x2="0" y2="3" stroke="currentColor" stroke-width=".9"/></pattern></defs>' +
        '<g>' + dsg.draw(id) + '</g>' +
      '</svg>' +
      '<figcaption><strong>' + dsg.title + '</strong><span>' + dsg.note + '</span></figcaption>';
    document.querySelector('[data-group="' + dsg.group + '"]').append(fig);
  });

  /* --- Opzioni -------------------------------------------------------------- */
  document.querySelectorAll('.controls button').forEach(function (b) {
    b.addEventListener('click', function () {
      var key = b.dataset.ink ? 'ink' : 'fx';
      document.querySelectorAll('[data-' + key + ']').forEach(function (o) {
        if (o.tagName === 'BUTTON') o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
      });
      document.body.dataset[key] = b.dataset[key];
    });
  });
})();
