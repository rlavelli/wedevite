/* ==========================================================================
   Variante "pin + scrub". Per ogni scena calcola quanto è stata scorsa
   (--p da 0 a 1) e lo passa al CSS. Va caricato dopo main.js.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Biglietto iniziale: stessi nomi e data della copertina, già formattati da main.js
  var cardNames = document.querySelector('[data-scrub="names"]');
  if (cardNames && C) cardNames.textContent = C.coppia.nome1 + ' e ' + C.coppia.nome2;
  var cardDate = document.querySelector('[data-scrub="date"]');
  var heroDate = document.querySelector('[data-slot="hero-date"]');
  if (cardDate && heroDate) cardDate.textContent = heroDate.textContent;

  if (reduce.matches) return;
  document.documentElement.classList.add('scrub-on');

  // Il programma: un tratto di scorrimento per ogni tappa; le tappe non usano la comparsa normale.
  var day = document.querySelector('.day');
  var steps = day ? Array.prototype.slice.call(day.querySelectorAll('.timeline__item')) : [];
  steps.forEach(function (s) { s.removeAttribute('data-reveal'); });
  function sizeDay() {
    if (day) day.style.height = 'calc(100svh + ' + Math.max(steps.length, 1) * 45 + 'svh)';
  }
  sizeDay();

  var scenes = Array.prototype.slice.call(document.querySelectorAll('[data-scene]'));

  function progress(scene) {
    var r = scene.getBoundingClientRect();
    var run = r.height - window.innerHeight;
    if (run <= 0) return 1;
    return Math.min(1, Math.max(0, -r.top / run));
  }

  var ticking = false;
  function update() {
    ticking = false;
    scenes.forEach(function (scene) {
      var p = progress(scene);
      scene.style.setProperty('--p', p.toFixed(4));
      if (scene === day) {
        steps.forEach(function (s, i) {
          s.classList.toggle('is-active', p >= i / steps.length);
        });
      }
    });
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { sizeDay(); onScroll(); });
  update();
})();
