/* ==========================================================================
   Variante "profondità". Va caricato dopo main.js.
   Passa al CSS quanto è stata scorsa ogni scena (--p da 0 a 1).
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  if (!C) return;

  // Nomi su tre righe (Luisa / e / Riccardo)
  var names = document.querySelector('.depth__names');
  if (names) {
    names.replaceChildren();
    [['n1', C.coppia.nome1], ['amp', 'e'], ['n2', C.coppia.nome2]].forEach(function (p) {
      var s = document.createElement('span');
      s.className = p[0];
      s.textContent = p[1];
      names.append(s, ' ');
    });
  }

  // Testo sotto le quattro foto: data e luogo, presi da config.js tramite main.js
  var text = document.querySelector('.letters__text');
  var when = document.querySelector('[data-slot="countdown-date"]');
  if (text && when) text.textContent = when.textContent + (C.luoghi[0] ? ' · ' + C.luoghi[0].nome : '');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('depth-on');

  var scenes = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));
  // data-scene="enter": la scena conta da quando entra dal basso, non da quando si blocca
  function progress(scene) {
    var r = scene.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = scene.dataset.scene === 'enter' ? (vh - r.top) / r.height : -r.top / (r.height - vh);
    return r.height <= vh ? 1 : Math.min(1, Math.max(0, p));
  }

  var ticking = false;
  function update() {
    ticking = false;
    scenes.forEach(function (scene) { scene.style.setProperty('--p', progress(scene).toFixed(4)); });
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
