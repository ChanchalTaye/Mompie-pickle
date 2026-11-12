document.addEventListener("DOMContentLoaded", () => {
    // 1. Sticky Navbar
    const navbar = document.getElementById("navbar");
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // 2. Mobile Menu Toggle & Overlay
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileNav = document.getElementById("mobile-nav");
    const mobileNavOverlay = document.getElementById("mobile-nav-overlay");
    const closeMenuBtn = document.getElementById("close-menu-btn");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    function openMobileMenu() {
        if (mobileNav) mobileNav.classList.add("active");
        if (mobileNavOverlay) mobileNavOverlay.classList.add("active");
        document.body.classList.add("menu-open");
    }

    function closeMobileMenu() {
        if (mobileNav) mobileNav.classList.remove("active");
        if (mobileNavOverlay) mobileNavOverlay.classList.remove("active");
        document.body.classList.remove("menu-open");
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener("click", openMobileMenu);
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener("click", closeMobileMenu);
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener("click", closeMobileMenu);
    }

    // Close Mobile Menu when clicking a link
    mobileLinks.forEach(link => {
        link.addEventListener("click", () => {
            closeMobileMenu();
        });
    });

    // Close on Escape key
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileNav && mobileNav.classList.contains("active")) {
            closeMobileMenu();
        }
    });

    // 3. Scroll Animations using Intersection Observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once animated to keep it visible
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select elements to animate
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-up');
    
    fadeElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // 4. Hero Background Infinite Track Slider
    const heroTrack = document.getElementById('heroSliderTrack');
    const heroDots = document.querySelectorAll('.hero-dot');
    const heroPrevBtn = document.getElementById('heroPrevBtn');
    const heroNextBtn = document.getElementById('heroNextBtn');
    const heroSection = document.getElementById('home');

    if (heroTrack && heroTrack.children.length > 0) {
        const originalSlides = Array.from(heroTrack.children);
        const originalCount = originalSlides.length;

        // Clone first and last slide for seamless infinite looping
        const firstClone = originalSlides[0].cloneNode(true);
        const lastClone = originalSlides[originalCount - 1].cloneNode(true);

        heroTrack.appendChild(firstClone);
        heroTrack.insertBefore(lastClone, originalSlides[0]);

        let currentIndex = 1; // start on the first real slide
        let isTransitioning = false;
        let autoSlideTimer = null;

        // Position track at first real slide
        heroTrack.style.transition = 'none';
        heroTrack.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

        function updateDots(activeRealIndex) {
            heroDots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === activeRealIndex);
            });
        }

        function moveToSlide(index) {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex = index;

            heroTrack.style.transition = 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            heroTrack.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

            // Determine active dot for UX feedback immediately
            let activeDot;
            if (currentIndex === 0) {
                activeDot = originalCount - 1;
            } else if (currentIndex === originalCount + 1) {
                activeDot = 0;
            } else {
                activeDot = currentIndex - 1;
            }
            updateDots(activeDot);
        }

        heroTrack.addEventListener('transitionend', () => {
            isTransitioning = false;
            // If we reached the cloned first slide at the end, snap back to real first slide
            if (currentIndex === originalCount + 1) {
                heroTrack.style.transition = 'none';
                currentIndex = 1;
                heroTrack.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
            }
            // If we reached the cloned last slide at the start, snap back to real last slide
            else if (currentIndex === 0) {
                heroTrack.style.transition = 'none';
                currentIndex = originalCount;
                heroTrack.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
            }
        });

        function nextHeroSlide() {
            if (isTransitioning) return;
            moveToSlide(currentIndex + 1);
        }

        function prevHeroSlide() {
            if (isTransitioning) return;
            moveToSlide(currentIndex - 1);
        }

        function startAutoSlider() {
            stopAutoSlider();
            autoSlideTimer = setInterval(nextHeroSlide, 5000);
        }

        function stopAutoSlider() {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        }

        if (heroNextBtn) {
            heroNextBtn.addEventListener('click', () => {
                nextHeroSlide();
                startAutoSlider();
            });
        }

        if (heroPrevBtn) {
            heroPrevBtn.addEventListener('click', () => {
                prevHeroSlide();
                startAutoSlider();
            });
        }

        heroDots.forEach((dot) => {
            dot.addEventListener('click', () => {
                if (isTransitioning) return;
                const dotIdx = parseInt(dot.getAttribute('data-index'), 10);
                moveToSlide(dotIdx + 1);
                startAutoSlider();
            });
        });

        // Pause on mouse hover & resume on mouse leave
        if (heroSection) {
            heroSection.addEventListener('mouseenter', stopAutoSlider);
            heroSection.addEventListener('mouseleave', startAutoSlider);

            // Touch swipe support for mobile
            let touchStartX = 0;
            heroSection.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].clientX;
            }, { passive: true });

            heroSection.addEventListener('touchend', (e) => {
                const diff = e.changedTouches[0].clientX - touchStartX;
                if (Math.abs(diff) > 40) {
                    if (diff < 0) {
                        nextHeroSlide();
                    } else {
                        prevHeroSlide();
                    }
                    startAutoSlider();
                }
            }, { passive: true });
        }

        // Keyboard arrow navigation
        window.addEventListener('keydown', (e) => {
            if (window.scrollY < window.innerHeight) {
                if (e.key === 'ArrowRight') {
                    nextHeroSlide();
                    startAutoSlider();
                } else if (e.key === 'ArrowLeft') {
                    prevHeroSlide();
                    startAutoSlider();
                }
            }
        });

        // Start auto-sliding
        startAutoSlider();
    }
});
