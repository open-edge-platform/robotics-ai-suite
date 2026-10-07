// SPDX-FileCopyrightText: (C) 2025 Intel Corporation
// SPDX-License-Identifier: Apache-2.0

/**
 * OEP Documentation - Central Head Bootstrap v1
 *
 * This file is the single source of truth for all third-party head integrations
 * across all deployed documentation versions. Updating this file takes effect
 * on every version without requiring a Sphinx rebuild.
 *
 * To introduce a breaking change, publish a new file (head-bootstrap.v2.js)
 * and update the <head> reference in a new rebuild cycle. Do not mutate the
 * v1 contract in a way that could silently break already-deployed versions.
 */
(function () {
  'use strict';

  var bootstrapSrc = document.currentScript && document.currentScript.src;
  // Idempotency guard - safe to include on single-page apps or partial reloads.
  if (window.__oepBootstrapV1Loaded) { return; }
  window.__oepBootstrapV1Loaded = true;

  /**
   * Append a <script> to <head> unless one with the same src already exists.
   * @param {string} src
   * @param {{ async?: boolean, defer?: boolean }} [opts]
   */
  function loadScript(src, opts) {
    if (document.querySelector('script[src="' + src + '"]')) { return; }
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    if (opts && opts.async) { s.async = true; }
    if (opts && opts.defer) { s.defer = true; }
    document.head.appendChild(s);
  }


  // 1) Intel WAP (cookie consent and TMS variables + loader).
  window.wapProfile = 'profile-microsite';    // This is mapped by WAP authorize value
  window.wapLocalCode = 'us-en';
  window.wapSection = 'dev-robotics-intel';
  window.wapEnv = 'prod';                    // Environment used by Adobe Tags. Non-prod should use 'stg'.

  // Initialize consent category queues if WAP has not populated them yet.
  window.wap_tms = window.wap_tms || {};
  window.wap_tms.categoriesQueue = window.wap_tms.categoriesQueue || {
    'ad targeting': [],
    'analytics': [],
    'functional': []
  };

  function getCookieValue(name) {
    var escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var match = document.cookie.match(new RegExp('(?:^|; )' + escaped + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function isConsentDebugEnabled() {
    try {
      var qp = new URLSearchParams(window.location.search || '');
      return qp.get('oepConsentDebug') === '1' || window.localStorage.getItem('oepConsentDebug') === '1';
    } catch (e) {
      return false;
    }
  }

  var consentDebugEnabled = isConsentDebugEnabled();

  function getConsentSnapshot() {
    var waLocation = window.utag_data && window.utag_data.wa_location ? String(window.utag_data.wa_location).toLowerCase() : null;
    return {
      waLocation: waLocation,
      consentObject: window.localStorage.getItem('_wap_user_consent'),
      consentString: window.localStorage.getItem('_wap_user_consent_str'),
      consentData: window.localStorage.getItem('_wap_user_consent_data'),
      optanonConsent: getCookieValue('OptanonConsent'),
      optanonClosed: getCookieValue('OptanonAlertBoxClosed')
    };
  }

  function logConsentSnapshot(stage) {
    if (!consentDebugEnabled) { return; }
    try {
      console.info('[oep-consent]', stage, getConsentSnapshot());
    } catch (e) {
      // Do not fail bootstrap for diagnostic logging.
    }
  }

  function getStoredConsentData() {
    try {
      var raw = window.localStorage.getItem('_wap_user_consent_data');
      var parsed = raw ? JSON.parse(raw) : {};
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {};
      }
      return parsed;
    } catch (e) {
      return {};
    }
  }

  function hydrateConsentBucket(location, data) {
    if (!location || data[location]) { return false; }
    var bucket = {};
    var consentObject = window.localStorage.getItem('_wap_user_consent');
    var consentString = window.localStorage.getItem('_wap_user_consent_str');
    var consentCookie = getCookieValue('OptanonConsent');
    var closedCookie = getCookieValue('OptanonAlertBoxClosed');

    if (consentObject) { bucket.object = consentObject; }
    if (consentString) { bucket.string = consentString; }
    if (consentCookie) { bucket.consent = consentCookie; }
    if (closedCookie) { bucket.closed = closedCookie; }

    if (Object.keys(bucket).length === 0) { return false; }
    data[location] = bucket;
    return true;
  }

  // Stabilize consent location and local consent data before WAP/Launch code runs.
  function stabilizeConsentLocation() {
    var data = getStoredConsentData();
    window.utag_data = window.utag_data || {};

    var fromUtag = window.utag_data.wa_location ? String(window.utag_data.wa_location).toLowerCase() : '';
    var fromStored = data.location ? String(data.location).toLowerCase() : '';
    var fromLocalCode = (typeof window.wapLocalCode === 'string' && window.wapLocalCode.indexOf('-') > -1)
      ? window.wapLocalCode.split('-')[0].toLowerCase()
      : '';

    var stableLocation = fromUtag || fromStored || fromLocalCode || 'us';

    if (fromUtag && fromStored && fromUtag !== fromStored) {
      // Prefer stored location when the current location has no prior bucket.
      if (!data[fromUtag] && data[fromStored]) {
        stableLocation = fromStored;
      }
    }

    if (!window.utag_data.wa_location || String(window.utag_data.wa_location).toLowerCase() !== stableLocation) {
      window.utag_data.wa_location = stableLocation;
    }

    var changed = false;
    if (!data.location || String(data.location).toLowerCase() !== stableLocation) {
      data.location = stableLocation;
      changed = true;
    }
    if (hydrateConsentBucket(stableLocation, data)) {
      changed = true;
    }

    if (changed) {
      try {
        window.localStorage.setItem('_wap_user_consent_data', JSON.stringify(data));
      } catch (e) {
        // Ignore storage failures and continue with bootstrap.
      }
    }
  }

  logConsentSnapshot('before-stabilize');
  stabilizeConsentLocation();
  logConsentSnapshot('after-stabilize');

  if (consentDebugEnabled) {
    document.addEventListener('consent.onetrust', function () {
      logConsentSnapshot('event:consent.onetrust');
    });
    document.addEventListener('wapEvent', function (evt) {
      if (evt && evt.detail === 'consent:ready') {
        logConsentSnapshot('event:consent:ready');
      }
    });
    setTimeout(function () {
      logConsentSnapshot('post-bootstrap-5s');
    }, 5000);
  }

  // 2) Google Analytics (gtag.js).
  // GA initializer; execution is deferred until analytics consent is granted.
  function initGa() {
    loadScript('https://www.googletagmanager.com/gtag/js?id=G-0TZHPQ70GD', { async: true });
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = window.gtag || gtag;
    gtag('js', new Date());
    gtag('config', 'G-0TZHPQ70GD');
  }

  window.wap_tms.categoriesQueue['analytics'].push(function () {
    loadScript('https://www.intel.com/content/dam/www/global/wap/performance-config.js');
    initGa();
  });

  loadScript('https://www.intel.com/content/dam/www/global/wap/main/wap-microsite.js', {
    async: true
  });

  // WAP consumes and executes analytics callbacks after user consent.

  function initKapa() {
    if (document.querySelector('script[src="https://widget.kapa.ai/kapa-widget.bundle.js"]')) { return; }
    var kapa = document.createElement('script');
    kapa.async = true;
    kapa.src = 'https://widget.kapa.ai/kapa-widget.bundle.js';
    kapa.setAttribute('data-website-id', '2f50f7bd-1e1f-4181-a931-602a22b19e91');
    kapa.setAttribute('data-project-name', 'Open Edge Platform Documentation');
    kapa.setAttribute('data-project-color', '#0068b5');
    kapa.setAttribute('data-project-logo', 'https://docs.openedgeplatform.intel.com/dev/_static/logo.svg');
    document.head.appendChild(kapa);
  }

  window.wap_tms.categoriesQueue['functional'].push(initKapa);

  // 3) Intel IGHF header/footer integration (delayed until dynamic footer includes complete).
  function initIghf() {
    if (!document.getElementById('footer-custom-content')) { return; }
    if (document.getElementById('oep-consent-chat-fallback')) {
      loadScript(new URL('kapa-consent-fallback.v1.js', bootstrapSrc ||
        'https://developer.robotics.intel.com/common-includes/head-bootstrap.v1.js').href, { async: true });
    }
    if (window.__oepIghfLoaded) { return; }
    window.__oepIghfLoaded = true;

    window.INTELNAV = window.INTELNAV || {};
    window.INTELNAV.renderSettings = window.INTELNAV.renderSettings || {
      version: '2.0 - 03/12/2017 08:00:00',
      textDirection: 'ltr',
      culture: 'en_US',
      OutputId: 'default'
    };
    window.INTELNAV.renderSettingsFooter = window.INTELNAV.renderSettingsFooter || {
      version: '2.0 - 03/12/2017 08:00:00',
      OutputId: 'gf_default'
    };
    loadScript('https://www.intel.com/ighf/50recode.2/js/headerchooser.js', { async: true });
  }

  // Preferred path: wait until include-html.js announces include completion.
  document.addEventListener('oep:includes-loaded', initIghf, { once: true });

  // If includes already finished before this script bound the event.
  if (window.__oepIncludesLoaded === true) {
    initIghf();
  }

  // Safety fallback: still load IGHF after 4s so footer is not permanently missing.
  setTimeout(initIghf, 4000);

}());
