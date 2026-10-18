(() => {
  'use strict';

  const native = window.QuzhanAndroid;
  if (!native) return;

  document.documentElement.classList.add('platform-android');

  let pendingImport = null;
  let pendingBackground = null;
  let pendingScan = null;
  let pendingUpdateCheck = null;
  let pendingUpdateInstall = null;

  function parseJson(value, fallback) {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function settlePending(target, payload) {
    if (!target) return;
    target(payload);
  }

  window.QuzhanNativeImport = (payload) => {
    const resolve = pendingImport;
    pendingImport = null;
    settlePending(resolve, parseJson(payload, { items: [], errors: [], skipped: 0 }));
  };

  window.QuzhanNativeBackground = (payload) => {
    const resolve = pendingBackground;
    pendingBackground = null;
    settlePending(resolve, parseJson(payload, { ok: false, code: 'IMPORT_FAILED' }));
  };

  window.QuzhanNativeScan = (payload) => {
    const resolve = pendingScan;
    pendingScan = null;
    settlePending(resolve, parseJson(payload, { items: [], errors: [], skipped: 0 }));
  };

  window.QuzhanNativeTrackMetadata = (payload) => {
    const updates = parseJson(payload, []);
    if (!Array.isArray(updates) || !updates.length) return;
    window.dispatchEvent(new CustomEvent('quzhan:track-metadata', { detail: updates }));
  };

  window.QuzhanNativeUpdateInfo = (payload) => {
    const resolve = pendingUpdateCheck;
    pendingUpdateCheck = null;
    settlePending(resolve, parseJson(payload, { ok: false, error: 'update check failed' }));
  };

  window.QuzhanNativeUpdateResult = (payload) => {
    const resolve = pendingUpdateInstall;
    pendingUpdateInstall = null;
    settlePending(resolve, parseJson(payload, { ok: false, error: 'update failed' }));
  };

  window.QuzhanNativeUpdateProgress = (payload) => {
    window.dispatchEvent(
      new CustomEvent('quzhan:update-progress', {
        detail: parseJson(payload, {}),
      }),
    );
  };

  window.QuzhanAndroidMediaAction = (action) => {
    const names = {
      toggle: 'playButton',
      next: 'nextButton',
      previous: 'prevButton',
    };
    const target = document.getElementById(names[action]);
    if (target) target.click();
  };

  const noopEvent = () => () => {};
  const resolveFalse = () => Promise.resolve(false);
  const resolveEmpty = () => Promise.resolve();

  window.quzhan = {
    platform: 'android',
    mediaBaseUrl: String(native.mediaBaseUrl() || ''),
    getState: () => Promise.resolve(parseJson(native.getState(), null)),
    getAppInfo: () => Promise.resolve(parseJson(native.getAppInfo(), {})),
    checkForUpdate: () =>
      new Promise((resolve) => {
        pendingUpdateCheck = resolve;
        native.checkForUpdate();
      }),
    installUpdate: (update) =>
      new Promise((resolve) => {
        pendingUpdateInstall = resolve;
        native.installUpdate(JSON.stringify(update || {}));
      }),
    saveState: (state) => {
      native.saveState(JSON.stringify(state));
    },
    flushState: (state) => {
      native.flushState(JSON.stringify(state));
      return Promise.resolve();
    },
    importFromDialog: (existingPaths) =>
      new Promise((resolve) => {
        pendingImport = resolve;
        native.pickAudio(JSON.stringify(Array.isArray(existingPaths) ? existingPaths : []));
      }),
    importPaths: (paths) =>
      new Promise((resolve) => {
        pendingImport = resolve;
        native.pickAudio(JSON.stringify(Array.isArray(paths) ? paths : []));
      }),
    scanLocalMusic: (existingPaths) =>
      new Promise((resolve) => {
        pendingScan = resolve;
        native.scanLocalMusic(
          JSON.stringify(Array.isArray(existingPaths) ? existingPaths : []),
        );
      }),
    getCoverPalette: (filePath) =>
      Promise.resolve(parseJson(native.getCoverPalette(String(filePath || '')), null)),
    getCoverArtwork: (filePath) =>
      Promise.resolve(String(native.getCoverArtwork(String(filePath || '')) || '')),
    importBackground: () =>
      new Promise((resolve) => {
        pendingBackground = resolve;
        native.pickBackground();
      }),
    clearBackground: () => {
      native.clearBackground();
      return Promise.resolve();
    },
    cleanupCovers: () => Promise.resolve(Number(native.cleanupCovers()) || 0),
    getPathForFile: () => '',
    revealFile: resolveFalse,
    minimize: resolveEmpty,
    toggleMaximize: resolveEmpty,
    closeWindow: resolveEmpty,
    hideToTray: resolveEmpty,
    quitApp: resolveEmpty,
    openUserData: resolveFalse,
    registerAssociations: resolveFalse,
    getAssociationStatus: () =>
      Promise.resolve({ registered: false, allDefault: false, windowsOnly: false }),
    openDefaultAppsSettings: resolveFalse,
    takeLaunchActions: () => Promise.resolve(null),
    isMaximized: resolveFalse,
    onWindowMaximized: noopEvent,
    onImportProgress: noopEvent,
    onSmokeImport: noopEvent,
    onCoversOptimized: noopEvent,
    onUpdateProgress: (callback) => {
      const handler = (event) => callback(event.detail);
      window.addEventListener('quzhan:update-progress', handler);
      return () => window.removeEventListener('quzhan:update-progress', handler);
    },
    showDesktopLyrics: resolveFalse,
    hideDesktopLyrics: resolveFalse,
    configureDesktopLyrics: resolveEmpty,
    updateDesktopLyrics: () => {},
    onDesktopLyricsVisibility: noopEvent,
    onOpenFiles: noopEvent,
    onRequestClose: noopEvent,
    onTrayAction: noopEvent,
    onOpenDefaultSettings: noopEvent,
  };

  const audio = document.getElementById('audio');
  if (!audio) return;

  let lastNoticeSignature = '';

  function queryMediaPath(url) {
    try {
      return new URL(url, window.location.href).searchParams.get('path') || '';
    } catch {
      return '';
    }
  }

  function notificationPayload(playing) {
    const title = document.getElementById('trackTitle')?.textContent?.trim() || '';
    const artist = document.getElementById('trackArtist')?.textContent?.trim() || '';
    const cover = document.getElementById('coverArt');
    return {
      title,
      artist,
      coverPath: cover ? queryMediaPath(cover.src) : '',
      playing: Boolean(playing),
    };
  }

  function syncNativePlayback(playing) {
    if (!titleAvailable()) return;
    const payload = notificationPayload(playing);
    const signature = JSON.stringify(payload);
    if (signature === lastNoticeSignature) return;
    lastNoticeSignature = signature;
    native.setPlaybackState(JSON.stringify(payload));
  }

  function titleAvailable() {
    const title = document.getElementById('trackTitle')?.textContent?.trim() || '';
    return Boolean(title && (audio.currentSrc || audio.src));
  }

  audio.addEventListener('playing', () => syncNativePlayback(true));
  audio.addEventListener('pause', () => syncNativePlayback(false));
  audio.addEventListener('loadedmetadata', () => syncNativePlayback(!audio.paused));
  audio.addEventListener('emptied', () => native.stopPlaybackService());

  const tech = document.getElementById('settingsTech');
  if (tech) tech.textContent = 'Android WebView · Kotlin';
  const edition = document.querySelector('.brand-edition');
  if (edition) edition.textContent = 'ANDROID / 01';
})();
