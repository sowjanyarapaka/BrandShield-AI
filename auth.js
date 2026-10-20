/* =========================================================
   auth.js
   Backend-aware authentication wiring for BrandShield AI.

   Goals:
   - Fetch helper (BSAI.Auth.fetchJSON) that includes credentials
     and X-CSRFToken, with safe 401 → login redirect.
   - login() / logout() / me() helpers.
   - BS.login view rendered into view-root if the backend is up
     and the user is not authenticated.
   - If the backend is unreachable (offline demo mode), silently
     fall back to the legacy localStorage DEMO MODE unchanged.

   NO visual redesign. NO CSS. Login form reuses the existing
   card/btn/form styling from css/main.css.
   ========================================================= */
(function () {
  'use strict';
  var BSAI = (window.BSAI = window.BSAI || {});
  BSAI.Auth = BSAI.Auth || {};

  // --- Config: derive backend URL from frontend origin. Frontend usually
  // served at root while Flask listens on 5000 same host. Override with
  // window.BSAI_API_BASE before loading auth.js if needed.
  var API_BASE = (typeof window.BSAI_API_BASE === 'string' && window.BSAI_API_BASE)
    || (location.port && location.hostname !== 'file://'
        ? (location.protocol + '//' + location.hostname + ':5000')
        : (location.protocol + '//' + location.hostname + ':5000'));
  BSAI.Auth.API_BASE = API_BASE;

  var lastCsrf = '';

  function saveCsrfFromResponse(resp) {
    try {
      var v = resp.headers && resp.headers.get ? resp.headers.get('X-CSRFToken') : null;
      if (v) { lastCsrf = v; return; }
    } catch (_) { /* ignore */ }
    // Fallback: attempt to read cookie (won't be HttpOnly; app also sends header)
    try {
      var parts = document.cookie.split(';');
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i].replace(/^\s+/, '');
        if (p.indexOf('csrftoken=') === 0) {
          lastCsrf = decodeURIComponent(p.substring(10));
          return;
        }
      }
    } catch (_) { /* ignore */ }
  }

  function safeToast(kind, title, body) {
    if (BSAI.UI && typeof BSAI.UI.toast === 'function') {
      try { BSAI.UI.toast(kind, title, body); } catch (_) { /* ignore */ }
    }
  }

  /* --------  Authenticated fetch helper  -------- */
  BSAI.Auth.fetchJSON = function (path, opts) {
    opts = opts || {};
    var url = (path.indexOf('http') === 0) ? path : (API_BASE + path);
    var headers = opts.headers ? cloneObj(opts.headers) : {};
    if (!headers['Content-Type'] && opts.body && !(opts.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (lastCsrf) headers['X-CSRFToken'] = lastCsrf;
    var init = {
      method: opts.method || 'GET',
      credentials: 'include',
      mode: 'cors',
      headers: headers,
      body: opts.body === undefined ? undefined : opts.body
    };
    return fetch(url, init).then(function (resp) {
      saveCsrfFromResponse(resp);
      if (resp.status === 401) {
        // Session lost → clear local authed state + go to login view
        BSAI.Auth._authedUser = null;
        if (typeof BSAI.Auth.redirectToLogin === 'function') BSAI.Auth.redirectToLogin();
        var err = new Error('Unauthorized');
        err.status = 401;
        throw err;
      }
      return resp.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (_) { data = { _raw: text }; }
        if (!resp.ok) {
          var msg = (data && data.error) || ('HTTP ' + resp.status);
          var err2 = new Error(msg);
          err2.status = resp.status;
          err2.body = data;
          throw err2;
        }
        return { ok: true, status: resp.status, data: data, headers: resp.headers };
      });
    }).catch(function (err) {
      // Network error → still surface; caller may decide to fall back.
      throw err;
    });
  };

  /* --------  Basic auth actions  -------- */
  BSAI.Auth.login = function (email, password) {
    // Always refresh CSRF before login.
    return fetch(API_BASE + '/api/csrf', { credentials: 'include', mode: 'cors' })
      .then(function (r) { saveCsrfFromResponse(r); return r; })
      .then(function () {
        return BSAI.Auth.fetchJSON('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: email, password: password })
        });
      })
      .then(function (res) {
        BSAI.Auth._authedUser = res.data && res.data.user;
        return res.data;
      });
  };

  BSAI.Auth.logout = function () {
    return BSAI.Auth.fetchJSON('/api/auth/logout', { method: 'POST' })
      .then(function () {
        BSAI.Auth._authedUser = null;
        return true;
      }, function () {
        BSAI.Auth._authedUser = null;
        return true;
      });
  };

  BSAI.Auth.me = function () {
    return BSAI.Auth.fetchJSON('/api/auth/me').then(function (res) {
      BSAI.Auth._authedUser = res.data && res.data.user;
      return res.data && res.data.user;
    });
  };

  BSAI.Auth.health = function () {
    return BSAI.Auth.fetchJSON('/api/health').then(function (res) { return res.data; });
  };

  BSAI.Auth.snapshot = function (optCompanyId) {
    var qs = optCompanyId ? ('?company_id=' + encodeURIComponent(optCompanyId)) : '';
    return BSAI.Auth.fetchJSON('/api/demo/snapshot' + qs)
      .then(function (res) { return res.data; });
  };

  /* --------  Backend reachability  -------- */
  var cachedReachable = null;
  BSAI.Auth.isBackendReachable = function (forceRefresh) {
    if (cachedReachable !== null && !forceRefresh) return Promise.resolve(cachedReachable);
    return BSAI.Auth.health().then(
      function () { cachedReachable = true; return true; },
      function () { cachedReachable = false; return false; }
    );
  };

  /* --------  Login view (no styling; uses existing CSS classes)  -------- */
  function loginViewHtml(preEmail, errorMsg) {
    var emailEsc = (preEmail || '').replace(/["&<>]/g, function (c) {
      return ({'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'})[c];
    });
    var errHtml = errorMsg
      ? ('<div class="alert alert--danger" role="alert" style="margin-top:0;margin-bottom:16px;padding:10px 12px;border-radius:8px;background:rgba(220,38,38,0.08);border:1px solid rgba(220,38,38,0.3);color:#dc2626;">' +
         (String(errorMsg).replace(/[<>&]/g, '')) + '</div>')
      : '';
    return (
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">' +
        '<div class="card" style="width:100%;max-width:420px;padding:28px;">' +
          '<div style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px;">' +
            '<div style="width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#00d4ff,#14b8a6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:22px;letter-spacing:0.5px;">BS</div>' +
            '<h1 style="margin:12px 0 4px 0;font-size:22px;">BrandShield AI</h1>' +
            '<div style="color:var(--muted,#8892a6);font-size:13px;">Sign in to continue</div>' +
          '</div>' +
          errHtml +
          '<form id="bs-login-form" autocomplete="on" novalidate>' +
            '<div style="margin-bottom:14px;">' +
              '<label for="bs-login-email" style="display:block;margin-bottom:6px;font-size:13px;font-weight:500;">Email</label>' +
              '<input id="bs-login-email" name="email" type="email" required autocomplete="username" placeholder="you@company.com" value="' + emailEsc + '"' +
                ' style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:var(--bg-card,#1a2332);color:inherit;font-size:14px;" />' +
            '</div>' +
            '<div style="margin-bottom:18px;">' +
              '<label for="bs-login-password" style="display:block;margin-bottom:6px;font-size:13px;font-weight:500;">Password</label>' +
              '<input id="bs-login-password" name="password" type="password" required autocomplete="current-password" placeholder="••••••••••"' +
                ' style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:var(--bg-card,#1a2332);color:inherit;font-size:14px;" />' +
            '</div>' +
            '<button type="submit" class="btn btn--scan" style="width:100%;justify-content:center;">' +
              '<span id="bs-login-btn-label">Sign in</span>' +
            '</button>' +
          '</form>' +
          '<div style="margin-top:18px;color:var(--muted,#8892a6);font-size:12px;line-height:1.6;">' +
            'Contact your Platform Admin to request an account. ' +
            'If the backend is not running, the app falls back to <strong>Demo Mode</strong>.' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  BSAI.Auth.renderLogin = function (opts) {
    opts = opts || {};
    // Hide sidebar + topbar for the login view.
    var sb = document.getElementById('sidebar');
    var tb = document.getElementById('topbar');
    if (sb) sb.style.display = 'none';
    if (tb) tb.style.display = 'none';
    var mount = document.getElementById('view-root');
    if (!mount) return;
    mount.innerHTML = loginViewHtml(opts.email, opts.error);
    var form = document.getElementById('bs-login-form');
    if (!form) return;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var email = (document.getElementById('bs-login-email').value || '').trim();
      var password = (document.getElementById('bs-login-password').value || '');
      var btnLabel = document.getElementById('bs-login-btn-label');
      if (!email || !password) {
        BSAI.Auth.renderLogin({ email: email, error: 'Email and password are required.' });
        return;
      }
      if (btnLabel) btnLabel.textContent = 'Signing in…';
      form.querySelectorAll('input,button').forEach(function (el) { el.disabled = true; });
      BSAI.Auth.login(email, password).then(function () {
        // Now load backend-owned snapshot → into BSAI.state, enter app shell.
        return BSAI.Auth.onLoginSuccess();
      }).catch(function (err) {
        var msg = (err && err.message) ? err.message : 'Sign in failed. Try again.';
        if (String(msg).toLowerCase().indexOf('csrf') !== -1) msg = 'Session expired; please retry.';
        BSAI.Auth.renderLogin({ email: email, error: msg });
      });
    });
  };

  BSAI.Auth.redirectToLogin = function () {
    if (typeof location !== 'undefined') {
      if (location.hash !== '#login') location.replace('#login');
      BSAI.Auth.renderLogin({ error: 'Please sign in again.' });
    }
  };

  /* --------  Post-login: enter app shell + hydrate state from backend  -------- */
  BSAI.Auth.onLoginSuccess = function () {
    // Restore sidebar + topbar.
    var sb = document.getElementById('sidebar');
    var tb = document.getElementById('topbar');
    if (sb) sb.style.display = '';
    if (tb) tb.style.display = '';
    // Update user chip with role/email.
    applyUserChip(BSAI.Auth._authedUser);
    // Hide admin-only nav entries for non-admin users
    applyRoleVisibility(BSAI.Auth._authedUser);
    // Load backend snapshot
    return BSAI.Auth.snapshot().then(function (snap) {
      hydrateStateFromSnapshot(snap);
      // Clear stale hash if still on login.
      if ((location.hash || '').replace(/^#/, '') === 'login') location.replace('#dashboard');
      // Notify views to re-render.
      if (typeof BSAI.renderCurrentView === 'function') BSAI.renderCurrentView();
      if (typeof BSAI.refreshStatuses === 'function') BSAI.refreshStatuses();
      safeToast('ok', 'Signed in', 'Welcome back.' + (BSAI.Auth._authedUser && BSAI.Auth._authedUser.email ? (' · ' + BSAI.Auth._authedUser.email) : ''));
      return true;
    }).catch(function (err) {
      safeToast('warn', 'Signed in but data failed to load', String(err && err.message || err));
      return true;
    });
  };

  /* --------  Map backend snapshot shape to frontend BSAI.state  -------- */
  function hydrateStateFromSnapshot(snap) {
    if (!snap) return;
    // Snapshot already contains scope-filtered rows.
    var brands = Array.isArray(snap.brands) ? snap.brands : [];
    var detectedSocials = Array.isArray(snap.socialProfiles) ? snap.socialProfiles : [];
    var detectedApps = Array.isArray(snap.apps) ? snap.apps : [];
    var detectedWebsites = Array.isArray(snap.websites) ? snap.websites : [];
    var investigations = Array.isArray(snap.investigations) ? snap.investigations : [];
    var trendPoints = Array.isArray(snap.trendPoints) ? snap.trendPoints : [];
    var scanHistory = Array.isArray(snap.scanHistory) ? snap.scanHistory : [];
    // Attach evidence arrays already on entities from backend.
    // Enrich risk if the frontend engine wants to re-weight locally.
    var newState = {
      brands: brands,
      socialProfiles: detectedSocials,
      apps: detectedApps,
      websites: detectedWebsites,
      investigations: investigations,
      trendPoints: trendPoints,
      scanHistory: scanHistory,
      lastFullScan: scanHistory.length ? (scanHistory[0].at || scanHistory[0].detected_at || new Date().toISOString()) : new Date().toISOString(),
      settings: BSAI.state && BSAI.state.settings ? BSAI.state.settings : (BSAI.Risk ? BSAI.Risk.mergeDefaults({}) : {}),
      _fromBackend: true,
      _scopeCompanyIds: Array.isArray(snap.scope_company_ids) ? snap.scope_company_ids : null,
      _user: snap.user || null
    };
    if (BSAI.Risk && typeof BSAI.Risk.enrichAll === 'function') {
      try { BSAI.Risk.enrichAll(newState); } catch (_) { /* ignore */ }
    }
    BSAI.state = newState;
    if (typeof BSAI.save === 'function') {
      try { BSAI.save(); } catch (_) { /* ignore */ }
    }
  }
  BSAI.Auth.hydrateStateFromSnapshot = hydrateStateFromSnapshot;

  /* --------  Update user chip  -------- */
  function applyUserChip(user) {
    if (!user) return;
    var chip = document.querySelector('.user-chip');
    if (!chip) return;
    var initials = 'U';
    if (user.email) {
      var head = (user.email.split('@')[0] || 'u').replace(/[^a-zA-Z0-9]/g, '').slice(0, 1).toUpperCase();
      if (head) initials = head;
    }
    var avatar = chip.querySelector('.user-chip__avatar');
    var name = chip.querySelector('.user-chip__name');
    var role = chip.querySelector('.user-chip__role');
    if (avatar) avatar.textContent = initials;
    if (name) name.textContent = user.email ? user.email.split('@')[0] : 'User';
    if (role) role.textContent = (user.role === 'admin' ? 'Platform Admin' : (user.company_name ? 'Company · ' + user.company_name : 'Company User'));
    chip.title = user.email || '';
    // Show logout button: it's inside the chip already; unhide.
    var lbtn = document.getElementById('btn-logout') || chip.querySelector('[data-role-logout]');
    if (lbtn) lbtn.style.display = '';
  }

  /* --------  Show/hide admin-only sidebar entries  -------- */
  function applyRoleVisibility(user) {
    document.querySelectorAll('[data-role-only]').forEach(function (el) {
      var needRole = el.getAttribute('data-role-only') || '';
      if (user && user.role === needRole) el.style.display = '';
      else el.style.display = 'none';
    });
  }
  BSAI.Auth.applyRoleVisibility = applyRoleVisibility;

  function cloneObj(o) {
    var c = {};
    Object.keys(o).forEach(function (k) { c[k] = o[k]; });
    return c;
  }
})();
