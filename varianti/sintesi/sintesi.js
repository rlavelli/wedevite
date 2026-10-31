/* ==========================================================================
   Variante "sintesi". Va caricato dopo main.js e profondita.js (copertina della C).
   Scrive la riga con data, ora e luogo e sceglie come far salire le schede:
   - se stanno in uno schermo: classe .tiles-pin, la sezione resta ferma come nella C
     (--p lo calcola profondita.js, la sezione ha data-scene="enter");
   - altrimenti --t (0 → 1) su ogni [data-rise] mentre scorre con la pagina.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  if (!C) return;

  var when = document.querySelector('.tiles__when span');
  var date = document.querySelector('[data-slot="countdown-date"]');
  if (when && date) when.textContent = date.textContent + (C.luoghi[0] ? ' · ' + C.luoghi[0].nome : '');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var root = document.documentElement;
  var row = document.querySelector('.tiles__row');
  var line = document.querySelector('.tiles__when');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-rise]'));

  // Le schede stanno in uno schermo? (altezza senza trasformazioni + margini del modo fermo)
  function choose() {
    var need = row.offsetHeight + line.offsetHeight + 32 + 32;
    var pin = need <= window.innerHeight;
    if (pin === root.classList.contains('tiles-pin')) return;
    root.classList.toggle('tiles-pin', pin);
    // nel modo fermo --t lo calcola il CSS: niente valori scritti sugli elementi
    if (pin) items.forEach(function (node) { node.style.removeProperty('--t'); });
    window.dispatchEvent(new Event('scroll'));   // profondita.js ricalcola --p
  }

  // Si misura l'elemento esterno, che non si muove: la scheda dentro è quella spostata dal CSS
  var ticking = false;
  function update() {
    ticking = false;
    if (root.classList.contains('tiles-pin')) return;
    var vh = window.innerHeight;
    items.forEach(function (node) {
      var t = (vh - node.getBoundingClientRect().top) / (vh * 0.6);
      node.style.setProperty('--t', Math.min(1, Math.max(0, t)).toFixed(4));
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { choose(); onScroll(); });
  window.addEventListener('load', choose);   // i font possono cambiare l'altezza delle schede
  choose();
  update();
})();
