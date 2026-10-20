/* =========================================================
   demo-data.js
   Fictional DEMO MODE dataset — clearly labeled, never real.
   Exposes:
     window.BSAI = window.BSAI || {};
     BSAI.seed = { brands, socialProfiles, apps, websites,
                   investigations, scanHistory, trendPoints };
   ========================================================= */
(function () {
  'use strict';

  var BSAI = (window.BSAI = window.BSAI || {});

  /* --------  Inline SVG logo helpers (data URIs)  -------- */
  function svgLogo(bg1, bg2, fg, letter) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="' + bg1 + '"/>' +
      '<stop offset="100%" stop-color="' + bg2 + '"/>' +
      '</linearGradient></defs>' +
      '<rect x="2" y="2" width="60" height="60" rx="14" fill="url(#g)"/>' +
      '<text x="50%" y="55%" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="30" font-weight="800" fill="' + fg + '">' + letter + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function appIcon(bg1, bg2, fg, letter) {
    return svgLogo(bg1, bg2, fg, letter);
  }

  var LOGO_NOVABANK   = svgLogo('#0A2540', '#1E3A5F', '#00D4FF', 'N');
  var LOGO_AEROVENTURE = svgLogo('#0F766E', '#14B8A6', '#FFFFFF', 'A');
  var LOGO_VIVAHEALTH = svgLogo('#7C3AED', '#00D4FF', '#FFFFFF', 'V');

  var APP_NOVA_ANDROID = appIcon('#0A2540', '#1E3A5F', '#00D4FF', 'N');
  var APP_NOVA_IOS     = appIcon('#112E51', '#00D4FF', '#FFFFFF', 'N');
  var APP_NOVA_BIZ     = appIcon('#0A2540', '#0F766E', '#FFFFFF', 'B');
  var APP_AERO_APP     = appIcon('#0F766E', '#14B8A6', '#FFFFFF', 'A');
  var APP_AERO_CREW    = appIcon('#0B5E57', '#0A2540', '#00D4FF', 'C');
  var APP_VIVA_PATIENT = appIcon('#7C3AED', '#00D4FF', '#FFFFFF', 'V');
  var APP_VIVA_PROVIDER = appIcon('#6D28D9', '#0EA5E9', '#FFFFFF', 'P');

  var APP_IMPERSONATOR_1 = appIcon('#0B2238', '#155672', '#00D4FF', 'N');  // similar to Novabank
  var APP_IMPERSONATOR_2 = appIcon('#0F5F59', '#16A693', '#FFFFFF', 'A');  // similar to Aero
  var APP_IMPERSONATOR_3 = appIcon('#692FC6', '#119AC8', '#FFFFFF', 'V');  // similar to Viva

  /* --------  Brands (3)  -------- */
  var BRANDS = [
    {
      id: 'br_novabank',
      name: 'NovaBank',
      tagline: 'Digital banking for the next generation',
      description:
        'NovaBank is a fictional full-service digital retail and business bank, offering checking, savings, loans, and investment products through web and mobile channels. Headquartered in the fictional region of New Avalon.',
      logo: LOGO_NOVABANK,
      createdAt: '2026-01-18T09:12:00Z',
      verifiedDomains: [
        { id: 'd_nv_1', value: 'novabank.com', verified: true, note: 'Primary corporate domain (simulated verification).' },
        { id: 'd_nv_2', value: 'nova.bank',   verified: true, note: 'Secondary TLD, registered in 2025.' },
        { id: 'd_nv_3', value: 'my-novabank.app', verified: true, note: 'Mobile-web portal.' }
      ],
      officialSocials: [
        { id: 's_nv_1', platform: 'X (Twitter)',   username: '@NovaBank',      url: 'https://twitter.com/NovaBank',      verified: true, note: 'Official X account with 482K followers (simulated).' },
        { id: 's_nv_2', platform: 'LinkedIn',      username: 'NovaBank PLC',   url: 'https://linkedin.com/company/novabank', verified: true, note: 'Official company page.' },
        { id: 's_nv_3', platform: 'Instagram',     username: '@novabank',      url: 'https://instagram.com/novabank',    verified: true, note: 'Retail brand account.' },
        { id: 's_nv_4', platform: 'Facebook Page', username: 'NovaBank',       url: 'https://facebook.com/NovaBank',     verified: true, note: 'Customer support page.' }
      ],
      officialApps: [
        { id: 'a_nv_1', name: 'NovaBank — Mobile Banking',  store: 'Google Play',  publisher: 'NovaBank Digital PLC',       url: 'https://play.google.com/store/apps/details?id=com.novabank.mobile',   icon: APP_NOVA_ANDROID, verified: true },
        { id: 'a_nv_2', name: 'NovaBank',                   store: 'Apple App Store', publisher: 'NovaBank PLC',               url: 'https://apps.apple.com/app/id000000001',                                      icon: APP_NOVA_IOS,     verified: true },
        { id: 'a_nv_3', name: 'NovaBank Business',          store: 'Google Play',  publisher: 'NovaBank Digital PLC',       url: 'https://play.google.com/store/apps/details?id=com.novabank.business', icon: APP_NOVA_BIZ,     verified: true }
      ],
      supportChannels: [
        { id: 'sc_nv_1', type: 'Hotline',   value: '+1 (555) 010-NOVA', note: '24/7 customer support (fictional).' },
        { id: 'sc_nv_2', type: 'Email',     value: 'support@novabank.com' },
        { id: 'sc_nv_3', type: 'Live Chat', value: 'Available via novabank.com portal.' },
        { id: 'sc_nv_4', type: 'In-app Support', value: 'Built-in chat in NovaBank mobile apps.' }
      ],
      allowlist: [
        'partner.novabank.com',
        'novabank.zendesk.com',
        'nova.bank'
      ]
    },
    {
      id: 'br_aeroventure',
      name: 'AeroVenture',
      tagline: 'Adventure travel & premium flights',
      description:
        'AeroVenture is a fictional premium adventure-travel and boutique-airline group offering curated expeditions, point redemptions, and member-only experiences. Brand licensing covers 14 fictional countries.',
      logo: LOGO_AEROVENTURE,
      createdAt: '2026-02-02T14:33:00Z',
      verifiedDomains: [
        { id: 'd_av_1', value: 'aeroventure.com', verified: true, note: 'Primary brand domain.' },
        { id: 'd_av_2', value: 'aero.travel',    verified: true, note: 'Campaign domain.' },
        { id: 'd_av_3', value: 'flyaeroventure.aero', verified: false, note: 'Recently purchased — DNS propagation pending (simulated).' }
      ],
      officialSocials: [
        { id: 's_av_1', platform: 'Instagram',     username: '@aeroventure',    url: 'https://instagram.com/aeroventure',  verified: true, note: 'Featured brand account with 1.2M followers (simulated).' },
        { id: 's_av_2', platform: 'X (Twitter)',   username: '@AeroVenture',    url: 'https://twitter.com/AeroVenture',    verified: true },
        { id: 's_av_3', platform: 'TikTok',        username: '@aeroventure_official', url: 'https://tiktok.com/@aeroventure_official', verified: true },
        { id: 's_av_4', platform: 'YouTube',       username: 'AeroVenture Expeditions', url: 'https://youtube.com/@aeroventure',  verified: true }
      ],
      officialApps: [
        { id: 'a_av_1', name: 'AeroVenture — Travel & Flights', store: 'Apple App Store', publisher: 'AeroVenture Group Ltd.',   url: 'https://apps.apple.com/app/id000000002',                    icon: APP_AERO_APP,  verified: true },
        { id: 'a_av_2', name: 'AeroVenture',                    store: 'Google Play',     publisher: 'AeroVenture Group Ltd.',   url: 'https://play.google.com/store/apps/details?id=av.aero',     icon: APP_AERO_APP,  verified: true },
        { id: 'a_av_3', name: 'AeroCrew by AeroVenture',        store: 'Apple App Store', publisher: 'AeroVenture Crew Systems',  url: 'https://apps.apple.com/app/id000000003',                    icon: APP_AERO_CREW, verified: true }
      ],
      supportChannels: [
        { id: 'sc_av_1', type: 'Hotline',   value: '+1 (555) 800-AERO' },
        { id: 'sc_av_2', type: 'Email',     value: 'hello@aeroventure.com' },
        { id: 'sc_av_3', type: 'DM Support', value: 'X, Instagram, TikTok verified channels only.' }
      ],
      allowlist: [
        'expeditions.aeroventure.com',
        'aeroventure.fandom.com'
      ]
    },
    {
      id: 'br_vivahealth',
      name: 'VivaHealth',
      tagline: 'Patient-first telehealth & wellness',
      description:
        'VivaHealth is a fictional integrated telehealth and wellness platform connecting patients with providers, appointment scheduling, secure messaging, lab results, and prescription refills across 9 fictional provinces.',
      logo: LOGO_VIVAHEALTH,
      createdAt: '2026-02-20T08:05:00Z',
      verifiedDomains: [
        { id: 'd_vh_1', value: 'vivahealth.com',     verified: true, note: 'Patient portal & marketing.' },
        { id: 'd_vh_2', value: 'viva.health',        verified: true, note: 'Short link domain for SMS.' },
        { id: 'd_vh_3', value: 'provider.vivahealth.com', verified: true, note: 'Provider portal.' }
      ],
      officialSocials: [
        { id: 's_vh_1', platform: 'LinkedIn',       username: 'VivaHealth',        url: 'https://linkedin.com/company/vivahealth',   verified: true },
        { id: 's_vh_2', platform: 'Facebook Page',  username: 'VivaHealth Clinic', url: 'https://facebook.com/VivaHealthClinic',     verified: true },
        { id: 's_vh_3', platform: 'Instagram',      username: '@vivahealth',        url: 'https://instagram.com/vivahealth',          verified: true },
        { id: 's_vh_4', platform: 'X (Twitter)',    username: '@VivaHealth',        url: 'https://twitter.com/VivaHealth',            verified: true }
      ],
      officialApps: [
        { id: 'a_vh_1', name: 'VivaHealth — Patient',   store: 'Apple App Store', publisher: 'VivaHealth Systems Inc.', url: 'https://apps.apple.com/app/id000000004', icon: APP_VIVA_PATIENT,  verified: true },
        { id: 'a_vh_2', name: 'VivaHealth Patient',     store: 'Google Play',     publisher: 'VivaHealth Systems Inc.', url: 'https://play.google.com/store/apps/details?id=vh.patient', icon: APP_VIVA_PATIENT, verified: true },
        { id: 'a_vh_3', name: 'VivaHealth Provider',    store: 'Apple App Store', publisher: 'VivaHealth Systems Inc.', url: 'https://apps.apple.com/app/id000000005', icon: APP_VIVA_PROVIDER, verified: true }
      ],
      supportChannels: [
        { id: 'sc_vh_1', type: 'Hotline',   value: '+1 (555) 4VIVA4U' },
        { id: 'sc_vh_2', type: 'Email',     value: 'care@vivahealth.com' },
        { id: 'sc_vh_3', type: 'Portal',    value: 'Secure messages via patient portal only.' }
      ],
      allowlist: [
        'labs.vivahealth.com',
        'mychart-vivahealth.com'
      ]
    }
  ];

  /* --------  Social Profiles (12)  --------
     Mix: 4 official-flagged, 5 suspicious impersonation, 2 uncertain, 1 false-positive.
     Each detectionEngine run will attach evidence + score — see detection-engine.js. */
  var SOCIAL_PROFILES = [
    /* --- NovaBank socials: 4 total --- */
    {
      id: 'sp_nv_off1', brandId: 'br_novabank', platform: 'X (Twitter)',
      username: '@NovaBank', displayName: 'NovaBank',
      bio: 'Official account. Banking built for the way you live today. For support DM us or call 1-555-010-NOVA.',
      followers: 482000, following: 1320, posts: 8420,
      profileImageType: 'official_verified',
      externalUrl: 'novabank.com/customer-hub',
      isOfficial: true,
      created: '2026-03-12T10:11:00Z', detectedBy: 'Seed / allowlist match',
      status: 'verified'
    },
    {
      id: 'sp_nv_sus1', brandId: 'br_novabank', platform: 'X (Twitter)',
      username: '@NovaBank_Support', displayName: 'NovaBank Support 🆘',
      bio: 'NovaBank 24/7 support. We DM first! Click link to verify your card: n0vabank-support . com',
      followers: 342, following: 2880, posts: 47,
      profileImageType: 'stolen_official_cropped',
      externalUrl: 'n0vabank-support.com/verify',
      isOfficial: false, suspicious: true,
      suspiciousHints: ['dm_first', 'lookalike_link_in_bio', 'spammy_follower_ratio', 'urgent_language'],
      created: '2026-10-05T03:02:00Z', detectedBy: 'Username similarity + keyword scan (simulated)'
    },
    {
      id: 'sp_nv_sus2', brandId: 'br_novabank', platform: 'Instagram',
      username: '@nova.bank.official.ig', displayName: 'Novabank Official',
      bio: 'NovaBank — giveaway campaign! First 1000 followers win $500. Tap link in bio ✅',
      followers: 1180, following: 4120, posts: 24,
      profileImageType: 'modified_logo_colors',
      externalUrl: 'giveaway-novabank . ru',
      isOfficial: false, suspicious: true,
      suspiciousHints: ['giveaway_language', 'lookalike_link', 'low_posts_high_follow_bot_ratio'],
      created: '2026-10-08T11:20:00Z', detectedBy: 'Display-name + logo similarity (simulated)'
    },
    {
      id: 'sp_nv_fp', brandId: 'br_novabank', platform: 'LinkedIn',
      username: 'NovaBank Marketing Summit (unofficial)',
      displayName: 'NovaBank Marketing Summit',
      bio: 'Independent community of marketers who love NovaBank products. Not affiliated — opinions are our own.',
      followers: 640, following: 220, posts: 34,
      profileImageType: 'custom_but_not_logo',
      externalUrl: 'summit-for-marketers . com',
      isOfficial: false, suspicious: false, falsePositive: true,
      suspiciousHints: ['brand_name_in_displayname_only'],
      created: '2026-09-21T08:41:00Z', detectedBy: 'Name substring match (false positive expected)'
    },

    /* --- AeroVenture socials: 4 total --- */
    {
      id: 'sp_av_off1', brandId: 'br_aeroventure', platform: 'Instagram',
      username: '@aeroventure', displayName: 'AeroVenture',
      bio: '✈️ Official AeroVenture. Escape the ordinary. Book: aero.travel Customer care: @AeroSupport',
      followers: 1200000, following: 520, posts: 2410,
      profileImageType: 'official_verified',
      externalUrl: 'aero.travel',
      isOfficial: true, created: '2026-03-22T09:00:00Z', detectedBy: 'Seed / allowlist match',
      status: 'verified'
    },
    {
      id: 'sp_av_sus1', brandId: 'br_aeroventure', platform: 'TikTok',
      username: '@aeroventur3_deals', displayName: 'AeroVenture Deals ✅',
      bio: 'Exclusive 90% off AeroVenture vouchers! Sign up via the site below — limited time!',
      followers: 8200, following: 42100, posts: 38,
      profileImageType: 'stolen_official_cropped',
      externalUrl: 'aer0venture-deals . info',
      isOfficial: false, suspicious: true,
      suspiciousHints: ['typo_username', 'too_good_to_be_true_deals', 'external_url_mismatch'],
      created: '2026-10-04T18:55:00Z', detectedBy: 'Username edit distance + link scanner (simulated)'
    },
    {
      id: 'sp_av_sus2', brandId: 'br_aeroventure', platform: 'Facebook Page',
      username: 'AeroVenture Bookings', displayName: 'AeroVenture Bookings — Official Page',
      bio: 'Book your next adventure at 70% discount. Message us your credit card to claim your seat.',
      followers: 2240, likes: 2310, posts: 56,
      profileImageType: 'modified_logo_colors',
      externalUrl: 'aeroventures-book . site',
      isOfficial: false, suspicious: true,
      suspiciousHints: ['payment_via_message', 'external_url_mismatch'],
      created: '2026-10-07T21:30:00Z', detectedBy: 'Logo hashing + keyword scan (simulated)'
    },
    {
      id: 'sp_av_unc', brandId: 'br_aeroventure', platform: 'X (Twitter)',
      username: '@AeroVenture_News', displayName: 'Aero News & Updates',
      bio: 'Unofficial news feed covering AeroVenture route announcements. Not affiliated.',
      followers: 512, following: 120, posts: 168,
      profileImageType: 'custom_but_not_logo',
      externalUrl: null,
      isOfficial: false, uncertain: true,
      suspiciousHints: ['brand_name_in_username'],
      created: '2026-09-02T12:08:00Z', detectedBy: 'Username substring (manual review needed)'
    },

    /* --- VivaHealth socials: 4 total --- */
    {
      id: 'sp_vh_off1', brandId: 'br_vivahealth', platform: 'LinkedIn',
      username: 'VivaHealth', displayName: 'VivaHealth',
      bio: 'Patient-first telehealth platform. We never request medical details via social DMs.',
      followers: 78500, following: 240, posts: 540,
      profileImageType: 'official_verified',
      externalUrl: 'vivahealth.com/about',
      isOfficial: true, created: '2026-03-28T08:00:00Z', detectedBy: 'Seed / allowlist match',
      status: 'verified'
    },
    {
      id: 'sp_vh_sus1', brandId: 'br_vivahealth', platform: 'WhatsApp Business (reported)',
      username: '+1 (555) 000-VIVA', displayName: 'VivaHealth Billing Dept',
      bio: '(Sample reported profile — simulated) Your VivaHealth prescription is ready. Click to confirm payment.',
      followers: null, following: null, posts: null,
      profileImageType: 'stolen_official_cropped',
      externalUrl: 'vivah-health . top / pay',
      isOfficial: false, suspicious: true,
      suspiciousHints: ['sms_phishing', 'urgent_language', 'lookalike_link_in_bio'],
      created: '2026-10-09T06:44:00Z', detectedBy: 'User-reported + keyword scan (simulated)'
    },
    {
      id: 'sp_vh_sus2', brandId: 'br_vivahealth', platform: 'Facebook Page',
      username: 'Viva Health Free Clinic', displayName: 'VivaHealth Free Clinic',
      bio: 'Free diabetes and blood-pressure screenings. Fill out the intake form (link) to book a slot.',
      followers: 410, likes: 438, posts: 18,
      profileImageType: 'copied_from_website',
      externalUrl: 'docs.google . com/forms/vivaclinic-intake',
      isOfficial: false, suspicious: true,
      suspiciousHints: ['unauthorized_event_name', 'external_data_collection_form'],
      created: '2026-10-01T04:16:00Z', detectedBy: 'Facebook display-name + logo scan (simulated)'
    },
    {
      id: 'sp_vh_unc', brandId: 'br_vivahealth', platform: 'X (Twitter)',
      username: '@VivaHealth_Alum', displayName: 'VivaHealth Alumni',
      bio: 'Former employees of VivaHealth sharing careers. Not affiliated. Opinions our own.',
      followers: 180, following: 92, posts: 72,
      profileImageType: 'custom_but_not_logo',
      externalUrl: null,
      isOfficial: false, uncertain: true,
      suspiciousHints: ['brand_name_in_displayname_only'],
      created: '2026-08-14T19:02:00Z', detectedBy: 'Name substring (manual review)'
    }
  ];

  /* --------  Apps (10)  -------- */
  var APPS = [
    /* NovaBank: 4 */
    {
      id: 'ap_nv_off1', brandId: 'br_novabank',
      name: 'NovaBank — Mobile Banking', store: 'Google Play',
      publisher: 'NovaBank Digital PLC',
      packageId: 'com.novabank.mobile',
      url: 'https://play.google.com/store/apps/details?id=com.novabank.mobile',
      icon: APP_NOVA_ANDROID,
      description: 'Manage accounts, pay bills, transfer money, and deposit checks from anywhere.',
      installs: '10M+', rating: 4.6, reviews: 128400,
      isOfficial: true, verified: true, created: '2026-03-10T10:00:00Z',
      detectedBy: 'Seed / allowlist match'
    },
    {
      id: 'ap_nv_off2', brandId: 'br_novabank',
      name: 'NovaBank', store: 'Apple App Store',
      publisher: 'NovaBank PLC',
      packageId: 'id000000001',
      url: 'https://apps.apple.com/app/id000000001',
      icon: APP_NOVA_IOS,
      description: 'The official NovaBank iPhone and iPad banking app.',
      installs: '5M+', rating: 4.7, reviews: 84120,
      isOfficial: true, verified: true, created: '2026-03-10T10:00:00Z',
      detectedBy: 'Seed / allowlist match'
    },
    {
      id: 'ap_nv_sus1', brandId: 'br_novabank',
      name: 'NоvaBank — Mobile', store: 'APK Mirror / Third-party Site',
      publisher: 'Nova Digital (unverified)',
      packageId: 'com.novabank.mobile.pro',
      url: 'https://apk-download-host . example / novabank-mobile',
      icon: APP_IMPERSONATOR_1,
      description: 'PRO version of NovaBank mobile — unlock extra features by entering your card.',
      installs: '8K', rating: 2.1, reviews: 412,
      isOfficial: false, suspicious: true,
      suspiciousHints: ['publisher_mismatch', 'third_party_store', 'name_homoglyph', 'ask_for_credentials_in_description'],
      created: '2026-10-06T15:18:00Z',
      detectedBy: 'Publisher whitelist + name similarity (simulated)'
    },
    {
      id: 'ap_nv_sus2', brandId: 'br_novabank',
      name: 'Novabank Wallet', store: 'Google Play',
      publisher: 'FinWallet Studio',
      packageId: 'studio.finwallet.novawallet',
      url: 'https://play.google.com/store/apps/details?id=studio.finwallet.novawallet',
      icon: APP_IMPERSONATOR_1,
      description: 'Third-party wallet aggregator. Import any bank including NovaBank using your online banking password.',
      installs: '50K+', rating: 3.0, reviews: 1104,
      isOfficial: false, suspicious: true,
      suspiciousHints: ['publisher_mismatch', 'credential_phishing'],
      created: '2026-10-03T09:30:00Z',
      detectedBy: 'Publisher whitelist + keyword scan (simulated)'
    },

    /* AeroVenture: 3 */
    {
      id: 'ap_av_off1', brandId: 'br_aeroventure',
      name: 'AeroVenture — Travel & Flights', store: 'Apple App Store',
      publisher: 'AeroVenture Group Ltd.',
      packageId: 'id000000002',
      url: 'https://apps.apple.com/app/id000000002',
      icon: APP_AERO_APP,
      description: 'Official AeroVenture companion — search, book, check in, and redeem miles.',
      installs: '3M+', rating: 4.8, reviews: 52300,
      isOfficial: true, verified: true, created: '2026-03-24T10:00:00Z',
      detectedBy: 'Seed / allowlist match'
    },
    {
      id: 'ap_av_sus1', brandId: 'br_aeroventure',
      name: 'AeroVenture — Cheap Flight Deals', store: 'Apple App Store',
      publisher: 'Cheap Flights Apps Inc.',
      packageId: 'id000099991',
      url: 'https://apps.apple.com/app/id000099991',
      icon: APP_IMPERSONATOR_2,
      description: 'Search 90% off AeroVenture and partner flights. Enter your passport number at checkout.',
      installs: '40K', rating: 2.9, reviews: 980,
      isOfficial: false, suspicious: true,
      suspiciousHints: ['publisher_mismatch', 'uses_brand_name_in_title', 'asks_for_sensitive_data'],
      created: '2026-10-05T22:12:00Z',
      detectedBy: 'Publisher whitelist + title scan (simulated)'
    },
    {
      id: 'ap_av_fp', brandId: 'br_aeroventure',
      name: 'AeroVenture Roleplay Sim', store: 'Google Play',
      publisher: 'Indie Game Studio',
      packageId: 'com.indie.avroleplay',
      url: 'https://play.google.com/store/apps/details?id=com.indie.avroleplay',
      icon: APP_AERO_CREW,
      description: 'A fan-made roleplay simulator. Game only — no real flights or bookings.',
      installs: '12K', rating: 4.2, reviews: 620,
      isOfficial: false, suspicious: false, falsePositive: true,
      suspiciousHints: ['brand_name_in_title'],
      created: '2026-09-09T16:05:00Z',
      detectedBy: 'Name substring match (expected false positive)'
    },

    /* VivaHealth: 3 */
    {
      id: 'ap_vh_off1', brandId: 'br_vivahealth',
      name: 'VivaHealth — Patient', store: 'Apple App Store',
      publisher: 'VivaHealth Systems Inc.',
      packageId: 'id000000004',
      url: 'https://apps.apple.com/app/id000000004',
      icon: APP_VIVA_PATIENT,
      description: 'Official VivaHealth patient app — appointments, messages, lab results, prescriptions.',
      installs: '2M+', rating: 4.7, reviews: 31200,
      isOfficial: true, verified: true, created: '2026-04-01T10:00:00Z',
      detectedBy: 'Seed / allowlist match'
    },
    {
      id: 'ap_vh_sus1', brandId: 'br_vivahealth',
      name: 'VivaHealth Medical Portal', store: 'Third-party APK Site',
      publisher: 'MedPortal (unverified)',
      packageId: 'med.portal.vivahealth.plus',
      url: 'https://apk-host . example /medportal-viva',
      icon: APP_IMPERSONATOR_3,
      description: 'Access your VivaHealth records by entering your SSN and insurance ID.',
      installs: '1.2K', rating: 1.8, reviews: 42,
      isOfficial: false, suspicious: true,
      suspiciousHints: ['third_party_store', 'publisher_mismatch', 'asks_for_sensitive_data', 'name_lookalike'],
      created: '2026-10-08T03:18:00Z',
      detectedBy: 'Publisher whitelist + keyword scan (simulated)'
    },
    {
      id: 'ap_vh_sus2', brandId: 'br_vivahealth',
      name: 'Viva Health — Diet Planner', store: 'Google Play',
      publisher: 'General Wellness Apps',
      packageId: 'com.generalwellness.vivadiet',
      url: 'https://play.google.com/store/apps/details?id=com.generalwellness.vivadiet',
      icon: APP_IMPERSONATOR_3,
      description: 'A generic diet planner app with "Viva Health" branding added for visibility.',
      installs: '22K', rating: 3.4, reviews: 760,
      isOfficial: false, suspicious: true,
      suspiciousHints: ['brandjacking_title', 'publisher_mismatch'],
      created: '2026-10-02T05:05:00Z',
      detectedBy: 'Publisher whitelist + name lookalike score (simulated)'
    }
  ];

  /* --------  Websites / domains (8)  -------- */
  var WEBSITES = [
    {
      id: 'ws_nv_1', brandId: 'br_novabank',
      domain: 'novabank-login-verify.com',
      resembles: 'novabank.com (official login portal)',
      typoExplanation:
        'Added "-login-verify" suffix + .com TLD. Pattern matches credential-harvesting kits commonly reusing brand names with hyphenated action words.',
      categories: ['typo_hyphen_suffix', 'lookalike_login_page'],
      firstSeen: '2026-10-08T14:12:00Z',
      registrar: 'Simulated · Registrar X',
      nameservers: ['ns1.simulated-host . net', 'ns2.simulated-host . net'],
      ip: '203.0.113.47 (simulated)',
      webServer: 'Simulated · nginx/1.24',
      dnsStatus: 'Simulated · A record resolves (mock)',
      screenshotPlaceholder: 'phishing_login',
      suspicious: true,
      severityHint: 'high',
      evidenceNotes: ['HTML title matches "NovaBank — Sign In"', 'Form POSTs to /capture-credentials (simulated)']
    },
    {
      id: 'ws_nv_2', brandId: 'br_novabank',
      domain: 'n0vabank.com',
      resembles: 'novabank.com',
      typoExplanation: 'Homoglyph substitution: "0" (zero) in place of letter "o". Visually near-identical in many fonts.',
      categories: ['homoglyph'],
      firstSeen: '2026-10-06T02:00:00Z',
      registrar: 'Simulated · Registrar Y',
      nameservers: ['ns1.rogue-ns . shop'],
      ip: '198.51.100.12 (simulated)',
      webServer: 'Simulated · Apache',
      dnsStatus: 'Simulated · A record + MX present (mock)',
      screenshotPlaceholder: 'homoglyph_clone',
      suspicious: true,
      severityHint: 'high',
      evidenceNotes: ['Has MX records → suggests phishing email setup (simulated)']
    },
    {
      id: 'ws_nv_3', brandId: 'br_novabank',
      domain: 'novabankk.com',
      resembles: 'novabank.com',
      typoExplanation: 'Double "k" at the end of the brand name — classic typo-squat pattern.',
      categories: ['typo_character_duplication'],
      firstSeen: '2026-10-04T06:45:00Z',
      registrar: 'Simulated · Registrar Z',
      nameservers: ['ns1.simulated-cloud . com'],
      ip: '192.0.2.88 (simulated)',
      webServer: 'Simulated · Cloudflare-fronted',
      dnsStatus: 'Simulated · resolving (mock)',
      screenshotPlaceholder: 'parked_or_redirect',
      suspicious: true,
      severityHint: 'medium',
      evidenceNotes: ['Currently parked with generic ads (simulated)']
    },
    {
      id: 'ws_av_1', brandId: 'br_aeroventure',
      domain: 'aeroventure-bookings.com',
      resembles: 'aeroventure.com (bookings flow)',
      typoExplanation: 'Added "-bookings" suffix — pattern used in fake travel booking scams.',
      categories: ['typo_hyphen_suffix', 'lookalike_booking_page'],
      firstSeen: '2026-10-07T09:02:00Z',
      registrar: 'Simulated · Registrar X',
      nameservers: ['ns1.travel-hosting . site'],
      ip: '203.0.113.91 (simulated)',
      webServer: 'Simulated · LiteSpeed',
      dnsStatus: 'Simulated · resolving (mock)',
      screenshotPlaceholder: 'fake_booking_form',
      suspicious: true,
      severityHint: 'high',
      evidenceNotes: ['Checkout page asks for card + CVV + passport scan upload (simulated)']
    },
    {
      id: 'ws_av_2', brandId: 'br_aeroventure',
      domain: 'aero-venture.com',
      resembles: 'aeroventure.com',
      typoExplanation: 'Extra hyphen inserted between brand tokens.',
      categories: ['typo_inserted_hyphen'],
      firstSeen: '2026-10-03T13:30:00Z',
      registrar: 'Simulated · Registrar Y',
      nameservers: ['ns1.simulated-host . net'],
      ip: '198.51.100.33 (simulated)',
      webServer: 'Simulated · nginx',
      dnsStatus: 'Simulated · resolving (mock)',
      screenshotPlaceholder: 'low_effort_clone',
      suspicious: true,
      severityHint: 'medium',
      evidenceNotes: ['Copies 3 of 4 hero images from official site (simulated visual match)']
    },
    {
      id: 'ws_av_3', brandId: 'br_aeroventure',
      domain: 'aeroventure.community',
      resembles: 'aeroventure.com (social lookalike)',
      typoExplanation: 'Different TLD (.community) with brand-relevant suffix; often used in fan-impersonation or fake-support scams.',
      categories: ['tld_lookalike'],
      firstSeen: '2026-09-28T02:18:00Z',
      registrar: 'Simulated · Registrar Z',
      nameservers: ['ns1.forum-host . xyz'],
      ip: '192.0.2.41 (simulated)',
      webServer: 'Simulated · NodeBB',
      dnsStatus: 'Simulated · resolving (mock)',
      screenshotPlaceholder: 'forum_lookalike',
      suspicious: true,
      severityHint: 'medium',
      evidenceNotes: ['Forum posts by "AeroSupport" contain links to external payment forms (simulated)']
    },
    {
      id: 'ws_vh_1', brandId: 'br_vivahealth',
      domain: 'vivahealth-care.top',
      resembles: 'vivahealth.com (billing / patient messaging)',
      typoExplanation: 'Suffix "-care" + .top TLD. Pattern consistent with fake patient-portal / billing-scam sites.',
      categories: ['tld_lookalike', 'typo_hyphen_suffix'],
      firstSeen: '2026-10-09T00:45:00Z',
      registrar: 'Simulated · Registrar X',
      nameservers: ['ns1.hp-scam . top'],
      ip: '203.0.113.202 (simulated)',
      webServer: 'Simulated · Apache',
      dnsStatus: 'Simulated · resolving (mock)',
      screenshotPlaceholder: 'patient_billing_scam',
      suspicious: true,
      severityHint: 'high',
      evidenceNotes: ['Requests insurance + SSN last 4 + credit card on same form (simulated)']
    },
    {
      id: 'ws_vh_fp', brandId: 'br_vivahealth',
      domain: 'vivahealth.fandom.com',
      resembles: 'vivahealth.com (fandom / user wiki)',
      typoExplanation: 'User-editable Fandom wiki. Was auto-flagged because the substring "vivahealth" appears as a subdomain.',
      categories: ['subdomain_lookalike'],
      firstSeen: '2026-09-10T12:00:00Z',
      registrar: 'Fandom, Inc. (real host; site is fictional content only)',
      nameservers: ['N/A (subdomain of fandom.com)'],
      ip: 'N/A (subdomain of fandom.com)',
      webServer: 'Fandom platform',
      dnsStatus: 'Simulated · resolving',
      screenshotPlaceholder: 'fandom_wiki',
      suspicious: false, falsePositive: true, severityHint: 'low',
      evidenceNotes: ['Legitimate fan community site; listed on brand allowlist in seed data.']
    }
  ];

  /* --------  Investigations (10)  -------- */
  var INVESTIGATIONS = [
    {
      id: 'INV-2026-001', brandId: 'br_novabank',
      title: 'Credential-phishing site "novabank-login-verify.com"',
      severity: 'high', status: 'investigating',
      createdAt: '2026-10-08T14:22:00Z',
      updatedAt: '2026-10-09T09:15:00Z',
      assignedTo: 'Analyst (demo)',
      summary:
        'Lookalike domain impersonating the NovaBank customer-login page. Form posts credentials to a simulated endpoint. Linked to a secondary X account DMing victims.',
      linkedAssetIds: ['ws_nv_1', 'sp_nv_sus1'],
      timeline: [
        { t: '2026-10-08T14:22:00Z', kind: 'new',    title: 'Case auto-opened by Website Monitoring module', body: 'Severity set to HIGH based on live credential capture form (simulated).' },
        { t: '2026-10-08T15:05:00Z', kind: 'warn',   title: 'Linked social profile detected',                 body: '@NovaBank_Support (X/Twitter) links to the same domain in bio.' },
        { t: '2026-10-09T09:15:00Z', kind: 'invest', title: 'Analyst triage in progress',                     body: 'Confirming registrar abuse contact and takedown path (mock).' }
      ],
      notes: [
        { t: '2026-10-08T15:20:00Z', author: 'Analyst', text: 'Registrar abuse form draft saved locally.' }
      ],
      responses: [
        { id: 1, label: 'Draft takedown request to registrar/host', done: true },
        { id: 2, label: 'Notify internal brand & communications team', done: false },
        { id: 3, label: 'Publish customer advisory via official channels', done: false }
      ],
      impact: {
        potentialReach: 'Unknown',
        reportedVictims: 'Unknown',
        confirmedVictims: 'Unknown',
        reportedLoss: 'Unknown',
        confirmedLoss: 'Unknown'
      }
    },
    {
      id: 'INV-2026-002', brandId: 'br_novabank',
      title: 'Homoglyph domain n0vabank.com registered',
      severity: 'high', status: 'open',
      createdAt: '2026-10-06T02:12:00Z',
      updatedAt: '2026-10-08T06:00:00Z',
      assignedTo: 'Analyst (demo)',
      summary: 'Homoglyph swap of letter "o" → digit "0". MX records present, which suggests upcoming phishing-email campaign (all simulated).',
      linkedAssetIds: ['ws_nv_2'],
      timeline: [
        { t: '2026-10-06T02:12:00Z', kind: 'new',  title: 'Case opened', body: 'Domain registered 12h prior to detection.' },
        { t: '2026-10-07T18:05:00Z', kind: 'warn', title: 'MX records added', body: 'New MX record → possible phishing mailer setup (simulated).' }
      ],
      notes: [],
      responses: [
        { id: 1, label: 'Contact registrar for UDRP/takedown', done: false },
        { id: 2, label: 'Add domain to customer-warning list',   done: true  }
      ],
      impact: {
        potentialReach: 'Unknown', reportedVictims: 'Unknown', confirmedVictims: 'Unknown',
        reportedLoss: 'Unknown', confirmedLoss: 'Unknown'
      }
    },
    {
      id: 'INV-2026-003', brandId: 'br_novabank',
      title: 'Third-party APK "NovaBank — Mobile PRO"',
      severity: 'high', status: 'investigating',
      createdAt: '2026-10-06T16:33:00Z',
      updatedAt: '2026-10-08T12:10:00Z',
      assignedTo: 'Analyst (demo)',
      summary: 'Homoglyph-named app on an unauthorized APK mirror; description prompts users to "verify with your card number + CVV" (simulated).',
      linkedAssetIds: ['ap_nv_sus1'],
      timeline: [
        { t: '2026-10-06T16:33:00Z', kind: 'new',    title: 'Case opened' },
        { t: '2026-10-08T12:10:00Z', kind: 'invest', title: 'Host contacted (simulated)', body: 'Abuse report sent to APK mirror operator; awaiting reply.' }
      ],
      notes: [],
      responses: [
        { id: 1, label: 'Host takedown report',      done: true },
        { id: 2, label: 'Google Play Protect referral', done: false },
        { id: 3, label: 'App-store advisory in-app',  done: false }
      ],
      impact: { potentialReach: 'Unknown', reportedVictims: 'Unknown', confirmedVictims: 'Unknown', reportedLoss: 'Unknown', confirmedLoss: 'Unknown' }
    },
    {
      id: 'INV-2026-004', brandId: 'br_novabank',
      title: 'LinkedIn "NovaBank Marketing Summit" (false positive)',
      severity: 'review', status: 'fp',
      createdAt: '2026-09-21T09:00:00Z',
      updatedAt: '2026-09-22T11:38:00Z',
      assignedTo: 'Analyst (demo)',
      summary:
        'A LinkedIn group that uses the "NovaBank" name but clearly disclaims affiliation in bio. Analysts reviewed and closed as false positive; added to allowlist.',
      linkedAssetIds: ['sp_nv_fp'],
      timeline: [
        { t: '2026-09-21T09:00:00Z', kind: 'new',    title: 'Auto-detected via name substring match' },
        { t: '2026-09-22T11:38:00Z', kind: 'good',   title: 'Closed as False Positive', body: 'Disclaimer present. Added to brand allowlist.' }
      ],
      notes: [{ t: '2026-09-22T11:38:00Z', author: 'Analyst', text: 'Group owner confirmed independent marketing community.' }],
      responses: [{ id: 1, label: 'Add to allowlist', done: true }],
      impact: { potentialReach: 'Unknown', reportedVictims: 'Unknown', confirmedVictims: 'Unknown', reportedLoss: 'Unknown', confirmedLoss: 'Unknown' }
    },
    {
      id: 'INV-2026-005', brandId: 'br_aeroventure',
      title: 'TikTok "@aeroventur3_deals" giveaway scam',
      severity: 'medium', status: 'open',
      createdAt: '2026-10-04T19:10:00Z',
      updatedAt: '2026-10-05T07:22:00Z',
      assignedTo: 'Analyst (demo)',
      summary: 'Impersonating TikTok account promising 90% off vouchers with an external-data-capture link (simulated).',
      linkedAssetIds: ['sp_av_sus1', 'ws_av_1'],
      timeline: [
        { t: '2026-10-04T19:10:00Z', kind: 'new',  title: 'Case opened' },
        { t: '2026-10-05T07:22:00Z', kind: 'warn', title: 'Domain linked', body: 'TikTok bio leads to aeroventure-bookings.com fake booking site.' }
      ],
      notes: [],
      responses: [
        { id: 1, label: 'Report account to TikTok Trust & Safety', done: false },
        { id: 2, label: 'Community advisory pinned on official Aero socials', done: false }
      ],
      impact: { potentialReach: 'Unknown', reportedVictims: 'Unknown', confirmedVictims: 'Unknown', reportedLoss: 'Unknown', confirmedLoss: 'Unknown' }
    },
    {
      id: 'INV-2026-006', brandId: 'br_aeroventure',
      title: 'Fan game "AeroVenture Roleplay Sim" — false positive',
      severity: 'low', status: 'resolved',
      createdAt: '2026-09-09T17:00:00Z',
      updatedAt: '2026-09-14T10:05:00Z',
      assignedTo: 'Analyst (demo)',
      summary:
        'Indie mobile game that uses the AeroVenture name in its title. Store description clearly states it is a roleplay simulator. Resolved — no impersonation intended (simulated clearance).',
      linkedAssetIds: ['ap_av_fp'],
      timeline: [
        { t: '2026-09-09T17:00:00Z', kind: 'new',  title: 'Detected' },
        { t: '2026-09-14T10:05:00Z', kind: 'good', title: 'Resolved — benign fan content', body: 'Added to allowlist.' }
      ],
      notes: [],
      responses: [
        { id: 1, label: 'Verify store description disclaimer', done: true },
        { id: 2, label: 'Document allowlist entry',            done: true }
      ],
      impact: { potentialReach: 'Unknown', reportedVictims: 'Unknown', confirmedVictims: 'Unknown', reportedLoss: 'Unknown', confirmedLoss: 'Unknown' }
    },
    {
      id: 'INV-2026-007', brandId: 'br_aeroventure',
      title: 'Fake bookings site aeroventure-bookings.com',
      severity: 'high', status: 'investigating',
      createdAt: '2026-10-07T09:10:00Z',
      updatedAt: '2026-10-09T14:05:00Z',
      assignedTo: 'Analyst (demo)',
      summary: 'High-fidelity fake bookings checkout requesting card + passport data. Linked to TikTok scam account.',
      linkedAssetIds: ['ws_av_1', 'sp_av_sus1'],
      timeline: [
        { t: '2026-10-07T09:10:00Z', kind: 'new',    title: 'Domain detection' },
        { t: '2026-10-07T16:00:00Z', kind: 'warn',   title: 'Live payment form confirmed (simulated)' },
        { t: '2026-10-09T14:05:00Z', kind: 'invest', title: 'Hosting provider abuse ticket opened (simulated)' }
      ],
      notes: [],
      responses: [
        { id: 1, label: 'Host & registrar abuse tickets', done: true },
        { id: 2, label: 'Payment processor notified about card data capture (mock)', done: false },
        { id: 3, label: 'Customer advisory',              done: false }
      ],
      impact: { potentialReach: 'Unknown', reportedVictims: 'Unknown', confirmedVictims: 'Unknown', reportedLoss: 'Unknown', confirmedLoss: 'Unknown' }
    },
    {
      id: 'INV-2026-008', brandId: 'br_vivahealth',
      title: 'vivahealth-care.top billing scam',
      severity: 'high', status: 'open',
      createdAt: '2026-10-09T01:05:00Z',
      updatedAt: '2026-10-09T05:50:00Z',
      assignedTo: 'Analyst (demo)',
      summary:
        'High-risk billing-scam lookalike requesting SSN, insurance ID, and credit card on the same form. Also advertised via a WhatsApp business profile impersonating "VivaHealth Billing Dept".',
      linkedAssetIds: ['ws_vh_1', 'sp_vh_sus1'],
      timeline: [
        { t: '2026-10-09T01:05:00Z', kind: 'new',  title: 'Domain detection' },
        { t: '2026-10-09T05:50:00Z', kind: 'bad',  title: 'Linked WhatsApp profile reported by 2 users (simulated report counts)' }
      ],
      notes: [],
      responses: [
        { id: 1, label: 'Escalate to host + registrar (high priority)', done: false },
        { id: 2, label: 'Patient portal banner warning (mock)', done: true },
        { id: 3, label: 'Care-line script update for billing scams', done: false }
      ],
      impact: { potentialReach: 'Unknown', reportedVictims: 'Unknown', confirmedVictims: 'Unknown', reportedLoss: 'Unknown', confirmedLoss: 'Unknown' }
    },
    {
      id: 'INV-2026-009', brandId: 'br_vivahealth',
      title: 'Third-party medical-portal APK with SSN prompt',
      severity: 'high', status: 'dismissed',
      createdAt: '2026-10-08T03:30:00Z',
      updatedAt: '2026-10-09T00:10:00Z',
      assignedTo: 'Analyst (demo)',
      summary:
        'Severity was set to HIGH on initial detection, but follow-up host inspection (simulated) returned 404; site appears already taken down by the host. Dismissed as "remediated by third party".',
      linkedAssetIds: ['ap_vh_sus1'],
      timeline: [
        { t: '2026-10-08T03:30:00Z', kind: 'new',  title: 'Detected' },
        { t: '2026-10-09T00:10:00Z', kind: 'good', title: 'Dismissed — host already removed the listing (simulated)', body: 'Re-scan returned 404; package no longer present.' }
      ],
      notes: [{ t: '2026-10-09T00:10:00Z', author: 'Analyst', text: 'Keep monitoring; may reappear.' }],
      responses: [
        { id: 1, label: 'Add package hash + domain to watchlist', done: true }
      ],
      impact: { potentialReach: 'Unknown', reportedVictims: 'Unknown', confirmedVictims: 'Unknown', reportedLoss: 'Unknown', confirmedLoss: 'Unknown' }
    },
    {
      id: 'INV-2026-010', brandId: 'br_novabank',
      title: 'Typosquat novabankk.com (parked)',
      severity: 'medium', status: 'investigating',
      createdAt: '2026-10-04T07:00:00Z',
      updatedAt: '2026-10-08T18:22:00Z',
      assignedTo: 'Analyst (demo)',
      summary: 'Double-"k" typosquat currently parked with generic adverts. Could pivot to active phishing at any time (simulated).',
      linkedAssetIds: ['ws_nv_3'],
      timeline: [
        { t: '2026-10-04T07:00:00Z', kind: 'new',    title: 'Domain detected (parked)' },
        { t: '2026-10-08T18:22:00Z', kind: 'invest', title: 'UDRP draft in progress (simulated)' }
      ],
      notes: [],
      responses: [
        { id: 1, label: 'Defensive registration of top 20 variants (simulated exercise)', done: false },
        { id: 2, label: 'UDRP/takedown if pivots to live content', done: false }
      ],
      impact: { potentialReach: 'Unknown', reportedVictims: 'Unknown', confirmedVictims: 'Unknown', reportedLoss: 'Unknown', confirmedLoss: 'Unknown' }
    }
  ];

  /* --------  Scan history & trend points (14 days)  -------- */
  function isoDaysAgo(n) {
    var d = new Date('2026-10-10T12:00:00Z');
    d.setUTCDate(d.getUTCDate() - n);
    return d.toISOString().slice(0, 10);
  }
  var TREND_POINTS = [
    { date: isoDaysAgo(13), newThreats: 1, open: 4,  resolved: 1 },
    { date: isoDaysAgo(12), newThreats: 0, open: 4,  resolved: 1 },
    { date: isoDaysAgo(11), newThreats: 2, open: 5,  resolved: 1 },
    { date: isoDaysAgo(10), newThreats: 1, open: 5,  resolved: 2 },
    { date: isoDaysAgo(9),  newThreats: 3, open: 7,  resolved: 2 },
    { date: isoDaysAgo(8),  newThreats: 2, open: 8,  resolved: 3 },
    { date: isoDaysAgo(7),  newThreats: 1, open: 7,  resolved: 3 },
    { date: isoDaysAgo(6),  newThreats: 2, open: 8,  resolved: 4 },
    { date: isoDaysAgo(5),  newThreats: 3, open: 9,  resolved: 4 },
    { date: isoDaysAgo(4),  newThreats: 2, open: 10, resolved: 5 },
    { date: isoDaysAgo(3),  newThreats: 4, open: 11, resolved: 5 },
    { date: isoDaysAgo(2),  newThreats: 2, open: 10, resolved: 6 },
    { date: isoDaysAgo(1),  newThreats: 3, open: 9,  resolved: 7 },
    { date: isoDaysAgo(0),  newThreats: 2, open: 8,  resolved: 7 }
  ];
  var SCAN_HISTORY = [
    { at: '2026-10-10T08:00:00Z', source: 'Social Media Monitoring (simulated)', status: 'ok', assetsScanned: 12, newFindings: 0 },
    { at: '2026-10-10T07:58:00Z', source: 'App Store Monitoring (simulated)',    status: 'ok', assetsScanned: 10, newFindings: 1 },
    { at: '2026-10-10T07:55:00Z', source: 'Website Monitoring (simulated)',      status: 'ok', assetsScanned: 8,  newFindings: 1 },
    { at: '2026-10-09T20:00:00Z', source: 'Social Media Monitoring (simulated)', status: 'warn', assetsScanned: 11, newFindings: 2, note: 'Rate-limited by simulated source' }
  ];

  BSAI.seed = {
    brands: BRANDS,
    socialProfiles: SOCIAL_PROFILES,
    apps: APPS,
    websites: WEBSITES,
    investigations: INVESTIGATIONS,
    trendPoints: TREND_POINTS,
    scanHistory: SCAN_HISTORY,
    lastFullScan: '2026-10-10T08:00:00Z'
  };
})();
