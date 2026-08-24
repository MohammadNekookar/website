/* ==========================================================================
   NEKOOKAR — interactions
   Theme · Mobile menu · Scroll reveal · Nav highlight · Skill bars ·
   Stats count-up · Certificate modal · Contact form (Web3Forms)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /* ------------------------------------------------------------------
       THEME TOGGLE
    ------------------------------------------------------------------ */
    var themeBtn = document.getElementById('theme-toggle');
    var metaTheme = document.getElementById('meta-theme-color');
    var THEME_COLORS = { 'dark-theme': '#000000', 'light-theme': '#fbfbfd' };

    function applyTheme(theme) {
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(theme);
        try { localStorage.setItem('theme', theme); } catch (e) { /* private mode */ }
        if (metaTheme) metaTheme.setAttribute('content', THEME_COLORS[theme]);
        if (themeBtn) themeBtn.setAttribute('aria-pressed', theme === 'light-theme' ? 'true' : 'false');
        if (window.Bg3D && window.Bg3D.setTheme) window.Bg3D.setTheme(theme === 'light-theme' ? 'light' : 'dark');
    }

    var savedTheme = 'dark-theme';
    try { savedTheme = localStorage.getItem('theme') || savedTheme; } catch (e) { /* ignore */ }

    /* ?theme=light|dark overrides saved preference (handy for testing/sharing) */
    var urlTheme = new URLSearchParams(window.location.search).get('theme');
    if (urlTheme === 'light' || urlTheme === 'dark') savedTheme = urlTheme + '-theme';

    applyTheme(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            var next = document.body.classList.contains('dark-theme') ? 'light-theme' : 'dark-theme';
            applyTheme(next);
        });
    }

    /* ------------------------------------------------------------------
       MOBILE MENU
    ------------------------------------------------------------------ */
    var menuToggle = document.getElementById('mobile-menu-toggle');
    var menuOverlay = document.getElementById('mobile-menu-overlay');

    function openMenu() {
        document.body.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
        menuToggle.setAttribute('aria-expanded', 'true');
        menuOverlay.setAttribute('aria-hidden', 'false');
    }

    function closeMenu() {
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        menuToggle.setAttribute('aria-expanded', 'false');
        menuOverlay.setAttribute('aria-hidden', 'true');
    }

    if (menuToggle && menuOverlay) {
        menuToggle.addEventListener('click', function () {
            document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
        });
        menuOverlay.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', closeMenu);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    /* ------------------------------------------------------------------
       HEADER STATE + SCROLL-LINKED BACKGROUND
    ------------------------------------------------------------------ */
    var header = document.getElementById('main-header');
    var scrollRoot = document.documentElement;
    var scrollTicking = false;

    function onScrollFrame() {
        if (header) header.classList.toggle('scrolled', window.scrollY > 24);
        var max = (scrollRoot.scrollHeight - window.innerHeight) || 1;
        if (window.Bg3D && window.Bg3D.setScroll) {
            window.Bg3D.setScroll(window.scrollY / max);
        }
        scrollTicking = false;
    }

    window.addEventListener('scroll', function () {
        if (!scrollTicking) {
            scrollTicking = true;
            window.requestAnimationFrame(onScrollFrame);
        }
    }, { passive: true });
    onScrollFrame();

    /* ------------------------------------------------------------------
       SCROLL REVEAL (staggered via inline --d delays)
    ------------------------------------------------------------------ */
    var revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { revealObs.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('in'); });
    }

    /* Hero reveals immediately on load for a crisp entrance */
    window.requestAnimationFrame(function () {
        document.querySelectorAll('#hero .reveal').forEach(function (el) {
            el.classList.add('in');
        });
    });

    /* ------------------------------------------------------------------
       ACTIVE NAV LINK HIGHLIGHTING
    ------------------------------------------------------------------ */
    var navLinks = document.querySelectorAll('.nav-link');
    var sections = document.querySelectorAll('main section[id]');

    function setActive(id) {
        navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
    }

    if ('IntersectionObserver' in window && sections.length) {
        var navObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) setActive(entry.target.id);
            });
        }, { rootMargin: '-38% 0px -55% 0px', threshold: 0 });

        sections.forEach(function (s) { navObs.observe(s); });
    }

    /* ------------------------------------------------------------------
       SKILL BARS
    ------------------------------------------------------------------ */
    var skillSection = document.getElementById('skills');

    if (skillSection) {
        if ('IntersectionObserver' in window) {
            var skillObs = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    skillSection.querySelectorAll('.bar-fill').forEach(function (bar) {
                        bar.style.width = bar.getAttribute('data-w');
                    });
                    obs.unobserve(entry.target);
                });
            }, { threshold: 0.25 });
            skillObs.observe(skillSection);
        } else {
            skillSection.querySelectorAll('.bar-fill').forEach(function (bar) {
                bar.style.width = bar.getAttribute('data-w');
            });
        }
    }

    /* ------------------------------------------------------------------
       STATS COUNT-UP
    ------------------------------------------------------------------ */
    var statEls = document.querySelectorAll('.stat dt[data-count]');

    function countUp(el) {
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var prefix = el.getAttribute('data-prefix') || '';
        var suffix = el.getAttribute('data-suffix') || '';
        var duration = 1400;
        var start = null;

        function step(ts) {
            if (!start) start = ts;
            var progress = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = prefix + Math.round(eased * target).toLocaleString('en-US') + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window && statEls.length) {
        var statObs = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    countUp(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        statEls.forEach(function (el) { statObs.observe(el); });
    }

    /* ------------------------------------------------------------------
       CERTIFICATE MODAL (Google Drive embed + fallback)
    ------------------------------------------------------------------ */
    var modal = document.getElementById('cert-modal');
    var modalClose = document.getElementById('modal-close');
    var modalTitle = document.getElementById('modal-title');
    var modalIssuer = document.getElementById('modal-issuer');
    var modalIframe = document.getElementById('modal-iframe');
    var modalDirect = document.getElementById('modal-direct-link');
    var modalFrame = modal ? modal.querySelector('.modal-frame') : null;
    var loadTimer = null;

    function driveEmbedUrl(url) {
        var m = /\/file\/d\/([a-zA-Z0-9_-]+)/.exec(url || '');
        return m ? 'https://drive.google.com/file/d/' + m[1] + '/preview' : url;
    }

    function openModal(card) {
        var titleEl = card.querySelector('.cert-body strong');
        var issuerEl = card.querySelector('.cert-body em');
        var link = card.getAttribute('data-link') || '';

        modalTitle.textContent = titleEl ? titleEl.textContent : '';
        modalIssuer.textContent = issuerEl ? issuerEl.textContent : '';
        modalDirect.href = link;
        modalIframe.src = driveEmbedUrl(link);

        modal.classList.remove('error');
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        /* If the embed never loads (blocked / offline), surface fallback */
        clearTimeout(loadTimer);
        loadTimer = setTimeout(function () {
            if (!modalIframe.contentWindow) return;
            try {
                if (!modalIframe.contentWindow.length && !modalFrame.dataset.loaded) {
                    modal.classList.add('error');
                }
            } catch (e) { /* cross-origin — assume fine */ }
        }, 9000);
    }

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        clearTimeout(loadTimer);
        setTimeout(function () { modalIframe.src = 'about:blank'; }, 350);
    }

    if (modal) {
        document.querySelectorAll('.cert-card:not(.static)').forEach(function (card) {
            card.addEventListener('click', function () { openModal(card); });
        });
        if (modalIframe) {
            modalIframe.addEventListener('load', function () { modalFrame.dataset.loaded = '1'; });
        }
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
        });
    }

    /* ------------------------------------------------------------------
       CONTACT FORM (fetch → Web3Forms, no page redirect)
    ------------------------------------------------------------------ */
    var form = document.getElementById('contact-form');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = form.querySelector('button[type="submit"]');
            var original = btn.innerHTML;

            btn.disabled = true;
            btn.innerHTML = 'Sending…';

            var payload = new FormData(form);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: payload
            })
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    if (data.success) {
                        btn.innerHTML = 'Message Sent ✓';
                        form.reset();
                        setTimeout(function () {
                            btn.innerHTML = original;
                            btn.disabled = false;
                        }, 3200);
                    } else {
                        throw new Error(data.message || 'Send failed');
                    }
                })
                .catch(function () {
                    btn.innerHTML = original;
                    btn.disabled = false;
                    alert('Could not send your message. Please email me directly at moh.nek@aut.ac.ir');
                });
        });
    }
});
