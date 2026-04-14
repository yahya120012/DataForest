document.addEventListener('DOMContentLoaded', () => {

  // 1. NAVBAR SCROLL EFFECT
  const navbar = document.getElementById('navbar');
  let rafPending = false;

  function onScroll() {
    if (!rafPending) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 20) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        rafPending = false;
      });
      rafPending = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Navigation Logic
  document.getElementById('nav-btn').addEventListener('click', () => {
    document.getElementById('model-results').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('brand-logo').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Buttons Logic
  document.getElementById('btn-run').addEventListener('click', () => {
    window.alert('Tahmin motoru calistirildi. Sonuclar panelde guncellendi.');
  });
  document.getElementById('btn-report').addEventListener('click', () => {
    document.getElementById('footer').scrollIntoView({ behavior: 'smooth' });
  });
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.alert('Teşekkürler. Bültene kaydoldun.');
    });
  }

  // Replicate smooth scorll for inner links manually
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const el = document.querySelector(this.getAttribute('href'));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 2. INTERSECTION OBSERVERS (Reveal Animations)
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  const observerOptions = {
    threshold: 0.2, // trigger when 20% visible
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target); // once true
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));


  // 3. CANVAS HERO SEQUENCE SCROLL
  const TOTAL_FRAMES = 150;
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const loaderContainer = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderText = document.getElementById('loader-text');

  let images = [];
  let loadedCount = 0;
  let isLoaded = false;
  let currentFrameIndex = 0;

  function getFrameSrc(i) {
    const safe = Math.min(Math.max(1, Math.floor(i)), TOTAL_FRAMES);
    const num = String(safe).padStart(3, '0');
    // Using correct path
    return `./images/kolonya/ezgif-frame-${num}.jpg`;
  }

  // Preload images
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFrameSrc(i);
    img.onload = onImageLoad;
    img.onerror = onImageLoad; // Continue even if error
    images.push(img);
  }

  function onImageLoad() {
    loadedCount++;
    const percent = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
    loaderFill.style.width = `${percent}%`;
    loaderText.innerText = `${loadedCount} / ${TOTAL_FRAMES} Yükleniyor...`;

    if (loadedCount === TOTAL_FRAMES) {
      isLoaded = true;
      loaderContainer.style.opacity = 0;
      setTimeout(() => {
        loaderContainer.style.display = 'none';
        renderFrame(0);
        updateOverlays();
      }, 500);
    }
  }

  function renderFrame(index) {
    if (!isLoaded || !ctx) return;

    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(1, Math.floor(rect.width));
    const cssHeight = Math.max(1, Math.floor(rect.height));
    const targetW = Math.floor(cssWidth * dpr);
    const targetH = Math.floor(cssHeight * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) {
      ctx.imageSmoothingQuality = 'high';
    }
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    // "cover" fit
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = cssWidth / cssHeight;
    let drawWidth, drawHeight, drawX, drawY;

    if (imgRatio > canvasRatio) {
      drawHeight = cssHeight;
      drawWidth = cssHeight * imgRatio;
      drawX = (cssWidth - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = cssWidth;
      drawHeight = cssWidth / imgRatio;
      drawX = 0;
      drawY = (cssHeight - drawHeight) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  window.addEventListener('resize', () => {
    if (isLoaded) renderFrame(currentFrameIndex);
  });

  // Calculate scroll index mapped to canvas
  const sequenceWrapper = document.querySelector('.hero-sequence-wrapper');

  function getScrollProgress() {
    const wrapRect = sequenceWrapper.getBoundingClientRect();
    // Wrap height is 500vh. When wrapRect.top is 0, progress = 0
    // When wrapRect.bottom = window.innerHeight, progress = 1
    const totalScrollRange = wrapRect.height - window.innerHeight;
    if (totalScrollRange <= 0) return 0;

    let progress = -wrapRect.top / totalScrollRange;
    return Math.min(Math.max(progress, 0), 1);
  }


  // Hero Text Overlay Logic (from framer-motion useTransform logic)
  // Text 1: progress [0, 0.03, 0.12, 0.15] -> Opacity: [0, 1, 1, 0], Y: [40, 0, 0, -30]
  // Text 2: progress [0.2, 0.24, 0.36, 0.4] -> Opacity: [0, 1, 1, 0] ...
  // Text 3: progress [0.45, 0.49, 0.61, 0.65] -> Opacity ...

  const block1 = document.getElementById('hero-block-1');
  const block2 = document.getElementById('hero-block-2');
  const block3 = document.getElementById('hero-block-3');

  function getTransform(val, mapX, mapY) {
    if (val <= mapX[0]) return mapY[0];
    if (val >= mapX[mapX.length - 1]) return mapY[mapY.length - 1];

    for (let i = 0; i < mapX.length - 1; i++) {
      if (val >= mapX[i] && val <= mapX[i + 1]) {
        const ratio = (val - mapX[i]) / (mapX[i + 1] - mapX[i]);
        return mapY[i] + ratio * (mapY[i + 1] - mapY[i]);
      }
    }
    return mapY[0];
  }

  function updateOverlays() {
    let progress = getScrollProgress();

    // Block 1
    const o1 = getTransform(progress, [0.0, 0.03, 0.12, 0.15], [0, 1, 1, 0]);
    const y1 = getTransform(progress, [0.0, 0.03, 0.12, 0.15], [40, 0, 0, -30]);
    block1.style.opacity = o1;
    block1.style.transform = `translateY(${y1}px)`;

    // Block 2
    const o2 = getTransform(progress, [0.2, 0.24, 0.36, 0.4], [0, 1, 1, 0]);
    const y2 = getTransform(progress, [0.2, 0.24, 0.36, 0.4], [40, 0, 0, -30]);
    block2.style.opacity = o2;
    block2.style.transform = `translateY(${y2}px)`;

    // Block 3
    const o3 = getTransform(progress, [0.45, 0.49, 0.61, 0.65], [0, 1, 1, 0]);
    const y3 = getTransform(progress, [0.45, 0.49, 0.61, 0.65], [40, 0, 0, -30]);
    block3.style.opacity = o3;
    block3.style.transform = `translateY(${y3}px)`;
  }

  // Bind scroll frame update
  let scrollRaf = false;
  window.addEventListener('scroll', () => {
    if (!scrollRaf) {
      window.requestAnimationFrame(() => {
        let progress = getScrollProgress();

        let frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
        );

        if (frameIndex !== currentFrameIndex) {
          currentFrameIndex = frameIndex;
          renderFrame(currentFrameIndex);
        }

        // Update texts synchronously on scroll
        updateOverlays();

        scrollRaf = false;
      });
      scrollRaf = true;
    }
  }, { passive: true });

  // 4. IMAGE MODAL LOGIC
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalClose = document.getElementById('modal-close');

  if (modal) {
    document.querySelectorAll('.showcase-card').forEach(card => {
      card.addEventListener('click', () => {
        const imgEl = card.querySelector('img');
        const titleEl = card.querySelector('.showcase-title');
        const descEl = card.querySelector('.showcase-desc');
        
        if (imgEl && titleEl && descEl) {
          modalImg.src = imgEl.src;
          modalTitle.textContent = titleEl.textContent;
          modalDesc.textContent = descEl.textContent;
          modal.classList.add('active');
        }
      });
    });

    modalClose.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }

});
