/* =========================================================
   risk-engine.js
   Aggregates evidence into:
     riskScore   0..100  (potential danger to brand if confirmed)
     confidence  0..100  (how strongly evidence supports the assessment)
     level       'safe' | 'low' | 'review' | 'medium' | 'high'
     reasons[]   textual bullets explaining both + next actions
     missing[]   information unknown ("Data Unavailable")

   IMPORTANT — rules enforced here:
     • Name/logo similarity alone NEVER maps to the highest risk level.
       Multiple signals + sensitive data / links are required for HIGH.
     • Weights are configurable via BSAI.state.settings.riskWeights.
   ========================================================= */
(function () {
  'use strict';
  var BSAI = (window.BSAI = window.BSAI || {});

  var DEFAULT_WEIGHTS = {
    // Signal-category weights (multiplied onto matched evidence)
    suspiciousLink:   1.0,
    logoSimilarity:   0.6,
    nameSimilarity:   0.55,
    sensitiveRequest: 1.2,
    impersonationSuffix: 0.9,
    thirdPartyStore:  0.85,
    publisherMismatch: 0.7,
    urgencyLanguage:  0.5,
    typoDomainPattern: 1.0,
    followerRatio:    0.25,
    allowlistMatch:   0.0,
    disclaimerInBio:  0.0,
    preFlaggedHint:   0.5
  };

  var LEVEL_RISK = [
    { at: 85, label: 'high',   text: 'High Risk — Review Required', cls: 'risk--high'   },
    { at: 62, label: 'medium', text: 'Medium Risk',                 cls: 'risk--medium' },
    { at: 42, label: 'review', text: 'Review Needed',               cls: 'risk--review' },
    { at: 18, label: 'low',    text: 'Low Risk',                    cls: 'risk--low'    },
    { at: 0,  label: 'safe',   text: 'Safe / Verified',             cls: 'risk--safe'   }
  ];

  var LEVEL_CONF = [
    { at: 80, text: 'Very High' },
    { at: 60, text: 'High' },
    { at: 40, text: 'Medium' },
    { at: 20, text: 'Low' },
    { at: 0,  text: 'Very Low' }
  ];

  function defaultSettings() {
    return {
      riskWeights: JSON.parse(JSON.stringify(DEFAULT_WEIGHTS)),
      // Level cutoffs (0..100). Must match LEVEL_RISK structure.
      levelCutoffs: {
        high: 85,
        medium: 62,
        review: 42,
        low: 18
      },
      backgroundAnimations: true,
      notifications: true,
      scanFrequencyMinutes: 360, // simulated
      uiDensity: 'comfortable'
    };
  }

  function mergeDefaults(partial) {
    var def = defaultSettings();
    partial = partial || {};
    var w = partial.riskWeights || {};
    Object.keys(def.riskWeights).forEach(function (k) {
      if (typeof w[k] !== 'number') w[k] = def.riskWeights[k];
    });
    partial.riskWeights = w;
    if (!partial.levelCutoffs) partial.levelCutoffs = def.levelCutoffs;
    Object.keys(def).forEach(function (k) {
      if (typeof partial[k] === 'undefined') partial[k] = def[k];
    });
    return partial;
  }

  function levelForScore(score, cutoffs) {
    var c = cutoffs || DEFAULT_LEVEL_CUTOFFS();
    if (score >= c.high)   return LEVEL_RISK[0];
    if (score >= c.medium) return LEVEL_RISK[1];
    if (score >= c.review) return LEVEL_RISK[2];
    if (score >= c.low)    return LEVEL_RISK[3];
    return LEVEL_RISK[4];
  }
  function DEFAULT_LEVEL_CUTOFFS() { return defaultSettings().levelCutoffs; }

  function confidenceLevel(pct) {
    for (var i = 0; i < LEVEL_CONF.length; i++) if (pct >= LEVEL_CONF[i].at) return LEVEL_CONF[i];
    return LEVEL_CONF[LEVEL_CONF.length - 1];
  }

  /* Categorize a piece of evidence by keywords in its title/polarity/body
     to apply configurable weights on top of the individual ev.weight. */
  function categoryBoost(evItem, weights) {
    var t = (evItem.title || '').toLowerCase();
    var b = (evItem.body || '').toLowerCase();
    var hay = t + ' ' + b;
    var boost = 1;
    if (/suspicious keyword.*url|lookalike domain|external url is a lookalike|lookalike.*link|url lookalike|link.*lookalike/.test(t))
      boost = Math.max(boost, weights.suspiciousLink);
    if (/lookalike: brand_token_tld|lookalike: inserted_hyphen|lookalike: hyphen_suffix|lookalike: edit_distance/.test(t))
      boost = Math.max(boost, weights.typoDomainPattern);
    if (/logo|visual hash|image.*match/.test(t)) boost = Math.max(boost, weights.logoSimilarity);
    if (/username.*similarity|display name|brand name.*display|name.*near-identical|name.*similar/.test(t))
      boost = Math.max(boost, weights.nameSimilarity);
    if (/sensitive data|requests sensitive|ssn|cvv|passport|credential|password.*solicit/.test(hay))
      boost = Math.max(boost, weights.sensitiveRequest);
    if (/impersonation-suffix|display name.*suffix|suffix.*typical/.test(t))
      boost = Math.max(boost, weights.impersonationSuffix);
    if (/unauthorized store|third|apk|mirror|site store/.test(t))
      boost = Math.max(boost, weights.thirdPartyStore);
    if (/publisher mismatch|publisher.*whitelist|not on the brand whitelist.*pub/i.test(t))
      boost = Math.max(boost, weights.publisherMismatch);
    if (/urgency|scam-typical|language in bio|term .*90% off|giveaway|voucher/.test(hay))
      boost = Math.max(boost, weights.urgencyLanguage);
    if (/follower|ratio|following count|bot pattern/.test(t))
      boost = Math.max(boost, weights.followerRatio);
    if (/allowlist|disclaimer|verified official|safe \/ verified|clearly disclaims/.test(hay))
      boost = Math.min(boost, weights.allowlistMatch); // 0
    if (/expected false positive|seed-marked.*false/.test(t)) boost = 0;
    if (/pre-flagged hint:/.test(t)) boost = Math.max(boost, weights.preFlaggedHint);
    return boost;
  }

  /*
     scoreAsset(evidence, { settings, kind, entity })
       kind: 'social' | 'app' | 'website'
       entity: the raw profile/app/site object
   */
  function scoreAsset(evidence, opts) {
    opts = opts || {};
    var settings = mergeDefaults(opts.settings || null);
    var kind = opts.kind || 'social';
    var weights = settings.riskWeights;
    var cutoffs = settings.levelCutoffs;

    // Split by polarity
    var neg = [], pos = [], amb = [], neu = [];
    (evidence || []).forEach(function (e) {
      if (!e) return;
      if (e.polarity === 'neg') neg.push(e);
      else if (e.polarity === 'pos') pos.push(e);
      else if (e.polarity === 'amb') amb.push(e);
      else neu.push(e);
    });

    var negativeWeighted = 0;
    var positiveWeighted = 0;
    var ambiguousWeighted = 0;
    (evidence || []).forEach(function (e) {
      var b = categoryBoost(e, weights);
      var contribution = Math.max(0, Math.min(1, e.weight || 0)) * Math.max(0, b);
      if (e.polarity === 'neg')       negativeWeighted += contribution;
      else if (e.polarity === 'pos')  positiveWeighted += contribution;
      else if (e.polarity === 'amb')  ambiguousWeighted += contribution;
    });

    // Confidence is a function of signal consistency & count
    var signalCount = (neg.length + pos.length + amb.length);
    var spread = Math.abs(negativeWeighted - positiveWeighted);
    var agreement = 0.5;
    if (signalCount >= 1) {
      agreement = (spread + 0.1) / (negativeWeighted + positiveWeighted + ambiguousWeighted + 0.2);
    }
    var confidence = Math.min(100, Math.round(
      12 + 22 * Math.min(4, signalCount) +
      44 * Math.min(1, agreement) +
      18 * Math.min(1, (negativeWeighted + positiveWeighted) / 1.2)
    ));

    // Risk calculation
    // Base line 8 — baseline of inherent unknowns in a simulated system
    var risk = 8;
    risk += 18 * Math.min(2.0, negativeWeighted);
    risk += 5  * Math.min(1.5, ambiguousWeighted);
    risk -= 28 * Math.min(1.0, positiveWeighted);

    // Boosts that require multiple signals — this enforces "similarity alone
    // cannot prove high risk".
    var nameOrLogoOnly = true;
    (neg || []).forEach(function (e) {
      var t = (e.title || '').toLowerCase();
      if (!/username|display name|name near-identical|name .*similar|logo|image.*match|visual hash/.test(t))
        nameOrLogoOnly = false;
    });
    if (nameOrLogoOnly && neg.length >= 1 && !hasSensitive(evidence) && !hasLinkEvidence(evidence)) {
      risk = Math.min(risk, cutoffs.review - 1); // cap at review or lower
    }

    // Strong evidence of active harm can raise risk
    if (hasSensitive(evidence) && negativeWeighted >= 1.0) risk += 22;
    if (hasLinkEvidence(evidence) && negativeWeighted >= 0.9) risk += 12;

    // Website category-based cap (can't exceed high by default)
    risk = Math.max(0, Math.min(100, Math.round(risk)));

    var level = levelForScore(risk, cutoffs);
    var reasons = buildReasons({
      neg: neg, pos: pos, amb: amb, neu: neu,
      weights: weights, risk: risk, levelText: level.text, confidence: confidence
    });
    var missing = buildMissing(opts.entity, kind);
    var next = buildNextActions({
      risk: risk,
      level: level.label,
      kind: kind,
      hasLink: hasLinkEvidence(evidence),
      hasSens: hasSensitive(evidence),
      hasPos: pos.length
    });

    return {
      riskScore: risk,
      confidence: confidence,
      confidenceLabel: confidenceLevel(confidence).text,
      level: level.label,
      levelText: level.text,
      levelClass: level.cls,
      reasons: reasons,
      missing: missing,
      nextActions: next
    };
  }

  function hasSensitive(ev) {
    for (var i = 0; i < ev.length; i++) {
      var h = (ev[i].title + ' ' + ev[i].body).toLowerCase();
      if (/sensitive|ssn|cvv|card number|passport|password.*solicit|credential/.test(h)) return true;
    }
    return false;
  }
  function hasLinkEvidence(ev) {
    for (var i = 0; i < ev.length; i++) {
      var h = (ev[i].title + ' ' + ev[i].body).toLowerCase();
      if (/lookalike|external url|suspicious keyword|link.*lookalike|domain lookalike|url matches/.test(h)) return true;
    }
    return false;
  }

  function buildReasons(o) {
    var reasons = [];
    if (o.neg.length === 0 && o.pos.length === 0 && o.amb.length === 0) {
      reasons.push({ kind: 'info', text: 'No simulated evidence signals were produced for this asset.' });
      return reasons;
    }
    // Top positive
    o.pos.slice().sort(function (a, b) { return (b.weight || 0) - (a.weight || 0); }).slice(0, 2).forEach(function (e) {
      reasons.push({ kind: 'positive', text: '✓ ' + e.title + ' — ' + e.body });
    });
    // Top negative
    o.neg.slice().sort(function (a, b) { return (b.weight || 0) - (a.weight || 0); }).slice(0, 5).forEach(function (e) {
      reasons.push({ kind: 'negative', text: '⚠ ' + e.title + ' — ' + e.body });
    });
    // Ambiguous
    o.amb.slice(0, 3).forEach(function (e) {
      reasons.push({ kind: 'ambiguous', text: '? ' + e.title + ' — ' + e.body });
    });
    reasons.push({ kind: 'risk', text:
      'Risk score ' + o.risk + ' / 100 → ' + o.levelText +
      ' (Confidence ' + o.confidence + '% — ' + confidenceLevel(o.confidence).text + ').'
    });
    reasons.push({ kind: 'note', text:
      'Name/logo similarity alone is never treated as proof of impersonation in simulated scoring.' });
    return reasons;
  }

  function buildMissing(entity, kind) {
    var m = [];
    // Honesty-first: reach, victims, and losses are never invented.
    m.push({ label: 'Potential audience / reach',     value: 'Data Unavailable' });
    m.push({ label: 'Reported victims',                value: 'Data Unavailable' });
    m.push({ label: 'Confirmed victims',               value: 'Data Unavailable' });
    m.push({ label: 'Reported financial losses',       value: 'Data Unavailable' });
    m.push({ label: 'Confirmed financial losses',      value: 'Data Unavailable' });
    if (kind === 'social') {
      if (!entity || typeof entity.followers !== 'number')
        m.push({ label: 'Follower count / reach', value: 'Data Unavailable' });
      if (!entity || !entity.created)
        m.push({ label: 'Account creation date (source)', value: 'Data Unavailable' });
    }
    if (kind === 'app') {
      if (!entity || typeof entity.installs !== 'string')
        m.push({ label: 'True install count', value: 'Data Unavailable' });
      if (!entity || !entity.url)
        m.push({ label: 'Direct store link', value: 'Data Unavailable' });
    }
    if (kind === 'website') {
      if (!entity || !entity.ip) m.push({ label: 'Hosting IP / ASN (real query)', value: 'Data Unavailable' });
      if (!entity || !entity.registrar) m.push({ label: 'Registrar / WHOIS (live)', value: 'Data Unavailable' });
    }
    return m;
  }

  function buildNextActions(o) {
    var actions = [];
    var levelInput = o.level;
    // Accept either a string label or a {label,text,cls} object (defensive)
    var lvl;
    if (typeof levelInput === 'string') {
      lvl = levelInput.toLowerCase();
    } else if (levelInput && typeof levelInput === 'object' && typeof levelInput.label === 'string') {
      lvl = levelInput.label.toLowerCase();
    } else {
      lvl = '';
    }
    if (lvl === 'high') {
      actions.push('Escalate to SOC lead — potential active impersonation campaign.');
      if (o.hasSens) actions.push('Draft takedown request to hosting provider / domain registrar with urgency.');
      if (o.hasLink)  actions.push('Publish customer advisory via verified official channels.');
    } else if (lvl === 'medium') {
      actions.push('Assign to an analyst for follow-up investigation.');
      actions.push('Gather additional evidence (screenshot archive, live link verification).');
    } else if (lvl === 'review') {
      actions.push('Human review — weak or mixed signals; classification uncertain.');
      actions.push('Check if asset is on the brand allowlist and add it if appropriate.');
    } else if (lvl === 'low') {
      actions.push('Monitor periodically in the next scheduled scan.');
    } else {
      actions.push('No action required; asset appears safe / is already allowlisted.');
    }
    if (!o.hasPos) actions.push('If this is a legitimate asset, click "Mark as legitimate" to add it to the brand allowlist.');
    return actions;
  }

  /* --------  Public  -------- */
  BSAI.Risk = {
    defaultSettings: defaultSettings,
    mergeDefaults: mergeDefaults,
    DEFAULT_WEIGHTS: DEFAULT_WEIGHTS,
    LEVEL_RISK: LEVEL_RISK,
    LEVEL_CONF: LEVEL_CONF,
    confidenceLevel: confidenceLevel,
    levelForScore: levelForScore,
    scoreAsset: scoreAsset
  };

  /* Precompute enriched assets with scores once seed is loaded */
  BSAI.Risk.enrichAll = function (state) {
    if (!BSAI.Detection) return state;
    var settings = state.settings;
    state.brands.forEach(function (brand) {
      // Social
      state.socialProfiles.filter(function (s) { return s.brandId === brand.id; }).forEach(function (sp) {
        var ev = BSAI.Detection.analyzeSocial(sp, brand);
        sp._evidence = ev;
        sp._risk = BSAI.Risk.scoreAsset(ev, { settings: settings, kind: 'social', entity: sp });
      });
      // Apps
      state.apps.filter(function (a) { return a.brandId === brand.id; }).forEach(function (ap) {
        var ev = BSAI.Detection.analyzeApp(ap, brand);
        ap._evidence = ev;
        ap._risk = BSAI.Risk.scoreAsset(ev, { settings: settings, kind: 'app', entity: ap });
      });
      // Websites
      state.websites.filter(function (w) { return w.brandId === brand.id; }).forEach(function (ws) {
        var ev = BSAI.Detection.analyzeWebsite(ws, brand);
        ws._evidence = ev;
        ws._risk = BSAI.Risk.scoreAsset(ev, { settings: settings, kind: 'website', entity: ws });
      });
    });
    return state;
  };
})();
