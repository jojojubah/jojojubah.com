// Y3JlYXRlZCBieSBKb2pvSnViYWggMjAyNQ==
document.addEventListener('DOMContentLoaded', function() {
    const learnLiquidButton = document.querySelector('.learn-liquid-card .store-badge-links a');
    const learnLiquidToast = document.getElementById('learnLiquidToast');
    const revealEmailBtn = document.getElementById('revealEmail');
    const emailHidden = document.getElementById('emailHidden');
    const emailVisible = document.getElementById('emailVisible');
    const siteNav = document.querySelector('.site-nav');
    const navMenuToggle = document.getElementById('navMenuToggle');
    const siteMenu = document.getElementById('siteMenu');
    const siteMenuOverlay = document.getElementById('siteMenuOverlay');
    const themeToggle = document.getElementById('themeToggle');
    const sectionIds = ['home', 'about', 'projects', 'skills', 'contact'];
    const sections = sectionIds
        .map(function(id) { return document.getElementById(id); })
        .filter(Boolean);
    const visibleSections = new Map();
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let activeSectionId = document.body.getAttribute('data-active-section') || 'home';
    let learnLiquidToastTimeout;

    const savedDarkMode = localStorage.getItem('darkMode');
    const useDarkMode = savedDarkMode === 'true';

    if (useDarkMode) {
        document.body.classList.add('dark-mode');
    }

    function closeNavMenu(options) {
        const shouldReturnFocus = Boolean(options && options.returnFocus);
        if (!siteNav || !navMenuToggle || !siteMenu || !siteMenuOverlay) return;
        siteNav.classList.remove('menu-open');
        document.body.classList.remove('site-menu-open');
        navMenuToggle.setAttribute('aria-expanded', 'false');
        navMenuToggle.setAttribute('aria-label', 'Open navigation menu');
        siteMenu.setAttribute('aria-hidden', 'true');
        siteMenuOverlay.setAttribute('aria-hidden', 'true');
        if (shouldReturnFocus) {
            navMenuToggle.focus();
        }
    }

    function openNavMenu() {
        if (!siteNav || !navMenuToggle || !siteMenu || !siteMenuOverlay) return;
        siteNav.classList.add('menu-open');
        document.body.classList.add('site-menu-open');
        navMenuToggle.setAttribute('aria-expanded', 'true');
        navMenuToggle.setAttribute('aria-label', 'Close navigation menu');
        siteMenu.setAttribute('aria-hidden', 'false');
        siteMenuOverlay.setAttribute('aria-hidden', 'false');
    }

    if (siteNav && navMenuToggle && siteMenu && siteMenuOverlay) {
        siteMenu.setAttribute('aria-hidden', 'true');

        navMenuToggle.addEventListener('click', function() {
            if (siteNav.classList.contains('menu-open')) {
                closeNavMenu({ returnFocus: true });
            } else {
                openNavMenu();
            }
        });

        siteMenuOverlay.addEventListener('click', function() {
            closeNavMenu({ returnFocus: true });
        });

        document.addEventListener('keydown', function(event) {
            if (event.key !== 'Escape') return;
            if (!siteNav.classList.contains('menu-open')) return;
            closeNavMenu({ returnFocus: true });
        });
    }

    function updateThemeToggleState() {
        if (!themeToggle) return;
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggle.setAttribute('aria-checked', String(isDarkMode));
        themeToggle.setAttribute('aria-label', isDarkMode ? 'Switch to light mode' : 'Switch to dark mode');
        themeToggle.setAttribute('title', isDarkMode ? 'Light mode' : 'Dark mode');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDarkMode = document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', String(isDarkMode));
            updateThemeToggleState();
        });
    }

    updateThemeToggleState();

    function setActiveBackgroundSection(sectionId) {
        if (!sectionId || sectionId === activeSectionId) return;
        activeSectionId = sectionId;
        document.body.setAttribute('data-active-section', sectionId);
    }

    function pickMostVisibleSection() {
        let strongestId = '';
        let strongestRatio = 0;
        const currentRatio = visibleSections.get(activeSectionId) || 0;

        visibleSections.forEach(function(ratio, sectionId) {
            if (ratio > strongestRatio) {
                strongestRatio = ratio;
                strongestId = sectionId;
            }
        });

        if (!strongestId && sections.length) {
            strongestId = sections[0].id;
        }

        if (!strongestId) return;

        if (strongestId === activeSectionId) {
            return;
        }

        const minSwitchGain = 0.14;
        if (strongestRatio >= currentRatio + minSwitchGain || currentRatio < 0.2) {
            setActiveBackgroundSection(strongestId);
        }
    }

    if (sections.length && !reducedMotionQuery.matches) {
        const sectionObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    visibleSections.set(entry.target.id, entry.intersectionRatio);
                } else {
                    visibleSections.delete(entry.target.id);
                }
            });

            pickMostVisibleSection();
        }, {
            root: null,
            rootMargin: '-18% 0px -45% 0px',
            threshold: [0.1, 0.25, 0.4, 0.55, 0.7]
        });

        sections.forEach(function(section) {
            sectionObserver.observe(section);
        });
    } else {
        setActiveBackgroundSection('home');
    }

    const revealCardSelector = '.profile-card, .code-window, .info-card, .skill-category, .project-card, .title-card, .text-card';
    const revealCards = Array.from(document.querySelectorAll(revealCardSelector));

    if (revealCards.length) {
        revealCards.forEach(function(card) {
            card.classList.add('scroll-fade-card');
        });

        if (reducedMotionQuery.matches) {
            revealCards.forEach(function(card) {
                card.classList.add('is-visible');
            });
        } else {
            const initialViewportTrigger = window.innerHeight * 0.92;
            revealCards.forEach(function(card) {
                if (card.getBoundingClientRect().top <= initialViewportTrigger) {
                    card.classList.add('is-visible');
                }
            });

            requestAnimationFrame(function() {
                document.body.classList.add('js-reveal');
            });

            if ('IntersectionObserver' in window) {
                const revealObserver = new IntersectionObserver(function(entries, observer) {
                    entries.forEach(function(entry) {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    });
                }, {
                    root: null,
                    rootMargin: '0px 0px -10% 0px',
                    threshold: 0.12
                });

                revealCards.forEach(function(card) {
                    if (!card.classList.contains('is-visible')) {
                        revealObserver.observe(card);
                    }
                });
            } else {
                revealCards.forEach(function(card) {
                    card.classList.add('is-visible');
                });
            }
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
            if (siteNav && siteNav.classList.contains('menu-open') && link.closest('.site-nav')) {
                closeNavMenu();
            }
        });
    });

    if (learnLiquidButton && learnLiquidToast) {
        learnLiquidButton.addEventListener('click', function() {
            learnLiquidToast.classList.add('visible');
            learnLiquidToast.setAttribute('aria-hidden', 'false');
            clearTimeout(learnLiquidToastTimeout);
            learnLiquidToastTimeout = setTimeout(function() {
                learnLiquidToast.classList.remove('visible');
                learnLiquidToast.setAttribute('aria-hidden', 'true');
            }, 4000);
        });
    }

    if (revealEmailBtn && emailHidden && emailVisible) {
        revealEmailBtn.addEventListener('click', function() {
            emailHidden.style.display = 'none';
            emailVisible.removeAttribute('hidden');
        });
    }
});
