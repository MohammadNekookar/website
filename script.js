document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       HEADER SCROLL EFFECT
       ========================================================================== */
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       MOBILE MENU DRAWER
       ========================================================================== */
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileMenuClose = document.getElementById('mobile-menu-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function openMobileMenu() {
        mobileMenuOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Lock body scroll
    }

    function closeMobileMenu() {
        mobileMenuOverlay.classList.remove('open');
        document.body.style.overflow = 'auto'; // Unlock body scroll
    }

    mobileMenuToggle.addEventListener('click', openMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    /* ==========================================================================
       THEME TOGGLE (DARK / LIGHT MODE)
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check for saved theme preference, otherwise default to dark-theme
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    body.className = savedTheme;

    themeToggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light-theme');
        } else {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark-theme');
        }
    });

    /* ==========================================================================
       INTERSECTION OBSERVER FOR ANIMATE-ON-SCROLL
       ========================================================================== */
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const fadeObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, fadeObserverOptions);

    fadeElements.forEach(element => {
        fadeObserver.observe(element);
    });

    /* ==========================================================================
       INTERACTIVE SKILL PROGRESS BARS
       ========================================================================== */
    const skillsSection = document.getElementById('skills');
    const progressBars = document.querySelectorAll('.skill-progress');

    const skillsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                progressBars.forEach(bar => {
                    const targetWidth = bar.getAttribute('data-width');
                    bar.style.width = targetWidth;
                });
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, { threshold: 0.2 });

    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }

    /* ==========================================================================
       CERTIFICATE MODAL VIEWER WITH GOOGLE DRIVE EMBED CONVERSION
       ========================================================================== */
    const certCards = document.querySelectorAll('.cert-card:not(.no-click)');
    const certModal = document.getElementById('cert-modal');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-title');
    const modalIssuer = document.getElementById('modal-issuer');
    const modalIframe = document.getElementById('modal-iframe');
    const modalDirectLink = document.getElementById('modal-direct-link');
    const modalFrameBody = document.querySelector('.modal-body-frame');

    // Function to translate standard google drive link into preview mode for embeds
    function getGoogleEmbedUrl(driveUrl) {
        if (!driveUrl) return '';
        // Extract Google Drive ID
        const match = driveUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
        return driveUrl;
    }

    certCards.forEach(card => {
        card.addEventListener('click', () => {
            const docTitle = card.querySelector('h4').textContent;
            const docIssuer = card.querySelector('.cert-issuer').textContent;
            const driveLink = card.getAttribute('data-link');
            const embedUrl = getGoogleEmbedUrl(driveLink);

            modalTitle.textContent = docTitle;
            modalIssuer.textContent = docIssuer;
            modalDirectLink.href = driveLink;
            modalIframe.src = embedUrl;
            
            // Remove previous error classes
            modalFrameBody.classList.remove('error');

            // Open modal
            certModal.classList.add('open');
            document.body.style.overflow = 'hidden'; // Lock background scroll
        });
    });

    function closeModal() {
        certModal.classList.remove('open');
        modalIframe.src = ''; // Clear iframe contents to save bandwidth
        document.body.style.overflow = 'auto'; // Unlock background scroll
    }

    modalCloseBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside the modal content box
    certModal.addEventListener('click', (e) => {
        if (e.target === certModal) {
            closeModal();
        }
    });

    // Handle escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && certModal.classList.contains('open')) {
            closeModal();
        }
    });

    /* ==========================================================================
       SCROLL ACTIVE NAV LINK HIGHLIGHTING
       ========================================================================== */
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Buffer to trigger navigation updates slightly early
            if (window.scrollY >= (sectionTop - 150)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       HERO LOGO 3D TILT EFFECT
       ========================================================================== */
    const logoCard = document.querySelector('.hero-logo-card');
    const logoWrapper = document.querySelector('.hero-logo-wrapper');
    
    if (logoCard && logoWrapper) {
        logoWrapper.addEventListener('mousemove', (e) => {
            const rect = logoWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Normalize values to a max tilt of 15 degrees
            const tiltX = (y / (rect.height / 2)) * -15;
            const tiltY = (x / (rect.width / 2)) * 15;
            
            logoCard.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`;
            logoCard.style.animation = 'none'; // Temporarily pause floating animation during interaction
        });
        
        logoWrapper.addEventListener('mouseleave', () => {
            logoCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
            logoCard.style.animation = 'floatLogo 6s ease-in-out infinite'; // Resume floating animation
        });
    }

});
