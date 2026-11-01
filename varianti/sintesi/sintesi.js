/* ==========================================================================
   Variante "sintesi". Va caricato dopo main.js e profondita.js (che fa tutto l'effetto della C).
   - Toccando una delle quattro foto, sotto compaiono i suoi dettagli (schede accessibili).
   - Se foto e dettagli non stanno in uno schermo, la sezione non si ferma (classe .info-free).
   ========================================================================== */
(function () {
  'use strict';

  var tabs = function () { return Array.prototype.slice.call(document.querySelectorAll('.letters--info [role="tab"]')); };

  function select(tab) {
    tabs().forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.classList.toggle('is-active', on);
    });
  }

  var row = document.querySelector('.letters--info [role="tablist"]');
  if (!row) return;
  row.addEventListener('click', function (e) {
    var tab = e.target.closest('[role="tab"]');
    if (tab) select(tab);
  });
  // frecce sinistra/destra tra le foto, come in ogni gruppo di schede
  row.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var list = tabs();
    var i = list.indexOf(document.activeElement);
    if (i < 0) return;
    var next = list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
    select(next);
    next.focus();
    e.preventDefault();
  });
  select(tabs()[0]);

  // Tutto in uno schermo? Altezza dei contenuti senza trasformazioni, più lo sfalsamento delle foto
  var root = document.documentElement;
  var stage = document.querySelector('.letters--info .letters__stage');
  function choose() {
    var need = Array.prototype.reduce.call(stage.children, function (h, child) {
      return h + child.offsetHeight + parseFloat(getComputedStyle(child).marginTop);
    }, 40 + 48);
    var free = need > window.innerHeight;
    if (free === root.classList.contains('info-free')) return;
    root.classList.toggle('info-free', free);
    window.dispatchEvent(new Event('scroll'));   // profondita.js ricalcola --p
  }
  window.addEventListener('resize', choose);
  window.addEventListener('load', choose);         // i font possono cambiare le altezze
  choose();
})();
