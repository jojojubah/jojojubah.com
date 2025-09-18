// Y3JlYXRlZCBieSBKb2pvSnViYWggMjAyNQ==
// Cookie Management System for JojoJubah Portfolio

/* ================= Cookie Consent + Google Analytics ================== */
(function cookieConsent(){
  const MEASUREMENT_ID = 'G-0ZM44HTK32'; // Replace with your GA ID

  function ensureBanner() {
    // Banner is now in HTML, no need to create dynamically
    return document.getElementById('cookieConsentBanner');
  }

  function enableGoogleAnalytics() {
    if (window.GA_LOADED) return;
    window.GA_LOADED = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      cookie_flags: 'secure;samesite=strict'
    });
    console.log('✅ Google Analytics enabled');
  }

  function showConsentBanner() {
    const consent = localStorage.getItem('cookieConsent');
    const banner = document.getElementById('cookieConsentBanner');
    if (!consent && banner) {
      banner.style.display = 'block';
    } else if (consent === 'accepted') {
      enableGoogleAnalytics();
    }
  }

  function hookBannerButtons() {
    const accept = document.getElementById('acceptCookies');
    const decline = document.getElementById('declineCookies');
    const learnMore = document.getElementById('learnMoreBtn');
    const banner = document.getElementById('cookieConsentBanner');

    accept && (accept.onclick = function(){
      localStorage.setItem('cookieConsent','accepted');
      // Also sync with cookie preferences system
      const cookiePreferences = {
        necessary: true,
        analytics: true, // User accepted all cookies
        advertising: false,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
      banner && (banner.style.display = 'none');
      enableGoogleAnalytics();
      console.log('✅ All cookies accepted');
    });

    decline && (decline.onclick = function(){
      localStorage.setItem('cookieConsent','declined');
      // Also sync with cookie preferences system
      const cookiePreferences = {
        necessary: true,
        analytics: false, // User declined cookies
        advertising: false,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
      banner && (banner.style.display = 'none');
      console.log('❌ Analytics declined by user');
    });

    learnMore && (learnMore.onclick = function(e){
      e.preventDefault();
      // Open the cookie preferences modal instead of creating a new modal
      showCookieModal();
    });
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', function() {
    showConsentBanner();
    hookBannerButtons();
  });

  // Also run immediately in case DOM is already loaded
  if (document.readyState === 'loading') {
    // DOM hasn't loaded yet
  } else {
    // DOM is already loaded
    showConsentBanner();
    hookBannerButtons();
  }
})();

/* ================= Cookie Preferences Management ================== */
(function cookiePreferences(){
  // Get current cookie preferences from localStorage
  function getCookiePreferences() {
    const stored = localStorage.getItem('cookiePreferences');
    return stored ? JSON.parse(stored) : {
      necessary: true,  // Always true
      analytics: false, // Default off
      advertising: false // Default off (not implemented)
    };
  }

  // Save cookie preferences to localStorage
  function saveCookiePreferences(preferences) {
    preferences.timestamp = new Date().toISOString();
    localStorage.setItem('cookiePreferences', JSON.stringify(preferences));

    // Handle Google Analytics based on analytics preference
    if (preferences.analytics) {
      enableGoogleAnalytics();
      localStorage.setItem('cookieConsent', 'accepted'); // Sync with old system
    } else {
      localStorage.setItem('cookieConsent', 'declined'); // Sync with old system
      // Disable GA if it was previously enabled
      if (window.gtag) {
        window.gtag('consent', 'update', {
          'analytics_storage': 'denied'
        });
      }
    }
  }

  // Reference to the Google Analytics function from the original code
  function enableGoogleAnalytics() {
    if (window.GA_LOADED) return;
    window.GA_LOADED = true;
    const MEASUREMENT_ID = 'G-0ZM44HTK32'; // Make sure this matches your GA ID
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, {
      anonymize_ip: true,
      cookie_flags: 'secure;samesite=strict'
    });
    console.log('✅ Google Analytics enabled via preferences');
  }

  // Show cookie modal function (global)
  window.showCookieModal = function() {
    const modal = document.getElementById('cookieModal');
    if (!modal) return;

    // Load current preferences into modal
    const preferences = getCookiePreferences();
    const analyticsToggle = document.getElementById('analyticsToggle');
    if (analyticsToggle) {
      analyticsToggle.checked = preferences.analytics;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  function initCookiePreferences() {
    // Apply stored preferences on page load
    const preferences = getCookiePreferences();
    if (preferences.analytics) {
      enableGoogleAnalytics();
    }

    // Set up modal functionality
    const modal = document.getElementById('cookieModal');
    const openBtn = document.getElementById('cookie-preferences');
    const closeBtn = document.getElementById('closeCookieModal');
    const saveBtn = document.getElementById('saveCookiePreferences');
    const analyticsToggle = document.getElementById('analyticsToggle');

    if (!modal || !openBtn || !closeBtn || !saveBtn || !analyticsToggle) {
      console.warn('⚠️ Cookie modal elements not found');
      return;
    }

    // Load current preferences into modal
    analyticsToggle.checked = preferences.analytics;

    // Close modal when clicking outside (now that modal has no backdrop)
    let handleOutsideClick;

    // Open modal - add both click and touchstart for better mobile support
    const openModal = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showCookieModal();

      // Set up outside click handler after modal opens
      setTimeout(() => {
        handleOutsideClick = (e) => {
          if (modal.style.display === 'flex' && !modal.contains(e.target)) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            document.removeEventListener('click', handleOutsideClick);
          }
        };
        document.addEventListener('click', handleOutsideClick);
      }, 10); // Small delay to avoid immediate close
    };

    openBtn.addEventListener('click', openModal);
    openBtn.addEventListener('touchstart', openModal, { passive: false });

    // Close modal
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      if (handleOutsideClick) {
        document.removeEventListener('click', handleOutsideClick);
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (handleOutsideClick) {
          document.removeEventListener('click', handleOutsideClick);
        }
      }
    });

    // Save preferences
    saveBtn.addEventListener('click', () => {
      const newPreferences = {
        necessary: true, // Always true
        analytics: analyticsToggle.checked,
        advertising: false // Not implemented yet
      };

      saveCookiePreferences(newPreferences);
      modal.style.display = 'none';
      document.body.style.overflow = '';
      if (handleOutsideClick) {
        document.removeEventListener('click', handleOutsideClick);
      }

      // Show confirmation (optional)
      console.log('✅ Cookie preferences saved:', newPreferences);

      // Hide the original consent banner if visible
      const banner = document.getElementById('cookieConsentBanner');
      if (banner) {
        banner.style.display = 'none';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initCookiePreferences);
})();

// Global function to test cookie banner (for development)
window.showCookieBanner = function() {
  const banner = document.getElementById('cookieConsentBanner');
  if (banner) {
    banner.style.display = 'block';
  }
};

// Global function to clear cookie settings (for development)
window.clearCookieSettings = function() {
  localStorage.removeItem('cookieConsent');
  localStorage.removeItem('cookiePreferences');
  console.log('🗑️ All cookie settings cleared');
};