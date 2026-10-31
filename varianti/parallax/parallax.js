/* ==========================================================================
   Variante "parallax a strati". Va caricato dopo main.js.
   data-speed: copertina, si sposta di (scorrimento × speed)
               (positivo = più lento della pagina, sembra lontano)
   data-depth: resto della pagina, si sposta in base a quanto dista dal centro
               dello schermo (positivo = lontano, negativo = vicino)
   ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING;
  if (!C) return;

  function picture(foto, alt, sizes) {
    var srcset = function (ext) {
      return foto.larghezze.map(function (w) { return foto.src + '-' + w + '.' + ext + ' ' + w + 'w'; }).join(', ');
    };
    var pic = document.createElement('picture');
    var source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = srcset('webp');
    source.sizes = sizes;
    var img = document.createElement('img');
    img.src = foto.src + '-' + foto.larghezze[0] + '.jpg';
    img.srcset = srcset('jpg');
    img.sizes = sizes;
    img.alt = alt || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    pic.append(source, img);
    return pic;
  }

  // Banda fotografica e livello del conto alla rovescia: foto prese da config.js
  var cov = C.copertina;
  var wide = document.querySelector('.moments__wide');
  var tall = document.querySelector('.moments__tall');
  if (wide) wide.append(picture(cov.fotoOrizzontale, cov.alt, '(min-width: 48rem) 45rem, 80vw'));
  if (tall) tall.append(picture(cov.fotoVerticale, '', '(min-width: 48rem) 22rem, 46vw'));
  var names = document.querySelector('.moments__names');
  if (names) names.textContent = C.coppia.nome1 + ' & ' + C.coppia.nome2;
  var caption = document.querySelector('.moments__caption');
  var heroDate = document.querySelector('[data-slot="hero-date"]');
  if (caption && heroDate) caption.textContent = heroDate.textContent;
  var layer = document.querySelector('.px-layer');
  if (layer) layer.append(picture(cov.fotoOrizzontale, '', '100vw'));

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('px-on');

  // Le foto dentro le cornici scorrono all'interno del loro riquadro
  // (ingrandite un po', così spostandosi non scoprono i bordi)
  document.querySelectorAll('.intro__photo img, .moments__wide img, .moments__tall img').forEach(function (n) {
    n.setAttribute('data-depth', '0.12');
    n.setAttribute('data-scale', '1.18');
  });
  if (layer) layer.setAttribute('data-depth', '0.25');
  var frame = document.querySelector('.intro__photo');

  var speedEls = Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
  var depthEls = Array.prototype.slice.call(document.querySelectorAll('[data-depth]'));
  var heroContent = document.querySelector('.hero__content');

  var ticking = false;
  function update() {
    ticking = false;
    var y = window.scrollY;
    var vh = window.innerHeight;

    if (y < vh * 1.3) {
      speedEls.forEach(function (el) {
        el.style.transform = 'translate3d(0,' + (y * parseFloat(el.dataset.speed)).toFixed(1) + 'px,0)';
      });
      if (heroContent) heroContent.style.opacity = Math.max(0, 1 - y / (vh * 0.65)).toFixed(3);
    }

    depthEls.forEach(function (el) {
      // si misura il contenitore, che non si muove: così il calcolo non insegue sé stesso
      var box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -vh * 0.5 || box.top > vh * 1.5) return;
      var offset = (box.top + box.height / 2 - vh / 2) * parseFloat(el.dataset.depth);
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)' + (el.dataset.scale ? ' scale(' + el.dataset.scale + ')' : '');
    });

    if (frame) {
      var r = frame.getBoundingClientRect();
      frame.style.setProperty('--frame-y', ((r.top + r.height / 2 - vh / 2) * -0.06).toFixed(1) + 'px');
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
