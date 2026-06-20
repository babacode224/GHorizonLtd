/* ============================================================
   G Horizon — interactions
   ============================================================ */
(function () {
  'use strict';

  /* ---- Sticky navbar style on scroll ---- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('nav-scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ---- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('hidden') === false;
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        document.body.style.overflow = '';
      })
    );
  }

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---- Animated stat counters ---- */
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && counters.length) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const dur = 1400; const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = target * eased;
          el.textContent = (Number.isInteger(target) ? Math.round(val) : val.toFixed(1)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-q').forEach((q) => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const a = item.querySelector('.faq-a');
      const isOpen = item.classList.contains('open');
      // close siblings within same list
      const list = item.parentElement;
      list.querySelectorAll('.faq-item.open').forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      a.style.maxHeight = isOpen ? null : a.scrollHeight + 'px';
      q.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---- Inquiry modal ---- */
  const overlay = document.getElementById('inquiry-modal');
  const propNameEl = document.getElementById('modal-prop-name');
  const openModal = (name) => {
    if (!overlay) return;
    if (propNameEl && name) propNameEl.textContent = name;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('[data-inquire]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.dataset.inquire);
    });
  });
  if (overlay) {
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    overlay.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ---- Products filtering ---- */
  const grid = document.getElementById('property-grid');
  if (grid) {
    const cards = Array.from(grid.querySelectorAll('[data-category]'));
    const chips = document.querySelectorAll('[data-filter]');
    const locationSel = document.getElementById('filter-location');
    const priceSel = document.getElementById('filter-price');
    const sortSel = document.getElementById('filter-sort');
    const countEl = document.getElementById('result-count');
    const emptyEl = document.getElementById('empty-state');
    let activeCat = 'all';

    const apply = () => {
      const loc = locationSel ? locationSel.value : 'all';
      const price = priceSel ? priceSel.value : 'all';
      let visible = 0;
      cards.forEach((c) => {
        const okCat = activeCat === 'all' || c.dataset.category === activeCat;
        const okLoc = loc === 'all' || c.dataset.location === loc;
        const p = parseInt(c.dataset.price, 10);
        let okPrice = true;
        if (price === 'lt100') okPrice = p < 100000000;
        else if (price === '100-300') okPrice = p >= 100000000 && p <= 300000000;
        else if (price === 'gt300') okPrice = p > 300000000;
        const show = okCat && okLoc && okPrice;
        c.style.display = show ? '' : 'none';
        if (show) visible++;
      });
      if (countEl) countEl.textContent = visible;
      if (emptyEl) emptyEl.classList.toggle('hidden', visible !== 0);
    };

    const sort = () => {
      if (!sortSel) return;
      const v = sortSel.value;
      const sorted = cards.slice().sort((a, b) => {
        if (v === 'price-asc') return a.dataset.price - b.dataset.price;
        if (v === 'price-desc') return b.dataset.price - a.dataset.price;
        return a.dataset.index - b.dataset.index;
      });
      sorted.forEach((c) => grid.appendChild(c));
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => c.classList.remove('chip-active'));
        chip.classList.add('chip-active');
        activeCat = chip.dataset.filter;
        apply();
      });
    });
    [locationSel, priceSel].forEach((s) => s && s.addEventListener('change', apply));
    sortSel && sortSel.addEventListener('change', () => { sort(); apply(); });
    apply();
  }

  /* ---- Appointment time-slot picker ---- */
  document.querySelectorAll('.slot').forEach((s) => {
    s.addEventListener('click', () => {
      s.closest('.slot-group')?.querySelectorAll('.slot').forEach((x) => x.classList.remove('sel'));
      s.classList.add('sel');
      const out = document.getElementById('chosen-slot');
      if (out) out.value = s.dataset.slot || s.textContent.trim();
    });
  });

  /* ---- File upload filename display ---- */
  document.querySelectorAll('input[type="file"]').forEach((inp) => {
    inp.addEventListener('change', () => {
      const label = document.querySelector(`[data-file-for="${inp.id}"]`);
      if (label) {
        label.textContent = inp.files.length
          ? Array.from(inp.files).map((f) => f.name).join(', ')
          : 'PDF, JPG, PNG or DOC — up to 5 MB';
      }
    });
  });

  /* ---- Demo form submit (no backend) ---- */
  document.querySelectorAll('form[data-demo]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const note = form.querySelector('[data-form-note]');
      if (btn) { btn.disabled = true; const t = btn.textContent; btn.textContent = 'Sending…';
        setTimeout(() => {
          if (note) { note.classList.remove('hidden'); }
          form.reset();
          btn.disabled = false; btn.textContent = t;
          const fileLbl = form.querySelector('[data-file-for]');
          if (fileLbl) fileLbl.textContent = 'PDF, JPG, PNG or DOC — up to 5 MB';
        }, 900);
      }
    });
  });

  /* ---- AnimatedHeading: char-by-char entrance ----
     <h1 data-anim-heading data-delay="200"> with text containing \n line breaks
     (use literal newlines or the string "\n"). charDelay = 30ms, transition 500ms. */
  document.querySelectorAll('[data-anim-heading]').forEach((el) => {
    const charDelay = 30;
    const initialDelay = parseInt(el.dataset.delay || '200', 10);
    const raw = (el.dataset.text || el.textContent).replace(/\\n/g, '\n');
    const lines = raw.split('\n');
    el.textContent = '';
    el.setAttribute('aria-label', raw.replace(/\n/g, ' '));
    lines.forEach((line, lineIndex) => {
      const lineLength = line.length;
      const lineEl = document.createElement('span');
      lineEl.className = 'block';
      for (let charIndex = 0; charIndex < line.length; charIndex++) {
        const span = document.createElement('span');
        span.className = 'ah-char';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = line[charIndex] === ' ' ? ' ' : line[charIndex];
        const delay = initialDelay + (lineIndex * lineLength * charDelay) + (charIndex * charDelay);
        span.style.transitionDelay = delay + 'ms';
        lineEl.appendChild(span);
      }
      el.appendChild(lineEl);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.querySelectorAll('.ah-char').forEach((c) => c.classList.add('in'));
    }));
  });

  /* ---- FadeIn wrappers ----
     class="fade-in" data-delay="800" data-duration="1000" */
  document.querySelectorAll('.fade-in').forEach((el) => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    const duration = parseInt(el.dataset.duration || '1000', 10);
    el.style.transitionDuration = duration + 'ms';
    setTimeout(() => el.classList.add('in'), delay);
  });

  /* ---- Hero headline rotator (seven30.co-style swap + progress bar) ----
     <span class="headline-rotator" data-interval="4500"
           data-phrases='["Line one|Line two", ...]'>
       <span class="headline-phrase">…</span>
     </span>
     <div class="headline-progress"><span></span></div>
     Use "|" inside a phrase to force a line break. */
  const rotator = document.querySelector('.headline-rotator');
  if (rotator) {
    let phrases = [];
    try { phrases = JSON.parse(rotator.dataset.phrases || '[]'); } catch (_) {}
    const phraseEl = rotator.querySelector('.headline-phrase');
    const progress = document.querySelector('.headline-progress');
    const interval = parseInt(rotator.dataset.interval || '4500', 10);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const render = (txt) => { phraseEl.innerHTML = txt.split('|').join('<br/>'); };

    if (phrases.length && phraseEl) {
      const heading = rotator.closest('h1');
      if (heading) heading.setAttribute('aria-label', phrases.map((p) => p.replace(/\|/g, ' ')).join('. '));
      render(phrases[0]);

      if (!reduce && phrases.length > 1) {
        let i = 0;
        const runProgress = () => {
          if (!progress) return;
          progress.classList.remove('run');
          void progress.offsetWidth;           // force reflow to restart the animation
          progress.style.setProperty('--hl-interval', interval + 'ms');
          progress.classList.add('run');
        };
        runProgress();
        setInterval(() => {
          phraseEl.classList.add('swap-out');
          setTimeout(() => {
            i = (i + 1) % phrases.length;
            render(phrases[i]);
            phraseEl.classList.remove('swap-out');
            phraseEl.classList.add('swap-in');
            setTimeout(() => phraseEl.classList.remove('swap-in'), 650);
            runProgress();
          }, 450);                              // matches hlOut duration
        }, interval);
      }
    }
  }

  /* ---- Footer year ---- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
