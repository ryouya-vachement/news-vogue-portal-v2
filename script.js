/* =========================================================
   OPINION — interactions & scroll animations
   ========================================================= */

(() => {
  /* --- Scroll-reveal via IntersectionObserver --- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // stagger siblings slightly for grouped reveals
        const delay = el.dataset.delay
          ? Number(el.dataset.delay)
          : Math.min(i * 60, 240);
        setTimeout(() => el.classList.add('in'), delay);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  revealEls.forEach((el) => io.observe(el));

  /* --- Header shadow on scroll --- */
  const header = document.getElementById('siteHeader');
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 8) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Mobile menu toggle --- */
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  if (menuBtn && mobileNav) {
    const toggle = () => {
      menuBtn.classList.toggle('active');
      mobileNav.classList.toggle('active');
      document.body.style.overflow =
        mobileNav.classList.contains('active') ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', toggle);
    mobileNav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', toggle)
    );
  }

  /* --- Compare tabs --- */
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) =>
        p.classList.toggle('active', p.dataset.panel === target)
      );
    });
  });

  /* --- Subtle parallax on hero title lines --- */
  const heroLines = document.querySelectorAll('.hero-title .line');
  let parallaxTicking = false;
  window.addEventListener('scroll', () => {
    if (parallaxTicking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      heroLines.forEach((l, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        l.style.transform = `translateX(${(y * 0.04 * dir).toFixed(2)}px)`;
      });
      parallaxTicking = false;
    });
    parallaxTicking = true;
  }, { passive: true });

  /* --- Smooth-scroll for in-page anchors (graceful fallback) --- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* --- Auto-rotate compare tabs when section in view (gentle demo) --- */
  const compareSection = document.getElementById('compare');
  if (compareSection && tabs.length) {
    let rotateTimer = null;
    let idx = 0;
    const startRotate = () => {
      stopRotate();
      rotateTimer = setInterval(() => {
        idx = (idx + 1) % tabs.length;
        tabs[idx].click();
      }, 5000);
    };
    const stopRotate = () => {
      if (rotateTimer) { clearInterval(rotateTimer); rotateTimer = null; }
    };
    const visIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) startRotate();
        else stopRotate();
      });
    }, { threshold: 0.3 });
    visIO.observe(compareSection);
    // pause rotation on user interaction
    tabs.forEach((t) => t.addEventListener('click', () => {
      stopRotate();
      idx = Array.from(tabs).indexOf(t);
    }));
  }
})();
