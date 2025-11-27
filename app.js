// Y3JlYXRlZCBieSBKb2pvSnViYWggMjAyNQ==
document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-center .nav-item');
    const homeIcon = document.querySelector('.home-icon');
    const menuToggle = document.getElementById('menu-toggle');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    const learnLiquidButton = document.querySelector('.learn-liquid-card .project-btn');
    const learnLiquidToast = document.getElementById('learnLiquidToast');
    let learnLiquidToastTimeout;

    // Footer elements
    const infoToggle = document.getElementById('info-toggle');
    const infoPopup = document.getElementById('info-popup');
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsPopup = document.getElementById('settings-popup');
    const themeToggle = document.getElementById('theme-toggle');
    const jellySwitch = document.getElementById('theme-jelly-switch');

    function scrollToSection(sectionId) {
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }

    function setActiveNavItem(activeItem) {
        navItems.forEach(item => item.classList.remove('active'));
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    function positionDropdown() {
        const r = menuToggle.getBoundingClientRect();
        dropdownMenu.style.position = 'fixed';
        dropdownMenu.style.top = (r.bottom + 30) + 'px';
        dropdownMenu.style.left = (r.right - dropdownMenu.offsetWidth + 10) + 'px';
    }

    function toggleDropdown() {
        dropdownMenu.classList.toggle('show');
    }

    function closeDropdown() {
        dropdownMenu.classList.remove('show');
    }

    function positionInfoPopup() {
        const r = infoToggle.getBoundingClientRect();
        infoPopup.style.position = 'fixed';
        infoPopup.style.bottom = (window.innerHeight - r.top + 25) + 'px';
        infoPopup.style.left = (r.right - 40) + 'px';
    }

    function toggleInfoPopup() {
        infoPopup.classList.toggle('show');
    }

    function closeInfoPopup() {
        infoPopup.classList.remove('show');
    }

    function positionSettingsPopup() {
        const r = settingsToggle.getBoundingClientRect();
        settingsPopup.style.position = 'fixed';
        settingsPopup.style.bottom = (window.innerHeight - r.top + 25) + 'px';
        settingsPopup.style.left = (r.left - settingsPopup.offsetWidth + 40) + 'px';
    }

    function toggleSettingsPopup() {
        settingsPopup.classList.toggle('show');
    }

    function closeSettingsPopup() {
        settingsPopup.classList.remove('show');
    }

    function toggleDarkMode() {
        console.log('toggleDarkMode called');
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        console.log('Dark mode is now:', isDark);
        if (themeToggle) {
            themeToggle.textContent = isDark ? 'Theme: Dark Mode' : 'Theme: Light Mode';
        }

        // Sync jelly switch state
        if (jellySwitch) {
            jellySwitch.checked = isDark;
        }

        // Store preference in localStorage
        localStorage.setItem('darkMode', isDark);
    }

    function showLearnLiquidToast() {
        if (!learnLiquidToast) return;
        learnLiquidToast.classList.add('visible');
        learnLiquidToast.setAttribute('aria-hidden', 'false');
        clearTimeout(learnLiquidToastTimeout);
        learnLiquidToastTimeout = setTimeout(() => {
            learnLiquidToast.classList.remove('visible');
            learnLiquidToast.setAttribute('aria-hidden', 'true');
        }, 4000);
    }

    // Load saved theme preference
    function loadThemePreference() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (themeToggle) {
                themeToggle.textContent = 'Theme: Dark Mode';
            }
        }
        // Set jelly switch initial state
        if (jellySwitch) {
            jellySwitch.checked = isDark;
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            scrollToSection(sectionId);
            setActiveNavItem(this);
        });
    });

    homeIcon.addEventListener('click', function() {
        scrollToSection('home');
        setActiveNavItem(null);
        closeDropdown();
        closeInfoPopup();
        closeSettingsPopup();
    });

    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        positionDropdown();
        toggleDropdown();
    });

    dropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                scrollToSection(sectionId);
                const activeNavItem = document.querySelector(`[data-section="${sectionId}"]`);
                setActiveNavItem(activeNavItem);
            }
            closeDropdown();
        });
    });

    // Footer event listeners
    infoToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        positionInfoPopup();
        toggleInfoPopup();
        closeDropdown(); // Close dropdown if open
        closeSettingsPopup(); // Close settings if open
    });

    settingsToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        positionSettingsPopup();
        toggleSettingsPopup();
        closeDropdown(); // Close dropdown if open
        closeInfoPopup(); // Close info if open
    });

    // Theme toggle event listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDarkMode();
        });
    } else {
        console.error('Theme toggle element not found');
    }

    // Jelly switch event listener
    if (jellySwitch) {
        jellySwitch.addEventListener('toggle', function(e) {
            toggleDarkMode();
        });
    } else {
        console.error('Jelly switch element not found');
    }

    document.addEventListener('click', function() {
        closeDropdown();
        closeInfoPopup();
        closeSettingsPopup();
    });

    window.addEventListener('scroll', function() {
        const sections = ['home', 'about', 'skills', 'projects', 'contact'];
        const scrollPosition = window.scrollY + 200;

        for (let i = sections.length - 1; i >= 0; i--) {
            const section = document.getElementById(sections[i]);
            if (section && scrollPosition >= section.offsetTop) {
                const activeNavItem = document.querySelector(`[data-section="${sections[i]}"]`);
                setActiveNavItem(activeNavItem);
                break;
            }
        }
    });

    if (learnLiquidButton) {
        learnLiquidButton.addEventListener('click', function() {
            showLearnLiquidToast();
        });
    }


    window.addEventListener('resize', function() {
        if (dropdownMenu.classList.contains('show')) {
            positionDropdown();
        }
        if (infoPopup.classList.contains('show')) {
            positionInfoPopup();
        }
        if (settingsPopup.classList.contains('show')) {
            positionSettingsPopup();
        }
    });

    // Load theme preference on page load
    loadThemePreference();

    setActiveNavItem(document.querySelector('[data-section="home"]'));

    // Contact button functionality
    const contactBtn = document.querySelector('.contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', function() {
            scrollToSection('contact');
            const contactNavItem = document.querySelector('[data-section="contact"]');
            setActiveNavItem(contactNavItem);
        });
    }

    // Email reveal functionality
    const revealEmailBtn = document.getElementById('revealEmail');
    const emailHidden = document.getElementById('emailHidden');
    const emailVisible = document.getElementById('emailVisible');

    if (revealEmailBtn && emailHidden && emailVisible) {
        revealEmailBtn.addEventListener('click', function() {
            emailHidden.style.display = 'none';
            emailVisible.removeAttribute('hidden');
        });
    }

    // Basic client-side protection (can be bypassed)
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Disable common keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.keyCode === 123 ||
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
    });

    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });

    // Disable drag
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
});
