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
