// Y3JlYXRlZCBieSBKb2pvSnViYWggMjAyNQ==
document.addEventListener('DOMContentLoaded', function() {
    const learnLiquidButton = document.querySelector('.learn-liquid-card .project-btn');
    const learnLiquidToast = document.getElementById('learnLiquidToast');
    const revealEmailBtn = document.getElementById('revealEmail');
    const emailHidden = document.getElementById('emailHidden');
    const emailVisible = document.getElementById('emailVisible');
    let learnLiquidToastTimeout;

    const savedDarkMode = localStorage.getItem('darkMode');
    const useDarkMode = savedDarkMode === 'true' || (
        savedDarkMode === null &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    if (useDarkMode) {
        document.body.classList.add('dark-mode');
    }

    document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            const targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;
            const target = document.querySelector(targetId);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
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
