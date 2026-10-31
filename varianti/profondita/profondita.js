/* ==========================================================================
   Variante "profondità". Va caricato dopo main.js.
   Aggiunge lo strato con le cime dei pini (assets/img/lago-*-pini-*.webp)
   e passa al CSS quanto è stata scorsa ogni scena (--p da 0 a 1).
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  if (!C) return;
  var cov = C.copertina;

  function srcset(foto, suffix) {
    return foto.larghezze.map(function (w) { return foto.src + suffix + '-' + w + '.webp ' + w + 'w'; }).join(', ');
  }

  // Strato davanti ai nomi: stesse foto, solo le cime dei pini (trasparente altrove)
  var front = document.querySelector('[data-depth-front]');
  if (front) {
    var pic = document.createElement('picture');
    var wide = document.createElement('source');
    wide.media = '(min-width: 48rem) and (orientation: landscape)';
    wide.srcset = srcset(cov.fotoOrizzontale, '-pini');
    wide.sizes = '100vw';
    var img = document.createElement('img');
    img.srcset = srcset(cov.fotoVerticale, '-pini');
    img.sizes = '100vw';
    img.src = cov.fotoVerticale.src + '-pini-' + cov.fotoVerticale.larghezze[0] + '.webp';
    img.alt = '';
    img.decoding = 'async';
    pic.append(wide, img);
    front.append(pic);
  }

  // Nomi su tre righe (Luisa / e / Riccardo), allineati per incrociare i due pini
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
