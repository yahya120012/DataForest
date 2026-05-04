document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('page-loading');
  const globalLoader = document.getElementById('global-loader');
  const globalLoaderFill = document.getElementById('global-loader-fill');
  const globalLoaderText = document.getElementById('global-loader-text');

  // 1. NAVBAR SCROLL EFFECT
  const navbar = document.getElementById('navbar');
  const scrollHint = document.getElementById('scroll-hint');
  let rafPending = false;

  function onScroll() {
    if (!rafPending) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 20) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        if (scrollHint) {
          if (window.scrollY > 10) {
            scrollHint.classList.add('is-hidden');
          } else {
            scrollHint.classList.remove('is-hidden');
          }
        }
        rafPending = false;
      });
      rafPending = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (scrollHint) {
    scrollHint.addEventListener('click', () => {
      const nextSection = document.getElementById('heritage');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

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
  const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;
  const useStaticMobileHero = isMobileViewport();
  const FRAME_STRIDE = useStaticMobileHero ? 1 : 1;
  const TARGET_FRAME_COUNT = useStaticMobileHero ? 0 : Math.ceil(TOTAL_FRAMES / FRAME_STRIDE);
  let lockedMobileViewport = null;
  const measureViewport = () => {
    const vv = window.visualViewport;
    return {
      vw: Math.round((vv && vv.width) ? vv.width : window.innerWidth),
      vh: Math.round((vv && vv.height) ? vv.height : window.innerHeight),
    };
  };
  const refreshLockedMobileViewport = () => {
    if (isMobileViewport()) {
      lockedMobileViewport = measureViewport();
    } else {
      lockedMobileViewport = null;
    }
  };
  const getViewportSize = () => {
    if (isMobileViewport() && lockedMobileViewport) {
      return lockedMobileViewport;
    }
    return measureViewport();
  };

  let images = [];
  let loadedCount = 0;
  let isLoaded = false;
  let currentFrameIndex = 0;
  const frameReady = new Array(TOTAL_FRAMES).fill(false);
  let staticLoadedCount = 0;
  const staticImages = Array.from(document.querySelectorAll('img')).filter((img) => !img.closest('#global-loader') && img.src && img.src.trim() !== '');
  const staticImageTarget = staticImages.length -= 1;
  const totalAssetTarget = TARGET_FRAME_COUNT;
  let resolveFramesLoaded;
  let resolveStaticLoaded;
  const framesLoadedPromise = new Promise((resolve) => { resolveFramesLoaded = resolve; });
  const staticLoadedPromise = new Promise((resolve) => { resolveStaticLoaded = resolve; });

  const updateGlobalLoader = () => {
    if (!globalLoaderFill || !globalLoaderText) return;
    const loadedAssets = loadedCount;
    const percent = totalAssetTarget > 0 ? Math.floor((loadedAssets / totalAssetTarget) * 100) : 100;
    globalLoaderFill.style.width = `${percent}%`;
    globalLoaderText.textContent = `${loadedAssets} / ${totalAssetTarget} yukleniyor...`;
  };

  const onStaticImageLoadDone = () => {
    staticLoadedCount++;
    updateGlobalLoader();
    if (staticLoadedCount === staticImageTarget) {
      resolveStaticLoaded();
    }
  };

  if (staticImageTarget === 0) {
    resolveStaticLoaded();
  } else {
    staticImages.forEach((img) => {
      if (img.complete) {
        onStaticImageLoadDone();
        return;
      }
      img.addEventListener('load', onStaticImageLoadDone, { once: true });
      img.addEventListener('error', onStaticImageLoadDone, { once: true });
    });
  }
  updateGlobalLoader();
  refreshLockedMobileViewport();
  let lastViewport = getViewportSize();
  let resizeTimer = null;

  function getFrameSrc(i) {
    const safe = Math.min(Math.max(1, Math.floor(i)), TOTAL_FRAMES);
    const num = String(safe).padStart(3, '0');
    // Using correct path
    return `./images/kolonya/ezgif-frame-${num}.Webp`;
  }

  // Preload images
  if (TARGET_FRAME_COUNT > 0) {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const frameIndex = i - 1;
      if (frameIndex % FRAME_STRIDE !== 0) {
        images.push(null);
        continue;
      }
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = () => onImageLoad(frameIndex, true);
      img.onerror = () => onImageLoad(frameIndex, false); // Continue even if error
      images.push(img);
    }
  } else {
    resolveFramesLoaded();
  }

  function onImageLoad(frameIndex, ok) {
    loadedCount++;
    frameReady[frameIndex] = ok;
    const percent = Math.floor((loadedCount / TARGET_FRAME_COUNT) * 100);
    loaderFill.style.width = `${percent}%`;
    loaderText.innerText = `${loadedCount} / ${TARGET_FRAME_COUNT} Yükleniyor...`;
    updateGlobalLoader();
    if (loadedCount === TARGET_FRAME_COUNT) {
      loaderText.innerText = 'Hazır';
      resolveFramesLoaded();
    }
  }

  function getNearestReadyFrameIndex(targetIndex) {
    if (frameReady[targetIndex]) return targetIndex;
    for (let d = 1; d < TOTAL_FRAMES; d++) {
      const left = targetIndex - d;
      const right = targetIndex + d;
      if (left >= 0 && frameReady[left]) return left;
      if (right < TOTAL_FRAMES && frameReady[right]) return right;
    }
    return 0;
  }

  Promise.all([framesLoadedPromise]).then(() => {
    isLoaded = true;
    currentFrameIndex = 0;
    if (!useStaticMobileHero) {
      renderFrame(currentFrameIndex);
      updateOverlays();
    }
    if (loaderContainer) {
      loaderContainer.style.opacity = 0;
      loaderContainer.style.display = 'none';
    }
    if (globalLoader) {
      globalLoader.classList.add('hidden');
    }
    document.body.classList.remove('page-loading');
  });

  function renderFrame(index) {
    if (!isLoaded || !ctx) return;

    const safeIndex = getNearestReadyFrameIndex(index);
    const img = images[safeIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const maxDpr = isMobileViewport() ? 1.6 : 3;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);


    const { vw, vh } = getViewportSize();


    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';

    const targetW = Math.floor(vw * dpr);
    const targetH = Math.floor(vh * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) {
      ctx.imageSmoothingQuality = 'high';
    }
    ctx.clearRect(0, 0, vw, vh);

    // "cover" fit
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = vw / vh;
    let drawWidth, drawHeight, drawX, drawY;

    if (imgRatio > canvasRatio) {
      drawHeight = vh;
      drawWidth = vh * imgRatio;
      drawX = (vw - drawWidth) / 2;
      drawY = 0;
    } else {
      drawWidth = vw;
      drawHeight = vw / imgRatio;
      drawX = 0;
      drawY = (vh - drawHeight) / 2;
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  }

  window.addEventListener('resize', () => {
    if (useStaticMobileHero) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasMobile = isMobileViewport();
      const nextViewport = getViewportSize();
      const widthDiff = Math.abs(nextViewport.vw - lastViewport.vw);
      const heightDiff = Math.abs(nextViewport.vh - lastViewport.vh);
      const rawViewport = measureViewport();

      // Update lock on meaningful layout changes (rotate, split-screen, zoom-level jumps).
      if (!wasMobile || widthDiff >= 2 || heightDiff >= 120) {
        refreshLockedMobileViewport();
      }
      lastViewport = getViewportSize();

      // Ignore tiny mobile viewport changes caused by browser bars.
      const rawWidthDiff = Math.abs(rawViewport.vw - nextViewport.vw);
      const rawHeightDiff = Math.abs(rawViewport.vh - nextViewport.vh);
      if (wasMobile && rawWidthDiff < 2 && rawHeightDiff < 120) {
        return;
      }

      if (isLoaded) renderFrame(currentFrameIndex);
    }, 120);
  });

  window.addEventListener('orientationchange', () => {
    if (useStaticMobileHero) return;
    setTimeout(() => {
      refreshLockedMobileViewport();
      lastViewport = getViewportSize();
      if (isLoaded) renderFrame(currentFrameIndex);
    }, 250);
  });

  // Calculate scroll index mapped to canvas
  const sequenceWrapper = document.querySelector('.hero-sequence-wrapper');

  function getScrollProgress() {
    const wrapRect = sequenceWrapper.getBoundingClientRect();
    // Wrap height is 500vh. When wrapRect.top is 0, progress = 0
    // When wrapRect.bottom = window.innerHeight, progress = 1
    const { vh } = getViewportSize();
    const totalScrollRange = wrapRect.height - vh;
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
        if (useStaticMobileHero) {
          scrollRaf = false;
          return;
        }
        let progress = getScrollProgress();

        let frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(progress * (TOTAL_FRAMES - 1)))
        );
        frameIndex = Math.floor(frameIndex / FRAME_STRIDE) * FRAME_STRIDE;

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

  // 5. TUİK DASHBOARD (4 grafik + tıklanabilir Türkiye haritası)
  (async () => {
    if (!window.echarts) {
      ['tuik-chart-0-status', 'tuik-chart-1-status', 'tuik-chart-2-status', 'tuik-chart-3-status', 'tuik-map-status']
        .forEach(id => {
          const el = document.getElementById(id);
          if (el) el.textContent = 'ECharts yüklenemedi. İnternet bağlantısını kontrol edin.';
        });
      return;
    }

    const apiConfigs = [
      {
        chartId: 'tuik-chart-0',
        statusId: 'tuik-chart-0-status',
        title: 'Emisyon Değişim Oranı',
        fallbackFile: './data/tuik/ALL-0.md'
      },
      {
        chartId: 'tuik-chart-1',
        statusId: 'tuik-chart-1-status',
        title: 'Sera Gazı Emisyonları',
        fallbackFile: './data/tuik/ALL-1.md'
      },
      {
        chartId: 'tuik-chart-2',
        statusId: 'tuik-chart-2-status',
        title: 'İçme-Kullanma Tesisleri',
        fallbackFile: './data/tuik/ALL-2.md'
      },
      {
        chartId: 'tuik-chart-3',
        statusId: 'tuik-chart-3-status',
        title: 'Belediye Su Göstergeleri',
        fallbackFile: './data/tuik/ALL-3.md'
      }
    ];

    const mapCfg = {
      chartId: 'tuik-map',
      statusId: 'tuik-map-status',
      title: 'Türkiye Haritası (Atık Hizmet)',
      fallbackFile: './data/tuik/ALL-4.md'
    };

    // Elle (hardcoded) veri: API/parse boşver.
    const hardcodedSeriesByChartId = {
      'tuik-chart-0': {
        unitMeasure: null,
        times: ["1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
        values: [289.9761921139999, 332.954254509, 682.848274068, 64.80326468800003, 568.3517600089996, 1258.9008410679996, 1641.885704219999, 1435.1627355590003, 1365.8844328300006, 2061.6191984019993, 1071.0891392439994, 1565.7032180979995, 2675.4203414070016, 2883.759362463998, 3907.248724423999, 4696.823256352003, 5798.389411478997, 5383.5438601219985, 5667.996655933997, 6533.940696560004, 8050.586992368006, 8397.522227863996, 7925.736148625996, 8772.440073882999, 8153.051545638999, 9249.492677842, 9626.276452589003, 9680.725732811996, 9614.670588475, 10735.627550279001, 13042.769822873002, 13362.729692904995, 12848.235051354999, 14472.635004344002]
      },
      'tuik-chart-1': {
        unitMeasure: null,
        times: ["1990", "1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
        values: [1506910.0804042134, 1559077.3519578287, 1608864.8736534563, 1664873.559231692, 1625041.7246832903, 1734456.4499051739, 1884937.3721447873, 1976178.0489742756, 1982376.063618472, 1959093.5591968352, 2129099.1976315086, 1989027.5961482604, 2035672.8141010662, 2174464.024981008, 2239961.517264852, 2406590.6523939855, 2555520.002140488, 2812740.5878407885, 2777927.776374536, 2826172.190709475, 2831748.3106474825, 3042796.4294466474, 3178821.3553966777, 3106667.899557669, 3249226.96082514, 3401529.6604319895, 3570380.9640671546, 3767722.466949115, 3737327.908406538, 3620213.276142032, 3706835.858775384, 4023198.3187507954, 3926956.0349428356, 3897811.03485072, 4101471.9042972918]
      },
      'tuik-chart-2': {
        unitMeasure: 'PN',
        times: ["2020", "2022", "2024"],
        values: [12482781.872000001, 13705121.125999996, 14339578.62]
      },
      'tuik-chart-3': {
        unitMeasure: 'BM3',
        times: ["1994", "1995", "1996", "1997", "1998", "2001", "2002", "2003", "2004", "2006", "2008", "2010", "2012", "2014", "2016", "2018", "2020", "2022", "2024"],
        values: [153646178.0, 155247103.0, 156596105.0, 163435826.0, 166807324.0, 194273178.0, 196865984.0, 201058290.0, 208732245.0, 227985632.0, 232678250.0, 250557422.0, 267399427.894, 291295351.88100004, 306480365.56071633, 319954534.0247998, 327151855.0636893, 337173740.4540329, 339715055.41267174]
      }
    };

    const hardcodedMapSeries = {
      unitMeasure: 'PN',
      times: ["2020", "2022", "2024"],
      values: [375159406.5055232, 379187511.1109411, 384903933.37150544]
    };

    const fmt = (num) => {
      if (!Number.isFinite(num)) return '-';
      const abs = Math.abs(num);
      const toTr = (x) => x.toFixed(2).replace('.', ',');
      if (abs >= 1000000000) return toTr(num / 1000000000) + ' milyar';
      if (abs >= 1000000) return toTr(num / 1000000) + ' milyon';
      if (abs >= 1000) return toTr(num / 1000) + ' bin';
      return num.toLocaleString('tr-TR', { maximumFractionDigits: 3 });
    };

    const extractXml = (text) => {
      const start = text.indexOf('<?xml');
      if (start !== -1) return text.slice(start);
      return text;
    };

    const fetchTextWithTimeout = async (url, timeoutMs) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      try {
        const r = await fetch(url, { method: 'GET', signal: ctrl.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.text();
      } finally {
        clearTimeout(t);
      }
    };

    const loadCachedTuikXml = async (fallbackFile) => {
      // Bu projede API bazen tarayıcıda takılabildiği için öncelik her zaman cache'dir.
      // Cache çalışmıyorsa (HTTP server yoksa) aşağıdaki error mesajı gösterilir.
      return await fetchTextWithTimeout(fallbackFile, 4500);
    };

    const parseTuikAggregatedTimeSeries = (xmlText) => {
      const xml = extractXml(xmlText);
      const doc = new DOMParser().parseFromString(xml, 'application/xml');

      // Browser XML parse errors show up as <parsererror>.
      const parserErr = doc.getElementsByTagName('parsererror');
      if (parserErr && parserErr.length) throw new Error('XML parse error');

      const nodes = Array.from(doc.getElementsByTagName('*'));

      let unitMeasure = null;
      for (const n of nodes) {
        if (n.localName !== 'Value') continue;
        if (n.getAttribute('id') === 'UNIT_MEASURE') {
          unitMeasure = n.getAttribute('value');
          break;
        }
      }

      // Aggregate all series for the same TIME_PERIOD.
      const totals = new Map(); // time -> sum(value)
      for (const n of nodes) {
        if (n.localName !== 'Obs') continue;

        let time = null;
        let value = null;

        const children = Array.from(n.children || []);
        for (const c of children) {
          if (c.localName === 'ObsDimension' && c.getAttribute('id') === 'TIME_PERIOD') {
            time = c.getAttribute('value');
          }
          if (c.localName === 'ObsValue') {
            value = c.getAttribute('value');
          }
        }

        if (!time) continue;
        const num = Number(value);
        if (!Number.isFinite(num)) continue;

        totals.set(time, (totals.get(time) || 0) + num);
      }

      const times = Array.from(totals.keys()).sort((a, b) => Number(a) - Number(b));
      const values = times.map(t => totals.get(t));

      return { times, values, unitMeasure };
    };

    const chartGrid = () => ({
      left: isMobileViewport() ? 56 : 64,
      right: isMobileViewport() ? 18 : 22,
      top: 18,
      bottom: 36,
      containLabel: true
    });

    const makeLineOption = (times, values, title, unit) => ({
      backgroundColor: 'transparent',
      grid: chartGrid(),
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderColor: 'rgba(111,187,213,0.25)',
        textStyle: { color: 'rgba(244,250,246,0.95)', fontSize: 13 },
        formatter: (params) => {
          const p = params && params[0];
          if (!p) return '';
          return `${p.axisValueLabel}<br/>${fmt(p.data)} ${unit || ''}`;
        }
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: 'rgba(111,187,213,0.25)' } },
        axisLabel: { color: 'rgba(244,250,246,0.55)', fontSize: 12 },
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: 'rgba(244,250,246,0.55)', fontSize: 12, formatter: (v) => fmt(Number(v)) },
        splitLine: { lineStyle: { color: 'rgba(111,187,213,0.12)' } }
      },
      series: [
        {
          name: title,
          type: 'line',
          data: values,
          smooth: true,
          showSymbol: false,
          lineStyle: { width: 3, color: '#6fbbd5' },
          itemStyle: { color: '#6fbbd5' }
        }
      ]
    });

    const makeBarOption = (times, values, title, unit) => ({
      backgroundColor: 'transparent',
      grid: chartGrid(),
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderColor: 'rgba(111,187,213,0.25)',
        textStyle: { color: 'rgba(244,250,246,0.95)', fontSize: 13 },
        formatter: (params) => {
          const p = params && params[0];
          if (!p) return '';
          return `${p.axisValueLabel}<br/>${fmt(p.data)} ${unit || ''}`;
        }
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: 'rgba(111,187,213,0.25)' } },
        axisLabel: { color: 'rgba(244,250,246,0.55)', fontSize: 10 },
        axisTick: { alignWithLabel: true },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: 'rgba(244,250,246,0.55)', fontSize: 12, formatter: (v) => fmt(Number(v)) },
        splitLine: { lineStyle: { color: 'rgba(111,187,213,0.12)' } }
      },
      series: [
        {
          name: title,
          type: 'bar',
          data: values,
          barMaxWidth: 22,
          itemStyle: { color: '#6fbbd5' }
        }
      ]
    });

    const makeScatterOption = (times, values, title, unit) => ({
      backgroundColor: 'transparent',
      grid: chartGrid(),
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderColor: 'rgba(111,187,213,0.25)',
        textStyle: { color: 'rgba(244,250,246,0.95)', fontSize: 13 },
        formatter: (p) => `${p.data && p.data.x}<br/>${fmt(p.data && p.data.y)} ${unit || ''}`
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: 'rgba(111,187,213,0.25)' } },
        axisLabel: { color: 'rgba(244,250,246,0.55)', fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: 'rgba(244,250,246,0.55)', fontSize: 12, formatter: (v) => fmt(Number(v)) },
        splitLine: { lineStyle: { color: 'rgba(111,187,213,0.12)' } }
      },
      series: [
        {
          name: title,
          type: 'scatter',
          symbolSize: 10,
          itemStyle: { color: '#6fbbd5' },
          data: values.map((v, i) => ({ value: [times[i], v], x: times[i], y: v }))
        }
      ]
    });

    const makePieOption = (times, values, title, unit) => {
      const sliceCount = 5;
      const start = Math.max(0, times.length - sliceCount);
      const pieTimes = times.slice(start);
      const pieValues = values.slice(start);
      const data = pieTimes.map((t, i) => ({ name: t, value: pieValues[i] }));

      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0,0,0,0.75)',
          borderColor: 'rgba(111,187,213,0.25)',
          textStyle: { color: 'rgba(244,250,246,0.95)', fontSize: 13 },
          formatter: (p) => `${p.name}<br/>${fmt(p.value)} ${unit || ''}`
        },
        legend: {
          bottom: 6,
          textStyle: { color: 'rgba(244,250,246,0.65)', fontSize: 10 }
        },
        series: [
          {
            name: title,
            type: 'pie',
            radius: ['45%', '72%'],
            center: ['50%', '52%'],
            avoidLabelOverlap: true,
            itemStyle: { borderColor: 'rgba(111,187,213,0.25)', borderWidth: 1 },
            label: { color: 'rgba(244,250,246,0.75)', fontSize: 12 },
            data
          }
        ]
      };
    };

    const makeDottedLineOption = (times, values, title, unit) => ({
      backgroundColor: 'transparent',
      grid: chartGrid(),
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.75)',
        borderColor: 'rgba(111,187,213,0.25)',
        textStyle: { color: 'rgba(244,250,246,0.95)', fontSize: 13 },
        formatter: (params) => {
          const p = params && params[0];
          if (!p) return '';
          return `${p.axisValueLabel}<br/>${fmt(p.data)} ${unit || ''}`;
        }
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { lineStyle: { color: 'rgba(111,187,213,0.25)' } },
        axisLabel: { color: 'rgba(244,250,246,0.55)', fontSize: 10 },
        boundaryGap: false
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: 'rgba(244,250,246,0.55)', fontSize: 12, formatter: (v) => fmt(Number(v)) },
        splitLine: { lineStyle: { color: 'rgba(111,187,213,0.12)' } }
      },
      series: [
        {
          name: title,
          type: 'line',
          data: values,
          smooth: false,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 9,
          lineStyle: { width: 2, type: 'dashed', color: '#6fbbd5' },
          itemStyle: { color: '#88cbe0' }
        }
      ]
    });

    const getChartShape = (chartId) => {
      if (chartId === 'tuik-chart-0') return 'bar';
      if (chartId === 'tuik-chart-1') return 'pie';
      if (chartId === 'tuik-chart-2') return 'atae';
      if (chartId === 'tuik-chart-3') return 'dotline';
      return 'line';
    };

    const makeChartOption = (chartId, times, values, title, unit) => {
      const shape = getChartShape(chartId);
      if (shape === 'bar') return makeBarOption(times, values, title, unit);
      if (shape === 'pie') return makePieOption(times, values, title, unit);
      if (shape === 'area') return makeScatterOption(times, values, title, unit);
      if (shape === 'dotline') return makeDottedLineOption(times, values, title, unit);
      return makeLineOption(times, values, title, unit);
    };

    const makeTurkeyMapOption = (value, unit) => {
      const map =
        window.echarts.getMap && (window.echarts.getMap('turkey') || window.echarts.getMap('Turkey'));
      const features =
        map && map.geoJson && Array.isArray(map.geoJson.features) ? map.geoJson.features : [];

      const pickRegionName = (props) => {
        if (!props) return null;
        const keys = [
          'name',
          'NAME',
          'Name',
          'NM_1',
          'NM_2',
          'NAME_1',
          'NAME_TR',
          'name_tr',
          'name_en',
          'il_adi',
          'province'
        ];
        for (const k of keys) {
          if (props[k]) return props[k];
        }
        return null;
      };

      const regionData = features
        .map((f, idx) => {
          const props = f && f.properties ? f.properties : {};
          const n =
            pickRegionName(props) ||
            props && (props.name || props.NAME || props.name_tr || props.il_adi || props.province) ||
            (f && f.id ? String(f.id) : null) ||
            String(idx);
          return { name: n, value };
        })
        .filter(d => d && d.name);

      // İsimler eşleşmezse bile harita alanları çizilsin diye veri setini yine de dolu tutuyoruz.
      const safeRegionData = regionData.length ? regionData : [{ name: 'Turkey', value }];

      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(0,0,0,0.75)',
          borderColor: 'rgba(111,187,213,0.25)',
          textStyle: { color: 'rgba(244,250,246,0.95)' },
          formatter: (p) => `${p.name}<br/>${fmt(p.value)} ${unit || ''}`
        },
        series: [
          {
            name: 'Türkiye',
            type: 'map',
            map: 'turkey',
            roam: false,
            label: { show: false },
            emphasis: {
              label: { show: true, color: 'rgba(244,250,246,0.85)', fontSize: 9 },
              itemStyle: {
                areaColor: '#88cbe0'
              }
            },
            data: safeRegionData,
            itemStyle: {
              borderColor: 'rgba(111,187,213,0.65)',
              borderWidth: 1,
              areaColor: '#2a7fa8'
            },
          }
        ]
      };
    };

    const chartInstances = [];
    const resizeAll = () => chartInstances.forEach(c => c && c.resize && c.resize());
    let chartResizeTimer = null;
    let lastChartViewport = getViewportSize();
    window.addEventListener('resize', () => {
      clearTimeout(chartResizeTimer);
      chartResizeTimer = setTimeout(() => {
        const nextViewport = getViewportSize();
        const widthDiff = Math.abs(nextViewport.vw - lastChartViewport.vw);
        const heightDiff = Math.abs(nextViewport.vh - lastChartViewport.vh);
        lastChartViewport = nextViewport;

        if (isMobileViewport() && widthDiff < 2 && heightDiff < 120) {
          return;
        }
        resizeAll();
      }, 120);
    });

    const setStatus = (statusId, text, hideAfter = true) => {
      const el = document.getElementById(statusId);
      if (!el) return;
      el.textContent = text;
      if (hideAfter) setTimeout(() => { el.style.display = 'none'; }, 300);
    };

    const renderLine = (domId, times, values, title, unit) => {
      const dom = document.getElementById(domId);
      if (!dom) return;
      const chart = window.echarts.init(dom, null, { renderer: 'canvas' });
      chart.setOption(makeLineOption(times, values, title, unit), true);
      chartInstances.push(chart);
      return chart;
    };

    const renderChart = (domId, chartId, times, values, title, unit) => {
      const dom = document.getElementById(domId);
      if (!dom) return;
      const chart = window.echarts.init(dom, null, { renderer: 'canvas' });
      chart.setOption(makeChartOption(chartId, times, values, title, unit), true);
      chartInstances.push(chart);
      return chart;
    };

    const renderMap = (domId, value, unit) => {
      const dom = document.getElementById(domId);
      if (!dom) return;
      const chart = window.echarts.init(dom, null, { renderer: 'canvas' });
      chart.setOption(makeTurkeyMapOption(value, unit), true);
      chartInstances.push(chart);
      return chart;
    };

    // Modal handlers
    const chartModal = document.getElementById('chart-modal');
    const chartModalClose = document.getElementById('chart-modal-close');
    const chartModalMap = document.getElementById('chart-modal-map');
    const chartModalLine = document.getElementById('chart-modal-line');
    const chartModalInfo = document.getElementById('chart-modal-info');

    let modalMapChart = null;
    let modalLineChart = null;
    let mapSeries = null;
    const lineSeriesByChartId = {};

    const openMapModal = (regionName = 'Türkiye') => {
      if (!chartModal) return;
      if (!mapSeries) {
        if (chartModalInfo) chartModalInfo.textContent = 'Harita verisi yüklenemedi. Lütfen sayfayı bir HTTP server ile açın ve tarayıcı konsolunu kontrol edin.';
        chartModal.classList.add('active');
        return;
      }
      chartModal.classList.add('active');

      const latestIdx = mapSeries.times.length - 1;
      const latestYear = mapSeries.times[latestIdx];
      const latestValue = mapSeries.values[latestIdx];

      const unit = mapSeries.unitMeasure || '';
      chartModalInfo.innerHTML = `
  <div style="font-family: var(--font-cormorant); font-size: 1.5rem; font-weight: 700; color: rgba(111,187,213,1); margin-bottom: .5rem;">
    ${mapCfg.title}
  </div>
  <div>Seçili bölge: <b>${regionName}</b></div>
  <div>Son dönem: <b>${latestYear}</b></div>
  <div>Değer: <b>${formatNumber(latestValue)}</b> ${unit}</div>
  <div style="margin-top:.5rem; color: rgba(244,250,246,0.6); font-size: .9rem;">
    Not: Bu prototipte tüm seriler aynı TIME_PERIOD’te toplanarak tek bir trend oluşturuldu.
  </div>
`;

      const mapDomId = chartModalMap && chartModalMap.id ? chartModalMap.id : 'chart-modal-map';
      if (!modalMapChart) {
        modalMapChart = renderMap(mapDomId, latestValue, unit);
      } else {
        modalMapChart.setOption(makeTurkeyMapOption(latestValue, unit), true);
      }

      if (chartModalMap) chartModalMap.style.display = '';

      if (!modalLineChart) {
        modalLineChart = renderLine(
          chartModalLine && chartModalLine.id ? chartModalLine.id : 'chart-modal-line',
          mapSeries.times,
          mapSeries.values,
          mapCfg.title,
          mapSeries.unitMeasure
        );
      } else {
        modalLineChart.setOption(makeLineOption(mapSeries.times, mapSeries.values, mapCfg.title, mapSeries.unitMeasure), true);
      }

      // DOM yerleşimi için kısa gecikme.
      setTimeout(() => {
        resizeAll();
        if (modalMapChart && modalMapChart.resize) modalMapChart.resize();
        if (modalLineChart && modalLineChart.resize) modalLineChart.resize();
      }, 50);
    };

    const openLineModal = (chartId) => {
      if (!chartModal) return;
      const parsed = lineSeriesByChartId[chartId];
      if (!parsed) {
        if (chartModalInfo) chartModalInfo.textContent = 'Veri hazır değil.';
        chartModal.classList.add('active');
        return;
      }

      const cfg = apiConfigs.find(x => x.chartId === chartId) || null;
      const title = (cfg && cfg.title) ? cfg.title : chartId;

      const unit = parsed.unitMeasure || '';
      const times = parsed.times;
      const values = parsed.values;
      const latestIdx = times.length - 1;
      const prevIdx = times.length - 2;
      const latestYear = times[latestIdx];
      const latestValue = values[latestIdx];
      const prevValue = values[prevIdx];

      let changeStr = '-';
      if (Number.isFinite(prevValue) && prevValue !== 0 && Number.isFinite(latestValue)) {
        const pct = ((latestValue - prevValue) / prevValue) * 100;
        changeStr = `${fmt(pct)}%`;
      }

      let minYear = times[0];
      let maxYear = times[0];
      let minVal = values[0];
      let maxVal = values[0];
      for (let i = 0; i < times.length; i++) {
        const v = values[i];
        if (!Number.isFinite(v)) continue;
        if (v < minVal) { minVal = v; minYear = times[i]; }
        if (v > maxVal) { maxVal = v; maxYear = times[i]; }
      }

      chartModal.classList.add('active');
      if (chartModalMap) chartModalMap.style.display = 'none';

      chartModalInfo.innerHTML = `
        <div style="font-family: var(--font-cormorant); font-size: 1.5rem; font-weight: 700; color: rgba(111,187,213,1); margin-bottom: .5rem;">
          ${title}
        </div>
        <div>Son dönem: <b>${latestYear}</b></div>
        <div>Değer: <b>${fmt(latestValue)}</b> ${unit}</div>
        <div>Önceki yıla göre değişim: <b>${changeStr}</b></div>
        <div style="margin-top:.5rem; color: rgba(244,250,246,0.6); font-size: .9rem;">
          Aralık: <b>${minYear}</b> (${fmt(minVal)} ${unit}) → <b>${maxYear}</b> (${fmt(maxVal)} ${unit})
        </div>
      `;

      const lineDomId = chartModalLine && chartModalLine.id ? chartModalLine.id : 'chart-modal-line';
      if (!modalLineChart) {
        modalLineChart = renderChart(lineDomId, chartId, times, values, title, unit);
      } else {
        modalLineChart.setOption(makeChartOption(chartId, times, values, title, unit), true);
      }

      setTimeout(() => {
        resizeAll();
        if (modalLineChart && modalLineChart.resize) modalLineChart.resize();
      }, 50);
    };

    if (chartModalClose) {
      chartModalClose.addEventListener('click', () => chartModal && chartModal.classList.remove('active'));
    }
    if (chartModal) {
      chartModal.addEventListener('click', (e) => {
        if (e.target === chartModal) chartModal.classList.remove('active');
      });
    }

    const tuikMapCard = document.getElementById('tuik-map-card');
    if (tuikMapCard) {
      tuikMapCard.addEventListener('click', () => openMapModal('Türkiye'));
    }

    // Her kartın sağ üstündeki "Büyüt" butonları (tıklanabilirliği görünür yapar).
    document.querySelectorAll('[data-tuik-expand]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expandType = btn.getAttribute('data-tuik-expand');
        const chartId = btn.getAttribute('data-chart-id');
        if (expandType === 'line' && chartId) openLineModal(chartId);
        if (expandType === 'map') openMapModal(btn.getAttribute('data-region') || 'Türkiye');
      });
    });

    // Load + render (hardcoded)
    try {
      apiConfigs.forEach((cfg) => {
        const parsed = hardcodedSeriesByChartId[cfg.chartId];
        if (!parsed) {
          setStatus(cfg.statusId, 'Veri yok', true);
          return;
        }

        lineSeriesByChartId[cfg.chartId] = parsed;
        renderChart(cfg.chartId, cfg.chartId, parsed.times, parsed.values, cfg.title, parsed.unitMeasure);
        setStatus(cfg.statusId, 'Hazır', true);

        // Tıklayınca modalda büyüt
        const dom = document.getElementById(cfg.chartId);
        if (dom) dom.addEventListener('click', () => openLineModal(cfg.chartId));
      });

      mapSeries = hardcodedMapSeries;
      const latestIdx = mapSeries.times.length - 1;
      const latestYear = mapSeries.times[latestIdx];
      const latestValue = mapSeries.values[latestIdx];

      // Map register'ı var mı kontrol et (turkey.js CDN yüklenmediyse getMap null döner).
      const mapRegistered =
        window.echarts.getMap && (window.echarts.getMap('turkey') || window.echarts.getMap('Turkey'));
      if (!mapRegistered) {
        setStatus(mapCfg.statusId, 'Türkiye haritası yüklenemedi (turkey.js).', false);
        return;
      }

      const mainMapChart = renderMap(mapCfg.chartId, latestValue, mapSeries.unitMeasure);
      if (mainMapChart && mainMapChart.on) {
        mainMapChart.on('click', (params) => {
          const name = params && params.name ? params.name : 'Türkiye';
          openMapModal(name);
        });
      }

      setStatus(mapCfg.statusId, `Hazır (${latestYear})`, true);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setStatus(mapCfg.statusId, 'Veri işleme hatası', false);
    }
  })();

});
