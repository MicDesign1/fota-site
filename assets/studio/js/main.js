// Flowers of the Aftermath — v4a (film poster), launched 14 Nov 2026.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) document.documentElement.classList.add('reduce');

  const fit = (el, ratio) => {
    if (!el) return;
    el.style.whiteSpace = 'nowrap';
    const avail = (el.parentElement.clientWidth || window.innerWidth) * ratio;
    // Measure the glyphs, not the block box (a display:block span is always 100% wide).
    el.style.fontSize = '80px';
    el.style.display = 'inline-block';
    el.style.width = 'max-content';
    const w = el.getBoundingClientRect().width || 1;
    el.style.fontSize = (80 * avail / w) + 'px';
    el.style.display = 'block';
    el.style.width = '';
  };
  const fitAll = () => {
    document.querySelectorAll('.hero-mark .fit').forEach(el => fit(el, 1.06));
    const mark = document.querySelector('.hero-mark');
    if (mark && mark.clientHeight && mark.scrollHeight > mark.clientHeight + 2) {
      const s = mark.clientHeight / mark.scrollHeight * 0.98;
      mark.querySelectorAll('.fit, .line-b').forEach(el => {
        el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * s) + 'px';
      });
    }
    document.querySelectorAll('.poster .title, .page-title').forEach(el => fit(el, 1.0));
    const info = document.querySelector('.info-word');
    if (info) fit(info, 1.0);
  };
  const ready = document.fonts ? document.fonts.ready : Promise.resolve();
  ready.then(() => { fitAll(); requestAnimationFrame(fitAll); });
  addEventListener('resize', fitAll);

  const reel = document.getElementById('reel');
  const toggle = document.getElementById('reel-toggle');
  if (reel && toggle) {
    const sync = () => { const p = reel.paused; toggle.textContent = p ? 'Play' : 'Pause'; toggle.setAttribute('aria-pressed', String(p)); };
    toggle.addEventListener('click', () => { reel.paused ? reel.play() : reel.pause(); });
    reel.addEventListener('play', sync); reel.addEventListener('pause', sync);
    if (reduce) { reel.pause(); sync(); }
  }

  // Teaser lightbox: native <dialog> (focus trap, Esc closes); sound only starts from the click.
  document.querySelectorAll('[data-lightbox]').forEach(btn => {
    const box = document.getElementById(btn.dataset.lightbox);
    if (!box || typeof box.showModal !== 'function') return;
    const vid = box.querySelector('video');
    const close = box.querySelector('.lb-close');
    const shut = () => { if (box.open) box.close(); };
    btn.addEventListener('click', () => {
      box.showModal();
      document.documentElement.classList.add('lb-open');
      document.querySelectorAll('.poster .bg-video, #reel').forEach(v => v.pause());
      if (close) close.focus();
      if (vid) { const p = vid.play(); if (p && p.catch) p.catch(() => {}); }
    });
    if (close) close.addEventListener('click', shut);
    box.addEventListener('click', e => { if (e.target === box) shut(); });
    box.addEventListener('close', () => {
      if (vid) vid.pause();
      document.documentElement.classList.remove('lb-open');
      btn.focus();
    });
  });

  if (!reduce) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const v = e.target;
        if (v.id === 'reel') continue;
        if (e.isIntersecting && e.intersectionRatio > 0.4) v.play().catch(() => {});
        else v.pause();
      }
    }, { threshold: [0.4, 0.6] });
    document.querySelectorAll('.poster .bg-video').forEach(v => io.observe(v));
  } else {
    document.querySelectorAll('.poster .bg-video').forEach(v => { v.removeAttribute('autoplay'); v.pause(); });
  }
})();
