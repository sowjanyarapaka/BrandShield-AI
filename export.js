/* =========================================================
   export.js
   - CSV export (UTF-8 BOM + Excel-friendly quoting)
   - Print summary (triggers window.print() + print-only CSS)
   Exposes BSAI.Export = { csv(data, opts), printSummary(opts) }
   ========================================================= */
(function () {
  'use strict';
  var BSAI = (window.BSAI = window.BSAI || {});

  function csvEscape(v) {
    if (v == null) return '';
    var s = String(v);
    if (/[",\r\n;]/.test(s)) {
      s = '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function buildCsv(rows, opts) {
    opts = opts || {};
    var headers = opts.headers || (rows[0] ? Object.keys(rows[0]) : []);
    var headerLine = headers.map(csvEscape).join(',');
    var body = rows.map(function (r) {
      return headers.map(function (h) { return csvEscape(r[h]); }).join(',');
    }).join('\r\n');
    return '\ufeff' + headerLine + '\r\n' + body; // BOM + CRLF
  }

  function download(filename, content, mime) {
    mime = mime || 'text/csv;charset=utf-8';
    try {
      var blob = new Blob([content], { type: mime });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        a.remove();
        try { URL.revokeObjectURL(url); } catch (_) {}
      }, 0);
      return true;
    } catch (err) {
      if (BSAI.UI && BSAI.UI.toast) BSAI.UI.toast('err', 'Export failed', String(err && err.message || err));
      return false;
    }
  }

  /* Flatteners for our entity types (social/apps/websites/investigations/brands) */
  function socialRows(list) {
    return list.map(function (s) {
      return {
        Id: s.id,
        Brand: BSAI.UI.brandName(s.brandId),
        Platform: s.platform,
        Username: s.username,
        'Display Name': s.displayName,
        'Risk Score': s._risk ? s._risk.riskScore : '',
        'Risk Level': s._risk ? s._risk.levelText : '',
        Confidence: s._risk ? s._risk.confidence : '',
        Status: s.status || (s.isOfficial ? 'Official' : 'Review'),
        Followers: s.followers || '',
        Following: s.following || '',
        Posts: s.posts || '',
        'External URL': s.externalUrl || '',
        Official: s.isOfficial ? 'Yes' : 'No',
        Detected: s.created || '',
        DetectedBy: s.detectedBy || 'Simulated'
      };
    });
  }
  function appRows(list) {
    return list.map(function (a) {
      return {
        Id: a.id,
        Brand: BSAI.UI.brandName(a.brandId),
        App: a.name,
        Store: a.store,
        Publisher: a.publisher,
        PackageId: a.packageId,
        Installs: a.installs || '',
        Rating: a.rating || '',
        Reviews: a.reviews || '',
        'Risk Score': a._risk ? a._risk.riskScore : '',
        'Risk Level': a._risk ? a._risk.levelText : '',
        Confidence: a._risk ? a._risk.confidence : '',
        Official: a.isOfficial ? 'Yes' : 'No',
        URL: a.url || '',
        Detected: a.created || '',
        DetectedBy: a.detectedBy || 'Simulated'
      };
    });
  }
  function websiteRows(list) {
    return list.map(function (w) {
      return {
        Id: w.id,
        Brand: BSAI.UI.brandName(w.brandId),
        Domain: w.domain,
        Resembles: w.resembles || '',
        TypoExplanation: w.typoExplanation || '',
        Categories: (w.categories || []).join('; '),
        FirstSeen: w.firstSeen || '',
        'Risk Score': w._risk ? w._risk.riskScore : '',
        'Risk Level': w._risk ? w._risk.levelText : '',
        Confidence: w._risk ? w._risk.confidence : '',
        Registrar: w.registrar || '',
        IP: w.ip || '',
        DNS: w.dnsStatus || '',
        DetectedBy: w.severityHint ? 'Seed severity ' + w.severityHint : 'Simulated'
      };
    });
  }
  function investigationRows(list) {
    return list.map(function (c) {
      return {
        CaseId: c.id,
        Title: c.title,
        Brand: BSAI.UI.brandName(c.brandId),
        Severity: c.severity,
        Status: c.status,
        AssignedTo: c.assignedTo || '',
        Created: c.createdAt || '',
        Updated: c.updatedAt || '',
        LinkedAssets: (c.linkedAssetIds || []).join('; '),
        Impact_Reach: (c.impact || {}).potentialReach || '',
        Impact_ReportedVictims: (c.impact || {}).reportedVictims || '',
        Impact_ConfirmedVictims: (c.impact || {}).confirmedVictims || '',
        Impact_ReportedLoss: (c.impact || {}).reportedLoss || '',
        Impact_ConfirmedLoss: (c.impact || {}).confirmedLoss || ''
      };
    });
  }
  function brandRows(list) {
    return list.map(function (b) {
      return {
        Id: b.id,
        Brand: b.name,
        Tagline: b.tagline || '',
        Domains: (b.verifiedDomains || []).map(function (d) { return d.value + (d.verified ? '(verified)' : ''); }).join('; '),
        OfficialSocials: (b.officialSocials || []).map(function (s) { return s.platform + ':' + s.username; }).join('; '),
        Apps: (b.officialApps || []).map(function (a) { return a.name + ' (' + a.store + ')'; }).join('; '),
        Support: (b.supportChannels || []).map(function (s) { return s.type + ':' + s.value; }).join('; '),
        Allowlist: (b.allowlist || []).join('; '),
        CreatedAt: b.createdAt || ''
      };
    });
  }

  function exportCsv(kind, list, filenamePrefix) {
    var rows, headers, prefix = filenamePrefix || 'BrandShieldAI';
    if (kind === 'brands') { rows = brandRows(list || BSAI.state.brands); headers = Object.keys(brandRows([BSAI.state.brands[0]])[0] || {}); }
    else if (kind === 'social') { rows = socialRows(list || BSAI.state.socialProfiles); headers = Object.keys(socialRows([BSAI.state.socialProfiles[0]])[0] || {}); }
    else if (kind === 'apps') { rows = appRows(list || BSAI.state.apps); headers = Object.keys(appRows([BSAI.state.apps[0]])[0] || {}); }
    else if (kind === 'websites') { rows = websiteRows(list || BSAI.state.websites); headers = Object.keys(websiteRows([BSAI.state.websites[0]])[0] || {}); }
    else if (kind === 'investigations') { rows = investigationRows(list || BSAI.state.investigations); headers = Object.keys(investigationRows([BSAI.state.investigations[0]])[0] || {}); }
    else if (kind === 'all') {
      // Combine multiple sections into one workbook-like CSV by concatenating sections with banner rows
      var parts = [];
      parts.push(['=== BRANDS ===']);
      var br = brandRows(BSAI.state.brands);
      if (br.length) parts.push(Object.keys(br[0])); br.forEach(function (r) { parts.push(Object.values(r)); });
      parts.push([]);
      parts.push(['=== SOCIAL PROFILES ===']);
      var sr = socialRows(BSAI.state.socialProfiles);
      if (sr.length) parts.push(Object.keys(sr[0])); sr.forEach(function (r) { parts.push(Object.values(r)); });
      parts.push([]);
      parts.push(['=== APPS ===']);
      var ar = appRows(BSAI.state.apps);
      if (ar.length) parts.push(Object.keys(ar[0])); ar.forEach(function (r) { parts.push(Object.values(r)); });
      parts.push([]);
      parts.push(['=== WEBSITES ===']);
      var wr = websiteRows(BSAI.state.websites);
      if (wr.length) parts.push(Object.keys(wr[0])); wr.forEach(function (r) { parts.push(Object.values(r)); });
      parts.push([]);
      parts.push(['=== INVESTIGATIONS ===']);
      var ir = investigationRows(BSAI.state.investigations);
      if (ir.length) parts.push(Object.keys(ir[0])); ir.forEach(function (r) { parts.push(Object.values(r)); });
      var flat = '\ufeff' + parts.map(function (row) {
        if (Array.isArray(row) && typeof row[0] === 'string' && row[0].indexOf('===') === 0) return row[0];
        if (Array.isArray(row)) return row.map(csvEscape).join(',');
        return '';
      }).join('\r\n');
      var stamp = new Date().toISOString().slice(0, 10);
      return download(prefix + '-FullExport-' + stamp + '.csv', flat, 'text/csv;charset=utf-8');
    }
    else {
      rows = []; headers = [];
    }
    if (!rows || !rows.length) {
      if (BSAI.UI && BSAI.UI.toast) BSAI.UI.toast('warn', 'Nothing to export', 'Current filters did not match any rows.');
      return false;
    }
    var content = buildCsv(rows, { headers: headers });
    var stamp = new Date().toISOString().slice(0, 10);
    return download(prefix + '-' + kind + '-' + stamp + '.csv', content, 'text/csv;charset=utf-8');
  }

  /* Print summary: builds a printable-only card grid in a temporary modal-less container and triggers print */
  function printSummary(opts) {
    opts = opts || {};
    // Build a summary view and inject it into an existing div that print styles make visible.
    var wrap = document.getElementById('print-summary');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'print-summary';
      wrap.style.cssText = 'display:none;';
      document.body.appendChild(wrap);
    }
    var s = BSAI.state;
    var threatsHigh = s.socialProfiles.concat(s.apps, s.websites).filter(function (x) { return x._risk && x._risk.level === 'high'; });
    var threatsMed  = s.socialProfiles.concat(s.apps, s.websites).filter(function (x) { return x._risk && x._risk.level === 'medium'; });
    var openCases = s.investigations.filter(function (c) { return c.status === 'open' || c.status === 'investigating'; });
    var summary = [
      ['Report generated', new Date().toLocaleString()],
      ['Mode', 'DEMO — Fictional data, simulated analysis only'],
      ['Monitored brands', s.brands.length],
      ['Total tracked assets', (s.socialProfiles.length + s.apps.length + s.websites.length)],
      ['High Risk findings', threatsHigh.length],
      ['Medium Risk findings', threatsMed.length],
      ['Open / Investigating cases', openCases.length],
      ['Resolved cases', s.investigations.filter(function (c) { return c.status === 'resolved'; }).length],
      ['Potential reach', 'Data Unavailable'],
      ['Reported / Confirmed victims', 'Data Unavailable'],
      ['Financial losses', 'Data Unavailable']
    ];
    wrap.innerHTML =
      '<div style="padding:24px;background:#fff;color:#000;">' +
        '<h1 style="font-size:22px;margin:0 0 6px;color:#000;">BrandShield AI — Digital Risk Report</h1>' +
        '<div style="color:#333;font-size:12px;margin-bottom:20px;">Brand impersonation protection · DEMO MODE fictional dataset</div>' +
        '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px;">' +
          summary.map(function (r) {
            return '<tr style="border-bottom:1px solid #ddd"><td style="padding:8px 10px;font-weight:700;width:38%;">' + BSAI.UI.escapeHtml(r[0]) + '</td><td style="padding:8px 10px;">' + BSAI.UI.escapeHtml(r[1]) + '</td></tr>';
          }).join('') +
        '</table>' +
        '<h2 style="font-size:16px;color:#000;margin:18px 0 8px;">Top findings by risk</h2>' +
        renderPrintRows('High Risk', threatsHigh) +
        renderPrintRows('Medium Risk', threatsMed) +
        '<h2 style="font-size:16px;color:#000;margin:18px 0 8px;">Open / Investigating cases</h2>' +
        renderPrintCases(openCases) +
        '<p style="margin-top:26px;color:#555;font-size:10.5px;">This report is for UI demonstration only. BrandShield AI DEMO MODE does not perform live scanning of any platform and all findings are clearly labeled Simulated in the application.</p>' +
      '</div>';

    // Use print-only rules already embedded in main.css @media print. We temporarily show the summary, print, then hide.
    wrap.style.display = 'block';
    var originalViewport = document.getElementById('view-root');
    if (originalViewport) originalViewport.style.display = 'none';
    var originalTopbar = document.getElementById('topbar');
    if (originalTopbar) originalTopbar.style.display = 'none';
    try { window.print(); } finally {
      setTimeout(function () {
        wrap.style.display = 'none';
        if (originalViewport) originalViewport.style.display = '';
        if (originalTopbar) originalTopbar.style.display = '';
        if (BSAI.UI && BSAI.UI.toast) BSAI.UI.toast('ok', 'Print summary dialog triggered', opts.successMsg || '');
      }, 500);
    }
  }

  function renderPrintRows(label, list) {
    if (!list.length) return '<div style="padding:10px 0;color:#555;font-size:12px;">' + label + ': none</div>';
    var rows = list.slice(0, 25).map(function (x) {
      var title = x.displayName || x.name || x.domain || x.username || x.id;
      var type = x.platform ? 'Social (' + x.platform + ')' : x.store ? 'App (' + x.store + ')' : x.domain ? 'Website' : 'Asset';
      return '<tr style="border-bottom:1px solid #eee;">' +
        '<td style="padding:8px 10px;vertical-align:top;">' + BSAI.UI.escapeHtml(title) + '</td>' +
        '<td style="padding:8px 10px;vertical-align:top;">' + BSAI.UI.escapeHtml(type) + '</td>' +
        '<td style="padding:8px 10px;vertical-align:top;">' + BSAI.UI.escapeHtml(BSAI.UI.brandName(x.brandId)) + '</td>' +
        '<td style="padding:8px 10px;vertical-align:top;">' + (x._risk ? x._risk.riskScore + ' / ' + x._risk.confidence + '%' : '') + '</td>' +
      '</tr>';
    }).join('');
    return (
      '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px;">' +
        '<thead style="background:#f3f3f3;"><tr><th style="padding:8px 10px;text-align:left;">' + label + '</th><th style="padding:8px 10px;text-align:left;">Type</th><th style="padding:8px 10px;text-align:left;">Brand</th><th style="padding:8px 10px;text-align:left;">Risk / Conf</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>'
    );
  }
  function renderPrintCases(list) {
    if (!list.length) return '<div style="padding:10px 0;color:#555;font-size:12px;">No open cases.</div>';
    var rows = list.map(function (c) {
      return '<tr style="border-bottom:1px solid #eee;">' +
        '<td style="padding:8px 10px;vertical-align:top;">' + BSAI.UI.escapeHtml(c.id) + '</td>' +
        '<td style="padding:8px 10px;vertical-align:top;">' + BSAI.UI.escapeHtml(c.title) + '</td>' +
        '<td style="padding:8px 10px;vertical-align:top;">' + BSAI.UI.escapeHtml(BSAI.UI.brandName(c.brandId)) + '</td>' +
        '<td style="padding:8px 10px;vertical-align:top;">' + BSAI.UI.escapeHtml(c.severity || '') + '</td>' +
        '<td style="padding:8px 10px;vertical-align:top;">' + BSAI.UI.escapeHtml(c.status || '') + '</td>' +
      '</tr>';
    }).join('');
    return (
      '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
        '<thead style="background:#f3f3f3;"><tr><th style="padding:8px 10px;text-align:left;">Case</th><th style="padding:8px 10px;text-align:left;">Title</th><th style="padding:8px 10px;text-align:left;">Brand</th><th style="padding:8px 10px;text-align:left;">Severity</th><th style="padding:8px 10px;text-align:left;">Status</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>'
    );
  }

  BSAI.Export = {
    csv: exportCsv,
    printSummary: printSummary,
    buildCsv: buildCsv,
    rows: {
      social: socialRows,
      apps: appRows,
      websites: websiteRows,
      investigations: investigationRows,
      brands: brandRows
    }
  };
})();
