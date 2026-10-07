// SPDX-FileCopyrightText: (C) 2025 Intel Corporation
// SPDX-License-Identifier: Apache-2.0
//
// OEP Documentation - Kapa Consent Fallback v1
// Shared fallback logic consumed by multiple published documentation versions.
// Keep this file backward-compatible for the v1 contract.
//
// Script for displaying an index of components included in the OEP documentation.
//Based on a JSON configuration file that is filled in manually.

(function () {
  'use strict';

  // Idempotency guard: prevents duplicate listeners/timers if the script is included twice.
  if (window.__oepKapaConsentFallbackLoaded) { return; }
  window.__oepKapaConsentFallbackLoaded = true;

  var btn = document.getElementById('oep-consent-chat-fallback');
  var tip = document.getElementById('oep-consent-chat-fallback-tip');
  var msg = document.getElementById('oep-consent-chat-fallback-message');
  if (!btn) { return; }

  /**
   * URL flag that requests chat auto-open when consent allows the widget to load.
   * Simple form: ?chat
   */
  function shouldAutoOpenKapaFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      return params.has('chat');
    } catch (e) {
      return false;
    }
  }

  // URL-driven chat auto-open state.
  var autoOpenRequested = shouldAutoOpenKapaFromUrl();
  var autoOpenInProgress = false;
  var autoOpenSucceeded = false;

  function isDebugEnabled() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      return params.get('oepChatDebug') === '1' || window.localStorage.getItem('oepChatDebug') === '1';
    } catch (e) {
      return false;
    }
  }

  var debugEnabled = isDebugEnabled();
  var RELOAD_AFTER_CONSENT_KEY = 'oepReloadAfterFunctionalConsent';

  function debugLog(stage, data) {
    if (!debugEnabled) { return; }
    try {
      console.info('[oep-chat-fallback]', stage, data || {});
    } catch (e) {
      // Never fail runtime due to diagnostics.
    }
  }

  function setReloadAfterConsentFlag(enabled) {
    try {
      if (enabled) {
        window.sessionStorage.setItem(RELOAD_AFTER_CONSENT_KEY, '1');
      } else {
        window.sessionStorage.removeItem(RELOAD_AFTER_CONSENT_KEY);
      }
    } catch (e) {
      // Ignore storage failures and continue without reload persistence.
    }
  }

  function shouldReloadAfterConsent() {
    try {
      return window.sessionStorage.getItem(RELOAD_AFTER_CONSENT_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function reloadPageAfterConsent() {
    if (!shouldReloadAfterConsent()) { return; }
    setReloadAfterConsentFlag(false);
    debugLog('reload:page');
    window.location.reload();
  }

  function tryReloadAfterConsent(reason) {
    if (!shouldReloadAfterConsent()) { return; }
    debugLog('reload:trigger:' + reason);
    reloadPageAfterConsent();
  }

  /** Returns true once initKapa() has fired and added the Kapa script tag. */
  function isKapaInitiated() {
    return document.querySelector('script[src*="kapa-widget.bundle.js"]') !== null;
  }

  function isConsentDialogAvailable() {
    return (window.OneTrust && typeof window.OneTrust.ToggleInfoDisplay === 'function') ||
      (window.Optanon && typeof window.Optanon.ToggleInfoDisplay === 'function') ||
      document.querySelector('#onetrust-pc-btn-handler, .ot-sdk-show-settings, [onclick*="ToggleInfoDisplay"]');
  }

  function showFallback() {
    if (!isConsentDialogAvailable() || isKapaInitiated() || btn.style.display === 'flex') { return; }
    btn.style.display = 'flex';
    debugLog('showFallback', { autoOpenRequested: autoOpenRequested });

    // If a deep link requested chat (?chat), make the consent fallback more prominent.
    if (autoOpenRequested) {
      btn.classList.add('oep-chat-fallback-attention');
      if (tip) { tip.classList.add('oep-chat-fallback-tip-pinned'); }
      if (msg) { msg.classList.add('oep-chat-fallback-message-visible'); }
    }
  }

  function hideFallback() {
    btn.style.display = 'none';
    debugLog('hideFallback');
    btn.classList.remove('oep-chat-fallback-attention');
    if (tip) { tip.classList.remove('oep-chat-fallback-tip-pinned'); }
    if (msg) { msg.classList.remove('oep-chat-fallback-message-visible'); }
  }

  /**
   * Opens Kapa if possible.
   * 1) Prefer official API if exposed by the widget.
   * 2) Fallback to clicking a visible launcher/button in the widget container.
   */
  function tryAutoOpenKapa() {
    if (window.Kapa && typeof window.Kapa.open === 'function') {
      window.Kapa.open();
      debugLog('autoOpen:window.Kapa.open');
      return true;
    }

    var launcher = document.querySelector(
      '#kapa-widget-container button, #kapa-widget-container [role="button"]'
    );
    if (launcher) {
      launcher.click();
      debugLog('autoOpen:launcher.click');
      return true;
    }

    return false;
  }

  function tryActivateFunctionalConsentCategory() {
    var root = document.querySelector('#onetrust-pc-sdk, .ot-pc-content, .ot-sdk-container');
    if (!root) { return false; }

    var candidates = root.querySelectorAll(
      '[role="tab"], .category-menu-switch-handler, .ot-accordion-layout .ot-acc-hdr, button, a'
    );
    for (var i = 0; i < candidates.length; i += 1) {
      var el = candidates[i];
      var label = (el.textContent || '').trim().toLowerCase();
      if (label.indexOf('functional') === -1) { continue; }
      if (typeof el.focus === 'function') { el.focus(); }
      if (typeof el.click === 'function') { el.click(); }
      return true;
    }

    return false;
  }

  /**
   * Open the OneTrust / WAP cookie-preferences modal and attempt to focus
   * the Functional cookies category.
   */
  function openConsentModal() {
    var opened = false;
    if (!isConsentDialogAvailable()) { hideFallback(); return; }

    if (window.OneTrust && typeof window.OneTrust.ToggleInfoDisplay === 'function') {
      window.OneTrust.ToggleInfoDisplay();
      opened = true;
      debugLog('consentOpen:OneTrust.ToggleInfoDisplay');
    } else if (window.Optanon && typeof window.Optanon.ToggleInfoDisplay === 'function') {
      // Older OneTrust / WAP alias
      window.Optanon.ToggleInfoDisplay();
      opened = true;
      debugLog('consentOpen:Optanon.ToggleInfoDisplay');
    } else {
      // DOM fallback: OneTrust injects a settings button that may be visually hidden
      var trigger = document.querySelector(
        '#onetrust-pc-btn-handler, .ot-sdk-show-settings, [onclick*="ToggleInfoDisplay"]'
      );
      if (trigger) {
        trigger.click();
        opened = true;
        debugLog('consentOpen:domTrigger.click');
      }
    }

    if (!opened) {
      debugLog('consentOpen:failed');
      return;
    }

    // Only reload after a successful user-driven consent flow from this fallback.
    setReloadAfterConsentFlag(true);

    if (tryActivateFunctionalConsentCategory()) { return; }

    // OneTrust UI may render asynchronously after open.
    var tries = 0;
    var maxTries = 12;
    var retryMs = 200;
    var timer = setInterval(function () {
      tries += 1;
      if (tryActivateFunctionalConsentCategory() || tries >= maxTries) {
        clearInterval(timer);
      }
    }, retryMs);
  }

  btn.addEventListener('click', openConsentModal);

  /**
   * Polls briefly until Kapa is ready, then opens it once.
   * Safe to call multiple times; it exits immediately after a successful open.
   */
  function scheduleAutoOpenKapa() {
    if (!autoOpenRequested || autoOpenSucceeded || autoOpenInProgress) { return; }

    autoOpenInProgress = true;
    debugLog('autoOpen:schedule:start');
    var elapsed = 0;
    var intervalMs = 250;
    var timeoutMs = 10000;
    var timer = setInterval(function () {
      elapsed += intervalMs;
      if (tryAutoOpenKapa()) {
        autoOpenSucceeded = true;
        autoOpenInProgress = false;
        debugLog('autoOpen:schedule:success');
        clearInterval(timer);
        return;
      }
      if (elapsed >= timeoutMs) {
        autoOpenInProgress = false;
        debugLog('autoOpen:schedule:timeout');
        clearInterval(timer);
      }
    }, intervalMs);
  }

  // Event-driven readiness: hide fallback and trigger auto-open as soon as Kapa appears.
  function attachKapaObserver() {
    if (typeof MutationObserver !== 'function') {
      debugLog('observer:unsupported');
      return;
    }

    var observer = new MutationObserver(function () {
      if (!isKapaInitiated()) { showFallback(); return; }
      hideFallback();
      tryReloadAfterConsent('observer:kapaDetected');
      scheduleAutoOpenKapa();
      debugLog('observer:kapaDetected');
      observer.disconnect();
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });

    // Safety stop so observer does not remain forever if Kapa never loads.
    setTimeout(function () {
      observer.disconnect();
      debugLog('observer:stopped');
    }, 30000);
  }

  // Hide fallback as soon as Kapa loads (consent granted after page load).
  window.wap_tms = window.wap_tms || {};
  window.wap_tms.categoriesQueue = window.wap_tms.categoriesQueue || {};
  window.wap_tms.categoriesQueue['ad targeting'] = window.wap_tms.categoriesQueue['ad targeting'] || [];
  window.wap_tms.categoriesQueue['analytics'] = window.wap_tms.categoriesQueue['analytics'] || [];
  window.wap_tms.categoriesQueue['functional'] = window.wap_tms.categoriesQueue['functional'] || [];
  window.wap_tms.categoriesQueue['functional'].push(function () {
    // This callback runs only when Functional consent is granted.
    setTimeout(function () {
      tryReloadAfterConsent('wapQueue:functional');
      if (shouldReloadAfterConsent()) { return; }

      // initKapa() runs in the same queue batch; give it a tick to append the tag.
      if (isKapaInitiated()) {
        hideFallback();
        scheduleAutoOpenKapa();
        debugLog('wapQueue:functional:kapaReady');
      }
    }, 200);
  });

  // Poll: show fallback if Kapa has not loaded within the initial window;
  // keep polling so the button disappears the moment consent is granted later.
  var INITIAL_DELAY  = 4000;   // ms before first visibility decision
  var POLL_INTERVAL  = 750;    // ms between subsequent checks
  var POLL_TIMEOUT   = 20000;  // ms total polling window
  var elapsed = 0;

  setTimeout(function () {
    if (isKapaInitiated()) { return; }   // already loaded - nothing to do
    showFallback();

    var poll = setInterval(function () {
      elapsed += POLL_INTERVAL;
      if (isKapaInitiated()) {
        hideFallback();
        tryReloadAfterConsent('poll:kapaDetected');
        scheduleAutoOpenKapa();
        debugLog('poll:kapaDetected');
        clearInterval(poll);
        return;
      }
      if (isConsentDialogAvailable()) { showFallback(); } else { hideFallback(); }
      if (elapsed >= POLL_TIMEOUT) {
        debugLog('poll:timeout');
        clearInterval(poll);
      }
    }, POLL_INTERVAL);
  }, INITIAL_DELAY);

  // Additional consent signals from WAP/OneTrust. These are best-effort and
  // ensure reload even if queue timing differs across environments.
  document.addEventListener('consent.onetrust', function () {
    setTimeout(function () {
      showFallback();
      tryReloadAfterConsent('event:consent.onetrust');
    }, 200);
  });

  document.addEventListener('wapEvent', function (evt) {
    if (evt && evt.detail === 'consent:ready') {
      setTimeout(function () {
        showFallback();
        tryReloadAfterConsent('event:wapEvent:consent:ready');
      }, 200);
    }
  });

  attachKapaObserver();

  // Best-effort immediate attempt for pages where Kapa is already available.
  scheduleAutoOpenKapa();
  debugLog('init:done', { autoOpenRequested: autoOpenRequested });
}());
