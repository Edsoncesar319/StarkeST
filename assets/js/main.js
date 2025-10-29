/**
* Template Name: Gp
* Template URL: https://bootstrapmade.com/gp-free-multipurpose-html-bootstrap-template/
* Updated: Aug 15 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  // Hero background tech particles
  function createHeroParticles() {
    const animDiv = document.querySelector('.hero-bg-anim');
    if (!animDiv) return;
    animDiv.innerHTML = '';
    // Quadrados (bits)
    for (let i = 0; i < 10; i++) {
      const sq = document.createElement('span');
      sq.className = 'hero-particle-square';
      sq.style.left = Math.random() * 100 + '%';
      sq.style.top = Math.random() * 100 + '%';
      sq.style.width = sq.style.height = (10 + Math.random() * 14) + 'px';
      sq.style.opacity = 0.18 + Math.random() * 0.22;
      sq.style.animationDelay = (Math.random() * 6) + 's';
      animDiv.appendChild(sq);
    }
    // Linhas (fluxo de dados)
    for (let i = 0; i < 6; i++) {
      const ln = document.createElement('span');
      ln.className = 'hero-particle-line';
      ln.style.left = Math.random() * 100 + '%';
      ln.style.top = Math.random() * 100 + '%';
      ln.style.width = (40 + Math.random() * 60) + 'px';
      ln.style.height = '2px';
      ln.style.opacity = 0.12 + Math.random() * 0.18;
      ln.style.animationDelay = (Math.random() * 8) + 's';
      animDiv.appendChild(ln);
    }
    // SVG Nuvem
    for (let i = 0; i < 2; i++) {
      const cloud = document.createElement('span');
      cloud.className = 'hero-particle-svg';
      cloud.innerHTML = `<svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="24" cy="14" rx="24" ry="14" fill="#fff" fill-opacity="0.08"/></svg>`;
      cloud.style.left = (10 + Math.random() * 80) + '%';
      cloud.style.top = (10 + Math.random() * 60) + '%';
      cloud.style.animationDelay = (Math.random() * 10) + 's';
      animDiv.appendChild(cloud);
    }
    // SVG Banco de Dados
    for (let i = 0; i < 2; i++) {
      const db = document.createElement('span');
      db.className = 'hero-particle-svg';
      db.innerHTML = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="16" cy="8" rx="14" ry="6" fill="#00c6ff" fill-opacity="0.10"/><rect x="2" y="8" width="28" height="16" rx="8" fill="#2563eb" fill-opacity="0.08"/></svg>`;
      db.style.left = (10 + Math.random() * 80) + '%';
      db.style.top = (30 + Math.random() * 40) + '%';
      db.style.animationDelay = (Math.random() * 10) + 's';
      animDiv.appendChild(db);
    }
  }
  window.addEventListener('DOMContentLoaded', createHeroParticles);

})();