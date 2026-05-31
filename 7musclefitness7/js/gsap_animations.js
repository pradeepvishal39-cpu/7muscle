// ============================================
// LUXURY GSAP ANIMATIONS & SLIDERS
// ============================================

window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP not available');
    return;
  }

  try {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // 1. HERO TEXT REVEAL
    const revealText = document.querySelectorAll('.reveal-text span');
    if (revealText.length > 0) {
      gsap.to(revealText, {
        y: '0%',
        opacity: 1,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.2,
        delay: 0.5
      });
    }

    // 2. PARALLAX BACKGROUNDS
    gsap.utils.toArray('.gs-parallax').forEach(section => {
      const speed = section.dataset.speed || 0.5;
      gsap.to(section, {
        yPercent: 30 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: section.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // 3. STAGGER REVEALS (Bento, Features, Pricing)
    gsap.utils.toArray('.gs-stagger').forEach(container => {
      const items = container.children;
      gsap.fromTo(items, 
        { y: 80, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: 'power4.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
          }
        }
      );
    });

    // 4. GENERAL FADE IN / REVEALS
    gsap.utils.toArray('.gs-reveal').forEach(element => {
      gsap.fromTo(element,
        { y: 60, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
          }
        }
      );
    });

    // 5. NUMBER COUNTERS
    gsap.utils.toArray('[data-target]').forEach((element) => {
      const targetValue = parseInt(element.getAttribute('data-target'), 10);
      ScrollTrigger.create({
        trigger: element,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to({ value: 0 }, {
            value: targetValue,
            duration: 2.5,
            ease: 'power4.out',
            onUpdate: function () {
              element.textContent = Math.floor(this.targets()[0].value) + (element.dataset.target == 500 || element.dataset.target == 90 ? '+' : '');
            },
          });
        }
      });
    });

    // 6. BUTTON & CARD HOVER EFFECTS
    gsap.utils.toArray('.feature-card, .trainer-luxury-card').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        gsap.to(el, { scale: 1.03, y: -4, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { scale: 1, y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      });
    });

    // 7. MAGNETIC BUTTONS (Agency-Level Micro-interaction)
    gsap.utils.toArray('.btn').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.4; // 0.4 determines pull strength
        const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
        
        gsap.to(btn, {
          x: x,
          y: y,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.3)',
          overwrite: 'auto'
        });
      });
    });

    // ============================================
    // REVIEWS CAROUSEL — unified, automated, premium slider
    // ============================================
    function initReviewsSlider() {
      const section = document.getElementById('reviews');
      const container = document.getElementById('reviews-carousel');
      if (!section || !container) return;

      const viewport = container.querySelector('.reviews-carousel__viewport');
      const track = container.querySelector('.reviews-carousel__track');
      const slides = container.querySelectorAll('.reviews-slide');
      const dotsContainer = section.querySelector('.reviews-dots');
      const prevBtn = document.getElementById('reviews-prev');
      const nextBtn = document.getElementById('reviews-next');
      const currentEl = document.getElementById('reviews-current');
      const totalEl = document.getElementById('reviews-total');

      if (!viewport || !track || slides.length === 0) return;

      const totalSlides = slides.length;
      const AUTOPLAY_MS = 5000;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let currentIndex = 0;
      let autoplayTimer = null;

      if (totalEl) totalEl.textContent = String(totalSlides);

      function setTrackPosition(animate) {
        const offset = currentIndex * viewport.offsetWidth;
        if (typeof gsap !== 'undefined' && animate && !prefersReducedMotion) {
          gsap.to(track, {
            x: -offset,
            duration: 0.55,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        } else {
          if (typeof gsap !== 'undefined') gsap.killTweensOf(track);
          track.style.transform = `translate3d(${-offset}px, 0, 0)`;
        }
      }

      function goTo(index) {
        currentIndex = ((index % totalSlides) + totalSlides) % totalSlides;
        setTrackPosition(true);

        if (currentEl) currentEl.textContent = String(currentIndex + 1);

        if (dotsContainer) {
          dotsContainer.querySelectorAll('.reviews-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
            dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
          });
        }
      }

      function next() {
        goTo(currentIndex + 1);
      }

      function prev() {
        goTo(currentIndex - 1);
      }

      // Generate Dot Buttons dynamically
      if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'reviews-dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', `Show review ${i + 1} of ${totalSlides}`);
          dot.setAttribute('aria-current', i === 0 ? 'true' : 'false');
          dot.addEventListener('click', () => {
            goTo(i);
            resetAutoplay();
          });
          dotsContainer.appendChild(dot);
        }
      }

      prevBtn?.addEventListener('click', () => {
        prev();
        resetAutoplay();
      });

      nextBtn?.addEventListener('click', () => {
        next();
        resetAutoplay();
      });

      function stopAutoplay() {
        if (autoplayTimer) {
          clearInterval(autoplayTimer);
          autoplayTimer = null;
        }
      }

      function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(next, AUTOPLAY_MS);
      }

      function resetAutoplay() {
        stopAutoplay();
        startAutoplay();
      }

      // Pause on mouse hover / resume on mouse out
      section.addEventListener('mouseenter', stopAutoplay);
      section.addEventListener('mouseleave', startAutoplay);
      section.addEventListener('focusin', stopAutoplay);
      section.addEventListener('focusout', (e) => {
        if (!section.contains(e.relatedTarget)) startAutoplay();
      });

      // Swipe Gestures for Mobile Viewports
      let startX = 0;
      container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoplay();
      }, { passive: true });

      container.addEventListener('touchend', (e) => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) next();
          else prev();
        }
        resetAutoplay();
      }, { passive: true });

      if (typeof gsap !== 'undefined') {
        gsap.set(track, { x: 0 });
      }

      goTo(0);
      startAutoplay();

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => setTrackPosition(false), 150);
      });
    }

    initReviewsSlider();

    // ============================================
    // BEFORE/AFTER COMPARISON SLIDER LOGIC
    // ============================================
    const comparisonContainers = document.querySelectorAll('.comparison-container');
    comparisonContainers.forEach(container => {
      const beforeImg = container.querySelector('.comparison-before');
      const handle = container.querySelector('.comparison-slider-handle');
      
      let isDragging = false;

      function updateSlider(xPos) {
        const rect = container.getBoundingClientRect();
        let x = xPos - rect.left;
        
        // Boundaries
        x = Math.max(0, Math.min(x, rect.width));
        
        const percentage = (x / rect.width) * 100;
        
        handle.style.left = `${percentage}%`;
        beforeImg.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
      }

      // Mouse events
      container.addEventListener('mousedown', (e) => {
        isDragging = true;
        updateSlider(e.clientX);
      });
      window.addEventListener('mouseup', () => {
        isDragging = false;
      });
      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        updateSlider(e.clientX);
      });

      // Touch events (mobile support)
      container.addEventListener('touchstart', (e) => {
        isDragging = true;
        updateSlider(e.touches[0].clientX);
      }, { passive: true });
      window.addEventListener('touchend', () => {
        isDragging = false;
      });
      window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        updateSlider(e.touches[0].clientX);
      }, { passive: true });
    });

    console.log('✅ Premium GSAP animations initialized');
  } catch (error) {
    console.warn('GSAP animation error:', error.message);
  }
});

// 8. CLIP-PATH REVEALS
gsap.utils.toArray('.clip-reveal').forEach(img => {
  gsap.fromTo(img, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.8, ease: 'power4.out', scrollTrigger: { trigger: img, start: 'top 85%' } });
});
