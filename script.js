/**
 * TOW YOU NEED — script.js
 * Handles: navigation, mobile menu, carousel, scroll animations, FAB
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ===================================================
     1. NAV: sticky state on scroll
     =================================================== */
  const nav = document.getElementById('mainNav');

  const handleNavScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load


  /* ===================================================
     2. MOBILE MENU toggle
     =================================================== */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
  });

  // Close menu when a nav link is clicked
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });


  /* ===================================================
     3. CAROUSEL
     =================================================== */
  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    const cards       = Array.from(track.querySelectorAll('.review-card'));
    const totalCards  = cards.length;
    let current       = 0;
    let visibleCount  = getVisibleCount();

    // Build dot buttons
    function buildDots() {
      dotsWrap.innerHTML = '';
      const totalDots = totalCards - visibleCount + 1;
      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to review ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function getVisibleCount() {
      if (window.innerWidth <= 600) return 1;
      if (window.innerWidth <= 900) return 2;
      return 3;
    }

    function goTo(index) {
      const maxIndex = Math.max(0, totalCards - visibleCount);
      current = Math.min(Math.max(index, 0), maxIndex);

      // Calculate the width of one card + gap (1.5rem = 24px)
      const cardEl   = cards[0];
      const style    = getComputedStyle(track);
      const gap      = parseFloat(style.gap) || 24;
      const cardWidth = cardEl.offsetWidth + gap;

      track.style.transform = `translateX(-${current * cardWidth}px)`;

      // Update dots
      const dots = Array.from(dotsWrap.querySelectorAll('.carousel__dot'));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });

      // Update button states
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current >= totalCards - visibleCount;
    }

    function handleResize() {
      const newVisible = getVisibleCount();
      if (newVisible !== visibleCount) {
        visibleCount = newVisible;
        buildDots();
        // Clamp current index to new maximum
        current = Math.min(current, Math.max(0, totalCards - visibleCount));
      }
      goTo(current);
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Keyboard navigation within carousel
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Touch / swipe support
    let touchStartX = 0;
    let touchEndX   = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const delta = touchStartX - touchEndX;
      if (Math.abs(delta) > 40) {
        // Swipe left = next, swipe right = prev
        if (delta > 0) goTo(current + 1);
        else           goTo(current - 1);
      }
    }, { passive: true });

    // Init
    buildDots();
    goTo(0);

    window.addEventListener('resize', handleResize, { passive: true });
  }


  /* ===================================================
     4. SCROLL REVEAL ANIMATIONS
     =================================================== */

  // Add data-reveal attribute to elements we want to animate in
  const revealSelectors = [
    '.trust-bar__item',
    '.section-header',
    '.section-header--left',
    '.service-card',
    '.why-us__left',
    '.why-us__right',
    '.why-point',
    '.contact__info',
    '.contact__visual',
    '.review-card',
    '.call-strip__text',
    '.call-strip__btn',
  ];

  // Apply reveal attribute and stagger delay to service cards
  document.querySelectorAll('.service-card').forEach((card, i) => {
    card.setAttribute('data-reveal', '');
    card.setAttribute('data-reveal-delay', String(i + 1));
  });

  // Apply reveal to other elements
  const otherRevealTargets = [
    '.section-header',
    '.section-header--left',
    '.why-us__left',
    '.why-us__right',
    '.contact__info',
    '.contact__visual',
    '.call-strip__text',
    '.call-strip__btn',
  ];

  otherRevealTargets.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.setAttribute('data-reveal', '');
    });
  });

  // Apply reveal to trust bar items with stagger
  document.querySelectorAll('.trust-bar__item').forEach((item, i) => {
    item.setAttribute('data-reveal', '');
    item.setAttribute('data-reveal-delay', String(i + 1));
  });

  // Apply reveal to why-points
  document.querySelectorAll('.why-point').forEach((pt, i) => {
    pt.setAttribute('data-reveal', '');
    pt.setAttribute('data-reveal-delay', String(i + 1));
  });

  // IntersectionObserver for all [data-reveal] elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));


  /* ===================================================
     5. FLOATING ACTION BUTTON (mobile)
     Shows after scrolling past the hero CTA
     =================================================== */
  const fabCall = document.getElementById('fabCall');

  if (fabCall) {
    const heroActions = document.querySelector('.hero__actions');

    const fabObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Show FAB when hero CTA is not visible
        fabCall.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });

    if (heroActions) {
      fabObserver.observe(heroActions);
    }
  }


  /* ===================================================
     6. FOOTER YEAR
     =================================================== */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ===================================================
     7. SMOOTH SCROLL for anchor links (older browser fallback)
     Modern browsers handle this via CSS scroll-behavior,
     but this ensures offset accounts for the fixed nav.
     =================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      e.preventDefault();

      const navHeight = nav.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

});
