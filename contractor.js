(() => {
  'use strict';
  document.querySelectorAll('.dc-links > a').forEach(link => {
    if (new URL(link.href).pathname === window.location.pathname) link.setAttribute('aria-current', 'page');
  });
  // Collection stays off until a verified submission service is integrated.
  const form = document.getElementById('contractorApplication');
  if (form) form.addEventListener('submit', event => {
    event.preventDefault();
    document.getElementById('application-status').focus();
  });
})();

// Count once on entry; retain the final accessible figure and reduced-motion view.
(() => {
  const figures = [...document.querySelectorAll('[data-proof-count]')];
  if (!figures.length || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      const el = entry.target;
      const node = el.firstChild;
      const target = Number(el.dataset.proofCount);
      const prefix = el.dataset.proofPrefix || '';
      const suffix = () => el.dataset.proofSuffix === '-Step' && document.documentElement.lang === 'es' ? ' pasos' : el.dataset.proofSuffix || '';
      const start = performance.now();
      el.setAttribute('aria-label', el.textContent);
      const frame = now => {
        const progress = Math.min(1, Math.max(0, (now - start) / 1000));
        node.nodeValue = prefix + Math.round(target * (1 - Math.pow(1 - progress, 3))) + suffix();
        if (progress < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  }, { threshold: .5 });
  figures.forEach(el => observer.observe(el));
})();

// Quiet, one-time entrances; honor reduced motion and leave content visible on failure.
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.dc-section > .dc-wrap, .dc-summary');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('dc-entered');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });
  targets.forEach(target => {
    target.classList.add('dc-enter');
    observer.observe(target);
  });
  document.body.classList.add('dc-motion-ready');
})();
