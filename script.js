/* =========================================================
   OPINION — interactions & scroll animations
   ========================================================= */

(() => {
  /* --- Today's date: update ticker / hero / section labels --- */
  const updateTodayDate = () => {
    const now = new Date();
    const Y = now.getFullYear();
    const M = String(now.getMonth() + 1).padStart(2, '0');
    const D = String(now.getDate()).padStart(2, '0');
    const dotted = `${Y}.${M}.${D}`;
    const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
    const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    const longDate = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${Y}`;
    document.querySelectorAll('[data-today-dot]').forEach(el => { el.textContent = dotted; });
    document.querySelectorAll('[data-today-long]').forEach(el => { el.textContent = longDate; });
  };
  updateTodayDate();

  /* --- Live news fetch (Google News RSS via rss2json) --- */
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const RSS_BASE = 'https://news.google.com/rss';
  const PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';
  const FEEDS = {
    top:      `${RSS_BASE}?hl=ja&gl=JP&ceid=JP:ja`,
    nation:   `${RSS_BASE}/headlines/section/topic/NATION?hl=ja&gl=JP&ceid=JP:ja`,
    world:    `${RSS_BASE}/headlines/section/topic/WORLD?hl=ja&gl=JP&ceid=JP:ja`,
    business: `${RSS_BASE}/headlines/section/topic/BUSINESS?hl=ja&gl=JP&ceid=JP:ja`,
    tech:     `${RSS_BASE}/headlines/section/topic/TECHNOLOGY?hl=ja&gl=JP&ceid=JP:ja`,
    ent:      `${RSS_BASE}/headlines/section/topic/ENTERTAINMENT?hl=ja&gl=JP&ceid=JP:ja`,
  };

  const parseItem = (item) => {
    const raw = item.title || '';
    const m = raw.match(/^(.+)\s+-\s+([^-]+)$/);
    const title = (m ? m[1] : raw).trim();
    const source = ((m ? m[2] : (item.author || 'NEWS'))).trim();
    const link = item.link || '#';
    const date = item.pubDate ? new Date(item.pubDate) : null;
    return { title, source, link, date };
  };

  const fetchFeed = async (url) => {
    const res = await fetch(PROXY + encodeURIComponent(url));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return (data.items || []).map(parseItem);
  };

  const timeAgo = (date) => {
    if (!date || isNaN(date.getTime())) return '';
    const diff = Date.now() - date.getTime();
    if (diff < 0) return '';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'たった今';
    if (mins < 60) return `${mins}分前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}時間前`;
    return `${Math.floor(hours / 24)}日前`;
  };

  const linkA = (it) =>
    `<a href="${escapeHtml(it.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.title)}</a>`;

  // ---------- Renderers per section ----------

  const renderToday = (items) => {
    const list = document.getElementById('todayNewsList');
    const updated = document.getElementById('todayUpdatedAt');
    if (!list) return;
    if (!items.length) {
      list.innerHTML = '<li class="today-loading">本日のニュースを取得できませんでした。</li>';
      return;
    }
    list.innerHTML = items.slice(0, 8).map((it, i) => {
      const t = it.date
        ? `${String(it.date.getHours()).padStart(2, '0')}:${String(it.date.getMinutes()).padStart(2, '0')}`
        : '';
      return `
        <li class="today-item">
          <span class="t-num">${String(i + 1).padStart(2, '0')}</span>
          <div class="t-body">
            <span class="t-source">${escapeHtml(it.source)}</span>
            <a class="t-headline" href="${escapeHtml(it.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.title)}</a>
          </div>
          <span class="t-time">${t}</span>
        </li>
      `;
    }).join('');
    if (updated) {
      const now = new Date();
      updated.textContent = `UPDATED: ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
  };

  const renderTopStory = (items) => {
    const ts = document.querySelector('.top-story .ts-text');
    if (!ts || !items.length) return;
    const top = items[0];
    const h2 = ts.querySelector('h2');
    if (h2) h2.innerHTML = linkA(top);
    const lede = ts.querySelector('.lede');
    if (lede) lede.textContent = `${top.source}・${timeAgo(top.date)}配信。— 国内の主要見出しを以下に並べます。`;

    const voices = ts.querySelector('.voices');
    if (!voices) return;
    const cls = ['positive', 'neutral', 'critical', 'global'];
    const cards = items.slice(1, 11).map((it, i) => `
      <article class="voice ${cls[i % 4]}">
        <header>
          <span class="badge">${String(i + 1).padStart(2, '0')}</span>
          <span class="source">${escapeHtml(it.source)}</span>
        </header>
        <h4>${linkA(it)}</h4>
        <p>${escapeHtml(timeAgo(it.date))}に配信</p>
      </article>
    `).join('');
    voices.innerHTML = `<h3 class="voices-title">同じ時刻、十の見出し</h3>${cards}`;
  };

  const renderThreeCol = (selector, items, baseNum) => {
    const cols = document.querySelector(selector);
    if (!cols || !items.length) return;
    cols.innerHTML = items.slice(0, 3).map((it, i) => `
      <article class="col">
        <span class="num">${String(baseNum + i).padStart(2, '0')}</span>
        <span class="src">${escapeHtml(it.source)}</span>
        <h3>${linkA(it)}</h3>
        <p>${escapeHtml(timeAgo(it.date))}に配信</p>
      </article>
    `).join('');
  };

  const renderCulture = (items) => {
    if (!items.length) return;
    const ul = document.querySelector('.wf-list');
    if (ul) {
      ul.innerHTML = items.slice(0, 4).map((it) => `
        <li><span>${escapeHtml(it.source)}</span>${linkA(it)}</li>
      `).join('');
    }
    const h2 = document.querySelector('.wf-text h2');
    if (h2) h2.innerHTML = linkA(items[0]);
    const p = document.querySelector('.wf-text > p.reveal');
    if (p) p.textContent = `${items[0].source}・${timeAgo(items[0].date)}配信。文化・エンタメ分野の主要見出しを以下にまとめます。`;
  };

  const renderWorld = (items) => {
    const list = document.querySelector('.world-list');
    if (!list || !items.length) return;
    const groups = [];
    for (let i = 0; i < 3; i++) {
      const g = items.slice(i * 4, i * 4 + 4);
      if (!g.length) break;
      groups.push(g);
    }
    list.innerHTML = groups.map((g, i) => {
      const main = g[0];
      const subs = g.slice(1, 4).map((s) => `
        <div><span class="src">${escapeHtml(s.source)}</span><p>${linkA(s)}</p></div>
      `).join('');
      return `
        <article class="world-item">
          <span class="w-num">${String(9 + i).padStart(2, '0')}</span>
          <div class="w-body">
            <h3>${linkA(main)}</h3>
            <div class="w-sources">${subs}</div>
          </div>
        </article>
      `;
    }).join('');
  };

  const renderCompare = (feeds) => {
    const map = {
      t1: { label: '政治', items: feeds.nation },
      t2: { label: '経済', items: feeds.business },
      t3: { label: 'テック', items: feeds.tech },
      t4: { label: '世界', items: feeds.world },
    };
    Object.entries(map).forEach(([key, { label, items }]) => {
      const tab = document.querySelector(`.tab[data-tab="${key}"]`);
      if (tab) tab.textContent = label;
      const panel = document.querySelector(`.panel[data-panel="${key}"]`);
      if (!panel || !items || !items.length) return;
      panel.innerHTML = items.slice(0, 3).map((it) => `
        <div class="panel-col">
          <span class="src">${escapeHtml(it.source)}</span>
          <h4>${linkA(it)}</h4>
          <p>${escapeHtml(timeAgo(it.date))}に配信</p>
        </div>
      `).join('');
    });
  };

  const renderArchive = (feeds) => {
    const ul = document.querySelector('.timeline');
    if (!ul) return;
    const order = [
      { items: feeds.nation,   cat: 'POLITICS' },
      { items: feeds.business, cat: 'ECONOMY' },
      { items: feeds.tech,     cat: 'TECH' },
      { items: feeds.ent,      cat: 'CULTURE' },
      { items: feeds.world,    cat: 'WORLD' },
      { items: feeds.top,      cat: 'TODAY' },
    ];
    const rows = order
      .map(o => o.items && o.items[0] ? { ...o.items[0], cat: o.cat } : null)
      .filter(Boolean);
    if (!rows.length) return;
    ul.innerHTML = rows.map((it) => {
      const d = it.date
        ? `${String(it.date.getMonth() + 1).padStart(2, '0')}.${String(it.date.getDate()).padStart(2, '0')}`
        : '—';
      return `
        <li>
          <span class="t-date">${d}</span>
          <span class="t-cat">${escapeHtml(it.cat)}</span>
          <span class="t-text">${linkA(it)}</span>
          <span class="t-src">${escapeHtml(it.source)}</span>
        </li>
      `;
    }).join('');
  };

  // ---------- Master loader ----------
  (async () => {
    try {
      const [top, nation, world, business, tech, ent] = await Promise.all([
        fetchFeed(FEEDS.top).catch(() => []),
        fetchFeed(FEEDS.nation).catch(() => []),
        fetchFeed(FEEDS.world).catch(() => []),
        fetchFeed(FEEDS.business).catch(() => []),
        fetchFeed(FEEDS.tech).catch(() => []),
        fetchFeed(FEEDS.ent).catch(() => []),
      ]);
      renderToday(top);
      renderTopStory(nation);
      renderThreeCol('#economy .three-col', business, 2);
      renderThreeCol('#tech .three-col', tech, 6);
      renderCulture(ent);
      renderWorld(world);
      renderCompare({ nation, business, tech, world });
      renderArchive({ top, nation, world, business, tech, ent });
    } catch (err) {
      const list = document.getElementById('todayNewsList');
      if (list) list.innerHTML =
        `<li class="today-loading">ニュースの読み込みに失敗しました。<small>${escapeHtml(err.message || err)}</small></li>`;
    }
  })();

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
