/* =========================================================
   charts.js
   Pure-canvas charts (no third-party libraries).
     BSAI.Charts.drawSeverityDonut(canvasId, data)
     BSAI.Charts.drawTrendLine(canvasId, data)
     BSAI.Charts.drawAssetBar(canvasId, data)
     BSAI.Charts.drawThreatRadar(canvasId, blips)
   ========================================================= */
(function () {
  'use strict';
  var BSAI = (window.BSAI = window.BSAI || {});

  function canvasOf(id) {
    var c = typeof id === 'string' ? document.getElementById(id) : id;
    if (!c || !(c instanceof HTMLCanvasElement)) return null;
    // scale for DPR
    var dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    var r = c.getBoundingClientRect();
    var w = Math.round(r.width || c.clientWidth || 200);
    var h = Math.round(r.height || c.clientHeight || 200);
    if (c.width !== w * dpr || c.height !== h * dpr) {
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + 'px'; c.style.height = h + 'px';
    }
    var ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { canvas: c, ctx: ctx, w: w, h: h };
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* --------  Severity Donut  -------- */
  function drawSeverityDonut(id, data) {
    var g = canvasOf(id); if (!g) return;
    var ctx = g.ctx, w = g.w, h = g.h;
    var total = data.reduce(function (a, b) { return a + Math.max(0, b.value || 0); }, 0) || 1;
    var cx = w / 2, cy = h / 2;
    var rOuter = Math.min(w, h) * 0.42;
    var rInner = rOuter * 0.62;
    var start = -Math.PI / 2;
    // Glow halo
    ctx.save();
    ctx.shadowBlur = 24;
    ctx.shadowColor = 'rgba(0,212,255,.18)';
    ctx.beginPath(); ctx.arc(cx, cy, rOuter + 2, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,212,255,.25)'; ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    // Segments
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      var v = Math.max(0, d.value || 0);
      if (!v) continue;
      var angle = (v / total) * Math.PI * 2;
      var end = start + angle;
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, start, end);
      ctx.arc(cx, cy, rInner, end, start, true);
      ctx.closePath();
      // Gradient per slice
      var grd = ctx.createLinearGradient(cx - rOuter, cy - rOuter, cx + rOuter, cy + rOuter);
      grd.addColorStop(0, d.color);
      grd.addColorStop(1, shade(d.color, -0.12));
      ctx.fillStyle = grd;
      ctx.fill();
      // inner stroke
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      start = end;
    }
    // Center text
    ctx.fillStyle = '#0A2540';
    ctx.font = '800 26px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 8);
    ctx.fillStyle = '#64748B';
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    ctx.fillText('TOTAL THREATS', cx, cy + 14);
  }

  /* --------  Trend Line  -------- */
  function drawTrendLine(id, data, opts) {
    var g = canvasOf(id); if (!g) return;
    var ctx = g.ctx, w = g.w, h = g.h;
    opts = opts || {};
    var padL = 36, padR = 18, padT = 16, padB = 28;
    var cw = w - padL - padR, ch = h - padT - padB;
    var n = data.length;
    if (!n) return;
    var maxY = 1;
    data.forEach(function (d) { Object.keys(d).forEach(function (k) { if (k !== 'date' && typeof d[k] === 'number') maxY = Math.max(maxY, d[k]); }); });
    maxY = Math.ceil(maxY * 1.2);
    // Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(15,39,67,.06)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    var gridSteps = 4;
    for (var gs = 0; gs <= gridSteps; gs++) {
      var gy = padT + ch - (ch / gridSteps) * gs;
      var yVal = Math.round((maxY / gridSteps) * gs);
      ctx.beginPath();
      ctx.moveTo(padL, gy); ctx.lineTo(padL + cw, gy);
      ctx.stroke();
      ctx.fillText(yVal, padL - 8, gy);
    }
    // X axis labels (sparse)
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var labelEvery = Math.max(1, Math.floor(n / 6));
    for (var xi = 0; xi < n; xi += labelEvery) {
      var x = padL + (xi / (n - 1)) * cw;
      ctx.fillStyle = '#94A3B8';
      var lbl = (data[xi].date || '').slice(5); // MM-DD
      ctx.fillText(lbl, x, padT + ch + 10);
    }
    ctx.restore();
    // Series colors
    var series = opts.series || [
      { key: 'open',     color: '#00D4FF', name: 'Open threats' },
      { key: 'newThreats', color: '#EF4444', name: 'New detections' },
      { key: 'resolved', color: '#10B981', name: 'Resolved' }
    ];
    series.forEach(function (s) {
      var points = data.map(function (d, i) {
        return {
          x: padL + (i / (n - 1)) * cw,
          y: padT + ch - (Math.min(maxY, d[s.key] || 0) / maxY) * ch,
          v: d[s.key] || 0
        };
      });
      // Area fill
      ctx.save();
      var grad = ctx.createLinearGradient(0, padT, 0, padT + ch);
      grad.addColorStop(0, hexToRgba(s.color, 0.28));
      grad.addColorStop(1, hexToRgba(s.color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(points[0].x, padT + ch);
      points.forEach(function (p) { ctx.lineTo(p.x, p.y); });
      ctx.lineTo(points[points.length - 1].x, padT + ch);
      ctx.closePath();
      ctx.fill();
      // Line
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.shadowColor = hexToRgba(s.color, 0.45);
      ctx.shadowBlur = 10;
      ctx.beginPath();
      points.forEach(function (p, i) { i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
      ctx.stroke();
      // Dots
      ctx.shadowBlur = 0;
      points.forEach(function (p, i) {
        if (i % Math.max(1, Math.floor(n / 8)) !== 0 && i !== n - 1) return;
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(p.x, p.y, 3.6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = s.color; ctx.lineWidth = 2;
        ctx.stroke();
      });
      ctx.restore();
    });
  }

  /* --------  Asset-type Bar  -------- */
  function drawAssetBar(id, data) {
    var g = canvasOf(id); if (!g) return;
    var ctx = g.ctx, w = g.w, h = g.h;
    var padL = 16, padR = 14, padT = 10, padB = 32;
    var n = data.length;
    var bw = (w - padL - padR) / n;
    var barW = Math.min(bw * 0.5, 42);
    var maxV = Math.max(1, data.reduce(function (a, b) { return Math.max(a, b.value || 0); }, 0));
    ctx.font = '600 11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    for (var i = 0; i < n; i++) {
      var d = data[i];
      var v = Math.max(0, d.value || 0);
      var bx = padL + bw * i + (bw - barW) / 2;
      var fullH = h - padT - padB;
      var bh = (v / maxV) * fullH;
      var by = padT + fullH - bh;
      // bar gradient
      var grd = ctx.createLinearGradient(bx, by, bx, by + bh);
      grd.addColorStop(0, shade(d.color, 0.05));
      grd.addColorStop(1, d.color);
      ctx.save();
      roundRect(ctx, bx, by, barW, Math.max(2, bh), 8);
      ctx.fillStyle = grd;
      ctx.shadowColor = hexToRgba(d.color, 0.35);
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.restore();
      // Value label
      ctx.fillStyle = '#0A2540';
      ctx.font = '800 12px Inter, system-ui, sans-serif';
      ctx.fillText(v, bx + barW / 2, by - 6);
      // Label
      ctx.fillStyle = '#475569';
      ctx.font = '600 10.5px Inter, system-ui, sans-serif';
      ctx.fillText(d.label, bx + barW / 2, h - padB + 14);
      ctx.fillStyle = '#94A3B8'; ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.fillText(d.sub || '', bx + barW / 2, h - padB + 26);
    }
  }

  /* --------  Animated Threat Radar  --------
     Sweeping translucent cyan cone, random blips that fade in/out,
     concentric rings, crosshairs.
     Respects BSAI._radarStop flag and global BSAI.state.settings.backgroundAnimations. */
  var radarRafId = 0;
  function drawThreatRadar(id, blipsStatic) {
    var g = canvasOf(id); if (!g) return;
    var ctx = g.ctx, w = g.w, h = g.h;
    var cx = w / 2, cy = h / 2;
    var r = Math.min(w, h) / 2 - 16;
    // blipsStatic: [{angle:0..2PI, dist:0..1, size, color, label}]
    var blips = (blipsStatic || []).slice().map(function (b) {
      return Object.assign({ pulse: Math.random() * Math.PI * 2, size: 3, color: '#00D4FF' }, b);
    });
    var sweepStart = { t: 0 };

    if (radarRafId) cancelAnimationFrame(radarRafId);

    function frame(ts) {
      if (document.body.classList.contains('animations-off') ||
          (BSAI.state && BSAI.state.settings && BSAI.state.settings.backgroundAnimations === false)) {
        // single static draw
        doDraw(0); return;
      }
      sweepStart.t += 0.012;
      doDraw(sweepStart.t);
      radarRafId = requestAnimationFrame(frame);
    }

    function doDraw(sweepAngle) {
      ctx.clearRect(0, 0, w, h);
      // Outter glow
      ctx.save();
      var halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.02);
      halo.addColorStop(0, 'rgba(0,212,255,0.10)');
      halo.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.02, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      // Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(0,212,255,0.28)';
      ctx.lineWidth = 1;
      for (var i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r / 4) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
      ctx.stroke();
      ctx.restore();

      // Sweep cone
      ctx.save();
      var cone = ctx.createConicGradient ? ctx.createConicGradient(sweepAngle, cx, cy) : null;
      ctx.translate(cx, cy);
      ctx.rotate(sweepAngle);
      if (cone) {
        cone.addColorStop(0, 'rgba(0,212,255,0.55)');
        cone.addColorStop(0.12, 'rgba(0,212,255,0.05)');
        cone.addColorStop(1, 'rgba(0,212,255,0)');
        ctx.fillStyle = cone;
      } else {
        ctx.fillStyle = 'rgba(0,212,255,0.16)';
      }
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, 0, Math.PI * 0.38);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Blips
      blips.forEach(function (b, i) {
        b.pulse += 0.08;
        var alpha = 0.55 + 0.45 * Math.sin(b.pulse);
        var rad = b.angle + i * 0.07;
        var dist = Math.max(0.05, Math.min(0.98, b.dist));
        var x = cx + Math.cos(rad) * r * dist;
        var y = cy + Math.sin(rad) * r * dist;
        ctx.save();
        ctx.shadowColor = hexToRgba(b.color, 0.8);
        ctx.shadowBlur = 14;
        ctx.fillStyle = hexToRgba(b.color, alpha);
        ctx.beginPath();
        ctx.arc(x, y, b.size + 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1, b.size * 0.45), 0, Math.PI * 2);
        ctx.fill();
        if (b.label) {
          ctx.fillStyle = '#0A2540';
          ctx.font = '700 10.5px Inter, system-ui, sans-serif';
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(b.label, x + 8, y);
        }
      });

      // Center dot
      ctx.save();
      ctx.fillStyle = '#00D4FF';
      ctx.shadowColor = 'rgba(0,212,255,.9)'; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(cx, cy, 2.4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    radarRafId = requestAnimationFrame(frame);
  }

  /* --------  color helpers  -------- */
  function hexToRgba(hex, a) {
    var h = (hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(h.substring(0, 2), 16) | 0;
    var g = parseInt(h.substring(2, 4), 16) | 0;
    var b = parseInt(h.substring(4, 6), 16) | 0;
    return 'rgba(' + r + ',' + g + ',' + b + ',' + Math.max(0, Math.min(1, a)) + ')';
  }
  function shade(hex, pct) {
    var h = (hex || '').replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var r = parseInt(h.substring(0, 2), 16) | 0;
    var g = parseInt(h.substring(2, 4), 16) | 0;
    var b = parseInt(h.substring(4, 6), 16) | 0;
    function adj(c) {
      if (pct >= 0) return Math.round(c + (255 - c) * pct);
      return Math.max(0, Math.round(c * (1 + pct)));
    }
    r = adj(r); g = adj(g); b = adj(b);
    return '#' + [r, g, b].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
  }

  BSAI.Charts = {
    drawSeverityDonut: drawSeverityDonut,
    drawTrendLine: drawTrendLine,
    drawAssetBar: drawAssetBar,
    drawThreatRadar: drawThreatRadar,
    util: { hexToRgba: hexToRgba, shade: shade }
  };
})();
