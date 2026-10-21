(() => {
  'use strict';
  const config = window.DC_CONFIG || {};
  const root = document.documentElement;
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch { /* Browsing still works. */ } }
  };
  let lang = storage.get('dc-language') === 'es' ? 'es' : 'en';
  const text = (en, es) => lang === 'es' ? es : en;
  const entries = [];
  const attributes = [];
  const dictionary = window.DC_SPANISH || {};
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement.closest('script,style,svg,[data-no-translate]') || !node.textContent.trim()
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const key = node.textContent.trim();
    entries.push({ node, original: node.textContent, translated: dictionary[key] });
  }
  document.querySelectorAll('[aria-label], [placeholder]').forEach(node => {
    ['aria-label', 'placeholder'].forEach(name => {
      if (node.hasAttribute(name)) attributes.push({ node, name, original: node.getAttribute(name) });
    });
  });
  const originalTitle = document.title;
  function applyLanguage() {
    root.lang = lang === 'es' ? 'es' : 'en';
    entries.forEach(({node, original, translated}) => {
      node.textContent = lang === 'es' && translated ? original.replace(original.trim(), translated) : original;
    });
    attributes.forEach(({node, name, original}) => node.setAttribute(name, lang === 'es' ? dictionary[original] || original : original));
    document.title = lang === 'es' ? dictionary[originalTitle] || originalTitle : originalTitle;
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === lang)));
    document.querySelectorAll('input,select,textarea').forEach(input => input.setCustomValidity(''));
    refreshFormNotices();
    updateConsentButtons();
  }
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    lang = button.dataset.language;
    storage.set('dc-language', lang);
    applyLanguage();
  }));
  // Dark is the default; light mode requires an explicit choice with the toggle.
  let theme = storage.get('dc-theme') === 'light' ? 'light' : 'dark';
  function applyTheme() {
    root.dataset.theme = theme;
    const button = document.getElementById('dcTheme');
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'light'));
      button.setAttribute('aria-label', text('Toggle light and dark mode', 'Cambiar entre modo claro y oscuro'));
    }
  }
  document.getElementById('dcTheme')?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    storage.set('dc-theme', theme);
    applyTheme();
  });
  const progress = document.querySelector('.dc-scroll-progress');
  let scrollQueued = false;
  function updateProgress() {
    const available = document.documentElement.scrollHeight - innerHeight;
    const value = available > 0 ? Math.min(1, Math.max(0, scrollY / available)) : 0;
    progress?.style.setProperty('--scroll-progress', value);
    document.querySelector('.nav-header')?.classList.toggle('dc-scrolled', scrollY > 24);
    scrollQueued = false;
  }
  addEventListener('scroll', () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  addEventListener('resize', updateProgress);
  addEventListener('load', updateProgress);
  new ResizeObserver(updateProgress).observe(document.body);
  const pipeline = document.querySelector('.dc-process-line');
  if (pipeline) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let stage = 0;
    const setStage = () => {
      pipeline.dataset.stage = stage;
      pipeline.querySelectorAll('.dc-pipeline-label').forEach((label, i) => label.classList.toggle('is-current', i === stage));
      document.querySelectorAll('.dc-stages .dc-card').forEach((card, i) => card.classList.toggle('dc-stage-current', i === stage));
    };
    setStage();
    setInterval(() => {
      if (document.hidden || reduced.matches) return;
      stage = (stage + 1) % 3;
      setStage();
    }, 2800);
  }
  // First-touch attribution is tab-scoped and contains no form answers or contact data.
  let consent = storage.get('dc-tracking-consent') || '';
  const attributionKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','msclkid','wbraid','gbraid'];
  let attribution = {};
  try { attribution = JSON.parse(sessionStorage.getItem('dc-attribution') || '{}'); } catch { /* Ignore invalid storage. */ }
  const params = new URLSearchParams(location.search);
  if (consent === 'rejected') attribution = {};
  else {
    attributionKeys.forEach(key => { if (params.has(key) && !attribution[key]) attribution[key] = params.get(key).slice(0, 300); });
    try { sessionStorage.setItem('dc-attribution', JSON.stringify(attribution)); } catch { /* Optional. */ }
  }
  const safeSource = location.origin + location.pathname;
  const bookingPrefill = new WeakMap();
  function bookingUrl(prefill) {
    try {
      const url = new URL(config.bookingUrl);
      if (url.protocol !== 'https:') return null;
      Object.entries(attribution).forEach(([key, value]) => url.searchParams.set(key, value));
      // Only confirmed submissions prefill the existing Cal.com booking form.
      if (prefill && url.hostname === 'cal.com') {
        url.searchParams.set('name', prefill.name);
        url.searchParams.set('email', prefill.email);
      }
      return url.href;
    } catch { return null; }
  }
  const bookingLinks = document.querySelectorAll('a[data-booking],a[href*="cal.com/bookings-appointments-ooxy15/15min"]');
  function refreshBookingLinks() {
    bookingLinks.forEach(link => {
      const href = bookingUrl(bookingPrefill.get(link));
      if (!href) return;
      link.href = href;
      const url = new URL(href);
      if (url.hostname !== 'cal.com' || url.pathname !== '/bookings-appointments-ooxy15/15min') return;
      link.dataset.calLink = 'bookings-appointments-ooxy15/15min';
      link.dataset.calNamespace = 'dcusa';
      link.dataset.calConfig = JSON.stringify({ layout: 'month_view', ...Object.fromEntries(url.searchParams) });
    });
  }
  refreshBookingLinks();
  let analyticsLoaded = false;
  const emitted = new Set();
  function addScript(src, id) {
    if (id && document.getElementById(id)) return;
    const script = document.createElement('script');
    script.async = true; script.src = src;
    if (id) script.id = id;
    document.head.appendChild(script);
  }
  function activateAnalytics() {
    if (consent !== 'accepted' || analyticsLoaded) return;
    analyticsLoaded = true;
    const t = config.tracking || {};
    window.dataLayer = window.dataLayer || [];
    // Prefer a single GTM container; configure GA4/Ads/Meta there to avoid duplicates.
    if (/^GTM-[A-Z0-9]+$/.test(t.gtmId || '')) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      addScript('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(t.gtmId), 'dc-gtm');
      return;
    }
    const ga = /^G-[A-Z0-9]+$/.test(t.ga4Id || '') ? t.ga4Id : '';
    const ads = /^AW-\d+$/.test(t.googleAdsId || '') ? t.googleAdsId : '';
    if (ga || ads) {
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      if (ga) window.gtag('config', ga);
      if (ads) window.gtag('config', ads);
      addScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga || ads), 'dc-gtag');
    }
    if (/^\d+$/.test(t.metaPixelId || '')) {
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.queue = []; fbq.loaded = true; fbq.version = '2.0';
      window.fbq = fbq; window._fbq = fbq;
      addScript('https://connect.facebook.net/en_US/fbevents.js', 'dc-meta');
      fbq('init', t.metaPixelId); fbq('track', 'PageView');
    }
  }
  function track(name, details = {}, key) {
    if (consent !== 'accepted' || (key && emitted.has(key))) return;
    if (key) emitted.add(key);
    const payload = { event: name, form_source: details.form_source || '', page_path: location.pathname, ...details };
    window.dataLayer = window.dataLayer || [];
    const t = config.tracking || {};
    window.dataLayer.push(payload);
    if (!/^GTM-[A-Z0-9]+$/.test(t.gtmId || '')) {
      if (window.gtag && t.ga4Id) window.gtag('event', name, details);
      if (name === 'dc_lead_confirmed') {
        if (window.fbq) window.fbq('track', 'Lead', {}, { eventID: key });
        if (window.gtag && t.googleAdsId && t.googleAdsLeadLabel) window.gtag('event', 'conversion', { send_to: t.googleAdsId + '/' + t.googleAdsLeadLabel, transaction_id: key });
      }
    }
    document.dispatchEvent(new CustomEvent('dc:analytics', {detail: payload}));
  }
  // Keep scheduling on this page so a confirmed booking retains first-party GA attribution.
  // Cal's fresh-booking event is separate from its reschedule and dry-run events.
  const calNamespace = 'dcusa';
  if (bookingLinks.length) {
    ((C, A, L) => {
      const push = (api, args) => api.q.push(args);
      C.Cal = C.Cal || function () {
        const cal = C.Cal, args = arguments;
        if (!cal.loaded) {
          cal.ns = {}; cal.q = cal.q || [];
          const script = document.createElement('script');
          script.src = A; script.async = true; document.head.appendChild(script);
          cal.loaded = true;
        }
        if (args[0] === L) {
          const api = function () { push(api, arguments); };
          api.q = [];
          if (typeof args[1] === 'string') {
            cal.ns[args[1]] = cal.ns[args[1]] || api;
            push(cal.ns[args[1]], args); push(cal, ['initNamespace', args[1]]);
          } else push(cal, args);
          return;
        }
        push(cal, args);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');
    window.Cal('init', calNamespace, { origin: 'https://app.cal.com' });
    window.Cal.config = window.Cal.config || {};
    window.Cal.config.forwardQueryParams = false;
    window.Cal.ns[calNamespace]('on', {
      action: 'bookingSuccessfulV2',
      callback: event => {
        const data = event.detail?.data;
        if (consent !== 'accepted' || String(data?.status).toUpperCase() !== 'ACCEPTED' || data.paymentRequired || Number(data.eventTypeId) !== 4928892 || !/^[a-zA-Z0-9_-]{10,200}$/.test(data.uid || '')) return;
        const key = 'cal:' + data.uid;
        if (storage.get('dc-booking-recorded:' + data.uid)) return;
        storage.set('dc-booking-recorded:' + data.uid, '1');
        // Only fixed non-personal parameters go to Analytics. UID stays in local deduplication storage.
        track('dc_booking_confirmed', { booking_provider: 'cal.com', appointment_type: 'strategy_call' }, key);
      }
    });
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a.dc-button,a[data-booking]');
    if (!link) return;
    track(link.href.includes('/apply') ? 'dc_application_open' : link.hasAttribute('data-booking') || /cal\.com|calendly\.com/.test(link.href) ? 'dc_booking_click' : 'dc_cta_click');
  });
  function updateConsentButtons() {
    const panel = document.getElementById('dcConsentPanel');
    const configured = Object.values(config.tracking || {}).some(Boolean);
    if (panel) panel.hidden = !!consent || !configured;
  }
  document.querySelectorAll('[data-tracking-choice]').forEach(button => button.addEventListener('click', () => {
    const previous = consent;
    consent = button.dataset.trackingChoice;
    storage.set('dc-tracking-consent', consent);
    if (consent === 'rejected') {
      attribution = {};
      try { sessionStorage.removeItem('dc-attribution'); } catch { /* Optional. */ }
      refreshBookingLinks();
      if (previous === 'accepted') { location.reload(); return; }
    }
    updateConsentButtons(); activateAnalytics();
  }));
  document.getElementById('dcPrivacySettings')?.addEventListener('click', () => {
    document.getElementById('dcConsentPanel').hidden = false;
  });
  const forms = document.querySelectorAll('[data-dc-form]');
  const endpointReady = (() => {
    try {
      const url = new URL(config.formEndpoint);
      const localTest = ['127.0.0.1','localhost'].includes(location.hostname) && ['127.0.0.1','localhost'].includes(url.hostname);
      return url.protocol === 'https:' || (localTest && url.protocol === 'http:');
    } catch { return false; }
  })();
  function refreshFormNotices() {
    forms?.forEach(form => {
      const status = form.querySelector('[data-form-status]');
      const button = form.querySelector('[type=submit]');
      if (!button) return;
      status.hidden = !endpointReady && form.dataset.complete !== 'true' && form.dataset.error !== 'true';
      if (form.dataset.complete === 'true') {
        status.textContent = text('Thanks. We received your details. Book a call below.', 'Gracias. Recibimos tus datos. Agenda una llamada abajo.');
        button.textContent = text('Details Received', 'Datos recibidos');
        return;
      }
      if (form.dataset.busy === 'true') { button.textContent = text('Sending…', 'Enviando…'); return; }
      if (form.dataset.error === 'true') {
        status.textContent = text('We could not confirm your submission. Try again, or call or email us.', 'No pudimos confirmar el envío. Intenta de nuevo o llámanos o escríbenos.');
        button.textContent = text('Try Again', 'Intentar de nuevo');
        return;
      }
      button.disabled = !endpointReady;
      button.textContent = endpointReady ? text('Send My Details', 'Enviar mis datos') : text('Online Sending Unavailable', 'Envío en línea no disponible');
      status.textContent = endpointReady ? text('Send your details for review.', 'Envía tus datos para revisarlos.') : '';
    });
  }
  forms.forEach(form => {
    const steps = [...form.querySelectorAll('[data-form-step]')];
    if (steps.length) {
      let currentStep = 0;
      const next = form.querySelector('[data-step-next]');
      const back = form.querySelector('[data-step-back]');
      const submit = form.querySelector('[type=submit]');
      const showStep = (index, focus = true) => {
        currentStep = index;
        steps.forEach((step, i) => { step.hidden = i !== index; });
        form.querySelectorAll('[data-step-label]').forEach((label, i) => {
          if (i === index) label.setAttribute('aria-current', 'step');
          else label.removeAttribute('aria-current');
        });
        back.hidden = index === 0;
        next.hidden = index === steps.length - 1;
        submit.hidden = index !== steps.length - 1;
        if (focus) steps[index].querySelector('legend').focus();
      };
      const advance = () => {
        for (const input of steps[currentStep].querySelectorAll('input,select,textarea')) {
          if (!input.reportValidity()) return;
        }
        showStep(Math.min(currentStep + 1, steps.length - 1));
      };
      next.addEventListener('click', advance);
      back.addEventListener('click', () => showStep(Math.max(0, currentStep - 1)));
      form.addEventListener('invalid', event => {
        const index = steps.findIndex(step => step.contains(event.target));
        if (index >= 0 && index !== currentStep) showStep(index, false);
      }, true);
      form.addEventListener('keydown', event => {
        if (event.key === 'Enter' && event.target.tagName === 'INPUT' && currentStep < steps.length - 1) {
          event.preventDefault(); advance();
        }
      });
      showStep(0, false);
    }
    let busy = false;
    let idempotencyKey = crypto.randomUUID();
    form.addEventListener('input', event => event.target.setCustomValidity?.(''));
    form.addEventListener('invalid', event => {
      if (lang === 'es') event.target.setCustomValidity(event.target.validity.typeMismatch ? 'Ingresa un correo o enlace válido.' : 'Completa este campo con un valor válido.');
    }, true);
    const sms = form.querySelector('[name=sms_consent]');
    if (sms && !config.smsEnabled) {
      sms.disabled = true;
      sms.checked = false;
    }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !endpointReady || form.dataset.complete === 'true' || !form.reportValidity()) return;
      busy = true; form.dataset.busy = 'true';
      form.dataset.error = 'false';
      const button = form.querySelector('[type=submit]');
      const status = form.querySelector('[data-form-status]');
      status.hidden = false;
      button.disabled = true;
      button.textContent = text('Sending…', 'Enviando…');
      const data = new FormData(form);
      const fields = {};
      for (const key of new Set(data.keys())) fields[key] = data.getAll(key).length > 1 ? data.getAll(key) : data.get(key);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(config.formEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
          credentials: 'omit', body: JSON.stringify({
            version: 1, idempotencyKey, source: form.dataset.dcForm, fields,
            submittedAt: new Date().toISOString(), sourcePage: safeSource,
            attribution: consent === 'rejected' ? {} : attribution, language: lang,
            smsConsent: config.smsEnabled && !!sms?.checked,
            smsDisclosureVersion: '2026-10-19-v1'
          })
        });
        const result = await response.json();
        if (!response.ok || result.success !== true || typeof result.submissionId !== 'string' || !result.submissionId) throw new Error('Submission not confirmed');
        form.dataset.complete = 'true';
        status.textContent = text('Thanks. We received your details. Book a call below.', 'Gracias. Recibimos tus datos. Agenda una llamada abajo.');
        status.classList.add('dc-form-success');
        form.querySelector('[data-after-submit]').hidden = false;
        form.querySelectorAll('[data-after-submit] a[data-booking]').forEach(link => {
          bookingPrefill.set(link, { name: String(fields.full_name || ''), email: String(fields.email || '') });
        });
        refreshBookingLinks();
        form.querySelectorAll('input,select,textarea').forEach(input => { input.disabled = true; });
        button.textContent = text('Details Received', 'Datos recibidos');
        track('dc_lead_confirmed', { form_source: form.dataset.dcForm }, idempotencyKey);
        status.focus();
      } catch {
        form.dataset.error = 'true';
        status.textContent = text('We could not confirm your submission. Try again, or call or email us.', 'No pudimos confirmar el envío. Intenta de nuevo o llámanos o escríbenos.');
        status.focus();
        button.disabled = false;
        button.textContent = text('Try Again', 'Intentar de nuevo');
      } finally { clearTimeout(timer); busy = false; form.dataset.busy = 'false'; }
    });
  });
  applyLanguage(); applyTheme(); updateProgress(); activateAnalytics();
})();

// Invisible spam trap for website form submissions.
(() => {
  const addTrap = () => document.querySelectorAll('form[data-dc-form]').forEach(form => {
    if (form.querySelector('[name="website_confirm"]')) return;
    const trap = document.createElement('div');
    trap.setAttribute('aria-hidden', 'true');
    trap.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden';
    const input = document.createElement('input');
    input.name = 'website_confirm'; input.type = 'text'; input.tabIndex = -1; input.autocomplete = 'off';
    trap.appendChild(input); form.appendChild(trap);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addTrap); else addTrap();
})();
