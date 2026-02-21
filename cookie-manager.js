// Y3JlYXRlZCBieSBKb2pvSnViYWggMjAyNQ==
// Cookie consent system aligned to the ChipChop modal flow.
(function cookieConsentManager() {
  const STORAGE_KEY = 'jojojubah_cookie_consent_v2';
  const MEASUREMENT_ID = 'G-0ZM44HTK32';

  const banner = document.getElementById('cookieConsentBanner');
  const panel = document.getElementById('cookiePanel');
  const settingsLinks = document.querySelectorAll('.cookie-settings-link');

  if (!banner || !panel) return;

  const bannerButtons = banner.querySelectorAll('[data-cookie-action]');
  const panelButtons = panel.querySelectorAll('[data-cookie-action]');
  const switches = panel.querySelectorAll('[data-cookie-key]');

  function readConsent() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (err) {
      return null;
    }
  }

  function writeConsent(value) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
      window.gtag('js', new Date());
    }
  }

  function enableGoogleAnalytics() {
    ensureGtag();
    if (!window.GA_LOADED) {
      window.GA_LOADED = true;
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
      document.head.appendChild(script);
      window.gtag('config', MEASUREMENT_ID, {
        anonymize_ip: true,
        cookie_flags: 'secure;samesite=strict'
      });
    }

    window.gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
  }

  function disableGoogleAnalytics() {
    if (!window.gtag) return;
    window.gtag('consent', 'update', {
      analytics_storage: 'denied'
    });
  }

  function applyAnalyticsPreference(consent) {
    if (consent && consent.analytics) {
      enableGoogleAnalytics();
      return;
    }
    disableGoogleAnalytics();
  }

  function setSwitches(preferences) {
    switches.forEach(function(input) {
      input.checked = Boolean(preferences && preferences[input.dataset.cookieKey]);
    });
  }

  function getSwitchValues() {
    const values = {};
    switches.forEach(function(input) {
      values[input.dataset.cookieKey] = input.checked;
    });
    return values;
  }

  function showBanner() {
    banner.classList.add('show');
    document.body.classList.add('cookie-consent-required');
  }

  function hideBanner() {
    banner.classList.remove('show');
    document.body.classList.remove('cookie-consent-required');
  }

  function openPanel() {
    panel.classList.add('show');
  }

  function closePanel() {
    panel.classList.remove('show');
  }

  function saveConsent(preferences, status) {
    const payload = {
      essential: true,
      analytics: Boolean(preferences.analytics),
      preferences: Boolean(preferences.preferences),
      marketing: Boolean(preferences.marketing),
      status: status,
      updatedAt: new Date().toISOString()
    };

    writeConsent(payload);
    hideBanner();
    closePanel();
    applyAnalyticsPreference(payload);
  }

  function acceptAll() {
    saveConsent({ analytics: true, preferences: true, marketing: true }, 'accepted_all');
  }

  function rejectOptional() {
    saveConsent({ analytics: false, preferences: false, marketing: false }, 'rejected_optional');
  }

  function saveFromPanel() {
    saveConsent(getSwitchValues(), 'custom');
  }

  function handleBannerAction(action) {
    if (action === 'accept') acceptAll();
    if (action === 'reject') rejectOptional();
    if (action === 'settings') openPanel();
  }

  function handlePanelAction(action) {
    if (action === 'panel-accept') acceptAll();
    if (action === 'panel-reject') rejectOptional();
    if (action === 'panel-save') saveFromPanel();
    if (action === 'panel-close') closePanel();
  }

  bannerButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      handleBannerAction(button.dataset.cookieAction);
    });
  });

  panelButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      handlePanelAction(button.dataset.cookieAction);
    });
  });

  settingsLinks.forEach(function(link) {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      openPanel();
      if (!readConsent()) showBanner();
    });
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closePanel();
  });

  document.addEventListener('click', function(event) {
    if (!panel.classList.contains('show')) return;
    if (event.target.closest('.cookie-panel')) return;
    if (event.target.closest('.cookie-settings-link')) return;
    if (event.target.closest('.cookie-banner')) return;
    closePanel();
  });

  document.addEventListener('click', function(event) {
    if (!document.body.classList.contains('cookie-consent-required')) return;
    if (event.target.closest('.cookie-banner') || event.target.closest('.cookie-panel')) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener('auxclick', function(event) {
    if (!document.body.classList.contains('cookie-consent-required')) return;
    if (event.target.closest('.cookie-banner') || event.target.closest('.cookie-panel')) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener('submit', function(event) {
    if (!document.body.classList.contains('cookie-consent-required')) return;
    if (event.target.closest('.cookie-banner') || event.target.closest('.cookie-panel')) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  const stored = readConsent();
  if (stored) {
    setSwitches(stored);
    applyAnalyticsPreference(stored);
  } else {
    setSwitches({ analytics: false, preferences: false, marketing: false });
    showBanner();
  }

  window.showCookieModal = openPanel;
  window.clearCookieSettings = function clearCookieSettings() {
    localStorage.removeItem(STORAGE_KEY);
    hideBanner();
    closePanel();
  };
})();
