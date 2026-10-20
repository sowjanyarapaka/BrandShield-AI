/* =========================================================
   ui-components.js
   Exposes BSAI.UI = { ... renderers, toast, modal, drawer ... }

   Convention: every renderer returns an HTML string. The
   parent then sets innerHTML and binds events via IDs/classes.
   ========================================================= */
(function () {
  'use strict';
  var BSAI = (window.BSAI = window.BSAI || {});

  /* --------  Small SVG icons (inline, no deps)  -------- */
  var ICONS = {
    shield:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    users:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    phone:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',
    globe:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>',
    alert:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12" y2="17"/></svg>',
    check:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    plus:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    edit:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    trash:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    download:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    printer:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
    magnify:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    filter:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    clock:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    reset:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    x:          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    info:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>',
    spinner:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
    arrowUp:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
    arrowDown:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>',
    link:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07L11.5 5.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>',
    verified:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.5 2 3.2-.2.6 3.2 2.8 1.6-1 3.2L20.8 15l-3 .2-.6 3.2-3.2-1-3.2 1-.6-3.2-3-.2-1.6-3.2 2.8-1.6.6-3.2 3.2.2z"/><polyline points="9 12 11 14 15 10"/></svg>'
  };
  function icon(name, size) {
    size = size || 18;
    return ICONS[name] ? ICONS[name].replace(/viewBox="0 0 24 24"/, 'viewBox="0 0 24 24" width="' + size + '" height="' + size + '"') : '';
  }

  /* --------  Utilities  -------- */
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fmtNum(n) {
    if (n == null || isNaN(n)) return '—';
    try { return Number(n).toLocaleString(); } catch (_) { return String(n); }
  }
  function fmtCompact(n) {
    if (n == null || isNaN(n)) return '—';
    n = Number(n);
    if (n >= 1e6) return (n / 1e6).toFixed(n < 10e6 ? 2 : 1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(n < 10000 ? 1 : 0) + 'K';
    return String(n);
  }
  function fmtDateTime(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (_) { return String(iso); }
  }
  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
    } catch (_) { return String(iso); }
  }
  function timeAgo(iso) {
    if (!iso) return 'Unknown';
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return 'Unknown';
      var diffMs = (Date.now() - d.getTime());
      if (diffMs < 0) diffMs = 0;
      var s = Math.floor(diffMs / 1000);
      if (s < 60) return s + 's ago';
      var m = Math.floor(s / 60);
      if (m < 60) return m + 'm ago';
      var h = Math.floor(m / 60);
      if (h < 24) return h + 'h ago';
      var days = Math.floor(h / 24);
      if (days < 45) return days + 'd ago';
      return fmtDate(iso);
    } catch (_) { return 'Unknown'; }
  }
  function uid(prefix) {
    return (prefix || 'id_') + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  }

  /* --------  Brand lookup helpers  -------- */
  function brandById(id) {
    return (BSAI.state && BSAI.state.brands || []).find(function (b) { return b.id === id; });
  }
  function brandName(id) {
    var b = brandById(id); return b ? b.name : 'Unknown Brand';
  }
  function brandLogo(id) {
    var b = brandById(id); return b ? b.logo : '';
  }

  /* --------  KPI card  -------- */
  function kpiCard(opts) {
    var variant = opts.variant || '';
    var icon = opts.icon || 'shield';
    var label = opts.label || '';
    var value = opts.value != null ? opts.value : 0;
    var suffix = opts.suffix || '';
    var sub = opts.sub || '';
    var delta = opts.delta || null;
    var pulse = opts.pulse;
    return (
      '<div class="kpi ' + (variant ? 'kpi--' + variant : '') + '">' +
        (pulse ? '<span class="kpi__pulse' + (pulse === 'cyan' ? ' cyan' : pulse === 'amber' ? ' amber' : pulse === 'red' ? ' red' : '') + '"></span>' : '') +
        '<div class="kpi__icon">' + ICONS[icon] + '</div>' +
        '<div class="kpi__label">' + escapeHtml(label) + '</div>' +
        '<div class="kpi__value">' + fmtNum(value) + '<span class="muted" style="font-weight:500;font-size:13px;letter-spacing:0;margin-left:4px">' + escapeHtml(suffix) + '</span></div>' +
        '<div class="kpi__sub">' +
          (delta != null ? (
            '<span class="' + (delta >= 0 ? 'kpi__delta-up' : 'kpi__delta-down') + '">' +
              (delta >= 0 ? '▲' : '▼') + ' ' + Math.abs(delta) + '%' +
            '</span><span class="sep"></span>') : '') +
          (sub || '') +
        '</div>' +
      '</div>'
    );
  }

  /* --------  Risk / status badges  -------- */
  function riskBadge(riskScoreOrLevel, extra) {
    extra = extra || {};
    var cls, text;
    if (typeof riskScoreOrLevel === 'number') {
      var lvl = BSAI.Risk.levelForScore(riskScoreOrLevel, BSAI.state && BSAI.state.settings && BSAI.state.settings.levelCutoffs);
      cls = lvl.cls; text = lvl.text;
    } else {
      var s = String(riskScoreOrLevel || '').toLowerCase();
      if (s === 'critical' || s === 'high')  { cls = 'risk--high';   text = 'High Risk — Review Required'; }
      else if (s === 'medium' || s === 'warning') { cls = 'risk--medium'; text = 'Medium Risk'; }
      else if (s === 'low')    { cls = 'risk--low';   text = 'Low Risk'; }
      else if (s === 'review') { cls = 'risk--review'; text = 'Review Needed'; }
      else if (s === 'safe' || s === 'verified') { cls = 'risk--safe'; text = 'Safe / Verified'; }
      else if (s === 'unknown' || s === '') { cls = 'risk--unknown'; text = 'Unknown'; }
      else { cls = 'risk--review'; text = riskScoreOrLevel; }
    }
    var sizeClass = extra.small ? ' style="padding:3px 8px;font-size:10.5px"' : '';
    var label = extra.short ? text.replace(/ — Review Required/i, '').replace(/Risk /i, '') : text;
    return (
      '<span class="badge ' + cls + '"' + sizeClass + '>' +
        '<span class="badge__dot"></span>' +
        escapeHtml(label) +
      '</span>'
    );
  }

  function statusBadge(status, extra) {
    extra = extra || {};
    status = String(status || 'open').toLowerCase();
    var map = {
      open:          ['status--open',          'Open'],
      investigating: ['status--investigating', 'Investigating'],
      resolved:      ['status--resolved',      'Resolved'],
      dismissed:     ['status--dismissed',     'Dismissed'],
      fp:            ['status--fp',            'False Positive'],
      'false-positive': ['status--fp',         'False Positive'],
      pending:       ['status--pending',       'Pending'],
      verified:      ['status--resolved',      'Verified']
    };
    var m = map[status] || ['status--pending', status];
    var cls = m[0]; var text = m[1];
    var sizeStyle = extra.small ? ' style="padding:3px 8px;font-size:10.5px"' : '';
    return '<span class="badge ' + cls + '"' + sizeStyle + '><span class="badge__dot"></span>' + escapeHtml(text) + '</span>';
  }

  /* --------  Risk ring (CSS conic) + confidence bar  -------- */
  function riskRing(score, opts) {
    opts = opts || {};
    score = Math.max(0, Math.min(100, score | 0));
    var color;
    if (score >= 85) color = '#EF4444';
    else if (score >= 62) color = '#F59E0B';
    else if (score >= 42) color = '#7C3AED';
    else if (score >= 18) color = '#10B981';
    else color = '#00D4FF';
    var cls = 'risk-ring ' + (opts.size === 'sm' ? 'sm' : opts.size === 'lg' ? 'lg' : '');
    return '<div class="' + cls + '" style="--p:' + score + ';--ring-color:' + color + ';"><span>' + score + '</span></div>';
  }

  function confidenceBar(pct, label) {
    pct = Math.max(0, Math.min(100, pct | 0));
    label = label || (pct + '% Confidence');
    return (
      '<div class="confidence-bar">' +
        '<span style="min-width:110px">Confidence</span>' +
        '<div class="confidence-bar__track"><div class="confidence-bar__fill" style="--c:' + pct + '"></div></div>' +
        '<span class="mono" style="font-weight:700;color:var(--ink-strong)">' + pct + '%</span>' +
      '</div>'
    );
  }

  /* --------  Evidence list  -------- */
  function evidenceList(items, options) {
    options = options || {};
    if (!items || !items.length) {
      return emptyState({ icon: 'info', title: 'No simulated evidence available', desc: 'The detection engine did not return any signal items for this asset.' });
    }
    return (
      '<div class="ev-list">' +
        items.map(function (e) {
          var wPct = Math.round(Math.max(0, Math.min(1, e.weight || 0)) * 100);
          return (
            '<div class="ev ' + ({ pos: 'pos', neg: 'neg', neu: 'neu', amb: 'amb' })[e.polarity] + '">' +
              '<div class="ev__top">' +
                '<span class="ev__title">' + escapeHtml(e.title) + '</span>' +
                (e.simulated ? '<span class="badge sim">Simulated</span>' : '') +
                '<span class="ev__weight mono" style="margin-left:auto">weight ' + wPct + '%</span>' +
              '</div>' +
              (e.body ? '<div class="ev__body">' + escapeHtml(e.body) + '</div>' : '') +
            '</div>'
          );
        }).join('') +
      '</div>'
    );
  }

  /* --------  States (loading/empty/error/unavailable)  -------- */
  function stateBlock(kind, opts) {
    opts = opts || {};
    var icons = { loading: 'spinner', empty: 'info', error: 'alert', unavailable: 'filter' };
    var title = opts.title || {
      loading: 'Loading…',
      empty: 'Nothing to show yet',
      error: 'Something went wrong',
      unavailable: 'Source not connected'
    }[kind];
    var desc = opts.desc || {
      loading: 'Simulated data is being prepared for this view.',
      empty: 'No items match the current filters. Try removing filters or creating a new item.',
      error: 'The simulated module returned an unexpected error. Try again or reset the demo.',
      unavailable: 'This module depends on a live data source that is NOT connected in demo mode. Below are seed-only simulated findings for UI validation.'
    }[kind];
    var actions = opts.actions || '';
    return (
      '<div class="state ' + kind + '">' +
        '<div class="state__icon">' + ICONS[icons[kind]] + '</div>' +
        '<div class="state__title">' + escapeHtml(title) + '</div>' +
        '<div class="state__desc">' + escapeHtml(desc) + '</div>' +
        (actions ? '<div style="margin-top:6px">' + actions + '</div>' : '') +
      '</div>'
    );
  }
  function loadingState(o) { return stateBlock('loading', o || {}); }
  function emptyState(o)   { return stateBlock('empty',   o || {}); }
  function errorState(o)   { return stateBlock('error',   o || {}); }
  function unavailableState(o) { return stateBlock('unavailable', o || {}); }

  /* --------  Severity legend  -------- */
  function severityLegend() {
    var items = [
      { sw: '#EF4444', label: 'High Risk — Review Required' },
      { sw: '#F59E0B', label: 'Medium Risk' },
      { sw: '#7C3AED', label: 'Review Needed' },
      { sw: '#10B981', label: 'Low Risk' },
      { sw: '#00D4FF', label: 'Safe / Verified' }
    ];
    return (
      '<div class="legend">' +
        items.map(function (i) {
          return '<div class="item"><span class="sw" style="background:' + i.sw + '"></span>' + escapeHtml(i.label) + '</div>';
        }).join('') +
      '</div>'
    );
  }

  /* --------  Initials avatar  -------- */
  function initialsFromName(name, size, variant) {
    var parts = String(name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    var letters = parts.map(function (p) { return p.charAt(0).toUpperCase(); }).join('') || '?';
    var vars = ['', 'amber', 'red', 'navy', 'teal'];
    var v = variant || vars[Math.max(0, Math.min(vars.length - 1, hash(name) % vars.length))];
    return '<div class="initials ' + (v || '') + ' ' + (size || 'sm') + '" title="' + escapeHtml(name) + '">' + escapeHtml(letters) + '</div>';
  }
  function hash(s) {
    var h = 0;
    for (var i = 0; i < (s || '').length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return Math.abs(h);
  }

  /* --------  Timeline  -------- */
  function timeline(items) {
    if (!items || !items.length) return emptyState({ icon: 'clock', title: 'No timeline events yet', desc: 'Status updates and analyst notes will appear here.' });
    return (
      '<div class="timeline">' +
        items.slice().sort(function (a, b) { return new Date(a.t) - new Date(b.t); }).map(function (e) {
          var cls = '';
          if (e.kind === 'good') cls = 'good';
          else if (e.kind === 'bad') cls = 'bad';
          else if (e.kind === 'warn') cls = 'warn';
          else if (e.kind === 'invest' || e.kind === 'new') cls = '';
          else cls = 'old';
          return (
            '<div class="tl-item ' + cls + '">' +
              '<div class="tl__time">' + fmtDateTime(e.t) + '</div>' +
              '<div class="tl__title">' + escapeHtml(e.title || '') + '</div>' +
              (e.body ? '<div class="tl__body">' + escapeHtml(e.body) + '</div>' : '') +
            '</div>'
          );
        }).join('') +
      '</div>'
    );
  }

  /* --------  Toasts  -------- */
  var toastHostEl;
  function toast(type, title, body) {
    if (!toastHostEl) toastHostEl = document.getElementById('toast-host');
    if (!toastHostEl) return;
    if (!body) { body = title || ''; title = type; type = 'ok'; }
    var icons = { ok: 'check', warn: 'alert', err: 'alert', info: 'info' };
    var t = document.createElement('div');
    t.className = 'toast ' + (type || 'ok');
    t.innerHTML =
      '<div class="toast__icon">' + ICONS[icons[type] || 'info'] + '</div>' +
      '<div class="grow">' +
        (title ? '<div class="toast__title">' + escapeHtml(title) + '</div>' : '') +
        (body ? '<div class="toast__body">' + escapeHtml(body) + '</div>' : '') +
      '</div>';
    toastHostEl.appendChild(t);
    setTimeout(function () {
      t.style.opacity = '0'; t.style.transform = 'translateY(8px) scale(.98)';
      t.style.transition = 'opacity .22s ease, transform .22s ease';
      setTimeout(function () { t.remove(); }, 260);
    }, 3400);
  }

  /* --------  Modal  -------- */
  function openModal(opts) {
    opts = opts || {};
    var host = document.getElementById('modal-host');
    var titleEl = document.getElementById('modal-title');
    var bodyEl  = document.getElementById('modal-body');
    var footerEl = document.getElementById('modal-footer');
    titleEl.textContent = opts.title || '';
    bodyEl.innerHTML = opts.body || '';
    footerEl.innerHTML = (opts.footer || '') ||
      '<button class="btn btn--secondary" data-close-modal="1">Cancel</button>' +
      '<button class="btn btn--primary" id="modal-confirm">Confirm</button>';
    host.classList.add('open');
    host.setAttribute('aria-hidden', 'false');
    if (opts.onConfirm) {
      var btn = document.getElementById('modal-confirm') || footerEl.querySelector('.btn--primary');
      if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); opts.onConfirm(closeModal); });
    }
    host.querySelectorAll('[data-close-modal]').forEach(function (el) {
      el.addEventListener('click', function () { closeModal(); });
    });
  }
  function closeModal() {
    var host = document.getElementById('modal-host');
    if (!host) return;
    host.classList.remove('open');
    host.setAttribute('aria-hidden', 'true');
    document.getElementById('modal-body').innerHTML = '';
    document.getElementById('modal-footer').innerHTML = '';
  }
  function confirmDialog(title, body, onConfirm) {
    openModal({
      title: title,
      body: '<p class="muted">' + escapeHtml(body) + '</p>',
      footer: '<button class="btn btn--secondary" data-close-modal="1">Cancel</button><button class="btn btn--danger" id="modal-confirm">Confirm</button>',
      onConfirm: function (close) { close(); if (onConfirm) onConfirm(); }
    });
  }

  /* --------  Drawer (right panel)  -------- */
  function openDrawer(opts) {
    opts = opts || {};
    var drawer = document.getElementById('drawer');
    document.getElementById('drawer-kicker').textContent = opts.kicker || 'Details';
    document.getElementById('drawer-title').textContent = opts.title || '';
    document.getElementById('drawer-body').innerHTML = opts.body || '';
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.querySelectorAll('[data-close-drawer]').forEach(function (el) {
      el.onclick = function () { closeDrawer(); };
    });
  }
  function closeDrawer() {
    var drawer = document.getElementById('drawer');
    if (!drawer) return;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.getElementById('drawer-body').innerHTML = '';
  }

  /* --------  Section header (for view titles + primary CTA)  -------- */
  function sectionHeader(opts) {
    opts = opts || {};
    var title = opts.title || '';
    var sub = opts.subtitle || '';
    var ctas = opts.ctas || '';
    return (
      '<div class="card-header" style="padding:14px 18px;margin-bottom:18px;border-radius:var(--r-lg);border:1px solid var(--border);background:linear-gradient(180deg,#FFFFFF,#F4FBFF);">' +
        '<div style="display:flex;align-items:center;gap:14px;flex:1;min-width:0">' +
          (opts.icon ? '<div class="kpi__icon" style="margin:0">' + (ICONS[opts.icon] || '') + '</div>' : '') +
          '<div style="min-width:0">' +
            '<h2 style="font-size:17px">' + escapeHtml(title) + '</h2>' +
            (sub ? '<div class="subtle" style="font-size:12.5px;margin-top:2px">' + escapeHtml(sub) + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="row" style="flex-wrap:wrap">' + ctas + '</div>' +
      '</div>'
    );
  }

  /* --------  Public  -------- */
  BSAI.UI = {
    ICONS: ICONS,
    icon: icon,
    escapeHtml: escapeHtml,
    fmtNum: fmtNum,
    fmtCompact: fmtCompact,
    fmtDateTime: fmtDateTime,
    fmtDate: fmtDate,
    timeAgo: timeAgo,
    uid: uid,
    brandById: brandById,
    brandName: brandName,
    brandLogo: brandLogo,
    initials: initialsFromName,

    kpiCard: kpiCard,
    riskBadge: riskBadge,
    statusBadge: statusBadge,
    riskRing: riskRing,
    confidenceBar: confidenceBar,
    evidenceList: evidenceList,
    severityLegend: severityLegend,
    timeline: timeline,
    sectionHeader: sectionHeader,

    loadingState: loadingState,
    emptyState: emptyState,
    errorState: errorState,
    unavailableState: unavailableState,
    stateBlock: stateBlock,

    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    confirmDialog: confirmDialog,
    openDrawer: openDrawer,
    closeDrawer: closeDrawer
  };
})();
