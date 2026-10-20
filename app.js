/* =========================================================
   app.js
   Central controller:
     • BSAI.state (in-memory + localStorage persistence)
     • Hash-based router → BSAI.views[route]
     • Digital-network canvas background animation
     • Shell bindings (sidebar, demo banner, scan, topbar)
     • demo reset
   ========================================================= */
(function () {
  'use strict';
  var BSAI = (window.BSAI = window.BSAI || {});
  BSAI.views = BSAI.views || {};

  var STORAGE_KEY = 'brandshield-ai-state-v1';
  var STORAGE_SETTINGS_KEY = 'brandshield-ai-settings-v1';

  /* --------  localStorage-backed store  -------- */
  BSAI.store = {
    get: function (k, dfl) {
      try {
        var raw = localStorage.getItem(k);
        if (raw == null) return dfl;
        return JSON.parse(raw);
      } catch (_) { return dfl; }
    },
    set: function (k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch (_) { return false; }
    },
    remove: function (k) { try { localStorage.removeItem(k); } catch (_) {} },
    clear: function () { try { localStorage.clear(); } catch (_) {} }
  };

  /* --------  State init  -------- */
  function seedState() {
    var seed = BSAI.seed || { brands: [], socialProfiles: [], apps: [], websites: [], investigations: [], trendPoints: [], scanHistory: [], lastFullScan: new Date().toISOString() };
    var saved = BSAI.store.get(STORAGE_KEY, null);
    var savedSettings = BSAI.store.get(STORAGE_SETTINGS_KEY, null);
    var settings = BSAI.Risk.mergeDefaults(savedSettings || {});
    var state;
    if (saved && Array.isArray(saved.brands) && saved.brands.length) {
      state = {
        brands: saved.brands,
        socialProfiles: saved.socialProfiles || [],
        apps: saved.apps || [],
        websites: saved.websites || [],
        investigations: saved.investigations || [],
        trendPoints: saved.trendPoints || JSON.parse(JSON.stringify(seed.trendPoints || [])),
        scanHistory: saved.scanHistory || JSON.parse(JSON.stringify(seed.scanHistory || [])),
        lastFullScan: saved.lastFullScan || seed.lastFullScan || new Date().toISOString()
      };
    } else {
      state = {
        brands: deepClone(seed.brands || []),
        socialProfiles: deepClone(seed.socialProfiles || []),
        apps: deepClone(seed.apps || []),
        websites: deepClone(seed.websites || []),
        investigations: deepClone(seed.investigations || []),
        trendPoints: deepClone(seed.trendPoints || []),
        scanHistory: deepClone(seed.scanHistory || []),
        lastFullScan: seed.lastFullScan || new Date().toISOString()
      };
    }
    state.settings = settings;
    if (BSAI.Risk && typeof BSAI.Risk.enrichAll === 'function') BSAI.Risk.enrichAll(state);
    return state;
  }

  function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

  function cloneStrip(obj) {
    if (Array.isArray(obj)) return obj.map(cloneStrip);
    if (obj && typeof obj === 'object') {
      var o = {};
      Object.keys(obj).forEach(function (k) {
        if (k === '_risk' || k === '_evidence') return;
        o[k] = cloneStrip(obj[k]);
      });
      return o;
    }
    return obj;
  }

  function persistState() {
    if (!BSAI.state) return;
    BSAI.store.set(STORAGE_KEY, cloneStrip({
      brands: BSAI.state.brands,
      socialProfiles: BSAI.state.socialProfiles,
      apps: BSAI.state.apps,
      websites: BSAI.state.websites,
      investigations: BSAI.state.investigations,
      trendPoints: BSAI.state.trendPoints,
      scanHistory: BSAI.state.scanHistory,
      lastFullScan: BSAI.state.lastFullScan
    }));
    BSAI.store.set(STORAGE_SETTINGS_KEY, BSAI.state.settings);
  }
  BSAI.save = persistState;

  BSAI.resetDemo = function (silent) {
    BSAI.store.remove(STORAGE_KEY);
    BSAI.store.remove(STORAGE_SETTINGS_KEY);
    BSAI.state = seedState();
    persistState();
    refreshStatuses();
    renderCurrentView();
    if (!silent && BSAI.UI) BSAI.UI.toast('ok', 'Demo reset complete', 'All data restored to seed data.');
  };

  /* --------  Router  -------- */
  var ROUTES = [
    { key: 'dashboard',        title: 'Dashboard',            crumbs: 'Home · Overview' },
    { key: 'brands',           title: 'Brand Profiler',       crumbs: 'Brands · Profiles' },
    { key: 'social',           title: 'Social Media Monitoring', crumbs: 'Monitoring · Social Media' },
    { key: 'apps',             title: 'App Store Monitoring', crumbs: 'Monitoring · App Stores' },
    { key: 'websites',         title: 'Website Monitoring',   crumbs: 'Monitoring · Websites' },
    { key: 'investigations',   title: 'Threat Investigation', crumbs: 'Workbench · Cases' },
    { key: 'reports',          title: 'Alerts & Reports',     crumbs: 'Reports · Alerts' },
    { key: 'settings',         title: 'Settings',             crumbs: 'System · Settings' },
    // Auth / admin routes are handled specially in renderCurrentView.
    { key: 'login',            title: 'Sign In',              crumbs: 'Authentication · Sign In' },
    { key: 'admin',            title: 'Platform Admin',       crumbs: 'Admin · Platform' }
  ];
  var ADMIN_SUBROUTES = {
    'companies': { title: 'Company Management', crumbs: 'Admin · Companies',  dataRoute: 'admin-companies' },
    'users':     { title: 'User Management',    crumbs: 'Admin · Users',      dataRoute: 'admin-users' },
    'platform':  { title: 'Platform Summary',   crumbs: 'Admin · Summary',    dataRoute: 'admin-platform' }
  };

  function currentRouteParts() {
    var raw = (location.hash || '#dashboard').replace(/^#/, '').replace(/^\//, '');
    var parts = raw.split(/[\/?]/);
    // Normalize known admin subroutes: #admin/companies -> key='admin', sub='companies'
    var key = parts[0] || 'dashboard';
    var sub = parts[1] || null;
    if (key === 'login') return { key: 'login', sub: null };
    if (key === 'admin') {
      if (ADMIN_SUBROUTES[sub]) return { key: 'admin', sub: sub };
      return { key: 'admin', sub: 'companies' };
    }
    var known = ROUTES.some(function (r) { return r.key === key; });
    return { key: known ? key : 'dashboard', sub: null };
  }
  function currentRoute() { return currentRouteParts().key; }

  function setViewMeta(key, sub) {
    var routeInfo = null;
    var dataRoute = key;
    if (key === 'admin' && sub && ADMIN_SUBROUTES[sub]) {
      routeInfo = ADMIN_SUBROUTES[sub];
      dataRoute = routeInfo.dataRoute;
    } else {
      routeInfo = ROUTES.find(function (x) { return x.key === key; }) || ROUTES[0];
    }
    var t = document.getElementById('view-title');
    var c = document.getElementById('view-crumbs');
    document.title = routeInfo.title + ' · BrandShield AI';
    if (t) t.textContent = routeInfo.title;
    if (c) c.textContent = routeInfo.crumbs;
    document.querySelectorAll('.sidebar-item').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === dataRoute);
    });
  }

  function renderCurrentView() {
    var mount = document.getElementById('view-root');
    if (!mount) return;
    var parts = currentRouteParts();
    var key = parts.key;
    var sub = parts.sub;

    // Login view is fully managed by auth.js — never overwrite it here.
    // This is the critical guard against the race condition where fetchJSON's
    // 401 handler calls redirectToLogin() which changes hash to #login, and
    // the resulting hashchange event used to fire renderCurrentView() which
    // did not recognize 'login', defaulted to dashboard, and replaced the
    // freshly-injected login form with dashboard loading state.
    if (key === 'login') return;

    setViewMeta(key, sub);
    // scroll to top on route change
    var mainCol = document.getElementById('main-col');
    if (mainCol) mainCol.scrollTop = 0;
    window.scrollTo(0, 0);

    // Admin subroutes: render via lightweight admin views (reuse existing card/table/btn CSS).
    if (key === 'admin') {
      mount.innerHTML = BSAI.UI ? BSAI.UI.loadingState({ desc: 'Loading Admin…' }) : '<div>Loading…</div>';
      requestAnimationFrame(function () {
        try { renderAdminView(sub, mount); }
        catch (e) { console.error('Admin view error:', e);
          if (BSAI.UI) mount.innerHTML = BSAI.UI.errorState({ title: 'Admin view failed', desc: String(e.message || e) }); }
      });
      return;
    }

    var rMeta = ROUTES.find(function (x) { return x.key === key; }) || ROUTES[0];
    mount.innerHTML = BSAI.UI ? BSAI.UI.loadingState({ desc: 'Rendering ' + rMeta.title + '…' }) : '<div style="padding:30px">Loading…</div>';
    requestAnimationFrame(function () {
      var view = BSAI.views[key];
      if (!view || typeof view.render !== 'function') {
        mount.innerHTML =
          '<div class="card"><div class="card-body">' +
            '<h2>Coming soon</h2>' +
            '<p class="muted">Section <code>' + key + '</code> is not implemented in this build.</p>' +
          '</div></div>';
        return;
      }
      try {
        mount.innerHTML = view.render();
        if (typeof view.bind === 'function') view.bind();
      } catch (err) {
        console.error('View render error:', err);
        if (BSAI.UI) mount.innerHTML = BSAI.UI.errorState({ title: 'View failed to render', desc: String(err && err.message || err) });
      }
    });
  }
  BSAI.renderCurrentView = renderCurrentView;
  BSAI.currentRoute = currentRoute;
  BSAI.ROUTES = ROUTES;

  /* --------  Shell bindings  -------- */
  function bindShell() {
    // close mobile sidebar on nav click
    document.querySelectorAll('.sidebar-item[data-route]').forEach(function (a) {
      a.addEventListener('click', function () {
        if (window.innerWidth < 768) document.body.classList.remove('sidebar-open');
      });
    });

    // Sidebar toggle (mobile)
    var tog = document.getElementById('sidebar-toggle');
    if (tog) tog.addEventListener('click', function (e) { e.stopPropagation(); document.body.classList.toggle('sidebar-open'); });

    // Dismiss sidebar on outside click
    document.addEventListener('click', function (e) {
      if (window.innerWidth >= 768) return;
      if (!document.body.classList.contains('sidebar-open')) return;
      var t = e.target;
      if (t.closest && (t.closest('.sidebar') || t.closest('#sidebar-toggle'))) return;
      document.body.classList.remove('sidebar-open');
    });

    // Demo banner dismiss
    var ban = document.getElementById('demo-banner-dismiss');
    if (ban) ban.addEventListener('click', function () {
      document.body.classList.add('no-banner');
      document.documentElement.style.setProperty('--banner-h', '0px');
      var sb = document.getElementById('sidebar');
      if (sb) sb.style.top = '0';
      var tb = document.getElementById('topbar');
      if (tb) tb.style.top = '0';
    });

    // Run scan button
    var scanBtn = document.getElementById('btn-scan');
    if (scanBtn) scanBtn.addEventListener('click', runSimulatedScan);

    // Notify button (demo)
    var nb = document.getElementById('btn-notify');
    if (nb) nb.addEventListener('click', function () {
      if (BSAI.UI) BSAI.UI.toast('info', 'Notifications (demo)', '4 unread. Alert list appears in Alerts & Reports.');
    });

    // Global search (debounced light-weight filter trigger)
    var gs = document.getElementById('global-search');
    if (gs) {
      var tm;
      gs.addEventListener('input', function () {
        clearTimeout(tm);
        tm = setTimeout(function () {
          BSAI._globalSearch = (gs.value || '').trim().toLowerCase();
          renderCurrentView();
        }, 220);
      });
    }

    // Logout button (only visible when backend-authenticated)
    var logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', function () {
      if (!BSAI.Auth) return;
      BSAI.Auth.logout().then(function () {
        if (typeof location !== 'undefined') location.hash = '#login';
        // Also reset the shell
        var sb = document.getElementById('sidebar');
        var tb = document.getElementById('topbar');
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (sb) sb.style.display = ''; // keep visible for login view? No: hide until re-login
        if (BSAI.Auth.applyRoleVisibility) BSAI.Auth.applyRoleVisibility(null);
        BSAI.Auth.renderLogin({ error: 'You have been signed out.' });
      });
    });

    // Hash change
    window.addEventListener('hashchange', renderCurrentView);

    // Resize → notify view
    var rtm;
    window.addEventListener('resize', function () {
      clearTimeout(rtm);
      rtm = setTimeout(function () {
        var v = BSAI.views[currentRoute()];
        if (v && typeof v.onResize === 'function') v.onResize();
      }, 160);
    });
  }

  function runSimulatedScan() {
    var btn = document.getElementById('btn-scan');
    if (!btn) return;
    var label = btn.querySelector('span');
    btn.disabled = true;
    if (label) label.textContent = 'Scanning…';
    if (BSAI.UI) BSAI.UI.toast('info', 'Simulated scan started', 'Running detection engine over ' +
      BSAI.state.socialProfiles.length + ' social · ' + BSAI.state.apps.length + ' apps · ' + BSAI.state.websites.length + ' domains (demo data only).');
    setTimeout(function () {
      var s = 0, a = 0, w = 0;
      if (Math.random() < 0.45) s++;
      if (Math.random() < 0.30) a++;
      if (Math.random() < 0.50) w++;
      var at = new Date().toISOString();
      function src(name, status, n) {
        return {
          at: at,
          source: name,
          status: status,
          assetsScanned: (name.indexOf('Social') !== -1) ? BSAI.state.socialProfiles.length : (name.indexOf('App') !== -1 ? BSAI.state.apps.length : BSAI.state.websites.length),
          newFindings: n,
          note: n ? (n + ' new signal(s)') : 'No new findings'
        };
      }
      BSAI.state.scanHistory.unshift(
        src('Social Media Monitoring (simulated)', (s ? 'warn' : 'ok'), s),
        src('App Store Monitoring (simulated)',    (a ? 'warn' : 'ok'), a),
        src('Website Monitoring (simulated)',      (w ? 'warn' : 'ok'), w)
      );
      BSAI.state.scanHistory = BSAI.state.scanHistory.slice(0, 20);
      BSAI.state.lastFullScan = at;
      persistState();
      refreshStatuses();
      renderCurrentView();
      btn.disabled = false;
      if (label) label.textContent = 'Run Scan';
      if (BSAI.UI) BSAI.UI.toast('ok', 'Simulated scan complete', (s + a + w) + ' new signal(s) detected across modules.');
    }, 1100);
  }

  function refreshStatuses() {
    var eng = document.getElementById('ss-engine');
    var ls = document.getElementById('ss-lastscan');
    if (eng) eng.textContent = 'Simulated';
    if (ls && BSAI.state && BSAI.state.lastFullScan && BSAI.UI) ls.textContent = BSAI.UI.timeAgo(BSAI.state.lastFullScan);
  }
  BSAI.refreshStatuses = refreshStatuses;

  /* --------  Digital network canvas background  -------- */
  var bgRaf = 0;
  function initBgCanvas() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    if (BSAI.state && BSAI.state.settings && BSAI.state.settings.backgroundAnimations === false) return;

    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    var MAX_NODES = 36;
    var MAX_PARTICLES = 64;
    var nodes = [], particles = [];

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGraph();
    }
    function buildGraph() {
      MAX_NODES = Math.min(40, Math.max(18, Math.round(W * H / 70000)));
      MAX_PARTICLES = Math.min(72, Math.max(28, Math.round(W * H / 50000)));
      nodes = []; particles = [];
      for (var i = 0; i < MAX_NODES; i++) {
        nodes.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
          r: 1.3 + Math.random() * 1.5
        });
      }
      for (var j = 0; j < MAX_PARTICLES; j++) {
        particles.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
          r: 0.6 + Math.random() * 1.2, a: 0.3 + Math.random() * 0.6
        });
      }
    }
    function step() {
      if (document.body.classList.contains('animations-off')) { bgRaf = requestAnimationFrame(step); return; }
      if (document.hidden) { bgRaf = requestAnimationFrame(step); return; }
      ctx.clearRect(0, 0, W, H);

      // move nodes
      var i, j, n, a, b, dx, dy, dist2, alpha;
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      // links
      var maxLink = 140;
      ctx.lineWidth = 0.8;
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          dist2 = dx * dx + dy * dy;
          if (dist2 < maxLink * maxLink) {
            alpha = 1 - Math.sqrt(dist2) / maxLink;
            ctx.strokeStyle = 'rgba(0,212,255,' + (alpha * 0.35) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // node glow + core
      for (i = 0; i < nodes.length; i++) {
        n = nodes[i];
        var grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grd.addColorStop(0, 'rgba(0,212,255,0.9)');
        grd.addColorStop(1, 'rgba(0,212,255,0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,180,220,0.95)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      // particles
      var p;
      for (j = 0; j < particles.length; j++) {
        p = particles[j];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;
        ctx.fillStyle = 'rgba(20,184,166,' + p.a + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      bgRaf = requestAnimationFrame(step);
    }
    resize();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 150);
    });
    bgRaf = requestAnimationFrame(step);
  }

  /* --------  Start  -------- */
  function init() {
    // Decide auth path: backend reachable? If yes, require login; otherwise
    // use the legacy localStorage DEMO MODE path 100% verbatim.
    var hasAuth = (BSAI.Auth && typeof BSAI.Auth.isBackendReachable === 'function');
    if (hasAuth) {
      initWithAuthFallback();
    } else {
      initLocalOnly();
    }
  }

  function initLocalOnly() {
    BSAI.state = seedState();
    bindShell();
    refreshStatuses();
    if (BSAI.state.settings.backgroundAnimations === false) document.body.classList.add('animations-off');
    initBgCanvas();
    if (!location.hash) location.replace('#dashboard');
    renderCurrentView();
    setTimeout(function () {
      if (BSAI.UI && !BSAI.store.get('brandshield-welcomed', false)) {
        BSAI.UI.toast('info', 'Welcome to BrandShield AI DEMO', 'Try Dashboard → Social Monitoring → Settings → Reset Demo.');
        BSAI.store.set('brandshield-welcomed', true);
      }
    }, 600);
  }

  function initWithAuthFallback() {
    // Prime the CSRF first so any cookie has a chance to be set.
    BSAI.Auth.isBackendReachable().then(function (reachable) {
      if (!reachable) {
        // Silent fallback to offline DEMO MODE. No auth, no visual change.
        initLocalOnly();
        return;
      }
      // Backend reachable: seed state now; after login we replace with backend.
      BSAI.state = seedState();
      bindShell();
      refreshStatuses();
      if (BSAI.state.settings.backgroundAnimations === false) document.body.classList.add('animations-off');
      initBgCanvas();
      // Try /me
      return BSAI.Auth.me().then(function (user) {
        if (!user) { BSAI.Auth.renderLogin(); return null; }
        return BSAI.Auth.onLoginSuccess().then(function () {
          if (!location.hash) location.replace('#dashboard');
          renderCurrentView();
        });
      }).catch(function (err) {
        // 401 is expected — render login. Anything else: toast then fallback.
        if (err && err.status === 401) {
          BSAI.Auth.renderLogin();
          return;
        }
        if (BSAI.UI) BSAI.UI.toast('warn', 'Backend session unavailable', 'Falling back to offline DEMO MODE.');
        if (!location.hash) location.replace('#dashboard');
        renderCurrentView();
      });
    }).catch(function () {
      initLocalOnly();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
