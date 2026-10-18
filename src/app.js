(() => {
  'use strict';

  const api = window.quzhan;
  const t = window.quzhanI18n.t;
  const audio = document.getElementById('audio');
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const els = {
    appShell: $('#appShell'),
    workspace: $('#workspace'),
    listeningStage: $('#listeningStage'),
    titlebarCenter: $('#titlebarCenter'),
    titlebarQueueToggle: $('#titlebarQueueToggle'),
    titlebarQueueCount: $('#titlebarQueueCount'),
    appVersion: $('#appVersion'),
    queueToggle: $('#queueToggle'),
    queuePanel: $('#queuePanel'),
    queueCollapseButton: $('#queueCollapseButton'),
    queueDropOverlay: $('#queueDropOverlay'),
    queueList: $('#queueList'),
    queueEmpty: $('#queueEmpty'),
    queueNoResults: $('#queueNoResults'),
    queueSearchInput: $('#queueSearchInput'),
    clearQueueSearch: $('#clearQueueSearch'),
    queueFilterOptions: $('#queueFilterOptions'),
    queueFilterCount: $('#queueFilterCount'),
    clearQueueFiltersButton: $('#clearQueueFiltersButton'),
    queueCount: $('#queueCount'),
    queueTotalDuration: $('#queueTotalDuration'),
    queueMenuButton: $('#queueMenuButton'),
    queueMenu: $('#queueMenu'),
    queueLocateButton: $('#queueLocateButton'),
    queueSortButton: $('#queueSortButton'),
    sortPopover: $('#sortPopover'),
    sortPopoverClose: $('#sortPopoverClose'),
    selectionStrip: $('#selectionStrip'),
    selectionCount: $('#selectionCount'),
    clearSelectionButton: $('#clearSelectionButton'),
    selectAllButton: $('#selectAllButton'),
    moveTopButton: $('#moveTopButton'),
    moveBottomButton: $('#moveBottomButton'),
    markPlayedButton: $('#markPlayedButton'),
    unmarkPlayedButton: $('#unmarkPlayedButton'),
    loopSelectionButton: $('#loopSelectionButton'),
    removeTracksButton: $('#removeTracksButton'),
    addTracksButton: $('#addTracksButton'),
    queueEmptyAddButton: $('#queueEmptyAddButton'),
    emptyQueueButton: $('#emptyQueueButton'),
    coverArt: $('#coverArt'),
    coverFallback: $('#coverFallback'),
    coverArtButton: $('#coverArtButton'),
    vinylDisc: $('#vinylDisc'),
    atmosphereImage: $('#atmosphereImage'),
    trackTitle: $('#trackTitle'),
    trackArtist: $('#trackArtist'),
    trackAlbum: $('#trackAlbum'),
    bylineDot: $('#bylineDot'),
    factQueuePosition: $('#factQueuePosition'),
    factUnplayed: $('#factUnplayed'),
    factLyrics: $('#factLyrics'),
    lyricsPanel: $('#lyricsPanel'),
    lyricsEmpty: $('#lyricsEmpty'),
    lyricsScroll: $('#lyricsScroll'),
    lyricsContent: $('#lyricsContent'),
    lyricsSource: $('#lyricsSource'),
    desktopLyricsButton: $('#desktopLyricsButton'),
    desktopLyricsShortcut: $('#desktopLyricsShortcut'),
    currentTime: $('#currentTime'),
    durationTime: $('#durationTime'),
    progressSlider: $('#progressSlider'),
    progressBuffer: $('#progressBuffer'),
    playButton: $('#playButton'),
    prevButton: $('#prevButton'),
    nextButton: $('#nextButton'),
    rewindButton: $('#rewindButton'),
    forwardButton: $('#forwardButton'),
    modeButton: $('#modeButton'),
    modeBadge: $('#modeBadge'),
    modePopover: $('#modePopover'),
    modePopoverClose: $('#modePopoverClose'),
    selectionModeHint: $('#selectionModeHint'),
    rateButton: $('#rateButton'),
    rateValue: $('#rateValue'),
    ratePopover: $('#ratePopover'),
    rateOptions: $('#rateOptions'),
    volumeButton: $('#volumeButton'),
    volumeSlider: $('#volumeSlider'),
    settingsButton: $('#settingsButton'),
    settingsBackdrop: $('#settingsBackdrop'),
    settingsPanel: $('#settingsPanel'),
    settingsCloseButton: $('#settingsCloseButton'),
    settingsRateOptions: $('#settingsRateOptions'),
    settingsVolumeSlider: $('#settingsVolumeSlider'),
    settingsVolumeValue: $('#settingsVolumeValue'),
    settingsSpectrumToggle: $('#settingsSpectrumToggle'),
    settingsThemeOptions: $('#settingsThemeOptions'),
    settingsLanguageOptions: $('#settingsLanguageOptions'),
    settingsBackgroundPreview: $('#settingsBackgroundPreview'),
    importBackgroundButton: $('#importBackgroundButton'),
    clearBackgroundButton: $('#clearBackgroundButton'),
    settingsBackgroundBlur: $('#settingsBackgroundBlur'),
    settingsBackgroundBlurValue: $('#settingsBackgroundBlurValue'),
    settingsBackgroundDim: $('#settingsBackgroundDim'),
    settingsBackgroundDimValue: $('#settingsBackgroundDimValue'),
    settingsBackgroundMotion: $('#settingsBackgroundMotion'),
    shortcutList: $('#shortcutList'),
    resetShortcutsButton: $('#resetShortcutsButton'),
    settingsOverlayScale: $('#settingsOverlayScale'),
    settingsOverlayScaleValue: $('#settingsOverlayScaleValue'),
    settingsOverlayOpacity: $('#settingsOverlayOpacity'),
    settingsOverlayOpacityValue: $('#settingsOverlayOpacityValue'),
    settingsOverlayLocked: $('#settingsOverlayLocked'),
    settingsOverlayClickThrough: $('#settingsOverlayClickThrough'),
    settingsCloseOptions: $('#settingsCloseOptions'),
    settingsAppVersion: $('#settingsAppVersion'),
    defaultPlayerButton: $('#defaultPlayerButton'),
    defaultPlayerStatus: $('#defaultPlayerStatus'),
    openUserDataButton: $('#openUserDataButton'),
    closeDialog: $('#closeDialog'),
    closeDialogCancel: $('#closeDialogCancel'),
    closeDialogConfirm: $('#closeDialogConfirm'),
    rememberCloseChoice: $('#rememberCloseChoice'),
    dockCover: $('#dockCover'),
    dockCoverImage: $('#dockCoverImage'),
    dockTrackTitle: $('#dockTrackTitle'),
    dockTrackArtist: $('#dockTrackArtist'),
    dockMoreButton: $('#dockMoreButton'),
    windowMinimize: $('#windowMinimize'),
    windowMaximize: $('#windowMaximize'),
    windowClose: $('#windowClose'),
    toastStack: $('#toastStack'),
    confirmDialog: $('#confirmDialog'),
    confirmTitle: $('#confirmTitle'),
    confirmMessage: $('#confirmMessage'),
    confirmCancel: $('#confirmCancel'),
    confirmAccept: $('#confirmAccept'),
    spectrumStrip: $('#spectrumStrip'),
    spectrumCanvas: $('#spectrumCanvas'),
    spectrumStatus: $('#spectrumStatus'),
    customBackground: $('#customBackground'),
    customBackgroundImage: $('#customBackgroundImage'),
  };

  const MODE_CONFIG = {
    sequential: {
      icon: '#i-repeat',
      label: '顺序',
      title: '顺序播放',
    },
    shuffle: {
      icon: '#i-shuffle',
      label: '随机',
      title: '一轮随机：跳过本轮已听过的歌',
    },
    'repeat-one': {
      icon: '#i-repeat-one',
      label: '单曲',
      title: '单曲循环',
    },
    selection: {
      icon: '#i-repeat-selection',
      label: '选中',
      title: '循环选中歌曲',
    },
  };

  const THEME_CONFIG = {
    cover: { label: '跟随封面', accent: null },
    amber: {
      label: '琥珀',
      accent: 'rgb(230, 168, 115)',
      rgb: '230, 168, 115',
      soft: 'rgb(243, 199, 159)',
    },
    tide: {
      label: '潮汐',
      accent: 'rgb(111, 182, 180)',
      rgb: '111, 182, 180',
      soft: 'rgb(167, 218, 213)',
    },
    moss: {
      label: '苔原',
      accent: 'rgb(155, 191, 141)',
      rgb: '155, 191, 141',
      soft: 'rgb(196, 220, 181)',
    },
    berry: {
      label: '夜莓',
      accent: 'rgb(211, 141, 165)',
      rgb: '211, 141, 165',
      soft: 'rgb(235, 181, 200)',
    },
    indigo: {
      label: '靛蓝',
      accent: 'rgb(143, 158, 232)',
      rgb: '143, 158, 232',
      soft: 'rgb(187, 197, 245)',
    },
  };

  const SHORTCUT_ACTIONS = [
    { id: 'playPause', label: '暂停 / 继续', fallback: 'Space' },
    { id: 'next', label: '下一首', fallback: 'KeyD' },
    { id: 'previous', label: '上一首', fallback: 'KeyA' },
    { id: 'seekForward', label: '往后 10 秒', fallback: 'ArrowRight' },
    { id: 'seekBackward', label: '往前 10 秒', fallback: 'ArrowLeft' },
    { id: 'desktopLyrics', label: '桌面歌词开关', fallback: 'KeyF' },
  ];

  const DEFAULT_SHORTCUTS = Object.fromEntries(
    SHORTCUT_ACTIONS.map((action) => [action.id, action.fallback]),
  );

  const defaultState = {
    version: 2,
    queue: [],
    currentId: null,
    currentTime: 0,
    volume: 0.78,
    muted: false,
    rate: 1,
    mode: 'sequential',
    queueOpen: true,
    selectionLoopIds: [],
    desktopLyrics: false,
    settings: {
      defaultRate: 1,
      defaultVolume: 0.78,
      spectrumEnabled: true,
      closeAction: 'ask',
      language: 'zh-CN',
      theme: 'cover',
      shortcuts: { ...DEFAULT_SHORTCUTS },
      overlay: {
        scale: 1,
        opacity: 0.92,
        locked: false,
        clickThrough: false,
      },
      background: {
        path: '',
        blur: 18,
        dim: 0.58,
        motion: true,
      },
    },
  };

  let state = { ...defaultState };
  let selectedIds = new Set();
  let selectionAnchorId = null;
  let lyricsModel = { lines: [], timed: false, source: '' };
  let currentLyricIndex = -1;
  let pendingRestoreTime = 0;
  let isScrubbing = false;
  let lastSavedVolume = 0.78;
  let importBusy = false;
  let saveTimer = null;
  let persistTimer = null;
  let overlayTimer = null;
  let suppressClickUntil = 0;
  let dragDepth = 0;
  let confirmCallback = null;
  let pressState = null;
  let reorderState = null;
  let audioErrorNotifiedFor = null;
  let currentSortMode = null;
  let audioContext = null;
  let analyserNode = null;
  let frequencyData = null;
  let spectrumFrame = null;
  let spectrumWidth = 0;
  let spectrumHeight = 0;
  let spectrumDpr = 1;
  let spectrumHeights = [];
  let spectrumAccentRgb = '230, 168, 115';
  let closeDialogOpen = false;
  let associationStatus = null;
  let queueSearchQuery = '';
  let queuePlayedFilter = 'all';
  let shortcutRecording = null;
  let queueSearchTimer = null;

  const textCollator = new Intl.Collator(['zh-Hans-CN-u-co-pinyin', 'zh-CN'], {
    numeric: true,
    sensitivity: 'base',
  });

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function mediaUrl(filePath) {
    return filePath && api.mediaBaseUrl
      ? `${api.mediaBaseUrl}/media?path=${encodeURIComponent(filePath)}`
      : '';
  }

  function currentItem() {
    return state.queue.find((item) => item.id === state.currentId) || null;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function formatDurationLong(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return t('0 分钟');
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return t('{count} 分钟', { count: minutes });
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest
      ? t('{hours} 小时 {minutes} 分钟', { hours, minutes: rest })
      : t('{hours} 小时', { hours });
  }

  function snapshotState() {
    const duration = Number(audio.duration);
    return {
      ...state,
      currentTime:
        Number.isFinite(audio.currentTime) && audio.currentTime > 0
          ? audio.currentTime
          : Number(state.currentTime) || 0,
      duration: Number.isFinite(duration) ? duration : undefined,
      updatedAt: Date.now(),
    };
  }

  function scheduleSave(important = false) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      api.saveState(snapshotState());
    }, 220);

    if (important) {
      api.saveState(snapshotState());
      clearTimeout(persistTimer);
      persistTimer = setTimeout(() => {
        api.flushState(snapshotState()).catch(() => {});
      }, 90);
    }
  }

  function flushState() {
    clearTimeout(saveTimer);
    const snapshot = snapshotState();
    api.saveState(snapshot);
    api.flushState(snapshot).catch(() => {});
  }

  function showToast(message, options = {}) {
    const toast = document.createElement('div');
    toast.className = `toast${options.error ? ' error' : ''}`;
    toast.textContent = message;
    els.toastStack.appendChild(toast);
    const duration = options.duration || 3300;
    setTimeout(() => {
      toast.classList.add('leaving');
      setTimeout(() => toast.remove(), 220);
    }, duration);
    return toast;
  }

  function askConfirm({ title, message, acceptText = t('确定'), onAccept }) {
    els.confirmTitle.textContent = title;
    els.confirmMessage.textContent = message;
    els.confirmAccept.textContent = acceptText;
    confirmCallback = onAccept;
    els.confirmDialog.hidden = false;
    els.confirmAccept.focus();
  }

  function closeConfirm() {
    els.confirmDialog.hidden = true;
    confirmCallback = null;
  }

  function updateSelectionModeHint() {
    const selectedCount = selectedIds.size;
    const loopCount = state.selectionLoopIds?.length || 0;
    if (selectedCount) {
      els.selectionModeHint.textContent = t('将循环当前选中的 {count} 首歌曲', {
        count: selectedCount,
      });
    } else if (loopCount) {
      els.selectionModeHint.textContent = t('当前循环列表中有 {count} 首歌曲', {
        count: loopCount,
      });
    } else {
      els.selectionModeHint.textContent = t('先在队列中选中歌曲');
    }
  }

  function renderSelection() {
    for (const id of [...selectedIds]) {
      if (!state.queue.some((item) => item.id === id)) selectedIds.delete(id);
    }
    const count = selectedIds.size;
    els.selectionStrip.classList.toggle('visible', count > 0);
    els.selectionCount.textContent = String(count);
    const disabled = count === 0;
    els.moveTopButton.disabled = disabled;
    els.moveBottomButton.disabled = disabled;
    els.markPlayedButton.disabled = disabled;
    els.unmarkPlayedButton.disabled = disabled;
    els.loopSelectionButton.disabled = disabled;
    els.removeTracksButton.disabled = disabled;
    els.selectAllButton.title =
      visibleQueueEntries().length &&
      count === visibleQueueEntries().length
        ? t('取消全选')
        : t('全选队列');
    els.selectAllButton.setAttribute('aria-label', els.selectAllButton.title);
    updateSelectionModeHint();
  }

  function visibleQueueEntries() {
    const query = queueSearchQuery.trim().toLocaleLowerCase();
    return state.queue
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (queuePlayedFilter === 'played' && !item.played) return false;
        if (queuePlayedFilter === 'unplayed' && item.played) return false;
        if (!query) return true;
        return [item.title, item.artist, item.album, item.fileName]
          .filter(Boolean)
          .some((value) => String(value).toLocaleLowerCase().includes(query));
      });
  }

  function resetQueueFilters() {
    queueSearchQuery = '';
    clearTimeout(queueSearchTimer);
    queuePlayedFilter = 'all';
    els.queueSearchInput.value = '';
    $$('button', els.queueFilterOptions).forEach((entry) => {
      entry.classList.toggle('selected', entry.dataset.queueFilter === 'all');
    });
    renderQueue({ keepScroll: true });
  }

  function renderQueue(options = {}) {
    const scrollTop = options.keepScroll ? els.queueList.scrollTop : 0;
    const fragment = document.createDocumentFragment();
    const visibleEntries = visibleQueueEntries();
    const hasFilter = Boolean(queueSearchQuery.trim()) || queuePlayedFilter !== 'all';
    const totalDuration = (hasFilter ? visibleEntries.map((entry) => entry.item) : state.queue)
      .reduce((sum, item) => sum + (Number(item.duration) || 0), 0);

    visibleEntries.forEach(({ item, index }) => {
      const isActive = item.id === state.currentId;
      const isSelected = selectedIds.has(item.id);
      const cover = mediaUrl(item.coverPath);
      const row = document.createElement('div');
      row.className = [
        'queue-row',
        isActive ? 'active' : '',
        isActive && audio.paused ? 'paused' : '',
        isSelected ? 'selected' : '',
        item.missing ? 'missing' : '',
      ]
        .filter(Boolean)
        .join(' ');
      row.dataset.id = item.id;
      row.tabIndex = 0;
      row.setAttribute('role', 'button');
      row.setAttribute(
        'aria-label',
        `${index + 1}. ${item.title}，${item.artist}${item.missing ? `，${t('文件不可用')}` : ''}`,
      );
      row.setAttribute('aria-current', isActive ? 'true' : 'false');

      row.innerHTML = `
        <div class="drag-handle" title="长按或拖动调整顺序" aria-hidden="true">
          <svg><use href="#i-grip"></use></svg>
        </div>
        <div class="row-state">
          <span class="row-number">${String(index + 1).padStart(2, '0')}</span>
          <svg class="row-play-icon"><use href="#i-play"></use></svg>
          <span class="eq-bars"><span></span><span></span><span></span></span>
        </div>
        <div class="row-art">
          ${cover ? `<img alt="" src="${cover}">` : '<svg><use href="#i-note"></use></svg>'}
          <span class="row-selected-mark"></span>
        </div>
        <div class="row-copy">
          <div class="row-title">${escapeHtml(item.title)}</div>
          <div class="row-subtitle">
            ${item.missing ? `<span class="missing-tag">${escapeHtml(t('文件不可用'))}</span>` : ''}
            <span>${escapeHtml(item.artist || t('未知艺术家'))}</span>
          </div>
        </div>
        <div class="row-duration">${formatTime(item.duration)}</div>
      `;

      const coverImage = $('img', row);
      if (coverImage) {
        coverImage.addEventListener('error', () => {
          coverImage.replaceWith(
            Object.assign(document.createElementNS('http://www.w3.org/2000/svg', 'svg'), {
              innerHTML: '<use href="#i-note"></use>',
            }),
          );
        });
      }
      fragment.appendChild(row);
    });

    els.queueList.replaceChildren(fragment);
    els.queueList.scrollTop = scrollTop;
    els.queueEmpty.hidden = state.queue.length > 0;
    els.queueNoResults.hidden = !(state.queue.length > 0 && !visibleEntries.length);
    els.queueList.hidden = visibleEntries.length === 0 && state.queue.length > 0;
    const countText = hasFilter
      ? t('显示 {visible} / {total} 首', {
        visible: visibleEntries.length,
        total: state.queue.length,
      })
      : t('{count} 首', { count: state.queue.length });
    els.queueCount.textContent = countText;
    els.queueFilterCount.textContent = hasFilter ? countText : '';
    els.clearQueueSearch.hidden = !queueSearchQuery;
    $$('button', els.queueFilterOptions).forEach((button) => {
      button.setAttribute('aria-pressed', String(button.classList.contains('selected')));
    });
    els.titlebarQueueCount.textContent = String(state.queue.length);
    els.queueTotalDuration.textContent = formatDurationLong(totalDuration);
    renderSelection();
    updateFacts();
  }

  function scrollCurrentIntoView(options = {}) {
    if (!currentItem()) return false;
    if (!state.queueOpen) {
      if (!options.expand) return false;
      toggleQueue(true);
      setTimeout(() => scrollCurrentIntoView({
        ...options,
        expand: false,
      }), 480);
      return true;
    }
    if (options.clearFilters && !els.queueList.querySelector('.queue-row.active')) {
      resetQueueFilters();
    }
    const row = els.queueList.querySelector('.queue-row.active');
    if (!row) return false;
    const listRect = els.queueList.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const top = els.queueList.scrollTop + rowRect.top - listRect.top -
      Math.max(0, (listRect.height - rowRect.height) / 2);
    els.queueList.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    if (options.highlight) {
      row.classList.remove('locate-flash');
      void row.offsetWidth;
      row.classList.add('locate-flash');
      setTimeout(() => row.classList.remove('locate-flash'), 1400);
    }
    return true;
  }

  function scheduleCurrentIntoView(options = {}) {
    requestAnimationFrame(() => {
      scrollCurrentIntoView(options);
      setTimeout(() => scrollCurrentIntoView(options), 100);
    });
  }

  function updateFacts() {
    const item = currentItem();
    if (!item) {
      els.factQueuePosition.textContent = '—';
      els.factUnplayed.textContent = '—';
      els.factLyrics.textContent = '—';
      return;
    }
    const index = state.queue.findIndex((entry) => entry.id === item.id);
    const remaining = state.queue.filter((entry) => !entry.played).length;
    els.factQueuePosition.textContent = `${String(index + 1).padStart(2, '0')} / ${String(
      state.queue.length,
    ).padStart(2, '0')}`;
    els.factUnplayed.textContent =
      state.mode === 'shuffle'
        ? t('{count} 首', { count: remaining })
        : t('{count} 首未听', { count: remaining });
    els.factLyrics.textContent = lyricsModel.timed
      ? t('同步歌词')
      : lyricsModel.lines.length
        ? t('纯文本')
        : t('暂无歌词');
  }

  function setMode(mode, options = {}) {
    if (!MODE_CONFIG[mode]) return;
    if (mode === 'selection') {
      if (!state.selectionLoopIds?.length && selectedIds.size) {
        state.selectionLoopIds = state.queue
          .filter((item) => selectedIds.has(item.id))
          .map((item) => item.id);
      }
      if (!state.selectionLoopIds?.length) {
        showToast(t('先选中想循环的歌曲，或点击工具栏里的“循环选中”'));
        return false;
      }
    }
    state.mode = mode;
    renderMode();
    if (options.persist !== false) scheduleSave(true);
    if (options.notify) {
      if (mode === 'shuffle') {
        const unplayed = state.queue.filter((item) => !item.played).length;
        showToast(t('一轮随机已开启，本轮还剩 {count} 首未听', { count: unplayed }));
      } else {
        showToast(t('已切换为{title}', { title: t(MODE_CONFIG[mode].title) }));
      }
    }
    return true;
  }

  function renderMode() {
    const config = MODE_CONFIG[state.mode] || MODE_CONFIG.sequential;
    const use = els.modeButton.querySelector('use');
    use.setAttribute('href', config.icon);
    els.modeButton.title = t(config.title);
    els.modeButton.classList.toggle('active', state.mode !== 'sequential');
    els.modeBadge.textContent = t(config.label);
    $$('.mode-option', els.modePopover).forEach((button) => {
      button.classList.toggle('selected', button.dataset.mode === state.mode);
    });
    updateSelectionModeHint();
    updateFacts();
  }

  function renderSortOptions() {
    els.queueSortButton.classList.toggle(
      'active',
      currentSortMode === 'artist' || currentSortMode === 'title' || currentSortMode === 'default',
    );
    $$('.sort-option', els.sortPopover).forEach((button) => {
      button.classList.toggle('selected', button.dataset.sort === currentSortMode);
    });
  }

  function queueOrderValue(item, originalIndex) {
    const order = Number(item.importOrder);
    return Number.isFinite(order) ? order : originalIndex.get(item.id);
  }

  function sortQueue(mode) {
    if (!state.queue.length) {
      showToast(t('播放队列还是空的'));
      return;
    }
    const originalIndex = new Map(state.queue.map((item, index) => [item.id, index]));
    const originalOrder = (a, b) =>
      queueOrderValue(a, originalIndex) - queueOrderValue(b, originalIndex);
    if (mode === 'artist') {
      state.queue.sort(
        (a, b) =>
          textCollator.compare(a.artist || '', b.artist || '') ||
          textCollator.compare(a.title || '', b.title || '') ||
          originalOrder(a, b),
      );
      showToast(t('已按歌手排序'));
    } else if (mode === 'title') {
      state.queue.sort(
        (a, b) =>
          textCollator.compare(a.title || '', b.title || '') ||
          textCollator.compare(a.artist || '', b.artist || '') ||
          originalOrder(a, b),
      );
      showToast(t('已按歌名首字母排序'));
    } else {
      state.queue.sort(originalOrder);
      showToast(t('已恢复最初导入顺序'));
    }
    currentSortMode = mode;
    renderSortOptions();
    renderQueue({ keepScroll: true });
    scheduleSave(true);
    els.sortPopover.hidden = true;
  }

  function markQueueCustomOrder() {
    currentSortMode = null;
    renderSortOptions();
  }

  function renderRate() {
    const rate = Number(state.rate) || 1;
    els.rateValue.textContent = `${rate.toFixed(rate % 1 === 0 ? 1 : 2).replace(/0$/, '')}×`;
    els.rateButton.classList.toggle('active', Math.abs(rate - 1) > 0.001);
    $$('button', els.rateOptions).forEach((button) => {
      button.classList.toggle('active', Math.abs(Number(button.dataset.rate) - rate) < 0.001);
    });
  }

  function applyTheme(themeId = state.settings?.theme) {
    const theme = THEME_CONFIG[themeId] || THEME_CONFIG.cover;
    if (theme.accent) {
      document.documentElement.style.setProperty('--accent', theme.accent);
      document.documentElement.style.setProperty('--accent-rgb', theme.rgb);
      document.documentElement.style.setProperty('--accent-soft', theme.soft);
      spectrumAccentRgb = theme.rgb;
      return;
    }
    resetAccent();
    const item = currentItem();
    if (item?.coverPath) extractAccent(item.coverPath).catch(() => {});
  }

  function shortcutFromEvent(event) {
    const code = event.code;
    if (!code || ['ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft',
      'AltRight', 'MetaLeft', 'MetaRight', 'CapsLock'].includes(code)) {
      return '';
    }
    const parts = [];
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    parts.push(code);
    return parts.join('+');
  }

  function shortcutLabel(combo) {
    const labels = {
      Space: 'Space',
      ArrowLeft: '←',
      ArrowRight: '→',
      ArrowUp: '↑',
      ArrowDown: '↓',
      Escape: 'Esc',
      Backspace: 'Backspace',
      Delete: 'Delete',
      Enter: 'Enter',
      Tab: 'Tab',
      Home: 'Home',
      End: 'End',
      PageUp: 'PgUp',
      PageDown: 'PgDn',
      Insert: 'Insert',
      Semicolon: ';',
      Quote: "'",
      Comma: ',',
      Period: '.',
      Slash: '/',
      Backslash: '\\',
      Minus: '-',
      Equal: '=',
      BracketLeft: '[',
      BracketRight: ']',
      Backquote: '`',
    };
    return String(combo || '')
      .split('+')
      .map((part) => {
        if (labels[part]) return labels[part];
        if (part.startsWith('Key')) return part.slice(3);
        if (part.startsWith('Digit')) return part.slice(5);
        if (part.startsWith('Numpad')) return `Num ${part.slice(6)}`;
        return part;
      })
      .join(' + ');
  }

  function shortcutConflict(combo, exceptId) {
    return SHORTCUT_ACTIONS.find(
      (action) => action.id !== exceptId && state.settings.shortcuts?.[action.id] === combo,
    );
  }

  function applyShortcutDefaults() {
    state.settings.shortcuts = { ...DEFAULT_SHORTCUTS };
    renderShortcutList();
    scheduleSave(true);
    showToast(t('快捷键已恢复默认'));
  }

  function renderShortcutList() {
    const fragment = document.createDocumentFragment();
    for (const action of SHORTCUT_ACTIONS) {
      const row = document.createElement('div');
      row.className = 'shortcut-row';
      const label = document.createElement('span');
      label.textContent = t(action.label);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'shortcut-key';
      button.dataset.shortcutAction = action.id;
      button.textContent = shortcutRecording === action.id
        ? t('按下新的快捷键…')
        : shortcutLabel(state.settings.shortcuts?.[action.id] || action.fallback);
      if (shortcutRecording === action.id) button.classList.add('recording');
      row.append(label, button);
      fragment.appendChild(row);
    }
    els.shortcutList.replaceChildren(fragment);
  }

  function renderBackground() {
    const background = state.settings?.background || defaultState.settings.background;
    const url = mediaUrl(background.path);
    els.listeningStage.classList.toggle('has-custom-background', Boolean(url));
    els.listeningStage.classList.toggle(
      'background-motion',
      Boolean(url) && background.motion !== false,
    );
    els.listeningStage.style.setProperty('--custom-bg-blur', `${Number(background.blur) || 0}px`);
    els.listeningStage.style.setProperty('--custom-bg-dim', String(Number(background.dim) || 0));
    els.customBackgroundImage.style.backgroundImage = url ? `url("${url}")` : 'none';
    els.customBackground.hidden = !url;
  }

  function applyOverlaySettings() {
    api.configureDesktopLyrics(state.settings.overlay).catch(() => {});
  }

  function renderSettings() {
    const settings = state.settings || defaultState.settings;
    const rate = clamp(settings.defaultRate, 0.5, 2);
    const volume = clamp(settings.defaultVolume, 0, 1);
    const volumePercent = Math.round(volume * 100);
    const background = settings.background || defaultState.settings.background;
    const blurPercent = (Number(background.blur) / 40) * 100;
    const dimPercent = (Number(background.dim) / 0.9) * 100;
    const overlay = settings.overlay || defaultState.settings.overlay;
    const overlayScalePercent = Math.round(Number(overlay.scale) * 100);
    const overlayOpacityPercent = Math.round(Number(overlay.opacity) * 100);
    const backgroundUrl = mediaUrl(background.path);
    $$('button', els.settingsRateOptions).forEach((button) => {
      button.classList.toggle(
        'selected',
        Math.abs(Number(button.dataset.settingsRate) - rate) < 0.001,
      );
    });
    $$('button', els.settingsThemeOptions).forEach((button) => {
      button.classList.toggle('selected', button.dataset.theme === settings.theme);
    });
    $$('button', els.settingsLanguageOptions).forEach((button) => {
      button.classList.toggle('selected', button.dataset.language === settings.language);
    });
    els.settingsVolumeSlider.value = String(volumePercent);
    els.settingsVolumeSlider.style.setProperty('--settings-volume', `${volumePercent}%`);
    els.settingsVolumeSlider.style.setProperty('--settings-fill', `${volumePercent}%`);
    els.settingsVolumeValue.textContent = `${volumePercent}%`;
    els.settingsSpectrumToggle.checked = settings.spectrumEnabled !== false;
    els.settingsBackgroundPreview.style.backgroundImage = backgroundUrl
      ? `url("${backgroundUrl}")`
      : '';
    els.settingsBackgroundPreview.classList.toggle('has-image', Boolean(backgroundUrl));
    els.settingsBackgroundBlur.value = String(Math.round(Number(background.blur) || 0));
    els.settingsBackgroundBlur.style.setProperty('--settings-fill', `${blurPercent}%`);
    els.settingsBackgroundBlurValue.textContent = `${Math.round(Number(background.blur) || 0)}px`;
    els.settingsBackgroundDim.value = String(Math.round((Number(background.dim) || 0) * 100));
    els.settingsBackgroundDim.style.setProperty('--settings-fill', `${dimPercent}%`);
    els.settingsBackgroundDimValue.textContent = `${Math.round((Number(background.dim) || 0) * 100)}%`;
    els.settingsBackgroundMotion.checked = background.motion !== false;
    els.clearBackgroundButton.disabled = !backgroundUrl;
    els.settingsOverlayScale.value = String(overlayScalePercent);
    els.settingsOverlayScale.style.setProperty('--settings-fill', `${((overlayScalePercent - 70) / 90) * 100}%`);
    els.settingsOverlayScaleValue.textContent = `${overlayScalePercent}%`;
    els.settingsOverlayOpacity.value = String(overlayOpacityPercent);
    els.settingsOverlayOpacity.style.setProperty('--settings-fill', `${overlayOpacityPercent}%`);
    els.settingsOverlayOpacityValue.textContent = `${overlayOpacityPercent}%`;
    els.settingsOverlayLocked.checked = Boolean(overlay.locked);
    els.settingsOverlayClickThrough.checked = Boolean(overlay.clickThrough);
    renderShortcutList();
    $$('.close-action-grid button', els.settingsCloseOptions).forEach((button) => {
      button.classList.toggle('selected', button.dataset.closeAction === settings.closeAction);
    });
  }

  function applyLanguage(language, options = {}) {
    if (!['en', 'zh-CN', 'zh-TW'].includes(language)) return;
    state.settings.language = language;
    window.quzhanI18n.setLanguage(language);
    applyTheme(state.settings.theme);
    renderTrack();
    renderQueue({ keepScroll: true });
    renderMode();
    renderSettings();
    updatePlayButton();
    updateProgressUI(audio.currentTime || 0, Number(audio.duration) || 0);
    if (!els.settingsBackdrop.hidden) refreshAssociationStatus();
    if (state.desktopLyrics) sendDesktopLyricsPayload();
    if (options.persist !== false) scheduleSave(true);
  }

  function applySpectrumSetting(enabled) {
    els.appShell.classList.toggle('spectrum-disabled', !enabled);
    if (enabled) {
      requestAnimationFrame(() => {
        resizeSpectrumCanvas();
        startSpectrumAnimation();
      });
    } else {
      stopSpectrumAnimation();
    }
  }

  async function refreshAssociationStatus() {
    try {
      associationStatus = await api.getAssociationStatus();
      if (!associationStatus?.registered) {
        els.defaultPlayerStatus.textContent = t('尚未在 Windows 中登记，点击右侧按钮完成登记');
      } else if (associationStatus.allDefault) {
        els.defaultPlayerStatus.textContent = t('曲栈已是全部支持格式的默认播放器');
      } else if (associationStatus.defaultCount > 0) {
        els.defaultPlayerStatus.textContent = t('已关联 {count} / {total} 种音频格式', {
          count: associationStatus.defaultCount,
          total: associationStatus.total,
        });
      } else {
        els.defaultPlayerStatus.textContent = t('已出现在“打开方式”中，尚未设为默认播放器');
      }
    } catch {
      els.defaultPlayerStatus.textContent = t('无法读取 Windows 文件关联状态');
    }
  }

  async function openWindowsDefaultApps() {
    els.defaultPlayerButton.disabled = true;
    try {
      await api.registerAssociations();
      const result = await api.openDefaultAppsSettings();
      showToast(
        result?.message || t('已打开 Windows 默认应用设置，请在系统界面确认曲栈'),
        { duration: 4600, error: !result?.ok },
      );
      setTimeout(refreshAssociationStatus, 900);
    } catch (error) {
      showToast(t('无法打开默认应用设置：{message}', {
        message: error.message || t('未知错误'),
      }), { error: true });
    } finally {
      els.defaultPlayerButton.disabled = false;
    }
  }

  function setCloseAction(action, options = {}) {
    if (!['ask', 'tray', 'quit'].includes(action)) return;
    state.settings.closeAction = action;
    renderSettings();
    if (options.persist !== false) scheduleSave(true);
    if (options.notify !== false) {
      const messages = {
        ask: '以后点击关闭按钮时会先询问',
        tray: '以后点击关闭按钮会最小化到托盘',
        quit: '以后点击关闭按钮会直接退出',
      };
      showToast(t(messages[action]));
    }
  }

  function openSettingsPanel() {
    renderSettings();
    refreshAssociationStatus();
    els.settingsBackdrop.hidden = false;
    els.settingsCloseButton.focus({ preventScroll: true });
  }

  function closeSettingsPanel() {
    shortcutRecording = null;
    els.settingsBackdrop.hidden = true;
  }

  function openCloseDialog() {
    if (closeDialogOpen) return;
    closeDialogOpen = true;
    const currentAction = state.settings?.closeAction;
    const selectedAction = currentAction === 'quit' ? 'quit' : 'tray';
    const selected = document.querySelector(
      `.close-choice input[name="closeChoice"][value="${selectedAction}"]`,
    );
    if (selected) selected.checked = true;
    els.rememberCloseChoice.checked = false;
    els.closeDialog.hidden = false;
    requestAnimationFrame(() => els.closeDialogCancel.focus({ preventScroll: true }));
  }

  function closeCloseDialog() {
    closeDialogOpen = false;
    els.closeDialog.hidden = true;
  }

  function confirmCloseAction() {
    const selected = document.querySelector('.close-choice input[name="closeChoice"]:checked');
    const action = selected?.value === 'quit' ? 'quit' : 'tray';
    if (els.rememberCloseChoice.checked) {
      setCloseAction(action, { notify: false });
    }
    closeCloseDialog();
    api.flushState(snapshotState()).catch(() => {});
    if (action === 'tray') {
      api.hideToTray();
    } else {
      api.quitApp();
    }
  }

  function renderVolume() {
    const volume = state.muted ? 0 : Number(state.volume);
    const percent = Math.round(clamp(volume, 0, 1) * 100);
    els.volumeSlider.value = String(percent);
    els.volumeSlider.style.setProperty('--volume', `${percent}%`);
    els.volumeButton.querySelector('use').setAttribute(
      'href',
      state.muted || volume === 0 ? '#i-volume-off' : '#i-volume',
    );
    els.volumeButton.title = state.muted ? t('取消静音') : t('静音');
  }

  function applyVolume() {
    const value = state.muted ? 0 : clamp(state.volume, 0, 1);
    audio.volume = value;
    audio.muted = Boolean(state.muted);
    renderVolume();
  }

  function renderQueueOpen() {
    const open = Boolean(state.queueOpen);
    els.appShell.classList.toggle('queue-collapsed', !open);
    els.queueToggle.title = open ? t('收起播放队列') : t('展开播放队列');
    els.titlebarQueueToggle.title = open ? t('收起播放队列') : t('展开播放队列');
    els.queuePanel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function toggleQueue(force) {
    state.queueOpen = typeof force === 'boolean' ? force : !state.queueOpen;
    renderQueueOpen();
    if (state.queueOpen) {
      setTimeout(() => scrollCurrentIntoView(), 90);
    }
    scheduleSave(true);
  }

  function setEmptyTrackUI() {
    els.trackTitle.textContent = t('还没有正在播放的歌');
    els.trackArtist.textContent = t('从队列里挑一首，或把音乐拖进来');
    els.trackAlbum.textContent = '';
    els.bylineDot.style.display = 'none';
    els.coverArt.removeAttribute('src');
    els.coverArt.style.visibility = 'hidden';
    els.coverFallback.style.display = 'flex';
    els.coverArtButton.classList.remove('playing');
    els.dockCover.classList.add('empty');
    els.dockCoverImage.removeAttribute('src');
    els.dockTrackTitle.textContent = t('还没有播放音乐');
    els.dockTrackArtist.textContent = t('播放队列已自动保存');
    els.atmosphereImage.style.backgroundImage = 'none';
    els.titlebarCenter.textContent = t('把每一次聆听留在原处');
    els.playButton.classList.remove('playing');
    els.playButton.title = t('播放');
    els.playButton.setAttribute('aria-label', t('播放'));
    els.vinylDisc.classList.remove('spinning');
    updateProgressUI(0, 0);
    resetAccent();
    updateSpectrumState(false);
    updateLyricsUI();
  }

  function renderTrack() {
    const item = currentItem();
    if (!item) {
      setEmptyTrackUI();
      return;
    }
    els.trackTitle.textContent = item.title;
    els.trackArtist.textContent = item.artist || t('未知艺术家');
    els.trackAlbum.textContent = item.album || '';
    els.bylineDot.style.display = item.album ? 'block' : 'none';
    els.dockTrackTitle.textContent = item.title;
    els.dockTrackArtist.textContent = item.artist || t('未知艺术家');
    els.titlebarCenter.textContent = t('正在播放 · {title}', { title: item.title });

    const cover = mediaUrl(item.coverPath);
    if (cover) {
      els.coverArt.src = cover;
      els.coverArt.style.visibility = 'visible';
      els.coverFallback.style.display = 'none';
      els.atmosphereImage.style.backgroundImage = `url("${cover.replaceAll('"', '\\"')}")`;
      els.dockCover.classList.remove('empty');
      els.dockCoverImage.src = cover;
      applyTheme(state.settings.theme);
    } else {
      els.coverArt.removeAttribute('src');
      els.coverArt.style.visibility = 'hidden';
      els.coverFallback.style.display = 'flex';
      els.atmosphereImage.style.backgroundImage = 'none';
      els.dockCover.classList.add('empty');
      applyTheme(state.settings.theme);
    }
    updateFacts();
  }

  function resetAccent() {
    document.documentElement.style.setProperty('--accent', '#e6a873');
    document.documentElement.style.setProperty('--accent-rgb', '230, 168, 115');
    document.documentElement.style.setProperty('--accent-soft', '#f3c79f');
    spectrumAccentRgb = '230, 168, 115';
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let rgb = [0, 0, 0];
    if (h < 60) rgb = [c, x, 0];
    else if (h < 120) rgb = [x, c, 0];
    else if (h < 180) rgb = [0, c, x];
    else if (h < 240) rgb = [0, x, c];
    else if (h < 300) rgb = [x, 0, c];
    else rgb = [c, 0, x];
    return rgb.map((value) => Math.round((value + m) * 255));
  }

  async function extractAccent(filePath) {
    if (!filePath || state.settings?.theme !== 'cover') return;
    const palette = await api.getCoverPalette(filePath);
    if (state.settings?.theme !== 'cover') return;
    if (!palette) return;
    const finalSaturation = clamp(Math.max(palette.saturation, 0.38), 0.35, 0.7);
    const finalLightness = clamp(palette.lightness + 0.12, 0.59, 0.72);
    const hue = palette.hue;
    const rgb = hslToRgb(hue, finalSaturation, finalLightness);
    const soft = hslToRgb(hue, clamp(finalSaturation - 0.08, 0.2, 0.6), clamp(finalLightness + 0.12, 0.7, 0.87));
    document.documentElement.style.setProperty('--accent', `rgb(${rgb.join(', ')})`);
    document.documentElement.style.setProperty('--accent-rgb', rgb.join(', '));
    document.documentElement.style.setProperty('--accent-soft', `rgb(${soft.join(', ')})`);
    spectrumAccentRgb = rgb.join(', ');
  }

  function parseLyrics(text) {
    const normalized = String(text || '')
      .replace(/^\uFEFF/, '')
      .replace(/\r\n?/g, '\n')
      .trim();
    if (!normalized) return { lines: [], timed: false };

    const offsetMatch = normalized.match(/^\[offset:([+-]?\d+)]/im);
    const offset = offsetMatch ? Number(offsetMatch[1]) / 1000 : 0;
    const timedLines = [];
    const plainLines = [];
    const timestampPattern = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?]/g;

    for (const rawLine of normalized.split('\n')) {
      const matches = [...rawLine.matchAll(timestampPattern)];
      const lineText = rawLine.replace(timestampPattern, '').trim();
      if (matches.length) {
        if (!lineText) continue;
        for (const match of matches) {
          const minutes = Number(match[1]);
          const seconds = Number(match[2]);
          const fraction = match[3] ? Number(`0.${match[3].padEnd(3, '0')}`) : 0;
          timedLines.push({
            time: Math.max(0, minutes * 60 + seconds + fraction + offset),
            text: lineText,
          });
        }
      } else if (lineText && !/^\[(ar|ti|al|by|re|ve|length):/i.test(rawLine.trim())) {
        plainLines.push(lineText);
      }
    }

    if (timedLines.length) {
      timedLines.sort((a, b) => a.time - b.time);
      return { lines: timedLines, timed: true };
    }

    return {
      lines: plainLines.map((line) => ({ time: null, text: line })),
      timed: false,
    };
  }

  function updateLyricsUI() {
    const item = currentItem();
    const emptyHeading = els.lyricsEmpty.querySelector('h2');
    const emptyCopy = els.lyricsEmpty.querySelector('p');
    if (!item) {
      els.lyricsEmpty.hidden = false;
      els.lyricsScroll.hidden = true;
      els.emptyQueueButton.hidden = false;
      emptyHeading.textContent = t('让声音慢下来');
      emptyCopy.textContent = t('歌曲内嵌歌词或同名 .lrc 文件会在这里逐行浮现。');
      els.lyricsSource.textContent = t('等待播放');
      els.lyricsPanel.classList.remove('plain');
      updateFacts();
      return;
    }

    lyricsModel = parseLyrics(item.lyrics);
    if (!lyricsModel.lines.length) {
      els.lyricsEmpty.hidden = false;
      els.lyricsScroll.hidden = true;
      els.emptyQueueButton.hidden = true;
      emptyHeading.textContent = t('这首歌没有歌词');
      emptyCopy.textContent = t('可以在音频文件里嵌入歌词，或在歌曲旁边放一个同名 .lrc 文件，再重新导入这首歌。');
      els.lyricsSource.textContent = t('暂无歌词');
      els.lyricsPanel.classList.remove('plain');
      updateFacts();
      return;
    }

    els.lyricsEmpty.hidden = true;
    els.lyricsScroll.hidden = false;
    els.lyricsPanel.classList.toggle('plain', !lyricsModel.timed);
    els.lyricsSource.textContent = lyricsModel.timed
      ? item.lyricsSource === 'sidecar'
        ? t('LRC · 本地文件')
        : t('同步歌词 · 内嵌')
      : t('未同步歌词');

    const fragment = document.createDocumentFragment();
    lyricsModel.lines.forEach((line, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lyric-line';
      button.dataset.index = String(index);
      if (line.time != null) {
        button.dataset.time = String(line.time);
        button.title = t('跳转到 {time}', { time: formatTime(line.time) });
      }
      button.innerHTML = lyricsModel.timed
        ? `<span class="lyric-time">${formatTime(line.time)}</span>${escapeHtml(line.text)}`
        : escapeHtml(line.text);
      fragment.appendChild(button);
    });
    els.lyricsContent.replaceChildren(fragment);
    currentLyricIndex = -1;
    els.lyricsScroll.scrollTop = 0;
    updateLyricsAtTime(audio.currentTime || 0, { force: true });
    updateFacts();
  }

  function findLyricIndex(time) {
    const lines = lyricsModel.lines;
    if (!lyricsModel.timed || !lines.length) return -1;
    let low = 0;
    let high = lines.length - 1;
    let result = -1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      if (lines[middle].time <= time + 0.03) {
        result = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    return result;
  }

  function updateLyricsAtTime(time, options = {}) {
    if (!lyricsModel.timed || !lyricsModel.lines.length) return;
    const index = findLyricIndex(time);
    if (index === currentLyricIndex && !options.force) return;
    currentLyricIndex = index;
    const lineNodes = $$('.lyric-line', els.lyricsContent);
    lineNodes.forEach((node, nodeIndex) => {
      node.classList.toggle('active', nodeIndex === index);
      node.classList.toggle('near', Math.abs(nodeIndex - index) === 1);
    });
    if (index >= 0 && lineNodes[index]) {
      lineNodes[index].scrollIntoView({
        block: 'center',
        behavior: options.force ? 'auto' : 'smooth',
      });
    }
  }

  function updateProgressUI(position, duration) {
    const safeDuration = Number.isFinite(duration) ? Math.max(0, duration) : 0;
    const safePosition = Number.isFinite(position) ? clamp(position, 0, safeDuration || 0) : 0;
    const ratio = safeDuration > 0 ? safePosition / safeDuration : 0;
    if (!isScrubbing) {
      els.progressSlider.value = String(Math.round(ratio * 1000));
      els.currentTime.textContent = formatTime(safePosition);
      els.progressSlider.style.setProperty('--progress', `${ratio * 100}%`);
    }
    els.durationTime.textContent = formatTime(safeDuration);
    let bufferedRatio = 0;
    if (safeDuration > 0 && audio.buffered?.length) {
      try {
        bufferedRatio = clamp(audio.buffered.end(audio.buffered.length - 1) / safeDuration, 0, 1);
      } catch {
        bufferedRatio = 0;
      }
    }
    els.progressBuffer.style.width = `${bufferedRatio * 100}%`;
    els.progressSlider.disabled = !currentItem();
  }

  function updatePlayButton() {
    const playing = !audio.paused && !audio.ended;
    els.playButton.classList.toggle('playing', playing);
    els.playButton.title = playing ? t('暂停') : t('播放');
    els.playButton.setAttribute('aria-label', playing ? t('暂停') : t('播放'));
    els.coverArtButton.classList.toggle('playing', playing);
    els.vinylDisc.classList.toggle('spinning', playing);
    const activeRow = els.queueList.querySelector('.queue-row.active');
    if (activeRow) activeRow.classList.toggle('paused', !playing);
    updateSpectrumState(playing);
  }

  function updateSpectrumState(playing = !audio.paused) {
    const hasTrack = Boolean(currentItem());
    els.spectrumStrip.classList.toggle('playing', playing);
    els.spectrumStatus.textContent = playing ? 'LIVE' : hasTrack ? 'PAUSED' : 'WAITING';
  }

  function ensureAudioGraph() {
    if (audioContext) {
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
      const sourceNode = audioContext.createMediaElementSource(audio);
      analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 512;
      analyserNode.smoothingTimeConstant = 0.62;
      analyserNode.minDecibels = -82;
      analyserNode.maxDecibels = -10;
      sourceNode.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
      frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
      startSpectrumAnimation();
    } catch (error) {
      console.warn('Audio spectrum is unavailable:', error);
      audioContext = null;
      analyserNode = null;
    }
  }

  function resizeSpectrumCanvas() {
    const rect = els.spectrumCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    spectrumWidth = rect.width;
    spectrumHeight = rect.height;
    spectrumDpr = Math.min(window.devicePixelRatio || 1, 2);
    els.spectrumCanvas.width = Math.round(spectrumWidth * spectrumDpr);
    els.spectrumCanvas.height = Math.round(spectrumHeight * spectrumDpr);
    const context = els.spectrumCanvas.getContext('2d');
    context.setTransform(spectrumDpr, 0, 0, spectrumDpr, 0, 0);
    spectrumHeights = [];
  }

  function drawSpectrum(timestamp) {
    spectrumFrame = requestAnimationFrame(drawSpectrum);
    if (document.hidden || !spectrumWidth || !spectrumHeight) return;
    const context = els.spectrumCanvas.getContext('2d');
    const barCount = Math.min(112, Math.max(42, Math.floor(spectrumWidth / 12)));
    if (spectrumHeights.length !== barCount) {
      spectrumHeights = new Array(barCount).fill(1.5);
    }

    const hasFrequencyData = Boolean(analyserNode && frequencyData && !audio.paused);
    if (hasFrequencyData) analyserNode.getByteFrequencyData(frequencyData);
    let bassLevel = 0;
    if (hasFrequencyData) {
      let bassSum = 0;
      const bassBins = Math.min(12, frequencyData.length);
      for (let index = 1; index < bassBins; index += 1) bassSum += frequencyData[index];
      bassLevel = bassSum / Math.max(1, bassBins - 1) / 255;
    }

    context.clearRect(0, 0, spectrumWidth, spectrumHeight);
    const baseline = spectrumHeight - 1;
    const maxBarHeight = Math.max(12, spectrumHeight - 14);
    const cellWidth = spectrumWidth / barCount;
    const barWidth = Math.max(1.2, cellWidth - Math.max(3, cellWidth * 0.32));
    const gradient = context.createLinearGradient(0, baseline, 0, baseline - maxBarHeight);
    gradient.addColorStop(0, `rgba(${spectrumAccentRgb}, 0.72)`);
    gradient.addColorStop(0.46, `rgba(${spectrumAccentRgb}, 0.42)`);
    gradient.addColorStop(1, 'rgba(241, 232, 219, 0.2)');
    context.fillStyle = gradient;

    for (let index = 0; index < barCount; index += 1) {
      let target;
      if (hasFrequencyData) {
        const normalized = Math.pow(index / Math.max(1, barCount - 1), 1.45);
        const bin = Math.min(
          frequencyData.length - 1,
          Math.floor(normalized * frequencyData.length * 0.78),
        );
        const spread = Math.max(1, Math.floor(frequencyData.length / barCount / 2));
        let sum = 0;
        let samples = 0;
        for (let offset = -spread; offset <= spread; offset += 1) {
          const sampleIndex = bin + offset;
          if (sampleIndex >= 0 && sampleIndex < frequencyData.length) {
            sum += frequencyData[sampleIndex];
            samples += 1;
          }
        }
        const level = samples ? sum / samples / 255 : 0;
        const energyBoost = 1 + bassLevel * 0.58;
        target = 1.5 + Math.min(1, Math.pow(level, 1.16) * energyBoost) * maxBarHeight;
      } else {
        target =
          1.7 +
          (Math.sin(timestamp * 0.0016 + index * 0.61) * 0.5 + 0.5) *
            (audio.paused ? 2.2 : 5.5);
      }
      const previous = spectrumHeights[index] || 1.5;
      const easing = target > previous ? 0.62 : 0.16;
      const height = previous + (target - previous) * easing;
      spectrumHeights[index] = height;
      const x = index * cellWidth + (cellWidth - barWidth) / 2;
      const y = baseline - Math.max(1.2, height);
      context.globalAlpha = 0.64 + Math.min(0.3, height / maxBarHeight);
      context.fillRect(x, y, barWidth, Math.max(1.2, height));
      context.globalAlpha = 0.48;
      context.fillStyle = 'rgba(246, 239, 228, 0.62)';
      context.fillRect(x, y, barWidth, 1);
      context.fillStyle = gradient;
    }
    context.globalAlpha = 0.16;
    context.fillStyle = 'rgba(240, 230, 216, 0.55)';
    context.fillRect(0, baseline, spectrumWidth, 1);
    context.globalAlpha = 1;
  }

  function startSpectrumAnimation() {
    if (spectrumFrame || document.hidden || state.settings?.spectrumEnabled === false) return;
    spectrumFrame = requestAnimationFrame(drawSpectrum);
  }

  function stopSpectrumAnimation() {
    if (!spectrumFrame) return;
    cancelAnimationFrame(spectrumFrame);
    spectrumFrame = null;
  }

  function updateMediaSession(item) {
    if (!('mediaSession' in navigator) || !item) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: item.title,
        artist: item.artist || t('未知艺术家'),
        album: item.album || '',
      });
    } catch {
      // Media Session metadata is optional.
    }
    if (item.coverPath) {
      const itemId = item.id;
      api
        .getCoverArtwork(item.coverPath)
        .then((artwork) => {
          if (!artwork || state.currentId !== itemId) return;
          navigator.mediaSession.metadata = new MediaMetadata({
            title: item.title,
            artist: item.artist || t('未知艺术家'),
            album: item.album || '',
            artwork: [{ src: artwork, sizes: '256x256' }],
          });
        })
        .catch(() => {});
    }
  }

  function updateMediaSessionPosition() {
    if (!('mediaSession' in navigator) || !currentItem()) return;
    const duration = Number(audio.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: audio.playbackRate || 1,
        position: Math.min(duration, Math.max(0, audio.currentTime || 0)),
      });
    } catch {
      // Some Chromium builds reject position updates while paused.
    }
  }

  function loadTrack(id, autoplay = false, options = {}) {
    const item = state.queue.find((entry) => entry.id === id);
    if (!item) return false;
    const sameTrack = state.currentId === id;
    state.currentId = id;
    if (!sameTrack) {
      state.currentTime = 0;
      pendingRestoreTime = Number(options.resumeTime) || 0;
    } else {
      pendingRestoreTime = Number(options.resumeTime) || 0;
    }
    audioErrorNotifiedFor = null;
    audio.src = mediaUrl(item.path);
    audio.playbackRate = Number(state.rate) || 1;
    audio.load();
    renderTrack();
    renderQueue({ keepScroll: true });
    updateLyricsUI();
    updateMediaSession(item);
    if (state.desktopLyrics) {
      sendDesktopLyricsPayload();
    }
    scheduleSave(true);
    scheduleCurrentIntoView();
    if (autoplay) {
      attemptPlay();
    }
    return true;
  }

  function attemptPlay() {
    ensureAudioGraph();
    if (!currentItem()) {
      if (state.queue.length) loadTrack(state.queue[0].id, false);
      else {
        addTracks();
        return;
      }
    }
    audio
      .play()
      .catch((error) => {
        updatePlayButton();
        if (error?.name !== 'AbortError') {
          showToast(t('无法开始播放，请检查文件是否仍然存在或格式是否受支持'), {
            error: true,
          });
        }
      });
  }

  function togglePlayPause() {
    if (!currentItem()) {
      if (state.queue.length) loadTrack(state.queue[0].id, true);
      else addTracks();
      return;
    }
    if (audio.paused) attemptPlay();
    else audio.pause();
  }

  function markPlayed(id, source = 'playback') {
    const item = state.queue.find((entry) => entry.id === id);
    if (!item || item.played) return;
    item.played = true;
    scheduleSave(true);
    renderQueue({ keepScroll: true });
    if (source === 'playback') {
      // The marker stays intentionally invisible in the list.
      updateFacts();
    }
  }

  function resetPlayedMarkers() {
    state.queue.forEach((item) => {
      item.played = false;
    });
    scheduleSave(true);
    renderQueue({ keepScroll: true });
  }

  function pickRandom(items, excludeId = null) {
    const candidates = excludeId && items.length > 1
      ? items.filter((item) => item.id !== excludeId)
      : items;
    if (!candidates.length) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function nextShuffleItem() {
    const currentId = state.currentId;
    let candidates = state.queue.filter((item) => !item.played && item.id !== currentId);
    if (!candidates.length) {
      const unplayedIncludingCurrent = state.queue.filter((item) => !item.played);
      if (unplayedIncludingCurrent.length === 1 && unplayedIncludingCurrent[0].id === currentId) {
        candidates = [unplayedIncludingCurrent[0]];
      }
    }
    if (candidates.length) return pickRandom(candidates);

    if (state.queue.length > 1) {
      resetPlayedMarkers();
      showToast(t('本轮已全部听完，已清空已听标记并开始新的一轮'));
      return pickRandom(state.queue, currentId);
    }
    return state.queue[0] || null;
  }

  function adjacentItem(direction = 1) {
    if (!state.queue.length) return null;
    let index = state.queue.findIndex((item) => item.id === state.currentId);
    if (index < 0) index = direction > 0 ? -1 : 0;
    const nextIndex = (index + direction + state.queue.length) % state.queue.length;
    return state.queue[nextIndex] || null;
  }

  function selectionAdjacentItem(direction = 1) {
    const selected = state.queue.filter((item) => state.selectionLoopIds.includes(item.id));
    if (!selected.length) return adjacentItem(direction);
    let index = selected.findIndex((item) => item.id === state.currentId);
    if (index < 0) index = direction > 0 ? -1 : 0;
    const nextIndex = (index + direction + selected.length) % selected.length;
    return selected[nextIndex];
  }

  function nextTrack(manual = true) {
    if (!state.queue.length) return;
    if (!manual && state.mode === 'repeat-one') {
      audio.currentTime = 0;
      attemptPlay();
      return;
    }

    let next = null;
    if (state.mode === 'shuffle') {
      next = nextShuffleItem();
    } else if (state.mode === 'selection') {
      next = selectionAdjacentItem(1);
    } else {
      next = adjacentItem(1);
    }
    if (next) {
      loadTrack(next.id, true);
    }
  }

  function previousTrack() {
    if (!currentItem()) {
      if (state.queue.length) loadTrack(state.queue[0].id, true);
      return;
    }
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    let previous = null;
    if (state.mode === 'selection') previous = selectionAdjacentItem(-1);
    else previous = adjacentItem(-1);
    if (previous) loadTrack(previous.id, true);
  }

  function seekBy(delta) {
    if (!currentItem()) return;
    const duration = Number(audio.duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    audio.currentTime = clamp(audio.currentTime + delta, 0, duration);
    state.currentTime = audio.currentTime;
    updateProgressUI(audio.currentTime, duration);
    updateLyricsAtTime(audio.currentTime);
    scheduleSave();
  }

  function setRate(rate) {
    state.rate = clamp(rate, 0.5, 2);
    audio.playbackRate = state.rate;
    audio.defaultPlaybackRate = state.rate;
    renderRate();
    closePopovers();
    scheduleSave(true);
    updateMediaSessionPosition();
  }

  async function addTracks() {
    if (importBusy) {
      showToast(t('正在导入上一批歌曲，请稍候'));
      return;
    }
    try {
      importBusy = true;
      const result = await api.importFromDialog(state.queue.map((item) => item.path));
      if (result) await handleImportResult(result);
    } catch (error) {
      showToast(t('导入失败：{message}', { message: error.message || t('无法打开文件') }), {
        error: true,
      });
    } finally {
      importBusy = false;
    }
  }

  async function addPaths(paths) {
    if (!paths?.length || importBusy) return null;
    try {
      importBusy = true;
      showToast(t('正在读取 {count} 个位置…', { count: paths.length }), { duration: 2100 });
      const result = await api.importPaths(
        paths,
        state.queue.map((item) => item.path),
      );
      await handleImportResult(result);
      return result;
    } catch (error) {
      showToast(t('导入失败：{message}', { message: error.message || t('无法读取文件') }), {
        error: true,
      });
      return null;
    } finally {
      importBusy = false;
    }
  }

  function pathKey(filePath) {
    return String(filePath || '').toLocaleLowerCase('en-US');
  }

  async function openExternalFiles(paths) {
    const requested = [...new Set((Array.isArray(paths) ? paths : []).filter(Boolean))];
    if (!requested.length) return;
    const missing = requested.filter(
      (filePath) =>
        !state.queue.some((item) => pathKey(item.path) === pathKey(filePath)),
    );
    if (missing.length) await addPaths(missing);
    const first = requested
      .map((filePath) =>
        state.queue.find((item) => pathKey(item.path) === pathKey(filePath)),
      )
      .find(Boolean);
    if (first) loadTrack(first.id, true);
  }

  async function handleImportResult(result) {
    const existing = new Set(state.queue.map((item) => pathKey(item.path)));
    const items = (Array.isArray(result?.items) ? result.items : []).filter((item) => {
      const key = pathKey(item.path);
      if (!key || existing.has(key)) return false;
      existing.add(key);
      return true;
    });
    if (items.length) {
      let nextImportOrder =
        state.queue.reduce((max, item) => {
          const value = Number(item.importOrder);
          return Number.isFinite(value) ? Math.max(max, value) : max;
        }, -1) + 1;
      for (const item of items) {
        if (!Number.isFinite(Number(item.importOrder))) {
          item.importOrder = nextImportOrder++;
        }
      }
      state.queue.push(...items);
      if (currentSortMode) markQueueCustomOrder();
      if (!state.currentId) {
        state.currentId = items[0].id;
        loadTrack(items[0].id, false);
      } else {
        renderQueue({ keepScroll: true });
      }
      scheduleSave(true);
      showToast(t('已加入 {count} 首歌曲，自动排到队尾', { count: items.length }));
    }
    if (result?.skipped) {
      showToast(t('已跳过 {count} 首已在队列中的歌曲', { count: result.skipped }));
    }
    if (result?.errors?.length) {
      const first = result.errors[0];
      const suffix = result.errors.length > 1
        ? t('另有 {count} 个失败', { count: result.errors.length - 1 })
        : '';
      showToast(
        `${first.message || t('部分文件导入失败')}${suffix}`,
        { error: true, duration: 4800 },
      );
    }
    if (!items.length && !result?.errors?.length) {
      if (!result?.skipped) showToast(t('没有找到可导入的音频文件'));
    }
  }

  function toggleQueueSelection(id, mode, event) {
    if (mode === 'toggle') {
      if (selectedIds.has(id)) selectedIds.delete(id);
      else selectedIds.add(id);
      selectionAnchorId = id;
    } else if (mode === 'range') {
      const entries = visibleQueueEntries();
      const anchor = selectionAnchorId || state.currentId || entries[0]?.item.id;
      let from = entries.findIndex((entry) => entry.item.id === anchor);
      const to = entries.findIndex((entry) => entry.item.id === id);
      if (from < 0) from = 0;
      if (from >= 0 && to >= 0) {
        const start = Math.min(from, to);
        const end = Math.max(from, to);
        if (!event.ctrlKey && !event.metaKey) selectedIds.clear();
        for (let index = start; index <= end; index += 1) {
          selectedIds.add(entries[index].item.id);
        }
      }
    }
    renderQueue({ keepScroll: true });
  }

  function selectAll() {
    const entries = visibleQueueEntries();
    if (!entries.length) return;
    if (entries.every((entry) => selectedIds.has(entry.item.id))) {
      selectedIds.clear();
    } else {
      selectedIds = new Set(entries.map((entry) => entry.item.id));
    }
    selectionAnchorId = entries[0]?.item.id || null;
    renderQueue({ keepScroll: true });
  }

  function moveSelected(edge) {
    if (!selectedIds.size) return;
    const selected = state.queue.filter((item) => selectedIds.has(item.id));
    const rest = state.queue.filter((item) => !selectedIds.has(item.id));
    state.queue = edge === 'top' ? [...selected, ...rest] : [...rest, ...selected];
    markQueueCustomOrder();
    renderQueue({ keepScroll: true });
    scheduleSave(true);
    showToast(t('已移到{edge}', { edge: t(edge === 'top' ? '队首' : '队尾') }));
  }

  function markSelected(played) {
    if (!selectedIds.size) {
      showToast(t('先在队列里选择歌曲'));
      return;
    }
    let changed = 0;
    state.queue.forEach((item) => {
      if (!selectedIds.has(item.id)) return;
      if (item.played !== played) changed += 1;
      item.played = played;
    });
    renderQueue({ keepScroll: true });
    scheduleSave(true);
    showToast(
      played
        ? t('已为 {count} 首歌打上已听标记', { count: selectedIds.size })
        : t('已清除 {count} 首歌的已听标记', { count: selectedIds.size }),
    );
    if (!changed) {
      // The operation is still useful and idempotent; no extra UI noise.
    }
  }

  function loopSelected() {
    if (!selectedIds.size) {
      showToast(t('先选中想循环的歌曲'));
      return;
    }
    state.selectionLoopIds = state.queue
      .filter((item) => selectedIds.has(item.id))
      .map((item) => item.id);
    if (state.mode !== 'selection') {
      state.mode = 'selection';
      renderMode();
    }
    const currentInLoop = state.selectionLoopIds.includes(state.currentId);
    if (!currentInLoop && state.selectionLoopIds.length) {
      loadTrack(state.selectionLoopIds[0], !audio.paused);
    }
    updateSelectionModeHint();
    renderQueue({ keepScroll: true });
    scheduleSave(true);
    showToast(t('已设置循环 {count} 首歌曲', { count: state.selectionLoopIds.length }));
  }

  function removeSelected() {
    if (!selectedIds.size) return;
    const removeCount = selectedIds.size;
    const wasPlaying = !audio.paused;
    const currentRemoved = selectedIds.has(state.currentId);
    const oldCurrentIndex = state.queue.findIndex((item) => item.id === state.currentId);
    state.queue = state.queue.filter((item) => !selectedIds.has(item.id));
    state.selectionLoopIds = state.selectionLoopIds.filter((id) => !selectedIds.has(id));
    if (state.mode === 'selection' && !state.selectionLoopIds.length) {
      state.mode = 'sequential';
      renderMode();
    }
    selectedIds.clear();

    if (currentRemoved) {
      const next =
        state.queue[Math.min(Math.max(oldCurrentIndex, 0), state.queue.length - 1)] ||
        state.queue[0] ||
        null;
      if (next) {
        loadTrack(next.id, wasPlaying);
      } else {
        stopPlayback();
        state.currentId = null;
        renderQueue();
        setEmptyTrackUI();
        if (state.desktopLyrics) toggleDesktopLyrics(false);
      }
    } else {
      renderQueue({ keepScroll: true });
    }
    scheduleSave(true);
    showToast(t('已从队列移除 {count} 首', { count: removeCount }));
    setTimeout(() => api.cleanupCovers().catch(() => {}), 500);
  }

  function stopPlayback() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    updatePlayButton();
  }

  function clearQueue() {
    const count = state.queue.length;
    askConfirm({
      title: t('清空播放队列？'),
      message: t('队列中的 {count} 首歌和本轮已听标记都会被清除。音乐文件本身不会被删除。', {
        count,
      }),
      acceptText: t('清空队列'),
      onAccept: () => {
        closeConfirm();
        stopPlayback();
        state.queue = [];
        state.currentId = null;
        state.currentTime = 0;
        state.mode = 'sequential';
        state.selectionLoopIds = [];
        selectedIds.clear();
        lyricsModel = { lines: [], timed: false, source: '' };
        setEmptyTrackUI();
        renderQueue();
        renderMode();
        if (state.desktopLyrics) toggleDesktopLyrics(false);
        scheduleSave(true);
        showToast(t('播放队列已清空'));
        setTimeout(() => api.cleanupCovers().catch(() => {}), 500);
      },
    });
  }

  function clearAllMarkers() {
    if (!state.queue.length) return;
    state.queue.forEach((item) => {
      item.played = false;
    });
    renderQueue({ keepScroll: true });
    scheduleSave(true);
    showToast(t('已清除全部已听标记，新一轮随机从现在开始'));
  }

  function reorderQueue(draggedId, targetId, before) {
    if (!draggedId || !targetId || draggedId === targetId) return;
    const fromIndex = state.queue.findIndex((item) => item.id === draggedId);
    if (fromIndex < 0) return;
    const [item] = state.queue.splice(fromIndex, 1);
    let targetIndex = state.queue.findIndex((entry) => entry.id === targetId);
    if (targetIndex < 0) targetIndex = state.queue.length;
    else if (!before) targetIndex += 1;
    state.queue.splice(targetIndex, 0, item);
    markQueueCustomOrder();
    renderQueue({ keepScroll: true });
    scheduleSave(true);
  }

  function beginReorder(pointerId, row, clientY) {
    if (!row) return;
    reorderState = {
      id: row.dataset.id,
      row,
      pointerId,
      startY: clientY,
      targetId: null,
      before: true,
      lastY: clientY,
    };
    row.classList.add('dragging');
    document.body.classList.add('reordering');
    window.getSelection()?.removeAllRanges();
  }

  function clearReorderIndicators() {
    $$('.queue-row.drag-before, .queue-row.drag-after', els.queueList).forEach((row) => {
      row.classList.remove('drag-before', 'drag-after');
    });
  }

  function finishReorder(cancelled = false) {
    if (!reorderState) return;
    const { id, targetId, before, row } = reorderState;
    row?.classList.remove('dragging');
    clearReorderIndicators();
    document.body.classList.remove('reordering');
    reorderState = null;
    if (!cancelled && targetId) {
      reorderQueue(id, targetId, before);
      suppressClickUntil = Date.now() + 300;
    } else if (!cancelled) {
      suppressClickUntil = Date.now() + 300;
    }
  }

  function handlePointerMove(event) {
    if (pressState && !reorderState) {
      const distance = Math.hypot(
        event.clientX - pressState.startX,
        event.clientY - pressState.startY,
      );
      if (distance > 6) {
        clearTimeout(pressState.timer);
        pressState = null;
      }
      return;
    }
    if (!reorderState || event.pointerId !== reorderState.pointerId) return;
    event.preventDefault();

    const rowUnderPointer = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest('.queue-row');
    clearReorderIndicators();
    if (rowUnderPointer && rowUnderPointer !== reorderState.row) {
      const rect = rowUnderPointer.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      reorderState.targetId = rowUnderPointer.dataset.id;
      reorderState.before = before;
      rowUnderPointer.classList.add(before ? 'drag-before' : 'drag-after');
    } else {
      reorderState.targetId = null;
    }

    const listRect = els.queueList.getBoundingClientRect();
    if (event.clientY < listRect.top + 32) {
      els.queueList.scrollTop -= 9;
    } else if (event.clientY > listRect.bottom - 32) {
      els.queueList.scrollTop += 9;
    }
  }

  function handlePointerUp(event) {
    if (pressState) {
      clearTimeout(pressState.timer);
      pressState = null;
    }
    if (reorderState && event.pointerId === reorderState.pointerId) {
      finishReorder(false);
    }
  }

  function openModePopover() {
    closePopovers();
    renderMode();
    els.modePopover.hidden = false;
  }

  function openRatePopover() {
    closePopovers();
    els.ratePopover.hidden = false;
  }

  function openQueueMenu() {
    closePopovers();
    els.queueMenu.hidden = false;
  }

  function openSortPopover() {
    closePopovers();
    renderSortOptions();
    els.sortPopover.hidden = false;
  }

  function closePopovers() {
    els.modePopover.hidden = true;
    els.ratePopover.hidden = true;
    els.queueMenu.hidden = true;
    els.sortPopover.hidden = true;
  }

  function showDesktopLyricsButtonState(active) {
    els.desktopLyricsButton.classList.toggle('active', active);
    els.desktopLyricsButton.querySelector('span').textContent = active
      ? t('关闭桌面歌词')
      : t('桌面歌词');
    els.desktopLyricsShortcut.classList.toggle('active', active);
  }

  function desktopLyricsPayload() {
    const item = currentItem();
    if (!item) return null;
    const rootStyles = getComputedStyle(document.documentElement);
    return {
      id: item.id,
      title: item.title,
      artist: item.artist || '',
      language: state.settings.language || 'zh-CN',
      timed: Boolean(lyricsModel.timed),
      accent: rootStyles.getPropertyValue('--accent').trim(),
      accentRgb: rootStyles.getPropertyValue('--accent-rgb').trim(),
      lines: lyricsModel.lines.map((line) => ({
        time: line.time,
        text: line.text,
      })),
    };
  }

  function sendDesktopLyricsPayload() {
    const payload = desktopLyricsPayload();
    if (!payload) return;
    api.showDesktopLyrics(payload).catch(() => {
      showToast(t('桌面歌词窗口打开失败'), { error: true });
    });
    showDesktopLyricsButtonState(true);
    startOverlayUpdates();
  }

  function toggleDesktopLyrics(force) {
    const active = typeof force === 'boolean' ? force : !state.desktopLyrics;
    if (!active) {
      state.desktopLyrics = false;
      api.hideDesktopLyrics().catch(() => {});
      showDesktopLyricsButtonState(false);
      stopOverlayUpdates();
      scheduleSave(true);
      return;
    }
    if (!currentItem()) {
      showToast(t('先播放一首带歌词的歌，再打开桌面歌词'));
      return;
    }
    if (!lyricsModel.timed) {
      showToast(
        lyricsModel.lines.length
          ? t('桌面歌词需要在歌词中加入时间轴，或使用同名 .lrc 文件')
          : t('这首歌还没有歌词，暂时无法显示桌面歌词'),
      );
      return;
    }
    state.desktopLyrics = true;
    sendDesktopLyricsPayload();
    api.updateDesktopLyrics({
      time: audio.currentTime || 0,
      playing: !audio.paused,
    });
    scheduleSave(true);
  }

  function startOverlayUpdates() {
    stopOverlayUpdates();
    overlayTimer = setInterval(() => {
      if (!state.desktopLyrics) return;
      api.updateDesktopLyrics({
        time: audio.currentTime || 0,
        playing: !audio.paused,
      });
    }, 120);
  }

  function stopOverlayUpdates() {
    if (overlayTimer) clearInterval(overlayTimer);
    overlayTimer = null;
  }

  function updateWindowMaximizeIcon(maximized) {
    const use = els.windowMaximize.querySelector('use');
    use.setAttribute('href', maximized ? '#i-restore' : '#i-square');
    els.windowMaximize.setAttribute('aria-label', maximized ? t('还原') : t('最大化'));
  }

  function updateAll() {
    renderQueue({ keepScroll: true });
    renderTrack();
    renderMode();
    renderRate();
    renderBackground();
    applyVolume();
    renderQueueOpen();
    updatePlayButton();
    const duration = Number(audio.duration) || currentItem()?.duration || 0;
    updateProgressUI(audio.currentTime || 0, duration);
  }

  function bindEvents() {
    els.coverArt.addEventListener('error', () => {
      els.coverArt.style.visibility = 'hidden';
      els.coverFallback.style.display = 'flex';
      els.atmosphereImage.style.backgroundImage = 'none';
    });
    els.dockCoverImage.addEventListener('error', () => {
      els.dockCoverImage.removeAttribute('src');
      els.dockCover.classList.add('empty');
    });
    els.addTracksButton.addEventListener('click', addTracks);
    els.queueEmptyAddButton.addEventListener('click', addTracks);
    els.emptyQueueButton.addEventListener('click', addTracks);
    els.queueCollapseButton.addEventListener('click', () => toggleQueue(false));
    els.queueToggle.addEventListener('click', () => toggleQueue());
    els.titlebarQueueToggle.addEventListener('click', () => toggleQueue());
    els.selectAllButton.addEventListener('click', selectAll);
    els.clearSelectionButton.addEventListener('click', () => {
      selectedIds.clear();
      renderQueue({ keepScroll: true });
    });
    els.moveTopButton.addEventListener('click', () => moveSelected('top'));
    els.moveBottomButton.addEventListener('click', () => moveSelected('bottom'));
    els.markPlayedButton.addEventListener('click', () => markSelected(true));
    els.unmarkPlayedButton.addEventListener('click', () => markSelected(false));
    els.loopSelectionButton.addEventListener('click', loopSelected);
    els.removeTracksButton.addEventListener('click', removeSelected);

    els.queueMenuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (els.queueMenu.hidden) openQueueMenu();
      else els.queueMenu.hidden = true;
    });
    els.queueMenu.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      els.queueMenu.hidden = true;
      if (button.dataset.action === 'clear-markers') clearAllMarkers();
      if (button.dataset.action === 'clear-queue') clearQueue();
    });
    els.queueSortButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (els.sortPopover.hidden) openSortPopover();
      else els.sortPopover.hidden = true;
    });
    els.queueLocateButton.addEventListener('click', () => {
      if (!currentItem()) {
        showToast(t('当前还没有播放歌曲'));
        return;
      }
      scrollCurrentIntoView({ expand: true, highlight: true, clearFilters: true });
    });
    els.sortPopoverClose.addEventListener('click', () => {
      els.sortPopover.hidden = true;
    });
    els.sortPopover.addEventListener('click', (event) => event.stopPropagation());
    $$('.sort-option', els.sortPopover).forEach((button) => {
      button.addEventListener('click', () => sortQueue(button.dataset.sort));
    });
    els.queueSearchInput.addEventListener('input', () => {
      queueSearchQuery = els.queueSearchInput.value;
      clearTimeout(queueSearchTimer);
      queueSearchTimer = setTimeout(() => renderQueue({ keepScroll: true }), 70);
    });
    els.queueSearchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        queueSearchQuery = '';
        clearTimeout(queueSearchTimer);
        els.queueSearchInput.value = '';
        renderQueue({ keepScroll: true });
      }
    });
    els.clearQueueSearch.addEventListener('click', () => {
      queueSearchQuery = '';
      clearTimeout(queueSearchTimer);
      els.queueSearchInput.value = '';
      els.queueSearchInput.focus();
      renderQueue({ keepScroll: true });
    });
    els.queueFilterOptions.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-queue-filter]');
      if (!button) return;
      queuePlayedFilter = button.dataset.queueFilter;
      $$('button', els.queueFilterOptions).forEach((entry) => {
        entry.classList.toggle('selected', entry === button);
      });
      renderQueue({ keepScroll: true });
    });
    els.clearQueueFiltersButton.addEventListener('click', resetQueueFilters);

    els.playButton.addEventListener('click', togglePlayPause);
    els.coverArtButton.addEventListener('click', togglePlayPause);
    els.prevButton.addEventListener('click', previousTrack);
    els.nextButton.addEventListener('click', () => nextTrack(true));
    els.rewindButton.addEventListener('click', () => seekBy(-10));
    els.forwardButton.addEventListener('click', () => seekBy(10));

    els.modeButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (els.modePopover.hidden) openModePopover();
      else els.modePopover.hidden = true;
    });
    els.modePopoverClose.addEventListener('click', () => {
      els.modePopover.hidden = true;
    });
    $$('.mode-option', els.modePopover).forEach((button) => {
      button.addEventListener('click', () => {
        if (setMode(button.dataset.mode, { notify: true })) {
          els.modePopover.hidden = true;
        }
      });
    });

    els.rateButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (els.ratePopover.hidden) openRatePopover();
      else els.ratePopover.hidden = true;
    });
    $$('button', els.rateOptions).forEach((button) => {
      button.addEventListener('click', () => setRate(Number(button.dataset.rate)));
    });
    els.ratePopover.addEventListener('click', (event) => event.stopPropagation());

    els.volumeButton.addEventListener('click', () => {
      if (state.muted || state.volume === 0) {
        state.muted = false;
        if (state.volume === 0) state.volume = lastSavedVolume || 0.7;
      } else {
        lastSavedVolume = state.volume;
        state.muted = true;
      }
      applyVolume();
      scheduleSave(true);
    });
    els.volumeSlider.addEventListener('input', () => {
      state.volume = clamp(Number(els.volumeSlider.value) / 100, 0, 1);
      state.muted = false;
      if (state.volume > 0) lastSavedVolume = state.volume;
      applyVolume();
    });
    els.volumeSlider.addEventListener('change', () => scheduleSave(true));

    els.progressSlider.addEventListener('input', () => {
      isScrubbing = true;
      const duration = Number(audio.duration) || currentItem()?.duration || 0;
      const ratio = Number(els.progressSlider.value) / 1000;
      const time = ratio * duration;
      els.progressSlider.style.setProperty('--progress', `${ratio * 100}%`);
      els.currentTime.textContent = formatTime(time);
    });
    els.progressSlider.addEventListener('change', () => {
      const duration = Number(audio.duration) || currentItem()?.duration || 0;
      const ratio = Number(els.progressSlider.value) / 1000;
      if (duration > 0) {
        audio.currentTime = clamp(ratio * duration, 0, duration);
        state.currentTime = audio.currentTime;
        updateLyricsAtTime(audio.currentTime);
      }
      isScrubbing = false;
      updateProgressUI(audio.currentTime || 0, duration);
      scheduleSave();
    });

    els.desktopLyricsButton.addEventListener('click', () => toggleDesktopLyrics());
    els.desktopLyricsShortcut.addEventListener('click', () => toggleDesktopLyrics());
    els.settingsButton.addEventListener('click', openSettingsPanel);
    els.settingsCloseButton.addEventListener('click', closeSettingsPanel);
    els.settingsBackdrop.addEventListener('click', (event) => {
      if (event.target === els.settingsBackdrop) closeSettingsPanel();
    });
    $$('button', els.settingsRateOptions).forEach((button) => {
      button.addEventListener('click', () => {
        const rate = Number(button.dataset.settingsRate);
        state.settings.defaultRate = rate;
        setRate(rate);
        renderSettings();
        scheduleSave(true);
      });
    });
    els.settingsVolumeSlider.addEventListener('input', () => {
      const volume = clamp(Number(els.settingsVolumeSlider.value) / 100, 0, 1);
      state.settings.defaultVolume = volume;
      state.volume = volume;
      state.muted = false;
      lastSavedVolume = volume || lastSavedVolume;
      applyVolume();
      renderSettings();
    });
    els.settingsVolumeSlider.addEventListener('change', () => scheduleSave(true));
    els.settingsSpectrumToggle.addEventListener('change', () => {
      state.settings.spectrumEnabled = els.settingsSpectrumToggle.checked;
      applySpectrumSetting(state.settings.spectrumEnabled);
      scheduleSave(true);
    });
    $$('button', els.settingsThemeOptions).forEach((button) => {
      button.addEventListener('click', () => {
        state.settings.theme = button.dataset.theme;
        applyTheme(state.settings.theme);
        renderSettings();
        if (state.desktopLyrics) sendDesktopLyricsPayload();
        scheduleSave(true);
      });
    });
    $$('button', els.settingsLanguageOptions).forEach((button) => {
      button.addEventListener('click', () => applyLanguage(button.dataset.language));
    });
    els.importBackgroundButton.addEventListener('click', async () => {
      els.importBackgroundButton.disabled = true;
      try {
        const result = await api.importBackground();
        if (result?.ok) {
          state.settings.background.path = result.path;
          renderBackground();
          renderSettings();
          scheduleSave(true);
          showToast(t('背景已导入'));
        } else if (result?.code === 'UNSUPPORTED_IMAGE') {
          showToast(t('图片格式不受支持'), { error: true });
        }
      } catch (error) {
        showToast(t('导入失败：{message}', {
          message: error.message || t('未知错误'),
        }), { error: true });
      } finally {
        els.importBackgroundButton.disabled = false;
      }
    });
    els.clearBackgroundButton.addEventListener('click', async () => {
      state.settings.background.path = '';
      await api.clearBackground().catch(() => {});
      renderBackground();
      renderSettings();
      scheduleSave(true);
      showToast(t('已移除背景'));
    });
    els.settingsBackgroundBlur.addEventListener('input', () => {
      state.settings.background.blur = Number(els.settingsBackgroundBlur.value);
      els.settingsBackgroundBlurValue.textContent = `${state.settings.background.blur}px`;
      renderBackground();
    });
    els.settingsBackgroundBlur.addEventListener('change', () => scheduleSave(true));
    els.settingsBackgroundDim.addEventListener('input', () => {
      state.settings.background.dim = Number(els.settingsBackgroundDim.value) / 100;
      els.settingsBackgroundDimValue.textContent = `${els.settingsBackgroundDim.value}%`;
      renderBackground();
    });
    els.settingsBackgroundDim.addEventListener('change', () => scheduleSave(true));
    els.settingsBackgroundMotion.addEventListener('change', () => {
      state.settings.background.motion = els.settingsBackgroundMotion.checked;
      renderBackground();
      scheduleSave(true);
    });
    els.shortcutList.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-shortcut-action]');
      if (!button) return;
      shortcutRecording = button.dataset.shortcutAction;
      renderShortcutList();
      const next = els.shortcutList.querySelector(
        `button[data-shortcut-action="${shortcutRecording}"]`,
      );
      next?.focus();
    });
    els.resetShortcutsButton.addEventListener('click', applyShortcutDefaults);
    els.settingsOverlayScale.addEventListener('input', () => {
      state.settings.overlay.scale = Number(els.settingsOverlayScale.value) / 100;
      els.settingsOverlayScaleValue.textContent = `${els.settingsOverlayScale.value}%`;
      applyOverlaySettings();
    });
    els.settingsOverlayScale.addEventListener('change', () => scheduleSave(true));
    els.settingsOverlayOpacity.addEventListener('input', () => {
      state.settings.overlay.opacity = Number(els.settingsOverlayOpacity.value) / 100;
      els.settingsOverlayOpacityValue.textContent = `${els.settingsOverlayOpacity.value}%`;
      applyOverlaySettings();
    });
    els.settingsOverlayOpacity.addEventListener('change', () => scheduleSave(true));
    els.settingsOverlayLocked.addEventListener('change', () => {
      state.settings.overlay.locked = els.settingsOverlayLocked.checked;
      applyOverlaySettings();
      scheduleSave(true);
    });
    els.settingsOverlayClickThrough.addEventListener('change', () => {
      state.settings.overlay.clickThrough = els.settingsOverlayClickThrough.checked;
      applyOverlaySettings();
      scheduleSave(true);
    });
    $$('.close-action-grid button', els.settingsCloseOptions).forEach((button) => {
      button.addEventListener('click', () => setCloseAction(button.dataset.closeAction));
    });
    els.defaultPlayerButton.addEventListener('click', openWindowsDefaultApps);
    els.openUserDataButton.addEventListener('click', () => {
      api.openUserData().catch(() => showToast(t('无法打开应用数据目录'), { error: true }));
    });
    els.closeDialogCancel.addEventListener('click', closeCloseDialog);
    els.closeDialogConfirm.addEventListener('click', confirmCloseAction);
    els.closeDialog.addEventListener('click', (event) => {
      if (event.target === els.closeDialog) closeCloseDialog();
    });
    els.dockMoreButton.addEventListener('click', () => {
      const item = currentItem();
      if (item) api.revealFile(item.path);
      else showToast(t('当前还没有播放歌曲'));
    });

    els.windowMinimize.addEventListener('click', () => api.minimize());
    els.windowMaximize.addEventListener('click', () => api.toggleMaximize());
    els.windowClose.addEventListener('click', async () => {
      await api.flushState(snapshotState()).catch(() => {});
      api.closeWindow();
    });

    els.confirmCancel.addEventListener('click', closeConfirm);
    els.confirmAccept.addEventListener('click', () => {
      const callback = confirmCallback;
      if (callback) callback();
    });
    els.confirmDialog.addEventListener('click', (event) => {
      if (event.target === els.confirmDialog) closeConfirm();
    });

    els.queueList.addEventListener('click', (event) => {
      if (Date.now() < suppressClickUntil) return;
      const row = event.target.closest('.queue-row');
      if (!row) return;
      const id = row.dataset.id;
      if (event.ctrlKey || event.metaKey) {
        toggleQueueSelection(id, 'toggle', event);
        return;
      }
      if (event.shiftKey) {
        toggleQueueSelection(id, 'range', event);
        return;
      }
      if (event.target.closest('.drag-handle')) return;
      const hadSelection = selectedIds.size > 0;
      selectedIds.clear();
      if (hadSelection) renderQueue({ keepScroll: true });
      else renderSelection();
      if (state.currentId === id) {
        togglePlayPause();
      } else {
        loadTrack(id, true);
      }
    });

    els.queueList.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const row = event.target.closest('.queue-row');
      if (!row) return;
      const onHandle = Boolean(event.target.closest('.drag-handle'));
      pressState = {
        row,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        timer: setTimeout(
          () => {
            if (!pressState) return;
            beginReorder(pressState.pointerId, pressState.row, pressState.startY);
            pressState = null;
          },
          onHandle ? 0 : 285,
        ),
      };
      if (onHandle) {
        clearTimeout(pressState.timer);
        beginReorder(event.pointerId, row, event.clientY);
        pressState = null;
      }
    });

    document.addEventListener('pointermove', handlePointerMove, { passive: false });
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', () => {
      if (pressState) clearTimeout(pressState.timer);
      pressState = null;
      finishReorder(true);
    });

    els.queueList.addEventListener('keydown', (event) => {
      const row = event.target.closest('.queue-row');
      if (!row) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        loadTrack(row.dataset.id, true);
      }
      if (event.key === 'Delete' && selectedIds.size) {
        event.preventDefault();
        removeSelected();
      }
    });

    els.queuePanel.addEventListener('dragenter', (event) => {
      if (!event.dataTransfer?.types?.includes('Files')) return;
      event.preventDefault();
      dragDepth += 1;
      els.queuePanel.classList.add('drag-over');
    });
    els.queuePanel.addEventListener('dragover', (event) => {
      if (!event.dataTransfer?.types?.includes('Files')) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    });
    els.queuePanel.addEventListener('dragleave', () => {
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) els.queuePanel.classList.remove('drag-over');
    });
    els.queuePanel.addEventListener('drop', async (event) => {
      event.preventDefault();
      dragDepth = 0;
      els.queuePanel.classList.remove('drag-over');
      const files = [...(event.dataTransfer?.files || [])];
      const paths = files.map((file) => api.getPathForFile(file)).filter(Boolean);
      if (paths.length) await addPaths(paths);
    });
    window.addEventListener('dragover', (event) => {
      if (event.dataTransfer?.types?.includes('Files')) event.preventDefault();
    });
    window.addEventListener('drop', (event) => {
      if (event.dataTransfer?.types?.includes('Files')) event.preventDefault();
    });

    els.lyricsContent.addEventListener('click', (event) => {
      const line = event.target.closest('.lyric-line[data-time]');
      if (!line) return;
      const time = Number(line.dataset.time);
      const duration = Number(audio.duration);
      if (Number.isFinite(time) && Number.isFinite(duration)) {
        audio.currentTime = clamp(time, 0, duration);
        updateLyricsAtTime(audio.currentTime);
        updateProgressUI(audio.currentTime, duration);
      }
    });

    document.addEventListener('click', (event) => {
      if (shortcutRecording && !event.target.closest('.shortcut-key')) {
        shortcutRecording = null;
        renderShortcutList();
      }
      if (
        !els.modePopover.contains(event.target) &&
        !els.modeButton.contains(event.target) &&
        !els.ratePopover.contains(event.target) &&
        !els.rateButton.contains(event.target) &&
        !els.queueMenu.contains(event.target) &&
        !els.queueMenuButton.contains(event.target) &&
        !els.sortPopover.contains(event.target) &&
        !els.queueSortButton.contains(event.target)
      ) {
        closePopovers();
      }
    });

    document.addEventListener('keydown', (event) => {
      const tag = event.target?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable;
      if (shortcutRecording) {
        event.preventDefault();
        event.stopPropagation();
        if (event.key === 'Escape') {
          shortcutRecording = null;
          renderShortcutList();
          return;
        }
        const combo = shortcutFromEvent(event);
        if (!combo) return;
        const actionId = shortcutRecording;
        const conflict = shortcutConflict(combo, actionId);
        if (conflict) {
          showToast(t('这个快捷键已用于“{action}”', { action: t(conflict.label) }), {
            error: true,
          });
          return;
        }
        state.settings.shortcuts[actionId] = combo;
        shortcutRecording = null;
        renderShortcutList();
        scheduleSave(true);
        showToast(t('快捷键已更新'));
        return;
      }
      if (event.key === 'Escape') {
        if (!els.closeDialog.hidden) {
          closeCloseDialog();
          return;
        }
        if (!els.settingsBackdrop.hidden) {
          closeSettingsPanel();
          return;
        }
        if (!els.confirmDialog.hidden) closeConfirm();
        closePopovers();
        return;
      }
      if (!els.closeDialog.hidden || !els.settingsBackdrop.hidden) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        els.queueSearchInput.focus();
        return;
      }
      if (typing) return;
      const combo = shortcutFromEvent(event);
      const shortcuts = state.settings.shortcuts || DEFAULT_SHORTCUTS;
      const isQueueRow = Boolean(event.target?.closest?.('.queue-row'));
      if (combo === shortcuts.playPause && !isQueueRow) {
        event.preventDefault();
        if (!event.repeat) togglePlayPause();
        return;
      }
      if (combo === shortcuts.next) {
        event.preventDefault();
        if (!event.repeat) nextTrack(true);
        return;
      }
      if (combo === shortcuts.previous) {
        event.preventDefault();
        if (!event.repeat) previousTrack();
        return;
      }
      if (combo === shortcuts.seekForward) {
        event.preventDefault();
        seekBy(10);
        return;
      }
      if (combo === shortcuts.seekBackward) {
        event.preventDefault();
        seekBy(-10);
        return;
      }
      if (combo === shortcuts.desktopLyrics) {
        event.preventDefault();
        if (!event.repeat) toggleDesktopLyrics();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
        if (state.queue.length && state.queueOpen) {
          event.preventDefault();
          selectAll();
        }
      }
      if (event.key === 'MediaPlayPause') {
        event.preventDefault();
        togglePlayPause();
      }
    });

    els.confirmAccept.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        els.confirmAccept.click();
      }
    });

    window.addEventListener('beforeunload', flushState);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        flushState();
        stopSpectrumAnimation();
      } else {
        resizeSpectrumCanvas();
        startSpectrumAnimation();
      }
    });

    api.onWindowMaximized(updateWindowMaximizeIcon);
    api.onDesktopLyricsVisibility((visible) => {
      state.desktopLyrics = visible;
      showDesktopLyricsButtonState(visible);
      if (visible) startOverlayUpdates();
      else stopOverlayUpdates();
    });
    api.onRequestClose(openCloseDialog);
    api.onOpenFiles((paths) => {
      openExternalFiles(paths);
    });
    api.onOpenDefaultSettings(() => {
      openSettingsPanel();
      setTimeout(openWindowsDefaultApps, 250);
    });
    api.onTrayAction((action) => {
      if (action === 'toggle-play') togglePlayPause();
      if (action === 'previous') previousTrack();
      if (action === 'next') nextTrack(true);
      if (action === 'open-settings') openSettingsPanel();
    });
    api.onSmokeImport(async (audioPath) => {
      if (audioPath) await addPaths([audioPath]);
    });
    api.onCoversOptimized((updates) => {
      const paths = new Map(updates.map((entry) => [entry.id, entry.path]));
      let changed = false;
      for (const item of state.queue) {
        const nextPath = paths.get(item.id);
        if (nextPath && item.coverPath !== nextPath) {
          item.coverPath = nextPath;
          changed = true;
        }
      }
      if (!changed) return;
      if (currentItem()) renderTrack();
      renderQueue({ keepScroll: true });
    });
  }

  function bindAudioEvents() {
    audio.addEventListener('timeupdate', () => {
      state.currentTime = audio.currentTime || 0;
      const duration = Number(audio.duration) || currentItem()?.duration || 0;
      if (!isScrubbing) updateProgressUI(audio.currentTime || 0, duration);
      updateLyricsAtTime(audio.currentTime || 0);
      updateMediaSessionPosition();
      if (state.desktopLyrics) {
        api.updateDesktopLyrics({
          time: audio.currentTime || 0,
          playing: !audio.paused,
        });
      }
    });
    audio.addEventListener('loadedmetadata', () => {
      const item = currentItem();
      const duration = Number(audio.duration);
      if (item?.missing) {
        item.missing = false;
        renderQueue({ keepScroll: true });
        scheduleSave(true);
      }
      if (item && Number.isFinite(duration) && Math.abs(duration - item.duration) > 0.8) {
        item.duration = duration;
        renderQueue({ keepScroll: true });
      }
      if (pendingRestoreTime > 0 && Number.isFinite(duration)) {
        audio.currentTime = clamp(pendingRestoreTime, 0, Math.max(0, duration - 0.1));
        pendingRestoreTime = 0;
      }
      updateProgressUI(audio.currentTime || 0, duration);
      updateLyricsAtTime(audio.currentTime || 0, { force: true });
      updateMediaSessionPosition();
    });
    audio.addEventListener('progress', () => {
      const duration = Number(audio.duration) || currentItem()?.duration || 0;
      updateProgressUI(audio.currentTime || 0, duration);
    });
    audio.addEventListener('durationchange', () => {
      updateProgressUI(audio.currentTime || 0, Number(audio.duration) || 0);
    });
    audio.addEventListener('play', updatePlayButton);
    audio.addEventListener('pause', () => {
      updatePlayButton();
      scheduleSave();
    });
    audio.addEventListener('playing', () => {
      updatePlayButton();
      const item = currentItem();
      if (item?.missing) {
        item.missing = false;
        renderQueue({ keepScroll: true });
      }
      if (state.currentId) markPlayed(state.currentId);
      updateMediaSessionPosition();
    });
    audio.addEventListener('ended', () => {
      updatePlayButton();
      nextTrack(false);
    });
    audio.addEventListener('error', () => {
      updatePlayButton();
      const item = currentItem();
      if (!item || audioErrorNotifiedFor === item.id) return;
      audioErrorNotifiedFor = item.id;
      item.missing = true;
      renderQueue({ keepScroll: true });
      scheduleSave(true);
      showToast(t('无法播放“{title}”，文件可能已移动或格式暂不支持', {
        title: item.title,
      }), {
        error: true,
        duration: 5200,
      });
    });
  }

  function bindMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const handlers = {
      play: () => attemptPlay(),
      pause: () => audio.pause(),
      previoustrack: previousTrack,
      nexttrack: () => nextTrack(true),
      seekbackward: (details) => seekBy(-(details.seekOffset || 10)),
      seekforward: (details) => seekBy(details.seekOffset || 10),
      seekto: (details) => {
        if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime;
      },
    };
    for (const [action, handler] of Object.entries(handlers)) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Not every Chromium build supports every action.
      }
    }
  }

  async function init() {
    bindEvents();
    bindAudioEvents();
    bindMediaSession();

    try {
      const saved = await api.getState();
      state = {
        ...defaultState,
        ...(saved || {}),
        queue: Array.isArray(saved?.queue) ? saved.queue : [],
        selectionLoopIds: Array.isArray(saved?.selectionLoopIds)
          ? saved.selectionLoopIds
          : [],
        settings: {
          ...defaultState.settings,
          ...(saved?.settings && typeof saved.settings === 'object' ? saved.settings : {}),
          shortcuts: {
            ...defaultState.settings.shortcuts,
            ...(saved?.settings?.shortcuts || {}),
          },
          overlay: {
            ...defaultState.settings.overlay,
            ...(saved?.settings?.overlay || {}),
          },
          background: {
            ...defaultState.settings.background,
            ...(saved?.settings?.background || {}),
          },
        },
      };
    } catch (error) {
      state = { ...defaultState };
      showToast(t('读取播放列表失败：{message}', {
        message: error.message || t('未知错误'),
      }), { error: true });
    }

    state.queue.forEach((item, index) => {
      if (!Number.isFinite(Number(item.importOrder))) item.importOrder = index;
    });
    api
      .getAppInfo()
      .then((info) => {
        if (info?.version) {
          els.appVersion.textContent = `V ${info.version}`;
          els.settingsAppVersion.textContent = `V ${info.version}`;
        }
      })
      .catch(() => {});
    state.settings.defaultRate = clamp(state.settings.defaultRate, 0.5, 2);
    state.settings.defaultVolume = clamp(state.settings.defaultVolume, 0, 1);
    if (!['en', 'zh-CN', 'zh-TW'].includes(state.settings.language)) {
      state.settings.language = 'zh-CN';
    }
    if (!THEME_CONFIG[state.settings.theme]) state.settings.theme = 'cover';
    state.settings.overlay.scale = clamp(state.settings.overlay.scale, 0.7, 1.6);
    state.settings.overlay.opacity = clamp(state.settings.overlay.opacity, 0.25, 1);
    state.settings.background.blur = clamp(state.settings.background.blur, 0, 40);
    state.settings.background.dim = clamp(state.settings.background.dim, 0, 0.9);
    state.rate = state.settings.defaultRate;
    state.volume = state.settings.defaultVolume;
    state.muted = false;
    audio.volume = state.volume;
    audio.muted = false;
    audio.playbackRate = state.rate;
    audio.defaultPlaybackRate = audio.playbackRate;
    lastSavedVolume = state.volume || 0.78;
    window.quzhanI18n.setLanguage(state.settings.language);
    applyTheme(state.settings.theme);
    renderRate();
    renderSettings();
    applySpectrumSetting(state.settings.spectrumEnabled !== false);
    renderBackground();
    applyOverlaySettings();
    applyVolume();
    renderQueueOpen();
    renderMode();
    renderSortOptions();

    if (state.queue.length) {
      const currentId = state.queue.some((item) => item.id === state.currentId)
        ? state.currentId
        : state.queue[0].id;
      state.currentId = currentId;
      loadTrack(currentId, false, { resumeTime: state.currentTime || 0 });
    } else {
      state.currentId = null;
      setEmptyTrackUI();
      renderQueue();
    }

    const maximized = await api.isMaximized().catch(() => false);
    updateWindowMaximizeIcon(maximized);
    renderSelection();
    updatePlayButton();
    resizeSpectrumCanvas();
    startSpectrumAnimation();
    if ('ResizeObserver' in window) {
      const spectrumObserver = new ResizeObserver(() => resizeSpectrumCanvas());
      spectrumObserver.observe(els.spectrumCanvas);
    }

    const launchActions = await api.takeLaunchActions().catch(() => null);
    if (launchActions?.paths?.length) {
      await openExternalFiles(launchActions.paths);
    }
    if (launchActions?.openDefaultSettings) {
      openSettingsPanel();
      setTimeout(openWindowsDefaultApps, 300);
    }

    if (state.desktopLyrics && state.queue.length) {
      setTimeout(() => {
        if (currentItem() && lyricsModel.timed) {
          sendDesktopLyricsPayload();
        } else {
          state.desktopLyrics = false;
          showDesktopLyricsButtonState(false);
        }
      }, 600);
    } else {
      showDesktopLyricsButtonState(false);
    }

    setInterval(() => {
      if (!audio.paused) scheduleSave();
    }, 5000);
  }

  init();
})();
