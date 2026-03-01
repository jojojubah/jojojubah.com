// Y3JlYXRlZCBieSBKb2pvSnViYWggMjAyNQ==
document.addEventListener('DOMContentLoaded', function() {
    const learnLiquidButton = document.querySelector('.learn-liquid-card .project-btn');
    const learnLiquidToast = document.getElementById('learnLiquidToast');
    const revealEmailBtn = document.getElementById('revealEmail');
    const emailHidden = document.getElementById('emailHidden');
    const emailVisible = document.getElementById('emailVisible');
    const siteNav = document.querySelector('.site-nav');
    const navMenuToggle = document.getElementById('navMenuToggle');
    const siteMenu = document.getElementById('siteMenu');
    const siteMenuOverlay = document.getElementById('siteMenuOverlay');
    const briefingRails = document.querySelectorAll('.briefings-rail');
    const briefingsNavButtons = document.querySelectorAll('.briefings-nav-btn');
    const briefingCards = document.querySelectorAll('.briefing-card');
    const briefingModal = document.getElementById('briefingModal');
    const briefingModalFrameWrap = document.getElementById('briefingModalFrameWrap');
    const briefingModalFrame = document.getElementById('briefingModalFrame');
    const briefingModalTitle = document.getElementById('briefingModalTitle');
    const briefingModalOriginalLink = document.getElementById('briefingModalOriginalLink');
    const briefingModalCloseButtons = document.querySelectorAll('[data-briefing-close]');
    const railAnimationFrames = new WeakMap();
    const themeToggle = document.getElementById('themeToggle');
    const sectionIds = ['home', 'about', 'skills', 'youtube', 'projects', 'contact'];
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
            if (event.key === 'Escape' && briefingModal && briefingModal.classList.contains('is-open')) {
                closeBriefingModal();
                return;
            }
            if (event.key !== 'Escape') return;
            if (!siteNav.classList.contains('menu-open')) return;
            closeNavMenu({ returnFocus: true });
        });
    }

    function buildBriefingEmbedUrl(videoId) {
        return 'https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    }

    function closeBriefingModal() {
        if (!briefingModal || !briefingModalFrame || !briefingModalFrameWrap) return;
        briefingModal.classList.remove('is-open');
        briefingModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('briefing-modal-open');
        briefingModalFrame.src = '';
        briefingModalFrameWrap.classList.remove('is-short');
    }

    function openBriefingModal(card) {
        if (!briefingModal || !briefingModalFrame || !briefingModalFrameWrap || !briefingModalTitle || !briefingModalOriginalLink) return;
        const videoId = card.getAttribute('data-video-id');
        const videoType = card.getAttribute('data-video-type');
        const videoTitle = card.getAttribute('data-video-title') || 'YouTube Video';
        const videoUrl = card.getAttribute('data-video-url') || '#';
        if (!videoId) return;

        briefingModalFrameWrap.classList.toggle('is-short', videoType === 'short');
        briefingModalTitle.textContent = videoTitle;
        briefingModalOriginalLink.setAttribute('href', videoUrl);
        briefingModalFrame.src = buildBriefingEmbedUrl(videoId);
        briefingModal.classList.add('is-open');
        briefingModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('briefing-modal-open');
    }

    function getRailStep(rail) {
        const railStyles = window.getComputedStyle(rail);
        const gap = parseFloat(railStyles.columnGap || railStyles.gap || '0');
        return (rail.clientWidth || 1) + gap;
    }

    function getRailIndex(rail) {
        const cards = rail.querySelectorAll('.briefing-card');
        if (!cards.length) return 0;
        const step = getRailStep(rail);
        if (!step) return 0;
        const rawIndex = Math.round(rail.scrollLeft / step);
        return Math.max(0, Math.min(cards.length - 1, rawIndex));
    }

    function updateRailUi(rail) {
        const railId = rail.id;
        if (!railId) return;
        const cards = rail.querySelectorAll('.briefing-card');
        if (!cards.length) return;

        const maxIndex = cards.length - 1;
        const index = getRailIndex(rail);
        const progress = document.querySelector('[data-rail-progress="' + railId + '"]');

        if (progress) {
            progress.textContent = String(index + 1) + ' / ' + String(cards.length);
        }

        document
            .querySelectorAll('.briefings-nav-btn[data-rail-target="' + railId + '"][data-briefings-dir="prev"]')
            .forEach(function(button) {
                button.disabled = index <= 0;
            });

        document
            .querySelectorAll('.briefings-nav-btn[data-rail-target="' + railId + '"][data-briefings-dir="next"]')
            .forEach(function(button) {
                button.disabled = index >= maxIndex;
            });
    }

    function scrollRail(rail, direction) {
        const cards = rail.querySelectorAll('.briefing-card');
        if (!cards.length) return;
        const currentIndex = getRailIndex(rail);
        const targetIndex = Math.max(0, Math.min(cards.length - 1, currentIndex + (direction === 'prev' ? -1 : 1)));
        const step = getRailStep(rail);
        const targetLeft = step * targetIndex;
        const previousFrame = railAnimationFrames.get(rail);
        if (previousFrame) {
            cancelAnimationFrame(previousFrame);
        }

        const startLeft = rail.scrollLeft;
        const distance = targetLeft - startLeft;
        const duration = 430;
        let startTime = 0;

        function easeInOutCubic(progress) {
            return progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        }

        function stepFrame(now) {
            if (!startTime) startTime = now;
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            rail.scrollLeft = startLeft + (distance * easeInOutCubic(progress));
            updateRailUi(rail);

            if (progress < 1) {
                railAnimationFrames.set(rail, requestAnimationFrame(stepFrame));
                return;
            }

            railAnimationFrames.delete(rail);
            rail.scrollLeft = targetLeft;
            updateRailUi(rail);
        }

        railAnimationFrames.set(rail, requestAnimationFrame(stepFrame));
    }

    if (briefingsNavButtons.length) {
        briefingsNavButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const railId = button.getAttribute('data-rail-target');
                const rail = railId ? document.getElementById(railId) : null;
                const direction = button.getAttribute('data-briefings-dir');
                if (!rail) return;
                scrollRail(rail, direction);
            });
        });
    }

    if (briefingRails.length) {
        briefingRails.forEach(function(rail) {
            let rafId;
            rail.addEventListener('scroll', function() {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(function() {
                    updateRailUi(rail);
                });
            });
            updateRailUi(rail);
        });

        window.addEventListener('resize', function() {
            briefingRails.forEach(function(rail) {
                updateRailUi(rail);
            });
        });
    }

    if (briefingCards.length) {
        briefingCards.forEach(function(card) {
            card.addEventListener('click', function() {
                openBriefingModal(card);
            });
        });
    }

    if (briefingModal && briefingModalCloseButtons.length) {
        briefingModalCloseButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                closeBriefingModal();
            });
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

    const revealCardSelector = '.profile-card, .code-window, .info-card, .skill-category, .briefings-shell, .project-card, .title-card, .text-card';
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
