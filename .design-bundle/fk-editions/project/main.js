/* ============================================================
   FK ÉDITIONS — Main script
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Page-load curtain ---------- */
  const curtain = document.querySelector('.curtain');
  const curtainLogo = document.querySelector('.curtain-logo');
  // Show logo briefly, then lift
  setTimeout(() => curtainLogo?.classList.add('visible'), 100);
  setTimeout(() => {
    curtain?.classList.add('lifted');
    setTimeout(() => curtain?.remove(), 2200);
  }, 1100);

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.querySelector('.scroll-progress');
  function updateProgress() {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* ---------- Custom cursor (desktop only) ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('cursor-active');
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    function loop() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    // Hover state on interactive elements
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('a, button, .book-card, .author-card, .event-card, .tweaks-swatch');
      if (t) ring.classList.add('is-hover');
      const input = e.target.closest('input, textarea');
      if (input) ring.classList.add('is-text');
    });
    document.addEventListener('mouseout', (e) => {
      ring.classList.remove('is-hover', 'is-text');
    });
  }

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const stored = localStorage.getItem('fk-theme');
  if (stored === 'dark') root.classList.add('dark');

  function setTheme(dark) {
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('fk-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('fk-theme', 'light');
    }
  }
  themeToggle?.addEventListener('click', () => {
    setTheme(!root.classList.contains('dark'));
  });

  /* ---------- Header scroll behaviour — hide on down, show on up ---------- */
  const header = document.querySelector('.header');
  let lastY = 0;
  function onScroll() {
    const y = window.scrollY;
    if (y > 40) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');
    if (y > 200 && y > lastY) {
      header?.classList.add('hidden');
    } else {
      header?.classList.remove('hidden');
    }
    lastY = y;
    updateProgress();

    // Parallax on hero backdrop F + book
    const hero = document.querySelector('.hero');
    if (hero) {
      const heroOffset = Math.min(y, 800);
      hero.style.setProperty('--bg-shift', (heroOffset * 0.3) + 'px');
    }
    const heroBook = document.querySelector('.hero-book.is-active .hero-book-cover');
    if (heroBook && y < 1200 && !heroBook.dataset.userMoving) {
      heroBook.style.transform = `translateY(${y * -0.08}px) rotateY(-6deg) rotateX(2deg)`;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Hero carousel ---------- */
  const heroBooks = Array.from(document.querySelectorAll('.hero-book'));
  const heroDots = Array.from(document.querySelectorAll('.hero-dot'));
  const heroCounterNow = document.querySelector('[data-hero-counter-now]');
  const heroNavPrev = document.querySelector('[data-hero-prev]');
  const heroNavNext = document.querySelector('[data-hero-next]');
  let heroIndex = 0;
  let heroTimer;

  function showHero(i) {
    heroIndex = (i + heroBooks.length) % heroBooks.length;
    heroBooks.forEach((b, idx) => b.classList.toggle('is-active', idx === heroIndex));
    heroDots.forEach((d, idx) => {
      d.classList.remove('is-active');
      // force restart animation
      d.offsetHeight; // reflow
    });
    heroDots[heroIndex]?.classList.add('is-active');
    if (heroCounterNow) heroCounterNow.textContent = String(heroIndex + 1).padStart(2, '0');

    // Update hero text — with fade transition
    const active = heroBooks[heroIndex];
    if (active) {
      const t = active.dataset.title;
      const a = active.dataset.author;
      const d = active.dataset.desc;
      const c = active.dataset.cat;
      const heroKicker = document.querySelector('[data-hero-cat]');
      const heroTitle = document.querySelector('[data-hero-title]');
      const heroDesc = document.querySelector('[data-hero-desc]');
      const heroAuthor = document.querySelector('[data-hero-author]');

      // Don't fade on first call
      const firstCall = !heroTitle.dataset.initialized;
      if (firstCall) heroTitle.dataset.initialized = '1';

      if (firstCall) {
        if (heroKicker) heroKicker.textContent = c;
        if (heroTitle) heroTitle.innerHTML = t;
        if (heroDesc) heroDesc.textContent = d;
        if (heroAuthor) heroAuthor.textContent = a;
      } else {
        heroTitle?.classList.add('fading');
        heroDesc?.classList.add('fading');
        setTimeout(() => {
          if (heroKicker) heroKicker.textContent = c;
          if (heroTitle) heroTitle.innerHTML = t;
          if (heroDesc) heroDesc.textContent = d;
          if (heroAuthor) heroAuthor.textContent = a;
          heroTitle?.classList.remove('fading');
          heroDesc?.classList.remove('fading');
        }, 380);
      }
    }
  }

  function nextHero() { showHero(heroIndex + 1); resetHeroTimer(); }
  function prevHero() { showHero(heroIndex - 1); resetHeroTimer(); }
  function resetHeroTimer() {
    clearInterval(heroTimer);
    heroTimer = setInterval(() => showHero(heroIndex + 1), 6000);
  }

  heroDots.forEach((d, i) => d.addEventListener('click', () => { showHero(i); resetHeroTimer(); }));
  heroNavPrev?.addEventListener('click', prevHero);
  heroNavNext?.addEventListener('click', nextHero);

  if (heroBooks.length) {
    showHero(0);
    resetHeroTimer();
  }

  /* ---------- Tabs in Nos parutions ---------- */
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const target = tab.dataset.tab;
      document.querySelectorAll('[data-tab-content]').forEach((c) => {
        c.style.display = c.dataset.tabContent === target ? '' : 'none';
      });
    });
  });

  /* ---------- Scroll reveal (IO + scroll fallback) ---------- */
  const revealEls = Array.from(document.querySelectorAll('.reveal, .reveal-stagger'));
  function checkReveals() {
    const vh = window.innerHeight;
    revealEls.forEach((el) => {
      if (el.classList.contains('is-in')) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh - 60 && r.bottom > 0) {
        el.classList.add('is-in');
      }
    });
  }
  checkReveals();
  window.addEventListener('scroll', checkReveals, { passive: true });
  window.addEventListener('resize', checkReveals);
  // Also try IO for smoother behaviour
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }
  // Safety net — ensure everything reveals after a max delay
  setTimeout(() => revealEls.forEach((el) => el.classList.add('is-in')), 3000);

  /* ---------- Newsletter form ---------- */
  const form = document.querySelector('.newsletter-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Merci ✓';
      btn.style.background = 'var(--accent)';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        form.reset();
      }, 2400);
    }
  });

  /* ---------- Tweaks (editor mode panel) ---------- */
  const tweaksPanel = document.querySelector('.tweaks-panel');
  const tweakDefaults = window.FK_TWEAKS || { accent: 'terracotta', font: 'cormorant', bg: 'pure' };

  function applyTweak(key, value) {
    if (key === 'accent') {
      root.setAttribute('data-accent', value === 'terracotta' ? '' : value);
      if (value === 'terracotta') root.removeAttribute('data-accent');
      document.querySelectorAll('.tweaks-swatch').forEach((s) => {
        s.classList.toggle('is-active', s.dataset.c === value);
      });
    } else if (key === 'font') {
      if (value === 'cormorant') root.removeAttribute('data-font');
      else root.setAttribute('data-font', value);
      document.querySelectorAll('[data-tweak-font]').forEach((s) => {
        s.classList.toggle('is-active', s.dataset.tweakFont === value);
      });
    } else if (key === 'bg') {
      if (value === 'pure') root.removeAttribute('data-bg');
      else root.setAttribute('data-bg', value);
      document.querySelectorAll('.tweaks-bg-swatch').forEach((s) => {
        s.classList.toggle('is-active', s.dataset.bg === value);
      });
    }
    // Persist to parent
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: value } }, '*');
  }

  // Init from defaults
  applyTweak('accent', tweakDefaults.accent);
  applyTweak('font', tweakDefaults.font);
  applyTweak('bg', tweakDefaults.bg || 'pure');

  document.querySelectorAll('.tweaks-swatch').forEach((s) => {
    s.addEventListener('click', () => {
      applyTweak('accent', s.dataset.c);
      const lbl = document.querySelector('[data-color-name]');
      if (lbl && s.dataset.label) lbl.textContent = s.dataset.label;
    });
    s.addEventListener('mouseenter', () => {
      const lbl = document.querySelector('[data-color-name]');
      if (lbl && s.dataset.label) lbl.textContent = s.dataset.label;
    });
  });
  document.querySelectorAll('[data-tweak-font]').forEach((s) => {
    s.addEventListener('click', () => applyTweak('font', s.dataset.tweakFont));
  });
  document.querySelectorAll('.tweaks-bg-swatch').forEach((s) => {
    s.addEventListener('click', () => {
      applyTweak('bg', s.dataset.bg);
      const lbl = document.querySelector('[data-bg-name]');
      if (lbl && s.dataset.label) lbl.textContent = s.dataset.label;
    });
    s.addEventListener('mouseenter', () => {
      const lbl = document.querySelector('[data-bg-name]');
      if (lbl && s.dataset.label) lbl.textContent = s.dataset.label;
    });
  });

  document.querySelector('[data-tweaks-close]')?.addEventListener('click', () => {
    tweaksPanel?.classList.remove('is-open');
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  });

  // Tweaks protocol — order matters
  window.addEventListener('message', (ev) => {
    const d = ev.data;
    if (!d || !d.type) return;
    if (d.type === '__activate_edit_mode') tweaksPanel?.classList.add('is-open');
    if (d.type === '__deactivate_edit_mode') tweaksPanel?.classList.remove('is-open');
  });
  // Announce after listener is live
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  /* ---------- Magnetic-ish cursor effect on big interactive elements ---------- */
  // Subtle parallax on hero book covers based on mouse
  const heroBooksContainer = document.querySelector('.hero-books');
  heroBooksContainer?.addEventListener('mousemove', (e) => {
    const rect = heroBooksContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const active = heroBooksContainer.querySelector('.hero-book.is-active .hero-book-cover');
    if (active) {
      active.dataset.userMoving = '1';
      active.style.transform = `rotateY(${-6 + x * 6}deg) rotateX(${2 - y * 4}deg) translateY(${y * -8}px)`;
      active.style.animation = 'none';
    }
  });
  heroBooksContainer?.addEventListener('mouseleave', () => {
    const active = heroBooksContainer.querySelector('.hero-book.is-active .hero-book-cover');
    if (active) {
      delete active.dataset.userMoving;
      active.style.transform = '';
      active.style.animation = '';
    }
  });

  /* ---------- Word-by-word reveal (split text + observe) ---------- */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    // Walk only text nodes inside to avoid breaking nested elements
    const html = el.innerHTML;
    // Replace text content of leaf text nodes
    function process(node) {
      const children = Array.from(node.childNodes);
      children.forEach((c) => {
        if (c.nodeType === Node.TEXT_NODE) {
          const text = c.textContent;
          if (!text.trim()) return;
          const frag = document.createDocumentFragment();
          const words = text.split(/(\s+)/);
          words.forEach((w) => {
            if (!w.trim()) {
              frag.appendChild(document.createTextNode(w));
            } else {
              const wrap = document.createElement('span');
              wrap.className = 'word';
              const inner = document.createElement('span');
              inner.textContent = w;
              wrap.appendChild(inner);
              frag.appendChild(wrap);
            }
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === Node.ELEMENT_NODE) {
          // Skip already-wrapped words
          if (c.classList?.contains('word')) return;
          process(c);
        }
      });
    }
    process(el);
    el.classList.add('word-reveal');
    // Stagger via --i
    Array.from(el.querySelectorAll('.word > span')).forEach((s, i) => {
      s.style.setProperty('--i', i);
    });
  }
  // Apply to all section titles and big h2s
  document.querySelectorAll('.section-title, .heritage-text h2, .spotlight-content h2, .newsletter h2').forEach(splitWords);

  // Observe word-reveal elements
  const wordObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        // After animation completes, allow overflow so italics don't clip
        const wordCount = e.target.querySelectorAll('.word').length;
        const delay = 1100 + wordCount * 60 + 200;
        setTimeout(() => e.target.classList.add('settled'), delay);
        wordObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.word-reveal').forEach((el) => wordObserver.observe(el));
  // Trigger hero title immediately
  setTimeout(() => {
    document.querySelectorAll('.hero .word-reveal').forEach((el) => el.classList.add('is-in'));
  }, 1300);

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    const inner = btn.querySelector('.magnetic-inner') || btn;
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      if (inner !== btn) inner.style.transform = `translate(${x * 0.1}px, ${y * 0.15}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      if (inner !== btn) inner.style.transform = '';
    });
  });

  /* ---------- Counter — animates 2020 (or any data-target number) ---------- */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target || el.textContent, 10);
      if (isNaN(target)) return;
      counterObserver.unobserve(el);
      let cur = 0;
      const dur = 1800;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        cur = Math.floor(target * eased);
        el.textContent = String(cur);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = String(target);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => counterObserver.observe(c));
})();
