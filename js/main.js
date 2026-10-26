/* ==========================================================================
   WALEED MALIK — main.js
   One requestAnimationFrame loop (gsap.ticker) drives Lenis, ScrollTrigger,
   the WebGL scene, the cursor and the scroll-linked UI.
   Test switches:  ?no3d  (no WebGL)   ?quality=full  (never auto-downgrade)
   ========================================================================== */
(function () {
  'use strict';
  var CFG = window.WM_CONFIG || {}, TXT = window.WM_CONTENT || {};
  var ART = CFG.artworks || [], CATS = CFG.categories || [];
  var ART_BY_ID = {}; ART.forEach(function (a) { ART_BY_ID[a.id] = a; });
  var CAT = {}; CATS.forEach(function (c, i) { c.i = i; CAT[c.key] = c; });
  var CAT_NAME = {}; CATS.forEach(function (c) { CAT_NAME[c.key] = c.name; });
  // service cards: every discipline has its own visual (see svcVisual below). Only "Book Cover Design" is a book:
  // a real 3D hardcover (WebGL) on desktop, a CSS book elsewhere. Pages = first 3 artworks of the category.
  // cover: the book's cover art · pages: used when the category has none of Waleed's own artworks to show
  var SVC_BOOKS = { cover: { cover: 'children-06', cloth: 0x1d2a52, pages: ['children-06'] } };
  // the 3D hero book: cover art + pages (keep in step with BOOK in tools/make-textures.py).
  // Mostly children's book spreads and comics; every spread = story text on the LEFT page, illustration on the RIGHT page.
  // Phones show the first 6 pages, desktops all 9 (see three.pagesMobile / pagesDesktop in config.js).
  var BOOK = { cover: 'children-06', pages: ['children-01', 'comic-01', 'children-02', 'character-06', 'children-05', 'comic-05', 'children-03', 'sketch-04', 'children-04'] };

  var root = document.documentElement, Q = new URLSearchParams(location.search);
  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches, NO3D = Q.has('no3d'), QFULL = Q.get('quality') === 'full';
  var MOBILE = matchMedia('(max-width: 980px), (pointer: coarse)').matches, FINE = matchMedia('(pointer: fine)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  // ONE throw-away WebGL probe (was two): is WebGL there, and is it software rendering (no graphics card)?
  // Software rendering keeps the glass tint but drops the live blur (very expensive without a GPU).
  // When 3D will run, the probe is made directly on the page's canvas with the renderer's settings and handed to
  // three.js, so the browser creates only ONE WebGL context in total (creating one costs 0.2–0.9 s on weak machines).
  var GLOK = false, SOFTWARE = false, GLCTX = null;
  function probeGL(want3D) { try {
    var c = want3D ? document.getElementById('gl') : document.createElement('canvas');
    var attrs = { alpha: true, antialias: false, stencil: false, depth: true, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    var g = window.WebGLRenderingContext && (c.getContext('webgl2', attrs) || c.getContext('webgl', attrs)); if (!g) return; GLOK = true;
    var d = g.getExtension('WEBGL_debug_renderer_info');
    if (d && /swiftshader|llvmpipe|software|basic render/i.test(g.getParameter(d.UNMASKED_RENDERER_WEBGL)) && !QFULL) { SOFTWARE = true; root.classList.add('no-blur', 'static-about'); }
    if (want3D) GLCTX = g; else { var lose = g.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); }
  } catch (e) {} }
  // with 3D off (?no3d / reduced motion) the probe is only needed to drop the glass blur on machines without a GPU,
  // so it runs a moment after start-up instead of blocking the first paint
  if (!REDUCE && !NO3D) probeGL(true); else setTimeout(function () { probeGL(false); }, 2500);
  var USE3D = !REDUCE && !NO3D && GLOK;
  root.classList.toggle('static-book', !USE3D);
  root.classList.toggle('static-bg', !USE3D);
  root.classList.toggle('flat-process', REDUCE || MOBILE || !hasGsap);
  if (CFG.showPlaceholderTags === false) root.classList.add('no-ph');

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rich(s) { return esc(s).replace(/\*(.+?)\*/g, '<em class="gold">$1</em>'); }
  function set(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }
  function txt(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }
  function artsOf(cat) { return cat === 'all' ? ART.slice() : ART.filter(function (a) { return a.cat === cat; }); }
  // Waleed's own work only (items with a "credit" are by other artists: grid + viewer only)
  function ownOf(cat) { return artsOf(cat).filter(function (a) { return !a.credit; }); }
  // examples for a service card / drawer: Waleed's own work in that category, or the fallback pages set in SVC_BOOKS
  function examplesOf(cat) { var l = ownOf(cat); if (!l.length && SVC_BOOKS[cat] && SVC_BOOKS[cat].pages) l = SVC_BOOKS[cat].pages.map(function (id) { return ART_BY_ID[id]; }).filter(Boolean); return l; }
  var PH = '<span class="ph-tag">Placeholder</span>', PH_SAMPLE = '<span class="ph-tag">Sample</span>';
  // responsive artwork: WebP (420 / 760 px) with a JPG fallback for browsers without WebP
  function pic(a, sizes, cls, eager) {
    return '<picture><source type="image/webp" srcset="images/thumbs-sm/' + a.id + '.webp 420w, images/thumbs/' + a.id + '.webp 760w" sizes="' + sizes + '">' +
      '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="images/art/' + a.id + '.jpg" alt="' + esc(a.alt) + '" width="' + a.w + '" height="' + a.h + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async"></picture>';
  }
  // small decorative image for the service-card visuals
  function sImg(id, cls) { var a = ART_BY_ID[id] || { w: 300, h: 300 }; return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="images/thumbs-sm/' + id + '.webp" alt="" width="' + a.w + '" height="' + a.h + '" loading="lazy" decoding="async">'; }
  // the picture on top of each service card: one visual per discipline (a book only for Book Cover Design)
  function svcVisual(key, c) {
    var inner = {
      children: '<div class="sv-story"><div class="sv-story__stack"></div><div class="sv-story__pg sv-story__pg--l">' + sImg('children-02') + '</div><div class="sv-story__pg sv-story__pg--r">' + sImg('children-02') + '</div><i class="sv-story__ribbon"></i></div>',
      comic: '<div class="sv-comic"><div class="sv-comic__page"><span class="sv-comic__p sv-comic__p--a">' + sImg('comic-01') + '</span><span class="sv-comic__p sv-comic__p--b">' + sImg('comic-03') + '</span><span class="sv-comic__p sv-comic__p--c">' + sImg('comic-05') + '</span></div><b class="sv-comic__pow">POW!</b><i class="sv-comic__bubble">Wow!</i></div>',
      character: '<div class="sv-char"><i class="sv-char__glow"></i><i class="sv-char__base"></i><div class="sv-char__spin"><span class="sv-char__card sv-char__card--l">' + sImg('character-04') + '</span><span class="sv-char__card sv-char__card--r">' + sImg('character-01') + '</span><span class="sv-char__card sv-char__card--c">' + sImg('character-06') + '</span></div></div>',
      cover: '<div class="svc-book"><div class="svc-book__cover">' + sImg('children-06') + '<b>' + esc(c.short) + '</b></div></div>',
      map: '<div class="sv-map"><div class="sv-map__sheet">' + [0, 1, 2, 3].map(function (i) { return '<span class="sv-map__fold" style="--i:' + i + '"></span>'; }).join('') + '</div><svg class="sv-map__pin" viewBox="0 0 24 34"><path d="M12 33C12 33 2 19.5 2 12a10 10 0 0 1 20 0c0 7.5-10 21-10 21z"/><circle cx="12" cy="12" r="4"/></svg><i class="sv-map__pinshadow"></i></div>',
      sketch: '<div class="sv-sketch"><div class="sv-sketch__book"><div class="sv-sketch__page">' + sImg('sketch-04') + '</div><i class="sv-sketch__rings"></i></div>' +
        '<svg class="sv-sketch__pencil" viewBox="0 0 200 22"><path class="pe-wood" d="M28 2 L170 2 L170 20 L28 20 Z"/><path class="pe-band" d="M170 2 L182 2 L182 20 L170 20 Z"/><path class="pe-eraser" d="M182 2 L194 2 Q198 2 198 6 L198 16 Q198 20 194 20 L182 20 Z"/><path class="pe-tip" d="M28 2 L4 11 L28 20 Z"/><path class="pe-lead" d="M10 8.8 L4 11 L10 13.2 Z"/><path class="pe-line" d="M28 11 L170 11"/></svg></div>',
      handdrawn: '<div class="sv-paint"><i class="sv-paint__wash sv-paint__wash--a"></i><i class="sv-paint__wash sv-paint__wash--b"></i><div class="sv-paint__paper">' + sImg('handdrawn-02') + '</div>' +
        '<svg class="sv-paint__palette" viewBox="0 0 120 80"><path class="pa-board" d="M60 4C28 4 4 20 4 40s20 36 52 36c10 0 12-8 8-14s0-12 10-12c20 0 42-4 42-22S92 4 60 4z"/><circle cx="30" cy="26" r="8" fill="#3f7cc2"/><circle cx="54" cy="18" r="8" fill="#e2564b"/><circle cx="80" cy="20" r="8" fill="#f0c04a"/><circle cx="24" cy="50" r="8" fill="#5aa36a"/><circle cx="44" cy="62" r="7" fill="#9b5fc0"/><circle cx="62" cy="40" r="6" fill="#2a2a33"/></svg>' +
        '<svg class="sv-paint__brush" viewBox="0 0 140 16"><path class="br-handle" d="M44 5 L136 6.5 Q139 8 136 9.5 L44 11 Z"/><path class="br-ferrule" d="M30 4 L46 4.5 L46 11.5 L30 12 Z"/><path class="br-tip" d="M30 4 Q12 5 2 8 Q12 11 30 12 Z"/></svg></div>',
      wrap: '<div class="sv-van"><div class="sv-van__studio"></div><i class="sv-van__floor"></i><div class="sv-van__car">' + sImg('wrap-01') + '</div></div>'
    }[key] || '';
    return '<div class="sv sv--' + key + '" aria-hidden="true">' + inner + '</div>';
  }
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.async = false; s.onload = res; s.onerror = function () { rej(new Error('Could not load ' + src)); }; document.body.appendChild(s); }); }

  /* ======================================================================
     CONTENT
     ====================================================================== */
  (function render() {
    var navHtml = (TXT.nav || []).map(function (n) { return '<a href="#' + n.id + '">' + esc(n.label) + '</a>'; }).join('');
    set('navLinks', navHtml + '<span class="nav__ind" id="navInd" aria-hidden="true"></span>');
    set('menuLinks', (TXT.nav || []).map(function (n, i) { return '<a href="#' + n.id + '"><i>' + pad(i) + '</i>' + esc(n.label) + '</a>'; }).join(''));
    set('footNav', navHtml);
    set('footCats', CATS.map(function (c) { return artsOf(c.key).length ? '<a href="#work" data-filter="' + c.key + '">' + esc(c.name) + '</a>' : '<a href="#services">' + esc(c.name) + '</a>'; }).join(''));   // a discipline with no artwork yet links to Services
    txt('footerTag', (TXT.footer || {}).tagline || '');

    var H = TXT.hero || {};
    txt('heroEyebrow', H.eyebrow); txt('hero-name', H.name); txt('heroPos', H.positioning); txt('heroIntro', H.intro);
    set('ctaWork', esc(H.ctaWork) + ' <span aria-hidden="true">↓</span>'); txt('ctaHire', H.ctaHire);
    set('heroFacts', (H.facts || []).map(function (f) { return '<div><dt>' + esc(f.label) + '</dt><dd>' + esc(f.auto ? String(ownOf('all').length) : f.value) + '</dd></div>'; }).join(''));

    var A = TXT.about || {};
    txt('aboutLabel', A.label); set('about-title', rich(A.title)); txt('aboutSub', A.sub);
    set('aboutBio', (A.bio || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join(''));
    set('knownFor', (A.knownFor || []).map(function (k) { return '<li><b>' + esc(k.title) + '</b><span>' + esc(k.text) + '</span></li>'; }).join(''));
    txt('howTitle', A.howTitle); set('howList', (A.how || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join(''));
    txt('toolsTitle', A.toolsTitle); set('toolsList', (A.tools || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join(''));

    var SV = TXT.services || { items: {} };
    txt('servicesLabel', SV.label); set('services-title', rich(SV.title)); txt('servicesSub', SV.sub);
    set('svcGrid', CATS.map(function (c, i) {
      var s = SV.items[c.key] || {}, a = artsOf(c.key)[0];
      return '<div class="svc' + (SVC_BOOKS[c.key] ? ' svc--book' : '') + '" tabindex="0" role="button" data-cat="' + c.key + '" aria-label="' + esc(c.name) + ': see details and examples" data-cursor="Open">' +
        '<div class="svc__thumb">' + svcVisual(c.key, c) + '<span class="svc__num">' + pad(i + 1) + '</span></div>' +
        (function () { var l = examplesOf(c.key).slice(0, 4), half = []; if (!l.length) return ''; while (half.length < 5) half = half.concat(l); var imgs = half.concat(half).map(function (x) { return '<img src="images/thumbs-sm/' + x.id + '.webp" alt="" loading="lazy" decoding="async" width="' + Math.round(46 * x.w / x.h) + '" height="46">'; }).join(''); return '<div class="svc__strip" aria-hidden="true"><div class="svc__track">' + imgs + '</div></div>'; })() +
        '<div class="svc__body"><h3>' + esc(c.name) + '</h3><p class="svc__value">' + esc(s.value) + '</p>' +
        '<p class="svc__k">Who it’s for</p><p class="svc__who">' + esc(s.who) + '</p>' +
        '<p class="svc__k">What you get</p><ul>' + (s.get || []).map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul>' +
        '<div class="svc__foot">' +
        '<a class="text-link magnetic" href="#" data-upwork target="_blank" rel="noopener" data-cursor="Upwork">' + esc(SV.cta) + ' ↗</a></div></div></div>';
    }).join(''));

    var W = TXT.work || {};
    txt('workLabel', W.label); set('work-title', rich(W.title)); txt('workSub', W.sub); txt('featuredLabel', W.featuredLabel); txt('gridLabel', W.gridLabel);
    set('featured', (W.featured || []).map(function (f) {
      var a = ART_BY_ID[f.img] || {};
      return '<article class="feat"><button type="button" class="feat__media" data-open="' + esc(f.img) + '" data-cursor="View" aria-label="Open ' + esc(a.title) + '">' +
        pic(a, '(max-width: 980px) 92vw, 760px') + '<span class="reveal-mask"></span></button>' +
        '<div class="feat__body glass"><div class="feat__top"><p class="label" style="margin:0">' + esc(f.tag) + '</p>' + (f.placeholder ? PH : '') + '</div>' +
        '<h4>' + esc(f.title) + '</h4><dl><div><dt>Challenge</dt><dd>' + esc(f.challenge) + '</dd></div><div><dt>Approach</dt><dd>' + esc(f.approach) + '</dd></div><div><dt>Result</dt><dd>' + esc(f.result) + '</dd></div></dl>' +
        '<a class="text-link" href="#" data-upwork target="_blank" rel="noopener">Start a similar project ↗</a></div></article>';
    }).join(''));
    set('filters', '<button type="button" class="chip is-on" data-cat="all" aria-pressed="true">All <small>' + ART.length + '</small></button>' +
      CATS.filter(function (c) { return artsOf(c.key).length; }).map(function (c) { return '<button type="button" class="chip" data-cat="' + c.key + '" aria-pressed="false">' + esc(c.short) + ' <small>' + artsOf(c.key).length + '</small></button>'; }).join(''));
    // grid in discipline order
    set('masonry', CATS.map(function (c) { return artsOf(c.key); }).reduce(function (a, b) { return a.concat(b); }, []).map(function (a) {
      return '<button type="button" class="tile" data-id="' + a.id + '" data-cat="' + a.cat + '" data-cursor="View">' +
        '<span class="tile__img">' + pic(a, '(max-width: 640px) 92vw, (max-width: 980px) 46vw, 400px') + '<span class="reveal-mask"></span>' +
        '<span class="tile__over" aria-hidden="true"><span class="tile__cat">' + esc(CAT_NAME[a.cat]) + '</span><b>' + esc(a.title) + '</b><em>' + esc(a.brief) + '</em><i>View case →</i></span></span>' +
        '<span class="tile__meta"><span class="tile__cat">' + esc(CAT_NAME[a.cat]) + '</span><span class="tile__title">' + esc(a.title) + '</span>' + (a.credit ? '<span class="tile__credit">' + esc(a.credit) + '</span>' : '') + '<span class="tile__brief">' + esc(a.brief) + '</span></span></button>';
    }).join(''));

    var P = TXT.process || { steps: [] };
    txt('processLabel', P.label); set('process-title', rich(P.title)); txt('processSub', P.sub);
    set('processTrack', P.steps.map(function (s) {
      var a = ART_BY_ID[s.img] || {};
      return '<li class="pstep"><div class="pstep__img pstep__img--' + s.crop + '"><img src="images/thumbs/' + s.img + '.webp" alt="' + esc(s.title + ': ' + (a.alt || '')) + '" loading="lazy" decoding="async"></div>' +
        '<div class="pstep__body"><span class="pstep__n">' + esc(s.n) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></div></li>';
    }).join('') + (function () {
      var C = P.compare; if (!C) return ''; var s0 = C.sets[0];
      return '<li class="pstep pcompare"><div class="cmp" id="cmp" data-cursor="Drag" style="--p:50%">' +
        '<img class="cmp__after" id="cmpAfter" src="images/compare/' + s0.key + '-after.webp" alt="' + esc(s0.altAfter) + '" width="370" height="560" loading="lazy" decoding="async">' +
        '<div class="cmp__before"><img id="cmpBefore" src="images/compare/' + s0.key + '-before.webp" alt="' + esc(s0.altBefore) + '" width="370" height="560" loading="lazy" decoding="async"></div>' +
        '<div class="cmp__handle" aria-hidden="true"><span>⇆</span></div>' +
        '<span class="cmp__tag cmp__tag--l" id="cmpTagL">' + esc(s0.before) + '</span><span class="cmp__tag cmp__tag--r" id="cmpTagR">' + esc(s0.after) + '</span>' +
        '<input class="cmp__range" id="cmpRange" type="range" min="0" max="100" value="50" aria-label="Compare ' + esc(s0.before) + ' and ' + esc(s0.after) + ': use the arrow keys">' +
        '</div><div class="pstep__body"><span class="pstep__n">↔</span><h3>' + esc(C.title) + '</h3><p>' + esc(C.text) + '</p>' +
        '<div class="cmp__sets" role="group" aria-label="Choose an example">' + C.sets.map(function (x, i) { return '<button type="button" class="chip' + (i ? '' : ' is-on') + '" data-cmp="' + i + '" aria-pressed="' + (i ? 'false' : 'true') + '">' + esc(x.label) + '</button>'; }).join('') + '</div></div></li>';
    })());

    var SK = TXT.skills || { groups: [] };
    txt('skillsLabel', SK.label); set('skills-title', rich(SK.title)); txt('skillsSub', SK.sub);
    set('skillGroups', SK.groups.map(function (g) { return '<div class="glass"><h3>' + esc(g.name) + '</h3><ul class="chips">' + g.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>'; }).join(''));

    var TS = TXT.testimonials || { items: [] };
    txt('tLabel', TS.label); set('t-title', rich(TS.title)); txt('tSub', TS.sub);
    set('tGrid', TS.items.map(function (t) {
      var r = clamp(Math.round(+t.rating || 5), 1, 5), stars = '<p class="t-stars" role="img" aria-label="Rated ' + r + ' out of 5 stars">' + '★★★★★'.slice(0, r) + '<span>' + '★★★★★'.slice(r) + '</span></p>';
      return (t.placeholder ? '<!-- SAMPLE – replace with real client review before launch -->' : '') +
        '<figure class="t-card glass">' + stars + '<blockquote>' + esc(t.quote) + '</blockquote><figcaption><span><b>' + esc(t.name) + (t.role ? ' <em>· ' + esc(t.role) + '</em>' : '') + '</b>' + esc(t.project) + '</span>' + (t.placeholder ? PH_SAMPLE : '') + '</figcaption></figure>';
    }).join(''));

    var F = TXT.faq || { items: [] };
    txt('faqLabel', F.label); set('faq-title', rich(F.title)); txt('faqSub', F.sub);
    set('faqList', F.items.map(function (f, i) {
      return '<div class="qa"><h3><button type="button" aria-expanded="false" aria-controls="qa' + i + '" id="qb' + i + '">' + esc(f.q) + '<i aria-hidden="true"></i></button></h3><div class="qa__a" id="qa' + i + '" role="region" aria-labelledby="qb' + i + '"><div><p>' + esc(f.a) + '</p></div></div></div>';
    }).join(''));

    var FA = F.aside;
    if (FA) set('faqAside', '<h3>' + esc(FA.title) + '</h3><p>' + esc(FA.text) + '</p><p class="svc__k">' + esc(FA.listTitle) + '</p><ul class="faq__check">' + FA.list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' +
      '<a class="btn btn--ghost btn--sm magnetic" href="#" data-upwork target="_blank" rel="noopener" data-cursor="Upwork">' + esc(FA.cta) + ' <span aria-hidden="true">↗</span></a>');

    var C = TXT.contact || {};
    txt('contactLabel', C.label); set('contact-title', rich(C.title)); txt('contactText', C.text); txt('contactCta', C.cta);
    txt('cAvail', C.availability); set('cResp', esc(C.response) + ' ' + PH); txt('cRate', C.rate);
  })();
  $$('[data-upwork]').forEach(function (a) { a.href = CFG.upwork; });
  // HEADSHOT SLOT (js/config.js → headshot): a real portrait replaces the About book
  var HEADSHOT = CFG.headshot || null;
  if (HEADSHOT) { var av = $('.about__visual'); if (av) av.innerHTML = '<figure class="headshot-frame"><img class="headshot" src="' + esc(HEADSHOT) + '" alt="Waleed Malik" width="800" height="1000" loading="lazy" decoding="async"><figcaption>Waleed Malik · Illustrator</figcaption></figure>'; }
  txt('year', String(new Date().getFullYear()));
  /* ---------- reviews slider: scroll-snap track, prev/next, dots, arrow keys, swipe (native) ---------- */
  (function () {
    var tr = $('#tGrid'), cards = $$('.t-card', tr), dotsEl = $('#tDots'), idx = 0; if (!tr || !cards.length) return;
    cards.forEach(function (c, i) { c.setAttribute('aria-label', 'Review ' + (i + 1) + ' of ' + cards.length); });
    function per() { var w = cards[0].getBoundingClientRect().width; return Math.max(1, Math.round(tr.clientWidth / Math.max(1, w))); }
    function pages() { return Math.max(1, cards.length - per() + 1); }
    function drawDots() { var n = pages(); dotsEl.innerHTML = Array.from({ length: n }, function (_, i) { return '<button type="button" data-t="' + i + '" aria-label="Show review ' + (i + 1) + '"></button>'; }).join(''); mark(); }
    function mark() { $$('button', dotsEl).forEach(function (d, i) { d.classList.toggle('is-on', i === idx); d.setAttribute('aria-current', i === idx ? 'true' : 'false'); }); var p = per(); txt('tCount', (idx + 1) + (p > 1 ? '–' + Math.min(cards.length, idx + p) : '') + ' / ' + cards.length); $('#tPrev').disabled = idx <= 0; $('#tNext').disabled = idx >= pages() - 1; }
    function go(i) { idx = clamp(i, 0, pages() - 1); tr.scrollTo({ left: cards[idx].offsetLeft - cards[0].offsetLeft, behavior: REDUCE ? 'auto' : 'smooth' }); mark(); }
    tr.addEventListener('scroll', function () { var x = tr.scrollLeft, best = 0, bd = 1e9; cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - cards[0].offsetLeft - x); if (d < bd) { bd = d; best = i; } }); best = Math.min(best, pages() - 1); if (best !== idx) { idx = best; mark(); } }, { passive: true });
    $('#tPrev').addEventListener('click', function () { go(idx - 1); }); $('#tNext').addEventListener('click', function () { go(idx + 1); });
    dotsEl.addEventListener('click', function (e) { var d = e.target.closest('[data-t]'); if (d) go(+d.dataset.t); });
    tr.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); } });
    (window.requestIdleCallback || function (f) { setTimeout(f, 200); })(function () { drawDots(); }, { timeout: 2500 }); var rt = 0; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { drawDots(); go(idx); }, 200); }, { passive: true });
  })();
  $$('.qa button').forEach(function (b) { b.addEventListener('click', function () { var qa = b.closest('.qa'), open = !qa.classList.contains('is-open'); qa.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open)); setTimeout(refreshSoft, 550); }); });

  /* ======================================================================
     LOADING SCREEN — a thin gold line fills as the page gets ready, then the screen fades out.
     It never stays longer than LD_MAX ms: after that the page is shown and the 3D fades in when it is ready.
     ====================================================================== */
  var S = { scroll: window.scrollY || 0, px: 0, py: 0 };
  var loader = $('#loader'), ldBar = $('#ldBar'), LD_MAX = (CFG.loader && +CFG.loader.maxMs) || 3000;   // change the number in js/config.js → loader.maxMs
  var tasks = {}, totalW = 0, doneW = 0, finished = false;
  function task(n, w) { tasks[n] = { w: w, done: false }; totalW += w; }
  function setBar(p) { if (ldBar) ldBar.style.transform = 'scaleX(' + Math.max(0.06, Math.min(1, p)).toFixed(3) + ')'; }
  function maybeReveal(force) {
    if (finished || (!force && doneW < totalW)) return;
    finished = true; setBar(1); setTimeout(revealPage, REDUCE ? 0 : 150);
  }
  function done(n) { var t = tasks[n]; if (t && !t.done) { t.done = true; doneW += t.w; setBar(doneW / totalW); maybeReveal(false); } }
  // the loading screen waits for the fonts and the 3D book (built behind it), but never longer than LD_MAX
  task('fonts', 2); task('libraries', 1);
  if (USE3D) { task('three', 3); task('book', 4); task('scene', 3); task('tune', 2); }
  // safety timer: the loading screen always goes away within LD_MAX ms of the page starting to load
  setTimeout(function () { maybeReveal(true); }, Math.max(200, LD_MAX - (window.performance && performance.now ? performance.now() : 0)));
  var fontsP = document.fonts ? Promise.race([Promise.all([document.fonts.load('400 40px Fraunces'), document.fonts.load('600 40px Fraunces'), document.fonts.load('600 16px Manrope')]), new Promise(function (r) { setTimeout(r, 4000); })]) : Promise.resolve();
  // the page is shown (still behind the loading screen) as soon as the fonts are in: no font-swap shift, and the hero text paints early
  fontsP.then(function () { done('fonts'); root.classList.add('fonts-ready'); }, function () { done('fonts'); root.classList.add('fonts-ready'); });
  done('libraries');
  setTimeout(function () { Object.keys(tasks).forEach(done); }, 15000);

  /* ======================================================================
     LENIS + ONE LOOP
     ====================================================================== */
  var lenis = null;
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (!REDUCE && window.Lenis && hasGsap) { lenis = new Lenis({ lerp: (CFG.motion && CFG.motion.smoothScroll) || 0.09, smoothWheel: true }); lenis.stop(); lenis.on('scroll', ScrollTrigger.update); }
  function scrollToY(y, immediate) { if (lenis) lenis.scrollTo(y, { duration: immediate ? 0 : 1.3, immediate: !!immediate, force: true }); else window.scrollTo({ top: y, behavior: REDUCE || immediate ? 'auto' : 'smooth' }); }
  function offsetTop(el) { return el.getBoundingClientRect().top + (window.scrollY || 0); }
  // where a nav link should land: the section's top sits just under the fixed nav (pinned sections start at their own top)
  function anchorY(t) { if (t.id === 'home') return 0; var pinned = t.id === 'process' && !root.classList.contains('flat-process'); var ni = document.querySelector('.nav__inner'), nh = ni ? ni.offsetHeight + 17 : 0;   /* height of the nav once it turns solid (8px padding top + bottom + 1px border) */ return Math.max(0, offsetTop(t) - (pinned ? 0 : nh)); }
  var tickers = [], lastT = 0;
  function onTick(f) { tickers.push(f); }
  function loop(time) {
    var t = hasGsap ? time : time / 1000, dt = lastT ? Math.min(0.1, t - lastT) : 0.016; lastT = t;
    if (lenis) lenis.raf(t * 1000);
    S.scroll = lenis ? lenis.animatedScroll : (window.scrollY || 0);
    for (var i = 0; i < tickers.length; i++) tickers[i](dt, t);
  }
  if (hasGsap) { gsap.ticker.add(loop); gsap.ticker.lagSmoothing(0); } else (function raf(ts) { loop(ts); requestAnimationFrame(raf); })(0);

  /* ---------- nav: progress, glass, active section + gold indicator ---------- */
  var bar = $('#progress'), nav = $('#nav'), navLinks = $$('#navLinks a'), navInd = $('#navInd'), docH = 1, lastBar = -1, solid = false, activeNav = -1, navTops = [];
  function measureDoc() { docH = Math.max(1, document.documentElement.scrollHeight - innerHeight); }
  function measureNav() { navTops = navLinks.map(function (a) { var el = document.getElementById(a.getAttribute('href').slice(1)); return el ? offsetTop(el) : 0; }); placeInd(); }
  function placeInd() { var a = navLinks[activeNav]; if (!a || !a.offsetWidth) { navInd.style.setProperty('--iw', 0); return; } navInd.style.setProperty('--ix', a.offsetLeft + 'px'); navInd.style.setProperty('--iw', (a.offsetWidth / 100).toFixed(3)); }
  onTick(function () {
    var p = clamp(S.scroll / docH, 0, 1); if (Math.abs(p - lastBar) > 0.0005) { lastBar = p; bar.style.transform = 'scaleX(' + p + ')'; }
    var sd = S.scroll > 30; if (sd !== solid) { solid = sd; nav.classList.toggle('is-solid', sd); }
    var probe = S.scroll + innerHeight * 0.35, idx = 0, best = -1;
    for (var i = 0; i < navTops.length; i++) if (navTops[i] <= probe && navTops[i] > best) { best = navTops[i]; idx = i; }
    if (idx !== activeNav) { if (!REDUCE) { var sid = (navLinks[idx].getAttribute('href') || '#home').slice(1); root.setAttribute('data-sec', sid); } activeNav = idx; navLinks.forEach(function (a, k) { a.classList.toggle('is-active', k === idx); if (k === idx) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); placeInd(); }
  });
  var burger = $('#burger'), menu = $('#menu'), menuOpen = false;
  // full-screen mobile menu: animated open/close (links slide in one after another), focus trap, Esc
  var menuT = 0;
  function setMenu(o) {
    menuOpen = o; burger.setAttribute('aria-expanded', String(o)); burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); root.classList.toggle('menu-open', o);
    root.style.overflow = o ? 'hidden' : ''; if (lenis) { if (o) lenis.stop(); else lenis.start(); }
    clearTimeout(menuT);
    if (o) { menu.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); }); var f = $('a', menu); if (f) setTimeout(function () { f.focus(); }, REDUCE ? 0 : 120); }
    else { menu.classList.remove('is-open'); menuT = setTimeout(function () { menu.hidden = true; }, REDUCE ? 0 : 450); }
  }
  document.addEventListener('keydown', function (e) {
    if (!menuOpen || e.key !== 'Tab') return;
    var f = [burger].concat($$('a, button', menu)), i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === f.length - 1 || i < 0)) { e.preventDefault(); f[0].focus(); }
  });
  burger.addEventListener('click', function () { setMenu(!menuOpen); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); } });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var target = document.getElementById(id.slice(1)); if (!target) return;
    e.preventDefault();
    if (a.dataset.filter) setFilter(a.dataset.filter);
    scrollToY(anchorY(target));
    if (!a.dataset.filter && history.replaceState) history.replaceState(null, '', id === '#work' && curFilter !== 'all' ? '#work/' + curFilter : id);
    var fe = target.querySelector('h1, h2') || target; fe.setAttribute('tabindex', '-1'); setTimeout(function () { fe.focus({ preventScroll: true }); }, lenis ? 1000 : 60);
  });

  /* ======================================================================
     THE BOOK — scroll position is the single source of truth while the hero
     is pinned; buttons, clicks, keys and swipes scroll to the matching page.
     ====================================================================== */
  var hero = $('#home'), heroStage = $('#heroBook'), cap = $('#bookCap'), btnOpen = $('#bookOpen'), btnClose = $('#bookClose'), btnPrev = $('#bookPrev'), btnNext = $('#bookNext');
  var C3 = CFG.three || {}, LEAVES_MAX = Math.min(BOOK.pages.length - 1, MOBILE ? (C3.pagesMobile || 4) : (C3.pagesDesktop || 6));
  var SC = null, LEAVES = USE3D ? LEAVES_MAX : 0, PAGES = BOOK.pages.slice(0, LEAVES_MAX + 1), NP = USE3D ? LEAVES + 1 : PAGES.length;
  hero.style.setProperty('--pages', USE3D ? NP : 0);
  var bookPage = 0;
  function heroRange() { return Math.max(1, hero.offsetHeight - innerHeight); }
  function scrollForPage(k) { return offsetTop(hero) + (clamp(k, 0, NP) / NP) * heroRange(); }
  function showCaption(k) {
    bookPage = k;
    if (k <= 0) cap.innerHTML = '<b>Cover</b>A storybook portfolio';
    else { var a = ART_BY_ID[PAGES[k - 1]] || {}; cap.innerHTML = '<b>' + pad(k) + ' / ' + pad(NP) + '</b>' + esc(a.title); }
    btnOpen.hidden = k > 0; btnClose.hidden = k <= 0;
    btnPrev.disabled = k <= 0; btnNext.disabled = k >= NP;
  }
  function goPage(k) {
    if (USE3D && !SC && root.classList.contains('wait3d')) return;   // 3D book still getting ready (first moment after load)
    k = clamp(k, 0, NP);
    if (SC) scrollToY(scrollForPage(k) + (k ? 2 : 0));
    else staticPage(k);
  }
  btnOpen.addEventListener('click', function () { goPage(1); });
  btnClose.addEventListener('click', function () { goPage(0); });
  btnPrev.addEventListener('click', function () { goPage(Math.round(bookPage) - 1); });
  btnNext.addEventListener('click', function () { goPage(Math.round(bookPage) + 1); });
  heroStage.addEventListener('click', function () { goPage(Math.round(bookPage) + 1 > NP ? 0 : Math.round(bookPage) + 1); });
  function bookKeys(e) {
    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goPage(Math.round(bookPage) + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); goPage(Math.round(bookPage) - 1); }
    else if (e.key === 'Escape') { e.preventDefault(); goPage(0); }
  }
  heroStage.addEventListener('keydown', bookKeys);
  // arrow keys also turn pages while the hero is on screen (and nothing else has focus)
  document.addEventListener('keydown', function (e) {
    if (e.target !== document.body || !viewer.hidden || menuOpen) return;
    var r = hero.getBoundingClientRect(); if (r.bottom < innerHeight * 0.5 || r.top > innerHeight * 0.5) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') bookKeys(e);
  });
  var swX = null;
  heroStage.addEventListener('pointerdown', function (e) { swX = e.clientX; }, { passive: true });
  heroStage.addEventListener('pointerup', function (e) { if (swX === null) return; var d = e.clientX - swX; swX = null; if (Math.abs(d) > 40) { goPage(Math.round(bookPage) + (d < 0 ? 1 : -1)); heroStage.dataset.swiped = '1'; setTimeout(function () { heroStage.dataset.swiped = ''; }, 50); } }, { passive: true });
  heroStage.addEventListener('click', function (e) { if (heroStage.dataset.swiped) e.stopImmediatePropagation(); }, true);
  // static CSS book (reduced motion / no WebGL)
  var cssHero = $('#heroBook .cssbook');
  // the static spread mirrors the 3D one: story text on the left page, the illustration on the right page
  function staticPage(k) {
    var prev = bookPage;
    k = clamp(k, 0, PAGES.length); cssHero.classList.toggle('is-open', k > 0);
    if (k > 0) {
      var a = ART_BY_ID[PAGES[k - 1]], img = $('.cssbook__pic img', cssHero);
      img.src = 'images/thumbs/' + a.id + '.webp'; img.width = a.w; img.height = a.h; img.alt = a.alt;
      $('.cssbook__text', cssHero).innerHTML = '<small>' + esc(CAT_NAME[a.cat]) + '</small><i></i><b>' + esc(a.title) + '</b><em>' + esc(a.story || a.brief) + '</em><span>Plate ' + k + '</span>';
      // a quick page turn (forwards or backwards) when the spread changes
      if (!REDUCE && prev > 0 && k !== prev && cssHero.animate) $('.cssbook__spread', cssHero).animate([{ transform: 'rotateY(' + (k > prev ? -14 : 14) + 'deg) scale(.97)', opacity: 0.4 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.7,.1,1)' });
    }
    showCaption(k);
  }
  showCaption(0);
  // about book: opens the hero book
  if ($('#aboutBook')) $('#aboutBook').addEventListener('click', function () { if (SC) goPage(1); });

  function start3D() {
    performance.mark && performance.mark('wm-3d-start');
    // three.js and the first book textures download in parallel; scene.js needs three first
    var texP = loadScript('js/tex-book.js').then(function () { done('book'); });
    return Promise.all([loadScript('js/vendor/three.min.js').then(function () { return loadScript('js/scene.js'); }).then(function () { done('three'); }), texP])
      .then(function () {
        SC = window.WMScene.create({
          canvas: $('#gl'), glContext: GLCTX, cfg: CFG.three || {}, mobile: MOBILE, qualityFull: QFULL, startTier: Q.get('tier'), state: S,
          artMeta: ART_BY_ID, catName: CAT_NAME,
          blooms: $$('main > section').slice(1),
          sections: $$('main > section'), touch: !FINE,
          book: { cover: BOOK.cover, pages: BOOK.pages, instances: [
            { name: 'hero', section: hero, stage: heroStage, pages: true, onPage: function (k) { showCaption(k); } },
            { name: 'about', section: $('#about'), stage: $('#aboutBook'), pages: false, skip: !!HEADSHOT },
            { name: 'contact', section: $('#contact'), stage: $('#contactBook'), pages: false, spin: 'turn' }
          ].filter(function (b) { return !b.skip && b.stage && !(SOFTWARE && b.name !== 'hero'); }) },
          onWorldOff: function () { root.classList.add('static-bg'); },
          onQuality: function (q) { window.__wmQuality = q; root.setAttribute('data-tier', q); if (q === 'low' || q === 'software') { root.classList.add('no-blur'); svcOff(); } }
        });
        window.__wm = SC;
        return SC.init();
      })
      .then(function () {
        done('scene');
        // the 1-second benchmark picks a quality tier (the page may already be visible; the 3D canvas fades in when ready)
        SC.ready().then(function () {
          setTimeout(function () { root.classList.remove('wait3d'); }, 700);   // the CSS cover stays until the 3D book has faded in
          done('tune'); performance.mark && performance.mark('wm-3d-ready');
          // remaining book pages: download after start-up, then painted one per idle slot
          setTimeout(function () { loadScript('js/tex-book-2.js').then(function () { SC.fillSpreads(); }, function () {}).then(startSvcBooks); }, 400);
        });
        if ($('#aboutBook')) { $('#aboutBook').setAttribute('data-cursor', 'Open'); $('#aboutBook').style.cursor = 'pointer'; }
        onTick(function (dt, t) {
          // hero scroll → book page (continuous, so pages curl with the scroll)
          var p = clamp((S.scroll - offsetHeroTop) / heroRangeC, 0, 1);
          SC.setPage('hero', p * NP);
          // nothing to draw behind a full-screen viewer / drawer / menu
          S.paused = !viewer.hidden || !drawer.hidden || menuOpen;
          SC.frame(dt, t);
        });
        refreshLayout();
      })
      .catch(function (err) {
        if (window.console) console.info('[3D] off:', err && err.message);
        SC = null; root.classList.remove('wait3d'); root.classList.add('static-book', 'static-bg'); ['three', 'book', 'scene', 'tune'].forEach(done); refreshLayout();
      });
  }
  var offsetHeroTop = 0, heroRangeC = 1;
  function measureHero() { offsetHeroTop = offsetTop(hero); heroRangeC = heroRange(); }
  // 3D starts after the loading screen has gone (its set-up can keep a slow computer busy for a moment);
  // until then the hero shows the closed CSS book cover (class wait3d)
  var started3D = false;
  function begin3D() { if (started3D || !USE3D) return; started3D = true; start3D(); }
  if (USE3D) { root.classList.add('wait3d'); begin3D(); }   // the 3D book is built behind the loading screen

  /* ======================================================================
     SERVICES — tilt + glare, details drawer
     ====================================================================== */
  var drawer = $('#drawer'), drawerBody = $('#drawerBody'), drawerOpener = null, car = null, carDots = [], carIdx = 0;
  function openDrawer(key, opener) {
    var c = CAT[key], s = (TXT.services.items || {})[key] || {}, arts = examplesOf(key).slice(0, 3);
    drawerBody.innerHTML = '<p class="label">' + pad(c.i + 1) + ' · Service</p><h3 id="drawerTitle">' + esc(c.name) + '</h3><p>' + esc(s.value) + '</p>' +
      // related artworks: a swipeable scroll-snap carousel with dots and arrow keys; each opens the case viewer
      '<div class="drawer__car" id="drawerCar" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Examples — use the arrow keys">' + arts.map(function (a, k) { return '<button type="button" class="drawer__slide" data-open="' + a.id + '" data-cursor="View" aria-label="' + esc(a.title) + ' (' + (k + 1) + ' of ' + arts.length + ') — open full screen"><img src="images/thumbs/' + a.id + '.webp" alt="' + esc(a.alt) + '" width="' + a.w + '" height="' + a.h + '" loading="lazy" decoding="async"><span>' + esc(a.title) + '</span></button>'; }).join('') + '</div>' +
      (arts.length > 1 ? '<div class="drawer__nav"><button type="button" class="round-btn" data-car="-1" aria-label="Previous example">←</button><div class="drawer__dots">' + arts.map(function (a, k) { return '<button type="button" data-dot="' + k + '" aria-label="Show example ' + (k + 1) + '"></button>'; }).join('') + '</div><button type="button" class="round-btn" data-car="1" aria-label="Next example">→</button></div>' : '') +
      '<p class="svc__k">Who it’s for</p><p>' + esc(s.who) + '</p><p class="svc__k">What you get</p><ul class="known">' + (s.get || []).map(function (g) { return '<li><span>' + esc(g) + '</span></li>'; }).join('') + '</ul>' +
      '<a class="btn btn--gold drawer__cta" href="' + CFG.upwork + '" target="_blank" rel="noopener">' + esc(TXT.services.cta) + ' ↗</a>';
    car = $('#drawerCar'); carDots = $$('[data-dot]', drawerBody); carIdx = 0; setDot(0);
    car.addEventListener('scroll', function () { var k = Math.round(car.scrollLeft / Math.max(1, car.clientWidth)); if (k !== carIdx) setDot(k); }, { passive: true });
    drawerOpener = opener; drawer.hidden = false; root.style.overflow = 'hidden'; if (lenis) lenis.stop();
    $('.drawer__close', drawer).focus();
    if (hasGsap && !REDUCE) gsap.fromTo('.drawer__panel', { xPercent: 100 }, { xPercent: 0, duration: 0.6, ease: 'expo.out' });
  }
  function setDot(k) { carIdx = k; carDots.forEach(function (d, i) { d.classList.toggle('is-on', i === k); d.setAttribute('aria-current', i === k ? 'true' : 'false'); }); }
  function carGo(k) { if (!car) return; var n = car.children.length; k = clamp(k, 0, n - 1); car.scrollTo({ left: k * car.clientWidth, behavior: REDUCE ? 'auto' : 'smooth' }); setDot(k); }
  function closeDrawer() { drawer.hidden = true; root.style.overflow = ''; if (lenis) lenis.start(); if (drawerOpener) drawerOpener.focus({ preventScroll: true }); }
  drawer.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) { closeDrawer(); return; }
    var d = e.target.closest('[data-dot]'); if (d) { carGo(+d.dataset.dot); return; }
    var cb = e.target.closest('[data-car]'); if (cb) { carGo(carIdx + (+cb.dataset.car)); return; }
    var o = e.target.closest('[data-open]'); if (o) { var a = ART_BY_ID[o.dataset.open]; openViewer(artsOf(a.cat), a.id, o); }
  });
  // keyboard: Esc closes, ←/→ move the carousel, Tab stays inside the drawer (focus trap)
  function focusables(el) { return $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', el).filter(function (x) { return x.offsetParent !== null || x === document.activeElement; }); }
  document.addEventListener('keydown', function (e) {
    if (drawer.hidden || !viewer.hidden) return;
    if (e.key === 'Escape') { closeDrawer(); return; }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && car) { e.preventDefault(); carGo(carIdx + (e.key === 'ArrowRight' ? 1 : -1)); return; }
    if (e.key === 'Tab') {
      var f = focusables(drawer); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !drawer.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- service-card 3D books (one shared WebGL renderer; CSS book on phones / reduced motion / weak GPUs) ---------- */
  var svc3d = false, svcWanted = !MOBILE && !REDUCE && !SOFTWARE;
  function svcOff() { svcWanted = false; svc3d = false; root.classList.remove('svc3d'); if (SC && SC.miniEnable) SC.miniEnable(false); }
  function startSvcBooks() {
    if (!SC || !svcWanted || !SC.addMini || (SC.tier && SC.tier() === 'low')) return;
    loadScript('js/tex-svc.js').then(function () {
      var list = $$('.svc--book').map(function (card) {
        var k = card.dataset.cat, b = SVC_BOOKS[k] || {};
        return { name: 'svc-' + k, section: $('#services'), stage: $('.svc__thumb', card), cover: b.cover, cloth: b.cloth, label: CAT[k].short, pages: examplesOf(k).slice(0, 3).map(function (a) { return a.id; }) };
      });
      return SC.addMini(list);
    }).then(function (ok) { if (ok && svcWanted) { svc3d = true; root.classList.add('svc3d'); $$('.svc--book.in-view').forEach(function (c) { SC.miniPages('svc-' + c.dataset.cat); }); } }).catch(function (err) { if (window.console) console.info('[3D] service books off:', err && err.message); });
  }
  // film-strips only animate while their card is on screen
  if (window.IntersectionObserver) { var svcIO = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('in-view', e.isIntersecting); if (e.isIntersecting && svc3d && e.target.classList.contains('svc--book')) SC.miniPages('svc-' + e.target.dataset.cat); /* paint its pages in idle time as soon as the card shows: first hover is instant */ }); }); $$('.svc').forEach(function (c) { svcIO.observe(c); }); }
  else $$('.svc').forEach(function (c) { c.classList.add('in-view'); });
  $$('.svc').forEach(function (card) {
    var name = 'svc-' + card.dataset.cat, timer = 0, pg = 1, r = null, opening = false;
    var pagesN = Math.max(1, Math.min(3, examplesOf(card.dataset.cat).length));
    function tilt(e) { if (!r) r = $('.svc__thumb', card).getBoundingClientRect(); SC.miniHover(name, true, clamp((e.clientX - r.left) / r.width * 2 - 1, -1, 1), clamp((e.clientY - r.top) / r.height * 2 - 1, -1, 1)); }
    var isBook = card.classList.contains('svc--book');
    card.addEventListener('pointerenter', function (e) {
      if (!svc3d || !isBook || e.pointerType === 'touch') return;
      r = null; SC.miniPages(name); pg = 1; SC.setPage(name, 1); tilt(e);
      clearInterval(timer); timer = setInterval(function () { pg = pg >= pagesN ? 1 : pg + 1; SC.setPage(name, pg); }, 1800);   // small page turns while you look
    });
    card.addEventListener('pointermove', function (e) { if (svc3d && isBook && e.pointerType !== 'touch') tilt(e); }, { passive: true });
    card.addEventListener('pointerleave', function () { if (!svc3d || !isBook) return; clearInterval(timer); SC.setPage(name, 0); SC.miniHover(name, false); });
    function go() {
      if (opening) return;
      if (svc3d && isBook) { opening = true; SC.miniPages(name); SC.setPage(name, Math.min(2, pagesN)); setTimeout(function () { opening = false; openDrawer(card.dataset.cat, card); }, 650); }
      else openDrawer(card.dataset.cat, card);
    }
    card.addEventListener('click', function (e) { if (e.target.closest('a')) return; go(); });
    card.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target === card) { e.preventDefault(); if (svc3d && isBook) SC.setPage(name, 1); openDrawer(card.dataset.cat, card); } });
  });

  /* ======================================================================
     WORK — filters, masonry, featured; CASE VIEWER
     ====================================================================== */
  var filterBtns = $$('#filters .chip'), tiles = $$('#masonry .tile'), curFilter = 'all';
  // FLIP filtering: tiles that stay glide from their old spot to the new one, leaving tiles fade out, new ones fade in.
  // The filter lives in the URL hash (#work/map) so a link or a reload keeps it.
  var flipT = 0;
  function isShown(t) { return !t.classList.contains("is-hidden"); }
  function setFilter(cat, fromHash) {
    if (cat !== 'all' && (!CAT[cat] || !artsOf(cat).length)) cat = 'all';   // unknown or empty category: show everything
    var match = function (t) { return cat === 'all' || t.dataset.cat === cat; };
    filterBtns.forEach(function (b) { var on = b.dataset.cat === cat; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    if (!fromHash && history.replaceState) history.replaceState(null, '', cat === 'all' ? '#work' : '#work/' + cat);
    if (cat === curFilter && fromHash !== 'force') return;
    curFilter = cat;
    var anim = !REDUCE && !!Element.prototype.animate, vis0 = tiles.filter(isShown), first = new Map();
    vis0.forEach(function (t) { var r = t.getBoundingClientRect(); first.set(t, r); t.getAnimations && t.getAnimations().forEach(function (a) { a.cancel(); }); });
    var leaving = vis0.filter(function (t) { return !match(t); });
    function apply() {
      tiles.forEach(function (t) { t.classList.toggle('is-hidden', !match(t)); });
      if (anim) {
        var k = 0;
        tiles.filter(isShown).forEach(function (t) {
          var f = first.get(t), l = t.getBoundingClientRect();
          if (f) { var dx = f.left - l.left, dy = f.top - l.top; if (Math.abs(dx) + Math.abs(dy) > 1) t.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.1,1)' }); }
          else t.animate([{ opacity: 0, transform: 'translateY(18px) scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: Math.min(k++, 12) * 30, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'backwards' });
        });
      }
      clearTimeout(flipT); flipT = setTimeout(refreshSoft, anim ? 700 : 60);
    }
    if (anim && leaving.length) {
      leaving.forEach(function (t) { t.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], { duration: 180, easing: 'ease-in', fill: 'forwards' }); });
      setTimeout(function () { leaving.forEach(function (t) { t.getAnimations().forEach(function (a) { a.cancel(); }); }); apply(); }, 180);
    } else apply();
  }
  function hashFilter() { var m = /^#work\/([a-z]+)$/.exec(location.hash || ''); return m ? m[1] : null; }
  window.addEventListener('hashchange', function () { var c = hashFilter(); if (c) setFilter(c, true); });
  filterBtns.forEach(function (b) { b.addEventListener('click', function () { setFilter(b.dataset.cat); }); });
  tiles.forEach(function (t) { t.addEventListener('click', function () { var list = tiles.filter(function (x) { return !x.classList.contains('is-hidden'); }).map(function (x) { return ART_BY_ID[x.dataset.id]; }); openViewer(list, t.dataset.id, t); }); });
  $$('#featured [data-open]').forEach(function (b) { b.addEventListener('click', function () { var a = ART_BY_ID[b.dataset.open]; openViewer(artsOf(a.cat), a.id, b); }); });

  var viewer = $('#viewer'), vImg = $('#vImg'), vList = [], vIdx = 0, vOpener = null;
  function openViewer(list, id, opener) {
    vList = list && list.length ? list : ART; vIdx = Math.max(0, vList.findIndex(function (a) { return a.id === id; })); vOpener = opener || document.activeElement;
    viewer.hidden = false; root.style.overflow = 'hidden'; if (lenis) lenis.stop(); showViewer(); $('#vClose').focus();
    if (hasGsap && !REDUCE) gsap.fromTo(viewer, { opacity: 0 }, { opacity: 1, duration: 0.35 });
  }
  function showViewer() {
    var a = vList[vIdx];
    vImg.classList.add('is-loading'); vImg.onload = function () { vImg.classList.remove('is-loading'); };
    vImg.src = 'images/art/' + a.id + '.jpg'; vImg.alt = a.alt;
    txt('vCat', CAT_NAME[a.cat]); txt('vTitle', a.title); var roleDt = $('#vRole').previousElementSibling; if (roleDt) roleDt.textContent = a.credit ? 'Credit' : 'My role'; viewer.classList.toggle('is-credited', !!a.credit); txt('vBrief', a.brief); txt('vRole', a.role); txt('vDel', a.deliverables); txt('vTools', (CFG.tools || {})[a.cat] || '');
    txt('vCount', pad(vIdx + 1) + ' / ' + pad(vList.length));
    [1, -1].forEach(function (d) { var im = new Image(); im.decoding = 'async'; im.src = 'images/art/' + vList[(vIdx + d + vList.length) % vList.length].id + '.jpg'; window.__vPre = (window.__vPre || []).concat(im.src).slice(-4); });   // preload next + previous
    resetZoom(false);
  }
  function closeViewer() { resetZoom(false); viewer.hidden = true; if (drawer.hidden) { root.style.overflow = ''; if (lenis) lenis.start(); } if (vOpener && vOpener.focus) vOpener.focus({ preventScroll: true }); }
  function stepViewer(d) { vIdx = (vIdx + d + vList.length) % vList.length; showViewer(); }
  $('#vClose').addEventListener('click', closeViewer); $('#vPrev').addEventListener('click', function () { stepViewer(-1); }); $('#vNext').addEventListener('click', function () { stepViewer(1); });
  document.addEventListener('keydown', function (e) {
    if (viewer.hidden) return;
    if (e.key === 'Escape') { if (Z.s > 1.01) resetZoom(true); else closeViewer(); }
    else if (e.key === 'ArrowRight') stepViewer(1); else if (e.key === 'ArrowLeft') stepViewer(-1);
    else if (e.key === '+' || e.key === '=') zoomBy(1.5); else if (e.key === '-' || e.key === '_') zoomBy(1 / 1.5); else if (e.key === '0') resetZoom(true);
    else if (e.key === 'Tab') { var f = $$('button, a', viewer), first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  /* zoom (wheel, double-click, pinch, + / − / 0 keys and buttons) and pan when zoomed; swipe changes artwork at 1x */
  var vStage = $('#vStage'), Z = { s: 1, x: 0, y: 0 }, ptrs = new Map(), pinch = null, pan = null, swipe = null;
  function zApply(animate) {
    vImg.style.transition = animate ? 'transform .35s cubic-bezier(.2,.7,.1,1), opacity .3s' : 'opacity .3s';
    vImg.style.transform = Z.s === 1 && !Z.x && !Z.y ? '' : 'translate(' + Z.x.toFixed(1) + 'px,' + Z.y.toFixed(1) + 'px) scale(' + Z.s.toFixed(3) + ')';
    var zoomed = Z.s > 1.01; vStage.classList.toggle('is-zoomed', zoomed); vStage.setAttribute('data-cursor', zoomed ? 'Drag' : 'Zoom');
    txt('vZoomLevel', Math.round(Z.s * 100) + '%');
  }
  function zClamp() {
    var r = vImg.getBoundingClientRect(), w0 = r.width / Z.s, h0 = r.height / Z.s, sr = vStage.getBoundingClientRect();
    var mx = Math.max(0, (w0 * Z.s - sr.width) / 2 + 40), my = Math.max(0, (h0 * Z.s - sr.height) / 2 + 40);
    if (Z.s <= 1.001) { Z.x = 0; Z.y = 0; } else { Z.x = clamp(Z.x, -mx, mx); Z.y = clamp(Z.y, -my, my); }
  }
  function zoomAt(ns, px, py, animate) {
    ns = clamp(ns, 1, 4);
    var r = vImg.getBoundingClientRect(), cx = r.left + r.width / 2 - Z.x, cy = r.top + r.height / 2 - Z.y;   // un-panned centre
    var ux = (px - cx - Z.x) / Z.s, uy = (py - cy - Z.y) / Z.s;                                            // image point under the pointer
    Z.x = px - cx - ns * ux; Z.y = py - cy - ns * uy; Z.s = ns;
    zClamp(); zApply(animate);
  }
  function zoomBy(f) { var r = vStage.getBoundingClientRect(); zoomAt(Z.s * f, r.left + r.width / 2, r.top + r.height / 2, true); }
  function resetZoom(animate) { Z.s = 1; Z.x = 0; Z.y = 0; zApply(animate); }
  vStage.addEventListener('wheel', function (e) { e.preventDefault(); zoomAt(Z.s * Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY, false); }, { passive: false });
  vStage.addEventListener('dblclick', function (e) { if (Z.s > 1.05) resetZoom(true); else zoomAt(2.5, e.clientX, e.clientY, true); });
  vStage.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button')) return;
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { vStage.setPointerCapture(e.pointerId); } catch (er) {}
    if (ptrs.size === 2) { var p = Array.from(ptrs.values()); pinch = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), s: Z.s }; pan = null; swipe = null; }
    else if (Z.s > 1.01) { pan = { x: e.clientX - Z.x, y: e.clientY - Z.y }; vStage.classList.add('is-panning'); }
    else swipe = e.clientX;
  });
  vStage.addEventListener('pointermove', function (e) {
    if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && ptrs.size === 2) { var p = Array.from(ptrs.values()); zoomAt(pinch.s * Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) / Math.max(1, pinch.d), (p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2, false); }
    else if (pan) { Z.x = e.clientX - pan.x; Z.y = e.clientY - pan.y; zClamp(); zApply(false); }
  });
  function ptrEnd(e) {
    ptrs.delete(e.pointerId); vStage.classList.remove('is-panning');
    if (ptrs.size < 2) pinch = null;
    if (!ptrs.size) { pan = null; if (swipe !== null && Z.s <= 1.01) { var d = e.clientX - swipe; if (Math.abs(d) > 50) stepViewer(d < 0 ? 1 : -1); } swipe = null; }
  }
  vStage.addEventListener('pointerup', ptrEnd); vStage.addEventListener('pointercancel', ptrEnd);
  $('#vZoomIn').addEventListener('click', function () { zoomBy(1.5); }); $('#vZoomOut').addEventListener('click', function () { zoomBy(1 / 1.5); }); $('#vZoomReset').addEventListener('click', function () { resetZoom(true); });

  /* ---------- process: drag-to-compare (sketch ↔ final) ---------- */
  var cmp = $('#cmp');
  if (cmp) {
    var cmpR = $('#cmpRange'), cmpDown = false, CMP = (TXT.process || {}).compare || { sets: [] }, cmpDemo = false;
    var cmpSet = function (v) { v = clamp(v, 0, 100); cmp.style.setProperty('--p', v.toFixed(1) + '%'); cmpR.value = Math.round(v); cmpR.setAttribute('aria-valuetext', Math.round(v) + '% ' + $('#cmpTagL').textContent); };
    var cmpX = function (x) { var r = cmp.getBoundingClientRect(); cmpSet((x - r.left) / r.width * 100); };
    cmp.addEventListener('pointerdown', function (e) { cmpDown = true; cmpDemo = true; try { cmp.setPointerCapture(e.pointerId); } catch (er) {} cmp.classList.add('is-drag'); cmpX(e.clientX); });
    cmp.addEventListener('pointermove', function (e) { if (cmpDown) cmpX(e.clientX); });
    var cmpUp = function () { cmpDown = false; cmp.classList.remove('is-drag'); };
    cmp.addEventListener('pointerup', cmpUp); cmp.addEventListener('pointercancel', cmpUp);
    cmpR.addEventListener('input', function () { cmpDemo = true; cmpSet(+cmpR.value); });
    $$('[data-cmp]').forEach(function (b) {
      b.addEventListener('click', function () {
        var x = CMP.sets[+b.dataset.cmp]; if (!x) return;
        $$('[data-cmp]').forEach(function (o) { var on = o === b; o.classList.toggle('is-on', on); o.setAttribute('aria-pressed', String(on)); });
        $('#cmpAfter').src = 'images/compare/' + x.key + '-after.webp'; $('#cmpAfter').alt = x.altAfter;
        $('#cmpBefore').src = 'images/compare/' + x.key + '-before.webp'; $('#cmpBefore').alt = x.altBefore;
        txt('cmpTagL', x.before); txt('cmpTagR', x.after); cmpR.setAttribute('aria-label', 'Compare ' + x.before + ' and ' + x.after + ': use the arrow keys'); cmpSet(50);
      });
    });
    // one gentle demo sweep the first time it comes into view, so people see it can be dragged
    if (!REDUCE && hasGsap && window.IntersectionObserver) {
      var cmpIO = new IntersectionObserver(function (es) { if (!es[0].isIntersecting || cmpDemo) return; cmpDemo = true; cmpIO.disconnect();
        var o = { v: 50 }; gsap.timeline({ onUpdate: function () { cmpSet(o.v); } }).to(o, { v: 78, duration: 0.9, ease: 'sine.inOut' }).to(o, { v: 24, duration: 1.1, ease: 'sine.inOut' }).to(o, { v: 50, duration: 0.8, ease: 'sine.inOut' });
      }, { threshold: 0.6 });
      cmpIO.observe(cmp);
    }
  }

  /* ======================================================================
     CURSOR, MAGNETIC BUTTONS, CARD TILT + GLARE
     ====================================================================== */
  var cursor = $('#cursor'), cursorLabel = $('#cursorLabel'), cx = -100, cy = -100, tx = -100, ty = -100, lastCur = '';
  if (FINE && !REDUCE) {
    root.classList.add('has-cursor');
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; S.px = e.clientX / innerWidth * 2 - 1; S.py = e.clientY / innerHeight * 2 - 1; }, { passive: true });
    document.addEventListener('pointerover', function (e) {
      var el = e.target.closest && e.target.closest('[data-cursor]'), l = el ? el.getAttribute('data-cursor') : ''; cursorLabel.textContent = l; cursor.classList.toggle('is-label', !!l);
      // over reading text the ring shrinks to a small caret-like dot, so it never covers the words
      var txtEl = !l && e.target.closest && e.target.closest('p, li, dd, blockquote, h1, h2, h3, h4, .sub') && !e.target.closest('a, button, [role="button"]');
      cursor.classList.toggle('is-text', !!txtEl);
    }, { passive: true });
    var mag = null, magR = null, mx = 0, my = 0, magD = false, tilt = null, tiltR = null, rx = 0, ry = 0, gx = 50, gy = 50, tiltD = false;
    document.addEventListener('pointerover', function (e) {
      var b = e.target.closest && e.target.closest('.magnetic'); if (b !== mag) { if (mag) { mag.style.setProperty('--mx', '0px'); mag.style.setProperty('--my', '0px'); } mag = b; if (b) magR = b.getBoundingClientRect(); }
      var c = e.target.closest && e.target.closest('.svc'); if (c !== tilt) { if (tilt) { tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--go', '0'); } tilt = c; if (c) tiltR = c.getBoundingClientRect(); }
    }, { passive: true });
    document.addEventListener('pointermove', function (e) {
      if (mag) { mx = (e.clientX - (magR.left + magR.width / 2)) * 0.25; my = (e.clientY - (magR.top + magR.height / 2)) * 0.32; magD = true; }
      if (tilt) { var u = (e.clientX - tiltR.left) / tiltR.width, v = (e.clientY - tiltR.top) / tiltR.height; rx = (u - 0.5) * 8; ry = (v - 0.5) * -8; gx = u * 100; gy = v * 100; tiltD = true; }
    }, { passive: true });
    onTick(function () {
      cx += (tx - cx) * 0.22; cy += (ty - cy) * 0.22; var t = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)'; if (t !== lastCur) { cursor.style.transform = t; lastCur = t; }
      if (magD && mag) { mag.style.setProperty('--mx', mx.toFixed(1) + 'px'); mag.style.setProperty('--my', my.toFixed(1) + 'px'); magD = false; }
      if (tiltD && tilt) { tilt.style.setProperty('--rx', rx.toFixed(2) + 'deg'); tilt.style.setProperty('--ry', ry.toFixed(2) + 'deg'); tilt.style.setProperty('--gx', gx.toFixed(1) + '%'); tilt.style.setProperty('--gy', gy.toFixed(1) + '%'); tilt.style.setProperty('--go', '1'); tiltD = false; }
    });
  } else if (!REDUCE) {
    // touch: no cursor. The background follows a gentle device tilt instead (and the scroll).
    var gyroOn = false;
    function onTilt(e) { if (e.gamma == null) return; gyroOn = true; S.px = clamp(e.gamma / 28, -1, 1) * 0.7; S.py = clamp((e.beta - 45) / 28, -1, 1) * 0.7; }
    window.addEventListener('deviceorientation', onTilt, { passive: true });
    // iOS asks for permission: request it once, on the first tap
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
      window.addEventListener('touchend', function ask() { window.removeEventListener('touchend', ask); DeviceOrientationEvent.requestPermission().catch(function () {}); }, { passive: true });
    }
    // no gyro at all: a very slow drift so the scene still breathes
    onTick(function (dt, t) { if (!gyroOn) { S.px = Math.sin(t * 0.13) * 0.35; S.py = Math.sin(t * 0.09 + 1) * 0.25; } });
  }

  /* ======================================================================
     REVEALS: split headings, fade-ups, image masks, process scroll
     ====================================================================== */
  function splitChars(el) {
    if (el.dataset.done) return; el.dataset.done = '1'; el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    (function walk(node, gold) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (w) {
            if (!w) return; if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
            var ws = document.createElement('span'); ws.className = 'w'; ws.setAttribute('aria-hidden', 'true');
            w.split('').forEach(function (c) { var cs = document.createElement('span'); cs.className = 'ch' + (gold ? ' gold' : ''); cs.textContent = c; ws.appendChild(cs); });
            frag.appendChild(ws);
          });
          ch.parentNode.replaceChild(frag, ch);
        } else if (ch.nodeType === 1) { var g = ch.classList.contains('gold'); if (g) { ch.classList.remove('gold'); ch.style.fontStyle = 'italic'; } walk(ch, gold || g); }
      });
    })(el, false);
  }
  function setupReveals() {
    if (!hasGsap || REDUCE) return;
    $$('[data-split]').forEach(function (el) {
      splitChars(el);
      var chars = $$('.ch', el);
      if (el.id === 'hero-name') gsap.from(chars, { yPercent: 80, opacity: 0, rotate: 6, duration: 1.1, ease: 'expo.out', stagger: 0.035, delay: 0.1 });
      else gsap.from(chars, { yPercent: 70, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.012, scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    var ups = $$('.sec-head .sub, .about__bio, .about__cols > *, .svc, .feat__body, .t-card, .qa, .skill-groups > *, .contact__card, .footer__col');
    ups.forEach(function (el) { el.classList.add('fade-up'); });
    ScrollTrigger.batch(ups, { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.06, overwrite: true }); } });
    // one batched observer for all image masks instead of one ScrollTrigger per image
    ScrollTrigger.batch($$('.reveal-mask').map(function (m) { return m.parentNode; }), { start: 'top 90%', once: true, onEnter: function (b) { gsap.to(b.map(function (p) { return p.querySelector('.reveal-mask'); }), { scaleX: 0, duration: 1.1, ease: 'expo.inOut', stagger: 0.05 }); } });
    if (!root.classList.contains('flat-process')) {
      var track = $('#processTrack'), rail = $('.process__rail');
      gsap.to(track, { x: function () { return -Math.max(0, track.scrollWidth + (parseFloat(getComputedStyle(rail).paddingLeft) || 0) - innerWidth + 40); }, ease: 'none', scrollTrigger: { trigger: '#process', start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo('#processFill', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '#process', start: 'top top', end: 'bottom bottom', scrub: true } });
    }
    gsap.from('.hero__copy > *:not(#hero-name), .book-ui', { opacity: 0, y: 20, duration: 1, stagger: 0.07, ease: 'expo.out', delay: 0.25 });
    gsap.from('.nav__inner > *', { y: -24, opacity: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out', clearProps: 'transform,opacity' });
  }

  /* ---------- layout ---------- */
  // parallax of the picture inside each service card (static book); positions cached here, never read while scrolling
  var svcThumbs = $$('.svc__thumb'), svcMid = [], svcPar = [];
  function measureSvc() { var sy = window.scrollY || 0; svcMid = svcThumbs.map(function (t) { var r = t.getBoundingClientRect(); return r.top + sy + r.height / 2; }); }
  if (!REDUCE) onTick(function () {
    for (var i = 0; i < svcMid.length; i++) { var c = svcMid[i] - S.scroll - innerHeight / 2; if (Math.abs(c) > innerHeight) continue; var v = (-c * 0.05).toFixed(1); if (v !== svcPar[i]) { svcPar[i] = v; svcThumbs[i].style.setProperty('--par', v + 'px'); } }
  });
  function refreshSoft() { measureDoc(); measureNav(); measureHero(); measureSvc(); if (SC) SC.resize(); }
  function refreshLayout() { refreshSoft(); if (hasGsap) ScrollTrigger.refresh(); }
  var rT = 0, lastW = innerWidth;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (MOBILE && innerWidth === lastW) { measureDoc(); return; } lastW = innerWidth; refreshLayout(); }, 160); }, { passive: true });
  if (hasGsap) ScrollTrigger.addEventListener('refresh', function () { measureDoc(); measureNav(); measureHero(); if (SC) SC.resize(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measureNav(); });
  // images carry width/height, so a late load rarely moves anything: only re-measure when the page height really changed
  var imgT = 0, lastDocH = 0;
  document.addEventListener('load', function (e) {
    if (!e.target || e.target.tagName !== 'IMG') return;
    clearTimeout(imgT); imgT = setTimeout(function () { var h = document.documentElement.scrollHeight; if (Math.abs(h - lastDocH) > 2) { lastDocH = h; refreshLayout(); } }, 500);
  }, true);

  function revealPage() {
    root.classList.add('is-revealed');
    loader.classList.add('is-done'); setTimeout(function () { loader.hidden = true; }, REDUCE ? 0 : 600);
    if (lenis) lenis.start();
    setupReveals(); refreshLayout(); lastDocH = document.documentElement.scrollHeight;
    performance.mark && performance.mark('wm-interactive');
    if (USE3D) begin3D();   // normally already started behind the loading screen; this is only a fallback
    var hf = hashFilter(); if (hf) setFilter(hf, true);
    if (location.hash && location.hash.length > 1) { var t = document.getElementById(hf ? 'work' : location.hash.slice(1)); if (t) setTimeout(function () { scrollToY(anchorY(t), true); }, 60); }
  }
  refreshLayout();
  window.__wmMode = { use3D: USE3D, mobile: MOBILE, reduce: REDUCE, no3d: NO3D, qualityFull: QFULL };
})();
