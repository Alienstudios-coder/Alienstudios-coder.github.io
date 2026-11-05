/* Alien Studios — site behaviour. No dependencies, no network requests, no tracking.
   Every feature is progressive: the site is fully usable without JavaScript. */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WHATSAPP = '254729927670';
  var EMAIL = 'paulmuthoni88@gmail.com';

  /* ---------- theme toggle ---------- */
  function initTheme() {
    var btn = $('[data-theme-toggle]'); if (!btn) return;
    var root = document.documentElement;
    var label = function () { btn.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); };
    label();
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { window.localStorage.setItem('as-theme', next); } catch (e) { /* ignore */ }
      label();
    });
  }

  /* ---------- header: solid on scroll ---------- */
  function initHeader() {
    var header = $('[data-header]'); if (!header) return;
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- mobile navigation + mega menu ---------- */
  function initNav() {
    var toggle = $('[data-nav-toggle]'), nav = $('[data-nav]'), header = $('[data-header]');
    var mega = $('[data-mega]'), megaBtn = $('[data-mega-toggle]');
    function setNav(open) {
      if (!toggle || !nav) return;
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      header.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      if (open) { var first = $('a, button', nav); if (first) first.focus(); }
    }
    function setMega(open) {
      if (!mega || !megaBtn) return;
      megaBtn.setAttribute('aria-expanded', String(open));
      mega.classList.toggle('is-open', open);
    }
    if (toggle) toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
    if (megaBtn) megaBtn.addEventListener('click', function (e) { e.stopPropagation(); setMega(megaBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (mega && mega.classList.contains('is-open')) { setMega(false); megaBtn.focus(); }
      else if (nav && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) { if (mega && !e.target.closest('.nav__item--mega')) setMega(false); });
    if (nav) nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 980) setNav(false); });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var items = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el, i) { el.style.transitionDelay = Math.min((i % 6) * 60, 300) + 'ms'; io.observe(el); });
  }

  /* ---------- rotating word in the hero ---------- */
  function initRotator() {
    var el = $('[data-rotator]'); if (!el || reduceMotion) return;
    var words = (el.getAttribute('data-words') || '').split('|').filter(Boolean); if (!words.length) return;
    var i = 0;
    el.setAttribute('aria-hidden', 'true');
    var sr = document.createElement('span'); sr.className = 'sr-only'; sr.textContent = 'organizations';
    el.parentNode.insertBefore(sr, el);
    el.textContent = words[0];
    setInterval(function () {
      if (document.hidden) return;
      el.classList.add('is-swapping');
      setTimeout(function () { i = (i + 1) % words.length; el.textContent = words[i]; el.classList.remove('is-swapping'); }, 300);
    }, 2600);
  }

  /* ---------- animated starfield with an orbit (canvas) ---------- */
  function initStarfield() {
    $$('[data-starfield]').forEach(function (canvas) {
      var ctx = canvas.getContext('2d'); if (!ctx) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, stars = [], t = 0, running = true, raf = 0;
      function size() {
        var r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var n = Math.round(Math.min(220, w * h / 6000));
        stars = []; for (var k = 0; k < n; k++) stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + .2, s: Math.random() * .25 + .03, p: Math.random() * Math.PI * 2 });
      }
      function draw() {
        ctx.clearRect(0, 0, w, h);
        for (var k = 0; k < stars.length; k++) {
          var st = stars[k], a = .35 + Math.sin(t * .02 + st.p) * .35;
          ctx.globalAlpha = Math.max(.08, a); ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
          if (!reduceMotion) { st.y -= st.s; if (st.y < -2) { st.y = h + 2; st.x = Math.random() * w; } }
        }
        // orbit ring with a travelling "planet"
        var cx = w * .78, cy = h * .32, rx = Math.min(w, 900) * .32, ry = rx * .3, rot = -.28;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
        ctx.globalAlpha = .22; ctx.strokeStyle = '#f5b731'; ctx.lineWidth = 1.2; ctx.setLineDash([4, 8]);
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        var ang = t * .006, px = Math.cos(ang) * rx, py = Math.sin(ang) * ry;
        var g = ctx.createRadialGradient(px, py, 0, px, py, 18); g.addColorStop(0, 'rgba(255,209,102,.95)'); g.addColorStop(1, 'rgba(255,209,102,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore(); ctx.globalAlpha = 1;
        t++;
        if (running && !reduceMotion) raf = requestAnimationFrame(draw);
      }
      size(); draw();
      window.addEventListener('resize', function () { size(); if (reduceMotion) draw(); });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
        var vis = en[0].isIntersecting; if (vis && !running) { running = true; draw(); } else if (!vis) { running = false; cancelAnimationFrame(raf); }
      }).observe(canvas);
      document.addEventListener('visibilitychange', function () { if (document.hidden) { running = false; cancelAnimationFrame(raf); } else { running = true; draw(); } });
    });
  }

  /* ---------- count-up numbers in the hero illustration ---------- */
  function initCounters() {
    if (reduceMotion) return;
    $$('[data-count]').forEach(function (el) {
      var end = Number(el.getAttribute('data-count')), start = performance.now(), dur = 1400;
      function step(now) {
        var p = Math.min(1, (now - start) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString('en-KE'); if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ---------- subtle tilt on the hero device ---------- */
  function initTilt() {
    var wrap = $('[data-tilt]'); if (!wrap || reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
    var dev = $('.device', wrap); if (!dev) return;
    wrap.addEventListener('pointermove', function (e) {
      var r = wrap.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      dev.style.transform = 'rotateY(' + (x * 10 - 4) + 'deg) rotateX(' + (-y * 8 + 2) + 'deg)';
    });
    wrap.addEventListener('pointerleave', function () { dev.style.transform = ''; });
  }

  /* ---------- solutions: sector filter ---------- */
  function initFilters() {
    var group = $('[data-filters]'); if (!group) return;
    var cards = $$('.product-card', $('[data-filter-target]')), status = $('[data-filter-status]');
    function apply(sector) {
      var shown = 0;
      cards.forEach(function (c) { var on = sector === 'all' || c.getAttribute('data-sector') === sector; c.classList.toggle('is-hidden', !on); if (on) shown++; });
      $$('[data-filter]', group).forEach(function (b) { var on = b.getAttribute('data-filter') === sector; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
      if (status) status.textContent = shown + (shown === 1 ? ' system shown' : ' systems shown');
    }
    group.addEventListener('click', function (e) { var b = e.target.closest('[data-filter]'); if (b) apply(b.getAttribute('data-filter')); });
  }

  /* ---------- solutions: "find your fit" ---------- */
  function initFinder() {
    var box = $('[data-finder]'); if (!box) return;
    var out = $('[data-finder-result]', box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fit]'); if (!b) return;
      $$('[data-fit]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.product-card').forEach(function (c) { c.classList.remove('is-fit'); });
      var slug = b.getAttribute('data-fit');
      out.textContent = '';
      if (slug === 'custom') {
        out.append('We build custom systems on the same secure foundations. ');
        var a = document.createElement('a'); a.href = '#custom'; a.textContent = 'See the sectors we build for'; out.append(a); out.append('.');
        return;
      }
      var card = $('.product-card a[href$="solutions/' + slug + '/"]');
      if (!card) return;
      var article = card.closest('.product-card'); article.classList.add('is-fit');
      out.append('We recommend the ');
      var link = document.createElement('a'); link.href = card.getAttribute('href'); link.textContent = card.textContent; out.append(link);
      out.append(slug === 'staff-leave-payroll' ? ' — it works for any organization with staff, alongside any other system.' : '. It is highlighted below.');
      var all = $('[data-filter="all"]'); if (all && all.getAttribute('aria-pressed') !== 'true') all.click();
      article.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ---------- copy to clipboard ---------- */
  function initCopy() {
    $$('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy');
        var done = function () { var old = btn.getAttribute('aria-label'); btn.setAttribute('aria-label', 'Copied'); btn.classList.add('is-copied'); setTimeout(function () { btn.setAttribute('aria-label', old); btn.classList.remove('is-copied'); }, 1600); };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, function () {}); else window.prompt('Copy the email address:', text);
      });
    });
  }

  /* ---------- contact form → WhatsApp or email (nothing is sent to this website) ---------- */
  function initContactForm() {
    var form = $('[data-contact-form]'); if (!form) return;
    var status = $('[data-form-status]', form), sendVia = 'whatsapp';
    var params = new URLSearchParams(window.location.search);
    var sys = $('#f-system', form), wanted = params.get('system') || (params.get('topic') === 'design' ? 'design' : '');
    if (wanted && sys && $('option[value="' + wanted.replace(/[^a-z-]/g, '') + '"]', sys)) sys.value = wanted;
    var date = $('#f-date', form); if (date) date.min = new Date().toISOString().slice(0, 10);
    var msg = $('#f-msg', form), counter = $('[data-count-for="f-msg"]', form);
    if (msg && counter) msg.addEventListener('input', function () { counter.textContent = String(msg.value.length); });

    var clean = function (v, max) { return String(v || '').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').replace(/\s+\n/g, '\n').trim().slice(0, max); };
    function setError(input, text) {
      var err = $('#' + input.getAttribute('aria-describedby'), form);
      input.setAttribute('aria-invalid', text ? 'true' : 'false');
      if (err) { err.textContent = text; err.hidden = !text; }
    }
    function validate() {
      var ok = true, first = null;
      [['#f-name', 'Please enter your name.'], ['#f-org', 'Please enter your organization.']].forEach(function (pair) {
        var el = $(pair[0], form), bad = clean(el.value, 200).length < 2; setError(el, bad ? pair[1] : ''); if (bad) { ok = false; first = first || el; }
      });
      var ph = $('#f-phone', form), digits = ph.value.replace(/\D/g, '');
      var badPhone = ph.value.trim() !== '' && !/^(?:254|0)?[17]\d{8}$/.test(digits);
      setError(ph, badPhone ? 'Enter a Kenyan number, e.g. 0712 345 678 — or leave it empty.' : ''); if (badPhone) { ok = false; first = first || ph; }
      if (first) first.focus();
      return ok;
    }
    $$('button[type="submit"]', form).forEach(function (b) { b.addEventListener('click', function () { sendVia = b.getAttribute('data-send'); }); });
    $$('input[required]', form).forEach(function (el) { el.addEventListener('blur', function () { if (el.getAttribute('aria-invalid') === 'true') validate(); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form__status'; status.textContent = '';
      if ($('#f-website', form).value) return; // bot trap
      if (!validate()) { status.classList.add('is-error'); status.textContent = 'Please check the highlighted fields.'; return; }
      var f = function (id, max) { return clean($(id, form).value, max || 200); };
      var sysText = sys.options[sys.selectedIndex].text;
      var lines = [
        'Hello Alien Studios, I would like to book a free demonstration.',
        '',
        'Name: ' + f('#f-name', 80),
        'Organization: ' + f('#f-org', 120),
        f('#f-phone') ? 'Phone: ' + f('#f-phone', 20) : '',
        'Interested in: ' + sysText,
        f('#f-date') ? 'Preferred day: ' + f('#f-date', 10) : '',
        'Where: ' + f('#f-where', 40),
        f('#f-msg', 1200) ? '\nWhat we would like to improve:\n' + f('#f-msg', 1200) : ''
      ].filter(function (l) { return l !== ''; }).join('\n');
      var url = sendVia === 'email'
        ? 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Demo request: ' + sysText + ' — ' + f('#f-org', 80)) + '&body=' + encodeURIComponent(lines)
        : 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines);
      status.classList.add('is-ok');
      status.textContent = sendVia === 'email' ? 'Opening your email app… press Send there to deliver your request.' : 'Opening WhatsApp… press Send there to deliver your request.';
      if (sendVia === 'email') window.location.href = url;
      else { var win = window.open(url, '_blank', 'noopener,noreferrer'); if (!win) window.location.href = url; }
    });
  }

  /* ---------- go ---------- */
  function init() {
    initTheme(); initHeader(); initNav(); initReveal(); initRotator(); initStarfield();
    initCounters(); initTilt(); initFilters(); initFinder(); initCopy(); initContactForm();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
}());
