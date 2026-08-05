(function () {
  const MENU_STYLE_ID = 'player-runtime-menu-style';
  const VIDEO_WATCHDOG_INTERVAL_MS = 8000;
  const VIDEO_STALL_LIMIT_MS = 24000;
  const VIDEO_RECOVERY_DELAY_MS = 800;
  const DEFAULT_IMAGE_DURATION_MS = 7000;
  const DEFAULT_GRADE_INTERVAL_MS = 10000;
  const DEFAULT_GRADE_PATTERN = /^(?:video|imagem|image|midia|media)?\d*\.(mp4|webm|mov|m4v|jpg|jpeg|png|gif|webp)$/i;

  function applyMenuPolish() {
    if (document.getElementById(MENU_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = MENU_STYLE_ID;
    style.textContent = `
      #controls-container,
      #controladora-container {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        left: auto !important;
        z-index: 10000 !important;
        width: clamp(340px, 30vw, 430px) !important;
        max-width: calc(100vw - 18px) !important;
        max-height: 100vh !important;
        overflow: auto !important;
        padding: 18px 16px 22px !important;
        background: rgba(9, 12, 18, 0.96) !important;
        border-top: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        border-left: 1px solid rgba(255, 255, 255, 0.14) !important;
        border-radius: 0 !important;
        box-shadow: -22px 0 60px rgba(0, 0, 0, 0.56) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        box-sizing: border-box !important;
        animation: runtimeMenuSlideIn 180ms ease-out both !important;
      }

      body.player-menu-open {
        overflow: hidden !important;
      }

      body.player-menu-open::before {
        content: "" !important;
        position: fixed !important;
        inset: 0 !important;
        z-index: 9998 !important;
        background: rgba(0, 0, 0, 0.38) !important;
        backdrop-filter: blur(7px) saturate(0.82) !important;
        -webkit-backdrop-filter: blur(7px) saturate(0.82) !important;
        pointer-events: auto !important;
      }

      @keyframes runtimeMenuSlideIn {
        from { opacity: 0; transform: translateX(26px); }
        to { opacity: 1; transform: translateX(0); }
      }

      #controls-container::-webkit-scrollbar,
      #controladora-container::-webkit-scrollbar {
        width: 8px !important;
      }

      #controls-container::-webkit-scrollbar-thumb,
      #controladora-container::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.22) !important;
        border-radius: 8px !important;
      }

      .menu-header {
        margin: 0 0 12px !important;
        text-align: left !important;
      }

      .menu-header h2,
      .runtime-menu-title {
        margin: 0 !important;
        color: #f7f8fb !important;
        font: 700 15px/1.2 'Montserrat', 'Plus Jakarta Sans', Arial, sans-serif !important;
        letter-spacing: 0 !important;
      }

      .runtime-menu-title {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        margin-bottom: 12px !important;
        padding: 2px 2px 12px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12) !important;
      }

      .runtime-menu-title::after {
        content: "M" !important;
        width: 26px !important;
        height: 26px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 8px !important;
        color: #cfe3ff !important;
        background: rgba(59, 130, 246, 0.16) !important;
        border: 1px solid rgba(96, 165, 250, 0.28) !important;
        font: 800 11px/1 'Montserrat', Arial, sans-serif !important;
      }

      .menu-grid {
        display: grid !important;
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        gap: 8px !important;
        list-style: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        background: transparent !important;
      }

      .menu-grid li {
        width: auto !important;
        min-width: 0 !important;
        height: 78px !important;
        display: flex !important;
        align-items: stretch !important;
        justify-content: stretch !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        border-radius: 8px !important;
        background: rgba(255, 255, 255, 0.06) !important;
        overflow: hidden !important;
        cursor: pointer !important;
        transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease !important;
        box-sizing: border-box !important;
      }

      .menu-grid li:hover {
        background: rgba(38, 132, 255, 0.2) !important;
        border-color: rgba(94, 164, 255, 0.78) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 10px 26px rgba(0, 0, 0, 0.32) !important;
      }

      .menu-grid li a,
      .menu-grid li button {
        width: 100% !important;
        height: 100% !important;
        min-width: 0 !important;
        border: 0 !important;
        background: transparent !important;
        color: #f8fafc !important;
        text-decoration: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 7px !important;
        padding: 9px 8px !important;
        box-sizing: border-box !important;
        font: 700 11px/1.18 'Montserrat', 'Plus Jakarta Sans', Arial, sans-serif !important;
        text-align: center !important;
        text-transform: none !important;
        letter-spacing: 0 !important;
        overflow-wrap: anywhere !important;
      }

      .menu-grid li i {
        margin: 0 !important;
        color: #9cc7ff !important;
        font-size: 20px !important;
        line-height: 1 !important;
      }

      .menu-grid li:hover i,
      .menu-grid li a.active i {
        color: #ffffff !important;
      }

      .menu-grid li a.active {
        background: rgba(45, 142, 255, 0.28) !important;
      }

      .menu-grid li.controladora-select {
        height: 78px !important;
        grid-column: span 2 !important;
        padding: 10px !important;
        color: #f8fafc !important;
        gap: 8px !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .menu-grid li.controladora-select label {
        margin: 0 !important;
        font: 700 12px/1.2 'Montserrat', Arial, sans-serif !important;
        color: #dbeafe !important;
      }

      .menu-grid select,
      #player-selector {
        width: 100% !important;
        max-width: 220px !important;
        border: 1px solid rgba(255, 255, 255, 0.16) !important;
        border-radius: 8px !important;
        background: rgba(0, 0, 0, 0.35) !important;
        color: #fff !important;
        padding: 8px 10px !important;
        outline: none !important;
      }

      #preset-livre-modal {
        border-radius: 8px !important;
        background: rgba(12, 14, 20, 0.96) !important;
        border: 1px solid rgba(255, 255, 255, 0.14) !important;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.68) !important;
      }

      #barra.commercial-bar,
      .barra-comercial.commercial-bar {
        min-height: 44px !important;
        padding: 6px 8px !important;
        background: rgba(24, 24, 24, 0.94) !important;
        border: 1px solid rgba(255, 255, 255, 0.16) !important;
        border-radius: 8px !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 10px 24px rgba(0, 0, 0, 0.35) !important;
        color: #ffffff !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 10px !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
        backdrop-filter: blur(10px) !important;
        -webkit-backdrop-filter: blur(10px) !important;
      }

      #barra.commercial-bar #infoAlternada,
      .barra-comercial.commercial-bar .info-alternada {
        min-width: 0 !important;
        flex: 1 1 auto !important;
        display: flex !important;
        align-items: center !important;
        gap: 0 !important;
        overflow: hidden !important;
        white-space: nowrap !important;
      }

      .commercial-info-frame {
        width: 100% !important;
        min-width: 0 !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        overflow: hidden !important;
        white-space: nowrap !important;
        color: #f7f7f7 !important;
        font-family: 'Montserrat', 'Plus Jakarta Sans', Arial, sans-serif !important;
      }

      .commercial-icon-box {
        width: 32px !important;
        height: 32px !important;
        flex: 0 0 32px !important;
        border-radius: 7px !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: linear-gradient(180deg, rgba(92, 92, 92, 0.95), rgba(49, 49, 49, 0.95)) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        color: #ffffff !important;
        font-size: 15px !important;
      }

      .commercial-category {
        flex: 0 0 auto !important;
        min-width: 68px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
        justify-content: center !important;
      }

      .commercial-category-name {
        color: #a8adb6 !important;
        font-size: 10px !important;
        font-weight: 800 !important;
        letter-spacing: 0 !important;
        text-transform: uppercase !important;
      }

      .commercial-category-line {
        width: 36px !important;
        height: 2px !important;
        border-radius: 999px !important;
        background: rgba(255, 255, 255, 0.42) !important;
      }

      .commercial-items {
        min-width: 0 !important;
        flex: 1 1 auto !important;
        display: flex !important;
        align-items: center !important;
        gap: 18px !important;
        overflow: hidden !important;
      }

      .commercial-item {
        flex: 0 1 auto !important;
        min-width: 0 !important;
        display: inline-flex !important;
        align-items: baseline !important;
        gap: 6px !important;
        color: #f7f7f7 !important;
      }

      .commercial-item-label {
        color: #aeb4c0 !important;
        font-size: 10px !important;
        font-weight: 800 !important;
        text-transform: uppercase !important;
      }

      .commercial-item-value {
        color: #ffffff !important;
        font-size: 15px !important;
        font-weight: 800 !important;
        letter-spacing: 0 !important;
      }

      .commercial-trend {
        font-size: 11px !important;
        font-weight: 800 !important;
      }

      .commercial-trend.up { color: #40d776 !important; }
      .commercial-trend.down { color: #48bff4 !important; }
      .commercial-trend.bad { color: #ff4157 !important; }

      .commercial-source {
        flex: 0 0 auto !important;
        color: #c8cbd2 !important;
        font-size: 9px !important;
        line-height: 1.15 !important;
        font-weight: 800 !important;
      }

      .commercial-source span {
        color: #ffffff !important;
        display: block !important;
      }

      .commercial-weather-symbol {
        font-size: 20px !important;
        color: #ffffff !important;
      }

      #barra.commercial-bar .relogio,
      #barra.commercial-bar > div:last-child,
      .barra-comercial.commercial-bar .commercial-brand,
      .barra-comercial.commercial-bar > img,
      .barra-comercial.commercial-bar > span.hora {
        flex: 0 0 auto !important;
      }

      #barra.commercial-bar .relogio,
      #barra.commercial-bar > div:last-child {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        padding-left: 14px !important;
        border-left: 1px solid rgba(255, 255, 255, 0.14) !important;
      }

      #barra.commercial-bar .logo-eletromidia,
      #barra.commercial-bar > div:last-child img,
      .barra-comercial.commercial-bar > img {
        height: 28px !important;
        width: auto !important;
        max-width: 170px !important;
        margin: 0 2px 0 0 !important;
        object-fit: contain !important;
      }

      #barra.commercial-bar #hora,
      .barra-comercial.commercial-bar .hora {
        color: #ffffff !important;
        font-size: 26px !important;
        font-weight: 800 !important;
        line-height: 1 !important;
        letter-spacing: 0 !important;
      }

      .barra-comercial.commercial-bar .hora {
        font-size: 21px !important;
      }

      .barra-comercial.commercial-bar .commercial-info-frame {
        gap: 8px !important;
      }

      .barra-comercial.commercial-bar .commercial-items {
        gap: 10px !important;
      }

      .barra-comercial.commercial-bar .commercial-item-value {
        font-size: 12px !important;
      }

      .barra-comercial.commercial-bar .commercial-source {
        display: none !important;
      }

      @media (max-width: 640px) {
        #controls-container,
        #controladora-container {
          width: min(390px, calc(100vw - 10px)) !important;
          padding: 14px 12px !important;
        }

        .menu-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }

        .menu-grid li {
          height: 76px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function preventHashJump() {
    document.querySelectorAll('#controls-container a[href="#"], #controladora-container a[href="#"]').forEach((link) => {
      if (link.dataset.runtimePrevented === '1') return;
      link.dataset.runtimePrevented = '1';
      link.addEventListener('click', (event) => event.preventDefault());
    });
  }

  function getMenuContainers() {
    return Array.from(document.querySelectorAll('#controls-container, #controladora-container'));
  }

  function isMenuVisible(menu) {
    if (!menu) return false;
    return window.getComputedStyle(menu).display !== 'none';
  }

  function updateMenuState() {
    document.body.classList.toggle('player-menu-open', getMenuContainers().some(isMenuVisible));
  }

  function ensureMenuTitles() {
    getMenuContainers().forEach((menu) => {
      if (menu.querySelector('.menu-header, .runtime-menu-title')) return;

      const title = document.createElement('div');
      title.className = 'runtime-menu-title';
      title.textContent = menu.id === 'controladora-container' ? 'Controladora' : 'Menu do Player';
      menu.insertBefore(title, menu.firstChild);
    });
  }

  function setupMenuState() {
    ensureMenuTitles();
    preventHashJump();
    updateMenuState();

    getMenuContainers().forEach((menu) => {
      if (menu.dataset.runtimeObserved === '1') return;
      menu.dataset.runtimeObserved = '1';

      const observer = new MutationObserver(updateMenuState);
      observer.observe(menu, { attributes: true, attributeFilter: ['style', 'class'] });
    });

    if (document.body.dataset.runtimeMenuKeyboard !== '1') {
      document.body.dataset.runtimeMenuKeyboard = '1';
      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        getMenuContainers().forEach((menu) => {
          if (isMenuVisible(menu)) menu.style.display = 'none';
        });
        updateMenuState();
      });
    }
  }

  function formatClock(date) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function buildCommercialFrame(frame) {
    const items = frame.items.map((item) => {
      const trendClass = item.trendClass || 'up';
      const trend = item.trend ? `<span class="commercial-trend ${trendClass}">${item.trend}</span>` : '';
      return `
        <span class="commercial-item">
          <span class="commercial-item-label">${item.label}</span>
          <span class="commercial-item-value">${item.value}</span>
          ${trend}
        </span>
      `;
    }).join('');

    const source = frame.source ? `<span class="commercial-source">Fonte:<span>${frame.source}</span></span>` : '';

    return `
      <div class="commercial-info-frame">
        <span class="commercial-icon-box"><i class="${frame.icon}"></i></span>
        <span class="commercial-category">
          <span class="commercial-category-name">${frame.category}</span>
          <span class="commercial-category-line"></span>
        </span>
        <span class="commercial-items">${items}</span>
        ${source}
      </div>
    `;
  }

  function getCommercialFrames() {
    return [
      {
        category: 'Agora',
        icon: 'fa fa-thermometer-half',
        source: 'Clima',
        items: [
          { label: '', value: '<i class="fa fa-sun commercial-weather-symbol"></i> 17°' },
          { label: '', value: '29°', trend: '▲', trendClass: 'bad' },
          { label: '', value: '17°', trend: '▼', trendClass: 'down' }
        ]
      },
      {
        category: 'Próximos dias',
        icon: 'fa fa-cloud',
        source: 'Clima',
        items: [
          { label: 'Qui', value: '30° 19°', trend: '▲ ▼', trendClass: 'bad' },
          { label: 'Sex', value: '29° 21°', trend: '▲ ▼', trendClass: 'bad' },
          { label: 'Sab', value: '31° 17°', trend: '▲ ▼', trendClass: 'bad' }
        ]
      },
      {
        category: 'Câmbio',
        icon: 'fa fa-coins',
        source: 'Valor PRO',
        items: [
          { label: 'Euro', value: 'R$ 5,91', trend: '▲ +1,05%', trendClass: 'up' },
          { label: 'Dólar', value: 'R$ 5,13', trend: '▲ +0,87%', trendClass: 'up' }
        ]
      },
      {
        category: 'Criptomoedas',
        icon: 'fa fa-database',
        source: 'Valor PRO',
        items: [
          { label: 'Bitcoin', value: 'R$ 330.074', trend: '▲ +2,09%', trendClass: 'up' }
        ]
      },
      {
        category: 'Índices',
        icon: 'fa fa-chart-line',
        source: 'Money Times',
        items: [
          { label: 'S&P 500', value: '7.766', trend: '▲ +0,25%', trendClass: 'up' },
          { label: 'Dow Jones', value: '54.287', trend: '▲ +0,10%', trendClass: 'up' }
        ]
      }
    ];
  }

  function startCommercialBar(options) {
    const bar = options.bar;
    const info = options.info;
    const clock = options.clock;
    const frameMs = options.frameMs || 5000;
    const frames = options.frames || getCommercialFrames();

    if (!bar || !info) return null;
    if (bar._commercialBarTimer) clearInterval(bar._commercialBarTimer);

    bar.classList.add('commercial-bar');

    let frameIndex = 0;
    let lastFrameAt = 0;

    const render = (forceFrame) => {
      const now = Date.now();
      if (forceFrame || now - lastFrameAt >= frameMs) {
        info.style.opacity = 0;
        const frame = frames[frameIndex];
        setTimeout(() => {
          info.innerHTML = buildCommercialFrame(frame);
          info.style.opacity = 1;
        }, forceFrame ? 0 : 180);
        frameIndex = (frameIndex + 1) % frames.length;
        lastFrameAt = now;
      }

      if (clock) clock.textContent = formatClock(new Date());
    };

    render(true);
    bar._commercialBarTimer = setInterval(() => render(false), 1000);
    return bar._commercialBarTimer;
  }

  function safePlay(video, label) {
    if (!video || !video.src) return;
    const result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch((error) => {
        console.warn(`Reproducao aguardando: ${label || 'video'}.`, error);
      });
    }
  }

  function clearVideo(video) {
    if (!video) return;
    try { video.pause(); } catch (error) {}
    video.removeAttribute('src');
    try { video.load(); } catch (error) {}
  }

  function sortGradeEntries(entries) {
    return entries.sort((a, b) => {
      const numberA = Number((a.name.match(/\d+/) || [0])[0]);
      const numberB = Number((b.name.match(/\d+/) || [0])[0]);
      if (numberA !== numberB) return numberA - numberB;
      return a.name.localeCompare(b.name, 'pt-BR', { numeric: true, sensitivity: 'base' });
    });
  }

  function createPlaylistEngine(options) {
    const video = options.video;
    const fallback = options.fallback;
    const input = options.input;
    const imageDurationMs = options.imageDurationMs || DEFAULT_IMAGE_DURATION_MS;
    const gradeIntervalMs = options.gradeIntervalMs || DEFAULT_GRADE_INTERVAL_MS;
    const gradePattern = options.gradePattern || DEFAULT_GRADE_PATTERN;
    const onMediaReady = options.onMediaReady || function () {};
    const onReset = options.onReset || function () {};
    const onBeforeManualLoad = options.onBeforeManualLoad || function () {};
    const label = options.label || document.title || 'Player';

    const state = {
      playlist: [],
      index: 0,
      imageTimeout: null,
      gradeDirectoryHandle: null,
      gradeCheckInterval: null,
      currentObjectUrl: null,
      videoWatchdog: null,
      recoveryTimeout: null,
      recoveryInProgress: false,
      recoveryAttempts: 0,
      lastVideoTime: 0,
      lastVideoProgressAt: Date.now()
    };

    if (video) {
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
    }

    function stopGrade() {
      if (state.gradeCheckInterval) clearInterval(state.gradeCheckInterval);
      state.gradeCheckInterval = null;
      state.gradeDirectoryHandle = null;
    }

    function stopImageTimer() {
      if (state.imageTimeout) clearTimeout(state.imageTimeout);
      state.imageTimeout = null;
    }

    function stopWatchdog() {
      if (state.videoWatchdog) clearInterval(state.videoWatchdog);
      state.videoWatchdog = null;
    }

    function stopRecovery() {
      if (state.recoveryTimeout) clearTimeout(state.recoveryTimeout);
      state.recoveryTimeout = null;
      state.recoveryInProgress = false;
    }

    function revokeObjectUrl() {
      if (!state.currentObjectUrl) return;
      URL.revokeObjectURL(state.currentObjectUrl);
      state.currentObjectUrl = null;
    }

    function clearCurrentSource() {
      stopImageTimer();
      stopRecovery();
      stopWatchdog();
      clearVideo(video);
      if (fallback) {
        fallback.removeAttribute('src');
        fallback.style.display = 'none';
      }
      revokeObjectUrl();
    }

    function startWatchdog() {
      if (!video || state.videoWatchdog) return;
      state.lastVideoTime = video.currentTime || 0;
      state.lastVideoProgressAt = Date.now();
      state.videoWatchdog = setInterval(() => {
        if (!video.src || video.paused || video.ended || document.hidden) {
          state.lastVideoTime = video.currentTime || 0;
          state.lastVideoProgressAt = Date.now();
          return;
        }

        const currentTime = video.currentTime || 0;
        if (currentTime > state.lastVideoTime + 0.25) {
          state.lastVideoTime = currentTime;
          state.lastVideoProgressAt = Date.now();
          state.recoveryAttempts = 0;
          return;
        }

        if (Date.now() - state.lastVideoProgressAt > VIDEO_STALL_LIMIT_MS) {
          recoverVideo(false);
        }
      }, VIDEO_WATCHDOG_INTERVAL_MS);
    }

    function recoverVideo(fromStart) {
      if (!video || state.recoveryInProgress || state.playlist.length === 0) return;
      if (state.recoveryAttempts >= 3) {
        state.recoveryAttempts = 0;
        next();
        return;
      }

      state.recoveryInProgress = true;
      state.recoveryAttempts += 1;
      const restartAt = fromStart ? 0 : Math.max(0, (video.currentTime || 0) - 0.5);

      stopRecovery();
      state.recoveryInProgress = true;
      state.recoveryTimeout = setTimeout(() => {
        state.recoveryTimeout = null;
        load(restartAt);
        state.recoveryInProgress = false;
      }, VIDEO_RECOVERY_DELAY_MS);
    }

    function load(startAt) {
      stopImageTimer();
      if (state.playlist.length === 0) return;

      const file = state.playlist[state.index];
      if (!file) {
        next();
        return;
      }

      clearCurrentSource();
      state.currentObjectUrl = URL.createObjectURL(file);

      const isVideo = file.type ? file.type.startsWith('video') : /\.(mp4|webm|mov|m4v)$/i.test(file.name);
      const isImage = file.type ? file.type.startsWith('image') : /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);

      if (isVideo) {
        if (fallback) fallback.style.display = 'none';
        video.style.display = 'block';
        video.loop = false;

        const startVideo = () => {
          if (startAt > 0 && Number.isFinite(video.duration)) {
            try {
              video.currentTime = Math.min(startAt, Math.max(0, video.duration - 0.5));
            } catch (error) {}
          }
          onMediaReady(video, file);
          safePlay(video, label);
        };

        video.addEventListener('loadedmetadata', startVideo, { once: true });
        video.addEventListener('loadeddata', () => onMediaReady(video, file), { once: true });
        video.src = state.currentObjectUrl;
        try { video.load(); } catch (error) {}
        safePlay(video, label);
        startWatchdog();
        return;
      }

      stopWatchdog();
      if (video) video.style.display = 'none';
      if (fallback) {
        fallback.style.display = 'block';
        fallback.onload = () => onMediaReady(fallback, file);
        fallback.src = state.currentObjectUrl;
      }
      state.imageTimeout = setTimeout(next, imageDurationMs);

      if (!isImage) {
        console.warn(`Tipo de midia nao reconhecido em ${label}:`, file.name);
      }
    }

    function next() {
      if (state.playlist.length === 0) return;
      state.index = (state.index + 1) % state.playlist.length;
      load(0);
    }

    function reload() {
      if (state.playlist.length === 0) return;
      state.index = 0;
      load(0);
    }

    function reset() {
      stopGrade();
      clearCurrentSource();
      state.playlist = [];
      state.index = 0;
      state.recoveryAttempts = 0;
      if (video) video.style.display = 'block';
      if (fallback) fallback.style.display = 'none';
      onReset();
    }

    function addFiles(files, append) {
      const validFiles = Array.from(files || []).filter(Boolean);
      if (validFiles.length === 0) return;
      const wasEmpty = state.playlist.length === 0;
      state.playlist = append === false ? validFiles : state.playlist.concat(validFiles);
      if (wasEmpty || append === false) {
        state.index = 0;
        load(0);
      }
    }

    function handleInputChange(event) {
      stopGrade();
      onBeforeManualLoad();
      addFiles(event && event.target ? event.target.files : [], true);
      if (event && event.target) event.target.value = null;
    }

    async function scanGradeDirectory() {
      if (!state.gradeDirectoryHandle) return;

      try {
        const foundEntries = [];
        for await (const entry of state.gradeDirectoryHandle.values()) {
          if (entry.kind === 'file' && gradePattern.test(entry.name)) foundEntries.push(entry);
        }

        sortGradeEntries(foundEntries);
        const nextNames = foundEntries.map((entry) => entry.name);
        const currentNames = state.playlist.map((file) => file.name);

        if (JSON.stringify(nextNames) !== JSON.stringify(currentNames)) {
          const files = await Promise.all(foundEntries.map((entry) => entry.getFile()));
          state.playlist = files;
          state.index = 0;
          if (state.playlist.length > 0) load(0);
          else clearCurrentSource();
        }
      } catch (error) {
        console.error(`Erro ao ler a grade em ${label}.`, error);
        stopGrade();
      }
    }

    async function readGradeFolder() {
      if (!window.showDirectoryPicker) {
        alert('Este navegador nao suporta selecao de pastas neste modo.');
        return;
      }

      try {
        const handle = await window.showDirectoryPicker();
        reset();
        state.gradeDirectoryHandle = handle;
        await scanGradeDirectory();
        state.gradeCheckInterval = setInterval(scanGradeDirectory, gradeIntervalMs);
      } catch (error) {
        console.error(`Selecao de grade cancelada ou negada em ${label}.`, error);
      }
    }

    if (input) input.onchange = handleInputChange;

    if (video) {
      video.addEventListener('error', () => recoverVideo(true));
      video.addEventListener('stalled', () => recoverVideo(false));
      video.addEventListener('waiting', () => {
        if (!state.recoveryTimeout) {
          state.recoveryTimeout = setTimeout(() => recoverVideo(false), VIDEO_STALL_LIMIT_MS);
        }
      });
      video.addEventListener('playing', () => {
        stopRecovery();
        state.lastVideoTime = video.currentTime || 0;
        state.lastVideoProgressAt = Date.now();
      });
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && video && video.src && video.style.display !== 'none') safePlay(video, label);
    });

    return {
      state,
      addMedia: () => { if (input) input.click(); },
      handleInputChange,
      loadMainMedia: () => load(0),
      nextMedia: next,
      reloadMidia: reload,
      resetMidias: reset,
      lerGradePasta: readGradeFolder,
      scanGradeDirectory,
      setPlaylist: (files) => addFiles(files, false),
      stopGrade
    };
  }

  window.PlayerRuntime = {
    applyMenuPolish,
    preventHashJump,
    setupMenuState,
    startCommercialBar,
    safePlay,
    clearVideo,
    createPlaylistEngine
  };

  applyMenuPolish();
  document.addEventListener('DOMContentLoaded', () => {
    applyMenuPolish();
    setupMenuState();
  });
})();
