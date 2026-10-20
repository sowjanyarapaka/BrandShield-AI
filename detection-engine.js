/* =========================================================
   detection-engine.js
   Simulated — NEVER claims live scanning.
   Every piece of evidence this module produces carries
   `simulated: true` and is marked in the UI with a "Simulated" pill.

   Exposes BSAI.Detection = {
     levenshtein(a,b), jaroWinkler(a,b),
     tokenize(s),
     analyzeSocial(profile, brand),
     analyzeApp(app, brand),
     analyzeWebsite(site, brand),
     typoPatternsAgainst(domain, officialList)
   }
   ========================================================= */
(function () {
  'use strict';
  var BSAI = (window.BSAI = window.BSAI || {});

  /* --------  String similarity helpers  -------- */
  function levenshtein(a, b) {
    a = String(a || '').toLowerCase();
    b = String(b || '').toLowerCase();
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = new Array(b.length + 1);
    var curr = new Array(b.length + 1);
    var i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      curr[0] = i;
      for (j = 1; j <= b.length; j++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      var tmp = prev; prev = curr; curr = tmp;
    }
    return prev[b.length];
  }

  function jaroWinkler(s1, s2) {
    s1 = String(s1 || '').toLowerCase();
    s2 = String(s2 || '').toLowerCase();
    if (s1 === s2) return 1;
    var m = Math.max(s1.length, s2.length);
    var matchRange = Math.floor(m / 2) - 1;
    if (matchRange < 0) matchRange = 0;
    var s1Matches = new Array(s1.length);
    var s2Matches = new Array(s2.length);
    var matches = 0;
    var i, j;
    for (i = 0; i < s1.length; i++) {
      var low = Math.max(0, i - matchRange);
      var high = Math.min(s2.length - 1, i + matchRange);
      for (j = low; j <= high; j++) {
        if (!s2Matches[j] && s1[i] === s2[j]) {
          s1Matches[i] = true; s2Matches[j] = true;
          matches++;
          break;
        }
      }
    }
    if (!matches) return 0;
    var t = 0, k = 0;
    for (i = 0; i < s1.length; i++) {
      if (s1Matches[i]) {
        while (!s2Matches[k]) k++;
        if (s1[i] !== s2[k]) t++;
        k++;
      }
    }
    t = t / 2;
    var j_sim = (matches / s1.length + matches / s2.length + (matches - t) / matches) / 3;
    var prefix = 0;
    for (i = 0; i < Math.min(4, s1.length, s2.length); i++) {
      if (s1[i] === s2[i]) prefix++; else break;
    }
    return j_sim + prefix * 0.1 * (1 - j_sim);
  }

  function normalizeName(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/^@/, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  function tokenize(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);
  }

  function containsAny(text, words) {
    var t = String(text || '').toLowerCase();
    for (var i = 0; i < words.length; i++) {
      if (t.indexOf(words[i].toLowerCase()) !== -1) return words[i];
    }
    return null;
  }

  /* Suspicious link keywords — simulated signal only, not blocklist */
  var SUSPICIOUS_LINK_KEYWORDS = [
    'verify', 'login', 'confirm', 'secure', 'support', 'helpdesk', 'giveaway',
    'win', 'free', 'claim', 'reward', 'verify-account', 'gift-card', 'billing',
    'refund', 'lottery', 'promo', 'limited-time', 'exclusive', 'signin',
    'pay', 'invoice', 'ticket'
  ];

  var URGENCY_LANGUAGE = [
    'now', 'immediately', 'urgent', '24/7', '24 hours', 'suspended', 'locked',
    'click link', 'verify your', 'confirm your', 'first 1000', '90% off', 'free voucher',
    'win $', 'ssn', 'social security', 'cvv', 'card number', 'credit card', 'passport'
  ];

  var SENSITIVE_DATA_REQUEST = [
    'ssn', 'social security', 'cvv', 'card number', 'passport', 'driver license',
    'insurance id', 'medicare id', 'password', 'online banking password'
  ];

  var SUSPICIOUS_DOMAIN_TLDS = ['.top', '.xyz', '.club', '.site', '.info', '.online', '.shop', '.bid', '.work', '.party', '.gq', '.cf', '.tk', '.ml', '.ga', '.ru', '.cn'];

  var HOMOGLYPHS = [
    { from: 'o', to: '0' },
    { from: '0', to: 'o' },
    { from: 'l', to: '1' },
    { from: '1', to: 'l' },
    { from: 'i', to: '1' },
    { from: 'a', to: 'e' },
    { from: 'e', to: 'a' },
    { from: 'rn', to: 'm' },
    { from: 'u', to: 'v' },
    { from: 'v', to: 'u' }
  ];

  function extractHost(url) {
    if (!url) return '';
    var u = String(url).trim();
    u = u.replace(/^https?:\/\//i, '');
    u = u.replace(/^www\./i, '');
    u = u.split(/[\/\?#]/)[0];
    return u.toLowerCase();
  }

  function domainOnly(host) {
    host = String(host || '').toLowerCase();
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return host;
    var parts = host.split('.');
    if (parts.length <= 2) return host;
    // crude — drop subdomain only for common co.uk-like cases
    if (parts.length >= 3 && /^(co|com|org|net|gov|edu|ac)$/i.test(parts[parts.length - 2])) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }

  /* --------  Typo patterns against a list of official domains  -------- */
  function typoPatternsAgainst(candidate, officialList) {
    var canDomain = domainOnly(extractHost(candidate) || candidate);
    var can = canDomain.replace(/\.[^.]+$/, ''); // drop tld
    var findings = [];
    officialList.forEach(function (off) {
      var offDomain = domainOnly(extractHost(off) || off);
      var offClean = offDomain.replace(/\.[^.]+$/, '');
      var lev = levenshtein(can, offClean);
      var jw = jaroWinkler(can, offClean);
      // hyphen split pattern
      var tokens = can.split(/[-_]/).filter(Boolean);
      if (tokens.length >= 2 && tokens[0] === offClean &&
          containsAny(tokens.slice(1).join('-'), SUSPICIOUS_LINK_KEYWORDS)) {
        findings.push({
          kind: 'hyphen_suffix',
          official: off,
          message: 'Hyphenated suffix "' + tokens.slice(1).join('-') + '" resembles phishing-lookalike pattern against "' + off + '".'
        });
      }
      // inserted hyphen (aero-venture vs aeroventure)
      if (can.replace(/-/g, '') === offClean) {
        findings.push({
          kind: 'inserted_hyphen',
          official: off,
          message: 'Matches "' + off + '" when hyphens are removed — classic hyphen-squat pattern.'
        });
      }
      // homoglyph + character duplication (edit distance close)
      if (lev >= 1 && lev <= 2 && jw >= 0.82) {
        findings.push({
          kind: 'edit_distance',
          official: off,
          message: 'Levenshtein distance ' + lev + ', Jaro-Winkler ' + jw.toFixed(2) + ' vs. "' + off + '".'
        });
      }
      // substring match: full brand token + different TLD
      if (can.indexOf(offClean) !== -1 && can !== offClean) {
        var tld = '.' + canDomain.split('.').slice(-1)[0];
        if (SUSPICIOUS_DOMAIN_TLDS.indexOf(tld) !== -1 || can.length !== offClean.length) {
          findings.push({
            kind: 'brand_token_tld',
            official: off,
            message: 'Embeds brand token "' + offClean + '" with TLD/suffix variation.'
          });
        }
      }
    });
    // suspicious TLD on its own — weak signal
    var cTld = '.' + canDomain.split('.').slice(-1)[0];
    if (SUSPICIOUS_DOMAIN_TLDS.indexOf(cTld) !== -1) {
      findings.push({
        kind: 'suspicious_tld',
        official: null,
        message: 'TLD "' + cTld + '" is commonly used in impersonation campaigns (weak signal).'
      });
    }
    return findings;
  }

  /* --------  Social  -------- */
  function analyzeSocial(profile, brand) {
    var evidence = [];
    var offUsernames = (brand.officialSocials || []).map(function (s) {
      return normalizeName(s.username);
    });
    var offDisplay = (brand.officialSocials || []).map(function (s) {
      return normalizeName(s.displayName || s.username);
    });

    // Username similarity
    var pUser = normalizeName(profile.username);
    var bestUserSim = 0;
    (brand.officialSocials || []).forEach(function (s) {
      var sim = Math.max(
        jaroWinkler(pUser, normalizeName(s.username)),
        jaroWinkler(pUser, normalizeName(brand.name))
      );
      if (sim > bestUserSim) bestUserSim = sim;
    });
    if (profile.isOfficial) {
      evidence.push(ev('pos', 'Username match (allowlist)', 0.95,
        'Matches a seed-listed official username (' + profile.username + ').', 'sim', true));
    } else if (bestUserSim > 0.92) {
      evidence.push(ev('neg', 'High username/handle similarity', 0.82,
        'Username/handle similarity ' + (bestUserSim * 100).toFixed(0) + '% vs. official "' + brand.name + '" accounts.', 'sim', true));
    } else if (bestUserSim > 0.8) {
      evidence.push(ev('amb', 'Moderate username similarity', 0.45,
        'Username similarity ' + (bestUserSim * 100).toFixed(0) + '% vs. official brand handles.', 'sim', true));
    }

    // Display name substring match
    var pName = normalizeName(profile.displayName);
    var brandTok = normalizeName(brand.name);
    if (profile.isOfficial) {
      // skip — already covered
    } else if (pName.indexOf(brandTok) !== -1) {
      // "Official" / "Support" suffix suspicion
      var imposterSuffix = /(official|support|help|team|verified|vip|reward|giveaway|deals|promo|billing|care)$/i.test(String(profile.displayName).replace(/\s+/g, ''));
      if (imposterSuffix) {
        evidence.push(ev('neg', 'Brand name + impersonation-suffix display name', 0.78,
          'Display name "' + profile.displayName + '" embeds brand name and uses a typical impersonation suffix (e.g. "Official", "Support", "Rewards").', 'sim', true));
      } else if (/(not affiliated|opinions are our own|unofficial|community)/i.test(profile.bio || '')) {
        evidence.push(ev('neu', 'Brand name in display + disclaimer in bio', 0.1,
          'Uses brand name but clearly disclaims affiliation in profile bio.', 'sim', true));
      } else {
        evidence.push(ev('amb', 'Brand name present in display name (no disclaimer)', 0.4,
          'Display name "' + profile.displayName + '" embeds brand name without explicit disclaimer.', 'sim', true));
      }
    }

    // Profile image types (seed-flagged, simulated)
    if (profile.profileImageType === 'official_verified' || profile.status === 'verified') {
      evidence.push(ev('pos', 'Profile image matches verified official asset (allowlist)', 0.9,
        'Image hash found in allowlist of verified brand assets (simulated).', 'sim', true));
    } else if (profile.profileImageType === 'stolen_official_cropped') {
      evidence.push(ev('neg', 'Logo similarity — likely cropped/modified official logo', 0.85,
        'Visual hash matches official logo with a crop/resize transform (simulated).', 'sim', true));
    } else if (profile.profileImageType === 'modified_logo_colors') {
      evidence.push(ev('neg', 'Logo similarity — colors altered but shape matches', 0.7,
        'Brand-logo visual shape match despite color/filter edits (simulated).', 'sim', true));
    } else if (profile.profileImageType === 'copied_from_website') {
      evidence.push(ev('amb', 'Image likely copied from website gallery', 0.45,
        'Image hash matches a media file from the brand website (simulated).', 'sim', true));
    } else if (profile.profileImageType === 'custom_but_not_logo') {
      evidence.push(ev('pos', 'Profile image does not resemble brand logo', 0.2,
        'Custom avatar; no brand-logo match.', 'sim', true));
    }

    // Suspicious link in bio/external URL
    var link = profile.externalUrl;
    if (link) {
      var host = extractHost(link);
      // Check if link is in brand allowlist or verified domains
      var inAllowlist = false;
      (brand.allowlist || []).forEach(function (a) { if (host.indexOf(a.toLowerCase()) !== -1) inAllowlist = true; });
      (brand.verifiedDomains || []).forEach(function (d) { if (host.indexOf(d.value.toLowerCase()) !== -1) inAllowlist = true; });
      if (inAllowlist) {
        evidence.push(ev('pos', 'External URL matches allowlisted/verified domain', 0.75,
          '"' + host + '" is on the verified domains or brand allowlist.', 'sim', true));
      } else {
        var kw = containsAny(link, SUSPICIOUS_LINK_KEYWORDS);
        if (kw) {
          evidence.push(ev('neg', 'Suspicious keyword "' + kw + '" in external URL', 0.7,
            'External link "' + link + '" contains impersonation-typical keyword "' + kw + '".', 'sim', true));
        }
        var typo = typoPatternsAgainst(host, (brand.verifiedDomains || []).map(function (d) { return d.value; }));
        if (typo.length) {
          evidence.push(ev('neg', 'External URL is a lookalike domain', 0.8,
            typo.map(function (t) { return t.message; }).join(' '), 'sim', true));
        }
        if (!kw && !typo.length) {
          evidence.push(ev('amb', 'External URL not on brand allowlist', 0.25,
            'Host "' + host + '" not found in allowlist/verified domains.', 'sim', true));
        }
      }
    }

    // Urgency/suspicious-language in bio
    if (profile.bio) {
      var urg = containsAny(profile.bio, URGENCY_LANGUAGE);
      var sens = containsAny(profile.bio, SENSITIVE_DATA_REQUEST);
      if (sens) {
        evidence.push(ev('neg', 'Requests sensitive data in profile bio', 0.9,
          'Matched term(s) suggesting request for SSN/payment/credentials: "' + sens + '".', 'sim', true));
      } else if (urg) {
        evidence.push(ev('amb', 'Urgency / scam-typical language in bio', 0.55,
          'Matched term "' + urg + '".', 'sim', true));
      }
    }

    // Follower / following ratio bot pattern (weak)
    if (typeof profile.followers === 'number' && typeof profile.following === 'number') {
      var ratio = profile.followers / Math.max(1, profile.following);
      if (profile.following > 2000 && ratio < 0.3) {
        evidence.push(ev('amb', 'Low follower/following ratio + high following count', 0.35,
          'Followers=' + profile.followers + ', Following=' + profile.following + ' (ratio ' + ratio.toFixed(2) + '). May indicate follow-back spam pattern.', 'sim', true));
      } else if (ratio > 50 && profile.posts < 40) {
        evidence.push(ev('amb', 'Suspiciously high follower count vs post count', 0.3,
          'Followers=' + profile.followers + ' but only ' + profile.posts + ' posts visible (simulated metrics).', 'sim', true));
      }
    }

    // seed-flagged false-positive
    if (profile.falsePositive) {
      evidence.push(ev('pos', 'Seed-marked as expected false-positive / non-impersonating', 0.9,
        'Previously closed as false positive in the demo dataset.', 'sim', true));
    }

    // Known seed-flagged suspicious hints
    (profile.suspiciousHints || []).forEach(function (h) {
      evidence.push(ev('neg', 'Pre-flagged hint: ' + h, 0.4,
        'Human or rule-based annotation present in demo data (no live signal involved).', 'sim', true));
    });

    return evidence;
  }

  /* --------  App  -------- */
  function analyzeApp(app, brand) {
    var evidence = [];

    var offNames = (brand.officialApps || []).map(function (a) { return normalizeName(a.name); });
    var offPublishers = (brand.officialApps || []).map(function (a) { return (a.publisher || '').toLowerCase().trim(); });
    var offPkgs = (brand.officialApps || []).map(function (a) { return (a.packageId || '').toLowerCase().trim(); });

    if (app.verified || app.isOfficial) {
      evidence.push(ev('pos', 'Allowlisted official app', 0.95,
        app.name + ' by ' + app.publisher + ' is in the seed-official list.', 'sim', true));
    } else {
      // Name similarity vs official app names
      var aName = normalizeName(app.name);
      var bestSim = 0;
      (brand.officialApps || []).forEach(function (o) {
        var sim = Math.max(jaroWinkler(aName, normalizeName(o.name)), jaroWinkler(aName, normalizeName(brand.name)));
        if (sim > bestSim) bestSim = sim;
      });
      if (bestSim > 0.9) {
        evidence.push(ev('neg', 'App name near-identical to an official ' + brand.name + ' app', 0.85,
          'Jaro-Winkler ' + bestSim.toFixed(2) + ' vs. official app name list.', 'sim', true));
      } else if (bestSim > 0.78) {
        evidence.push(ev('amb', 'App name is similar to official ' + brand.name + ' apps', 0.45,
          'Jaro-Winkler ' + bestSim.toFixed(2) + '.', 'sim', true));
      }

      // Publisher mismatch
      var pub = (app.publisher || '').toLowerCase().trim();
      if (app.suspiciousHints && app.suspiciousHints.indexOf('publisher_mismatch') !== -1) {
        evidence.push(ev('neg', 'Publisher mismatch', 0.8,
          '"' + app.publisher + '" is not on the verified publisher whitelist for ' + brand.name + '.', 'sim', true));
      } else if (offPublishers.length && offPublishers.indexOf(pub) === -1) {
        evidence.push(ev('amb', 'Publisher is not on the brand whitelist', 0.35,
          'Publisher "' + app.publisher + '" is not in the seed-official publishers list.', 'sim', true));
      }

      // Third-party / APK mirror store
      var store = String(app.store || '').toLowerCase();
      if (app.suspiciousHints && app.suspiciousHints.indexOf('third_party_store') !== -1 ||
          /apk|third|unofficial|mirror|site/.test(store)) {
        evidence.push(ev('neg', 'App listed on unauthorized store', 0.75,
          'Store: "' + app.store + '". Official apps are distributed only via Google Play / Apple App Store allowlisted listings.', 'sim', true));
      }

      // Sensitive data request in description
      if (app.description) {
        var sens = containsAny(app.description, SENSITIVE_DATA_REQUEST);
        if (sens) {
          evidence.push(ev('neg', 'Description requests sensitive data', 0.88,
            'Matched term "' + sens + '" in the app description. Official bank/health/airline apps do not solicit credentials directly in descriptions.', 'sim', true));
        }
      }

      // Rating/review weak signal
      if (typeof app.rating === 'number' && app.rating <= 2.5 && (app.reviews || 0) > 100) {
        evidence.push(ev('amb', 'Low user rating / many negative reviews', 0.25,
          'Rating ' + app.rating.toFixed(1) + ' over ' + app.reviews + ' reviews (simulated).', 'sim', true));
      }
    }

    if (app.falsePositive) {
      evidence.push(ev('pos', 'Seed-marked expected false positive', 0.9,
        'App description clearly states it is an independent/fan work.', 'sim', true));
    }
    (app.suspiciousHints || []).forEach(function (h) {
      evidence.push(ev('neg', 'Pre-flagged hint: ' + h, 0.4,
        'Human or rule-based annotation in demo data only.', 'sim', true));
    });

    return evidence;
  }

  /* --------  Website / domain  -------- */
  function analyzeWebsite(site, brand) {
    var evidence = [];
    var offDomains = (brand.verifiedDomains || []).map(function (d) { return d.value; });
    var allowlist = brand.allowlist || [];

    var host = extractHost(site.domain) || site.domain;
    var inAllowlist = false;
    allowlist.forEach(function (a) { if (host.indexOf(a.toLowerCase()) !== -1) inAllowlist = true; });
    offDomains.forEach(function (d) { if (host.indexOf(d.toLowerCase()) !== -1) inAllowlist = true; });

    if (inAllowlist) {
      evidence.push(ev('pos', 'Domain is on the brand allowlist / verified domains', 0.95,
        'No impersonation expected for allowlisted domains.', 'sim', true));
    } else {
      var typos = typoPatternsAgainst(host, offDomains);
      if (typos.length) {
        var strongest = 0;
        typos.forEach(function (t) {
          var w = 0.55;
          if (t.kind === 'hyphen_suffix') w = 0.75;
          if (t.kind === 'inserted_hyphen') w = 0.7;
          if (t.kind === 'edit_distance')   w = 0.8;
          if (t.kind === 'brand_token_tld') w = 0.55;
          if (t.kind === 'suspicious_tld')  w = 0.2;
          if (w > strongest) strongest = w;
          evidence.push(ev('neg', 'Domain lookalike: ' + t.kind, w, t.message, 'sim', true));
        });
      } else {
        evidence.push(ev('neu', 'No typo pattern matched against verified domains', 0.05,
          'Domain name does not trigger the simulated typo rules.', 'sim', true));
      }

      // Categories (seed)
      (site.categories || []).forEach(function (c) {
        evidence.push(ev('amb', 'Category match: ' + c, 0.25,
          'Annotated category in demo seed data only.', 'sim', true));
      });

      // Evidence notes
      (site.evidenceNotes || []).forEach(function (n) {
        evidence.push(ev('neg', 'Page signal: ' + n, 0.5,
          'Seed-annotated note about the page content (simulated).', 'sim', true));
      });
    }

    if (site.falsePositive) {
      evidence.push(ev('pos', 'Seed-marked expected false positive', 0.9,
        'Previously documented/allowlisted non-impersonating domain.', 'sim', true));
    }

    return evidence;
  }

  function ev(polarity, title, weight, body, sim, isSim) {
    return {
      polarity: polarity,       // pos / neg / amb / neu
      title: title,
      weight: Math.max(0, Math.min(1, weight)), // 0..1
      body: body || '',
      simulated: isSim !== false // true by default for this demo engine
    };
  }

  BSAI.Detection = {
    levenshtein: levenshtein,
    jaroWinkler: jaroWinkler,
    normalizeName: normalizeName,
    tokenize: tokenize,
    containsAny: containsAny,
    extractHost: extractHost,
    domainOnly: domainOnly,
    typoPatternsAgainst: typoPatternsAgainst,
    analyzeSocial: analyzeSocial,
    analyzeApp: analyzeApp,
    analyzeWebsite: analyzeWebsite
  };
})();
