const {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  nativeImage,
  shell,
  screen,
  Tray,
} = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const crypto = require('node:crypto');
const http = require('node:http');
const os = require('node:os');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

const AUDIO_EXTENSIONS = new Set([
  '.mp3',
  '.flac',
  '.m4a',
  '.aac',
  '.wav',
  '.ogg',
  '.oga',
  '.opus',
  '.webm',
]);

const OPEN_WITH_EXTENSIONS = [...AUDIO_EXTENSIONS].map((extension) => extension.slice(1));
const ASSOCIATION_PROG_ID = 'Quzhan.Audio';
const ASSOCIATION_APP_NAME = 'Quzhan';
const LEGACY_ASSOCIATION_PROG_ID = 'Lingyin.Audio';
const LEGACY_ASSOCIATION_APP_NAME = 'Lingyin';

const DEFAULT_SHORTCUTS = {
  playPause: 'Space',
  next: 'KeyD',
  previous: 'KeyA',
  seekForward: 'ArrowRight',
  seekBackward: 'ArrowLeft',
  desktopLyrics: 'KeyF',
};
const VALID_LANGUAGES = new Set(['en', 'zh-CN', 'zh-TW']);
const VALID_THEMES = new Set(['cover', 'amber', 'tide', 'moss', 'berry', 'indigo']);

const MAIN_I18N = {
  en: {
    chooseBackground: 'Choose a custom background',
    importBackground: 'Use this image',
    imageFiles: 'Image files',
    importAudioTitle: 'Add music to the queue',
    addToQueue: 'Add to queue',
    audioFiles: 'Audio files',
    allFiles: 'All files',
    noAudioFiles: 'No supported audio files were found',
    invalidAudioFile: 'Not a readable audio file',
    unsupportedAudioFormat: 'Unsupported audio format',
    defaultAppsOpened: 'Windows Default Apps is open. Confirm Quzhan there.',
    defaultAppsUnavailable: 'Unable to open Windows Settings',
    defaultAppsWindowsOnly: 'Default Apps settings are only available on Windows.',
    trayOpen: 'Open Quzhan',
    trayPlayPause: 'Play / Pause',
    trayPrevious: 'Previous',
    trayNext: 'Next',
    traySettings: 'Settings',
    trayQuit: 'Quit Quzhan',
    trayTooltip: 'Quzhan',
  },
  'zh-CN': {
    chooseBackground: '选择自定义背景',
    importBackground: '使用这张图片',
    imageFiles: '图片文件',
    importAudioTitle: '把音乐加入播放队列',
    addToQueue: '加入队列',
    audioFiles: '音频文件',
    allFiles: '所有文件',
    noAudioFiles: '没有找到可导入的音频文件',
    invalidAudioFile: '不是可读取的音频文件',
    unsupportedAudioFormat: '不支持的音频格式',
    defaultAppsOpened: '已打开 Windows 默认应用设置，请在系统界面确认曲栈。',
    defaultAppsUnavailable: '无法打开 Windows 设置',
    defaultAppsWindowsOnly: '默认应用设置仅适用于 Windows。',
    trayOpen: '打开曲栈',
    trayPlayPause: '播放 / 暂停',
    trayPrevious: '上一首',
    trayNext: '下一首',
    traySettings: '设置',
    trayQuit: '退出曲栈',
    trayTooltip: '曲栈',
  },
  'zh-TW': {
    chooseBackground: '選擇自訂背景',
    importBackground: '使用這張圖片',
    imageFiles: '圖片檔案',
    importAudioTitle: '把音樂加入播放佇列',
    addToQueue: '加入佇列',
    audioFiles: '音訊檔案',
    allFiles: '所有檔案',
    noAudioFiles: '沒有找到可匯入的音訊檔案',
    invalidAudioFile: '不是可讀取的音訊檔案',
    unsupportedAudioFormat: '不支援的音訊格式',
    defaultAppsOpened: '已開啟 Windows 預設應用程式設定，請在系統介面確認曲棧。',
    defaultAppsUnavailable: '無法開啟 Windows 設定',
    defaultAppsWindowsOnly: '預設應用程式設定僅適用於 Windows。',
    trayOpen: '開啟曲棧',
    trayPlayPause: '播放 / 暫停',
    trayPrevious: '上一首',
    trayNext: '下一首',
    traySettings: '設定',
    trayQuit: '結束曲棧',
    trayTooltip: '曲棧',
  },
};

function mainText(key) {
  const language = lastState.settings?.language || 'zh-CN';
  return MAIN_I18N[language]?.[key] || MAIN_I18N['zh-CN'][key] || key;
}

function remapLegacyCoverPath(value, legacyDir, targetCoverDir) {
  if (typeof value !== 'string' || !value) return value;
  const legacyCoverDir = path.resolve(legacyDir, 'covers');
  const resolved = path.resolve(value);
  const relative = path.relative(legacyCoverDir, resolved);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return value;
  return path.join(targetCoverDir, relative);
}

function migrateLegacyData(targetUserData) {
  const targetLibrary = path.join(targetUserData, 'library.json');
  if (fs.existsSync(targetLibrary)) return;

  const appDataDir = path.dirname(targetUserData);
  const legacyDirs = [
    path.join(appDataDir, 'lingyin-player'),
    path.join(appDataDir, '聆音'),
    path.join(appDataDir, 'Lingyin'),
  ];
  const sourceDir = legacyDirs.find((dir) => fs.existsSync(path.join(dir, 'library.json')));
  if (!sourceDir) return;

  const sourceLibrary = path.join(sourceDir, 'library.json');
  const targetCoverDir = path.join(targetUserData, 'covers');
  try {
    const raw = JSON.parse(fs.readFileSync(sourceLibrary, 'utf8'));
    if (Array.isArray(raw.queue)) {
      raw.queue = raw.queue.map((item) => {
        if (!item || typeof item !== 'object') return item;
        return {
          ...item,
          coverPath: remapLegacyCoverPath(item.coverPath, sourceDir, targetCoverDir),
        };
      });
    }
    fs.writeFileSync(targetLibrary, JSON.stringify(raw, null, 2), 'utf8');
  } catch (error) {
    console.warn('Unable to rewrite migrated library paths:', error);
    fs.copyFileSync(sourceLibrary, targetLibrary);
  }

  for (const legacyDir of legacyDirs) {
    const legacyCovers = path.join(legacyDir, 'covers');
    if (!fs.existsSync(legacyCovers)) continue;
    fs.cpSync(legacyCovers, targetCoverDir, {
      recursive: true,
      force: false,
      errorOnExist: false,
    });
  }
}

if (process.env.QUZHAN_DATA_DIR) {
  app.setPath('userData', path.resolve(process.env.QUZHAN_DATA_DIR));
} else if (app.isPackaged) {
  const appDataDir = app.getPath('appData');
  const targetUserData = path.join(appDataDir, 'quzhan-player');
  try {
    fs.mkdirSync(targetUserData, { recursive: true });
    migrateLegacyData(targetUserData);
  } catch (error) {
    console.warn('Unable to migrate previous app data:', error);
  }
  app.setPath('userData', targetUserData);
}

const MIME_TYPES = {
  '.mp3': 'audio/mpeg',
  '.flac': 'audio/flac',
  '.m4a': 'audio/mp4',
  '.aac': 'audio/aac',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.oga': 'audio/ogg',
  '.opus': 'audio/ogg',
  '.webm': 'audio/webm',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.avif': 'image/avif',
};

const DEFAULT_STATE = {
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
  windowBounds: null,
  overlayBounds: null,
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
  updatedAt: 0,
};

let mainWindow = null;
let overlayWindow = null;
let lastState = { ...DEFAULT_STATE };
let stateFile = '';
let coverDir = '';
let backgroundDir = '';
let stateReadOk = false;
let quitting = false;
let overlayPayload = null;
let overlayPlayback = { time: 0, playing: false };
let mediaServer = null;
let mediaBaseUrl = '';
const mediaToken = crypto.randomBytes(24).toString('hex');
const allowedMediaPaths = new Set();
let stateWriteTimer = null;
let tray = null;
let pendingOpenPaths = [];
let pendingOpenDefaultSettings = false;

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

function isAudioFile(filePath) {
  return AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function cleanText(value, fallback = '') {
  if (typeof value !== 'string') return fallback;
  return value.replace(/\u0000/g, '').trim() || fallback;
}

function cleanShortcut(value, fallback) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 80 || !/^[A-Za-z0-9+]+$/.test(trimmed)) return fallback;
  return trimmed;
}

function safeFileStem(value) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

function mediaPathKey(filePath) {
  if (typeof filePath !== 'string' || !filePath) return '';
  const resolved = path.resolve(filePath);
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved;
}

function allowMediaPath(filePath) {
  const key = mediaPathKey(filePath);
  if (key) allowedMediaPaths.add(key);
}

function isAllowedMediaPath(filePath) {
  const key = mediaPathKey(filePath);
  return Boolean(key && allowedMediaPaths.has(key));
}

function refreshAllowedMediaPaths() {
  allowedMediaPaths.clear();
  for (const item of lastState.queue || []) {
    allowMediaPath(item.path);
    allowMediaPath(item.coverPath);
  }
  allowMediaPath(lastState.settings?.background?.path);
}

function scheduleStateWrite() {
  if (stateWriteTimer) return;
  stateWriteTimer = setTimeout(() => {
    stateWriteTimer = null;
    writeStateAtomically();
  }, 900);
}

function flushStateNow() {
  if (stateWriteTimer) {
    clearTimeout(stateWriteTimer);
    stateWriteTimer = null;
  }
  writeStateAtomically();
}

function getWindowBounds(bounds) {
  if (!bounds || typeof bounds !== 'object') return null;
  const width = clampNumber(bounds.width, 980, 4000, 1320);
  const height = clampNumber(bounds.height, 640, 3000, 820);
  const x = Number.isFinite(Number(bounds.x)) ? Math.round(Number(bounds.x)) : undefined;
  const y = Number.isFinite(Number(bounds.y)) ? Math.round(Number(bounds.y)) : undefined;
  return { width, height, ...(Number.isFinite(x) ? { x } : {}), ...(Number.isFinite(y) ? { y } : {}) };
}

function getOverlayBounds(bounds) {
  if (!bounds || typeof bounds !== 'object') return null;
  const width = clampNumber(bounds.width, 300, 1400, 820);
  const height = clampNumber(bounds.height, 80, 500, 172);
  const x = Number.isFinite(Number(bounds.x)) ? Math.round(Number(bounds.x)) : undefined;
  const y = Number.isFinite(Number(bounds.y)) ? Math.round(Number(bounds.y)) : undefined;
  return { width, height, ...(Number.isFinite(x) ? { x } : {}), ...(Number.isFinite(y) ? { y } : {}) };
}

function fitBoundsToDisplays(bounds, fallbackWidth = 1360, fallbackHeight = 860) {
  const candidate = getWindowBounds(bounds) || { width: fallbackWidth, height: fallbackHeight };
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  const workArea = primary.workArea;
  const width = Math.min(candidate.width, workArea.width);
  const height = Math.min(candidate.height, workArea.height);
  const hasVisibleArea = Number.isFinite(candidate.x) && Number.isFinite(candidate.y) &&
    displays.some((display) => {
      const area = display.workArea;
      const overlapWidth = Math.min(candidate.x + width, area.x + area.width) -
        Math.max(candidate.x, area.x);
      const overlapHeight = Math.min(candidate.y + height, area.y + area.height) -
        Math.max(candidate.y, area.y);
      return overlapWidth >= 120 && overlapHeight >= 80;
    });
  if (!hasVisibleArea) {
    return {
      width,
      height,
      x: Math.round(workArea.x + (workArea.width - width) / 2),
      y: Math.round(workArea.y + (workArea.height - height) / 2),
    };
  }
  return { width, height, x: candidate.x, y: candidate.y };
}

function writeStateAtomically() {
  if (!stateFile) return;
  const tempFile = `${stateFile}.${process.pid}.tmp`;
  const serialized = JSON.stringify(lastState, null, 2);
  try {
    fs.writeFileSync(tempFile, serialized, 'utf8');
    fs.renameSync(tempFile, stateFile);
  } catch (error) {
    console.error('Unable to save library state:', error);
  }
}

function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_STATE };
  const queue = Array.isArray(raw.queue)
    ? raw.queue
        .filter((item) => item && typeof item === 'object' && typeof item.path === 'string')
        .map((item, index) => ({
          ...item,
          id: typeof item.id === 'string' ? item.id : crypto.randomUUID(),
          title: cleanText(item.title, path.basename(item.path, path.extname(item.path))),
          artist: cleanText(item.artist, '未知艺术家'),
          album: cleanText(item.album, ''),
          duration: clampNumber(item.duration, 0, 24 * 60 * 60, 0),
          played: Boolean(item.played),
          addedAt: Number(item.addedAt) || Date.now(),
          importOrder: Number.isFinite(Number(item.importOrder))
            ? Number(item.importOrder)
            : index,
        }))
    : [];
  const ids = new Set(queue.map((item) => item.id));
  const currentId = ids.has(raw.currentId) ? raw.currentId : null;
  const validModes = new Set(['sequential', 'shuffle', 'repeat-one', 'selection']);
  const validCloseActions = new Set(['ask', 'tray', 'quit']);
  const rawSettings = raw.settings && typeof raw.settings === 'object' ? raw.settings : {};
  const rawShortcuts = rawSettings.shortcuts && typeof rawSettings.shortcuts === 'object'
    ? rawSettings.shortcuts
    : {};
  const rawOverlay = rawSettings.overlay && typeof rawSettings.overlay === 'object'
    ? rawSettings.overlay
    : {};
  const rawBackground = rawSettings.background && typeof rawSettings.background === 'object'
    ? rawSettings.background
    : {};
  return {
    ...DEFAULT_STATE,
    ...raw,
    version: 2,
    queue,
    currentId,
    currentTime: clampNumber(raw.currentTime, 0, 24 * 60 * 60, 0),
    volume: clampNumber(raw.volume, 0, 1, DEFAULT_STATE.volume),
    rate: clampNumber(raw.rate, 0.5, 2, 1),
    muted: Boolean(raw.muted),
    mode: validModes.has(raw.mode) ? raw.mode : 'sequential',
    queueOpen: raw.queueOpen !== false,
    selectionLoopIds: Array.isArray(raw.selectionLoopIds)
      ? raw.selectionLoopIds.filter((id) => ids.has(id))
      : [],
    desktopLyrics: Boolean(raw.desktopLyrics),
    windowBounds: getWindowBounds(raw.windowBounds),
    overlayBounds: getOverlayBounds(raw.overlayBounds),
    settings: {
      defaultRate: clampNumber(
        rawSettings.defaultRate,
        0.5,
        2,
        clampNumber(raw.rate, 0.5, 2, 1),
      ),
      defaultVolume: clampNumber(
        rawSettings.defaultVolume,
        0,
        1,
        clampNumber(raw.volume, 0, 1, 0.78),
      ),
      spectrumEnabled: rawSettings.spectrumEnabled !== false,
      closeAction: validCloseActions.has(rawSettings.closeAction)
        ? rawSettings.closeAction
        : 'ask',
      language: VALID_LANGUAGES.has(rawSettings.language) ? rawSettings.language : 'zh-CN',
      theme: VALID_THEMES.has(rawSettings.theme) ? rawSettings.theme : 'cover',
      shortcuts: {
        playPause: cleanShortcut(rawShortcuts.playPause, DEFAULT_SHORTCUTS.playPause),
        next: cleanShortcut(rawShortcuts.next, DEFAULT_SHORTCUTS.next),
        previous: cleanShortcut(rawShortcuts.previous, DEFAULT_SHORTCUTS.previous),
        seekForward: cleanShortcut(rawShortcuts.seekForward, DEFAULT_SHORTCUTS.seekForward),
        seekBackward: cleanShortcut(rawShortcuts.seekBackward, DEFAULT_SHORTCUTS.seekBackward),
        desktopLyrics: cleanShortcut(
          rawShortcuts.desktopLyrics,
          DEFAULT_SHORTCUTS.desktopLyrics,
        ),
      },
      overlay: {
        scale: clampNumber(rawOverlay.scale, 0.7, 1.6, 1),
        opacity: clampNumber(rawOverlay.opacity, 0.25, 1, 0.92),
        locked: Boolean(rawOverlay.locked),
        clickThrough: Boolean(rawOverlay.clickThrough),
      },
      background: {
        path: typeof rawBackground.path === 'string' ? rawBackground.path : '',
        blur: clampNumber(rawBackground.blur, 0, 40, 18),
        dim: clampNumber(rawBackground.dim, 0, 0.9, 0.58),
        motion: rawBackground.motion !== false,
      },
    },
  };
}

async function readState() {
  try {
    const text = await fsp.readFile(stateFile, 'utf8');
    lastState = normalizeState(JSON.parse(text));
    stateReadOk = true;
  } catch (error) {
    if (error.code === 'ENOENT') stateReadOk = true;
    else {
      console.error('Unable to load library state:', error);
      try {
        fs.copyFileSync(stateFile, `${stateFile}.corrupt-${Date.now()}`);
      } catch {
        // Keep the original file untouched if the backup cannot be written.
      }
    }
    lastState = normalizeState(DEFAULT_STATE);
  }
  refreshAllowedMediaPaths();
  return lastState;
}

async function readSidecarLyrics(filePath) {
  const parsed = path.parse(filePath);
  const candidates = [
    path.join(parsed.dir, `${parsed.name}.lrc`),
    path.join(parsed.dir, `${parsed.name}.LRC`),
    path.join(parsed.dir, `${parsed.name}.txt`),
  ];
  for (const candidate of candidates) {
    try {
      const text = await fsp.readFile(candidate, 'utf8');
      const normalized = text.replace(/^\uFEFF/, '').trim();
      if (normalized) return normalized;
    } catch {
      // Try the next sidecar name.
    }
  }
  return '';
}

function formatLrcTimestamp(milliseconds) {
  const safeMs = Math.max(0, Math.round(Number(milliseconds) || 0));
  const minutes = Math.floor(safeMs / 60000);
  const seconds = Math.floor((safeMs % 60000) / 1000);
  const hundredths = Math.floor((safeMs % 1000) / 10);
  return `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(
    hundredths,
  ).padStart(2, '0')}]`;
}

function embeddedLyrics(metadata) {
  const tags = Array.isArray(metadata?.common?.lyrics) ? metadata.common.lyrics : [];
  const variants = [];
  for (const tag of tags) {
    if (tag?.syncText?.length) {
      variants.push(
        tag.syncText
          .map((line) => `${formatLrcTimestamp(line.timestamp)}${cleanText(line.text)}`)
          .join('\n'),
      );
    } else if (typeof tag?.text === 'string' && tag.text.trim()) {
      variants.push(tag.text.trim());
    }
  }
  variants.sort((a, b) => {
    const aSynced = /\[\d{2}:\d{2}/.test(a);
    const bSynced = /\[\d{2}:\d{2}/.test(b);
    return Number(bSynced) - Number(aSynced) || b.length - a.length;
  });
  return variants[0] || '';
}

function extractCoverPalette(filePath) {
  if (!filePath) return null;
  const image = nativeImage.createFromPath(filePath);
  if (image.isEmpty()) return null;
  const resized = image.resize({ width: 32, height: 32, quality: 'good' });
  const bitmap = resized.toBitmap();
  const samples = [];
  for (let index = 0; index < bitmap.length; index += 4) {
    const b = bitmap[index] / 255;
    const g = bitmap[index + 1] / 255;
    const r = bitmap[index + 2] / 255;
    const a = bitmap[index + 3] / 255;
    if (a < 0.75) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const delta = max - min;
    if (delta < 0.025) continue;
    const saturation = lightness > 0.5
      ? delta / (2 - max - min)
      : delta / (max + min);
    if (lightness < 0.08 || lightness > 0.92) continue;
    let hue = 0;
    if (max === r) hue = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    else if (max === g) hue = ((b - r) / delta + 2) * 60;
    else hue = ((r - g) / delta + 4) * 60;
    samples.push({ hue, saturation, lightness });
  }
  if (!samples.length) return null;
  let sin = 0;
  let cos = 0;
  let saturation = 0;
  let lightness = 0;
  for (const sample of samples) {
    const radians = (sample.hue * Math.PI) / 180;
    sin += Math.sin(radians) * sample.saturation;
    cos += Math.cos(radians) * sample.saturation;
    saturation += sample.saturation;
    lightness += sample.lightness;
  }
  return {
    hue: ((Math.atan2(sin, cos) * 180) / Math.PI + 360) % 360,
    saturation: saturation / samples.length,
    lightness: lightness / samples.length,
  };
}

function coverArtworkDataUrl(filePath) {
  if (!filePath) return '';
  const image = nativeImage.createFromPath(filePath);
  if (image.isEmpty()) return '';
  return image.resize({ width: 256, height: 256, quality: 'good' }).toDataURL();
}

async function persistCover(picture, id) {
  if (!picture?.data) return '';
  let extension = '.jpg';
  if (picture.format === 'image/png') extension = '.png';
  else if (picture.format === 'image/webp') extension = '.webp';
  else if (picture.format === 'image/gif') extension = '.gif';
  const fileName = `${safeFileStem(id)}${extension}`;
  const outputPath = path.join(coverDir, fileName);
  await fsp.writeFile(outputPath, Buffer.from(picture.data));
  allowMediaPath(outputPath);
  return outputPath;
}

const BACKGROUND_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif']);

async function importBackgroundImage() {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: mainText('chooseBackground'),
    buttonLabel: mainText('importBackground'),
    properties: ['openFile'],
    filters: [
      { name: mainText('imageFiles'), extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif'] },
    ],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const source = result.filePaths[0];
  const extension = path.extname(source).toLowerCase();
  if (!BACKGROUND_EXTENSIONS.has(extension)) {
    return { ok: false, code: 'UNSUPPORTED_IMAGE' };
  }
  await fsp.mkdir(backgroundDir, { recursive: true });
  const target = path.join(
    backgroundDir,
    `background-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension}`,
  );
  await fsp.copyFile(source, target);
  allowMediaPath(target);
  if (lastState.settings?.background) lastState.settings.background.path = target;
  scheduleStateWrite();
  return { ok: true, path: target, name: path.basename(source) };
}

async function cleanupOrphanCovers() {
  if (!coverDir || !stateReadOk) return 0;
  let entries;
  try {
    entries = await fsp.readdir(coverDir, { withFileTypes: true });
  } catch {
    return 0;
  }
  const referenced = new Set(
    (lastState.queue || [])
      .map((item) => (item.coverPath ? path.basename(item.coverPath) : ''))
      .filter(Boolean),
  );
  let removed = 0;
  for (const entry of entries) {
    if (!entry.isFile() || referenced.has(entry.name)) continue;
    try {
      await fsp.unlink(path.join(coverDir, entry.name));
      removed += 1;
    } catch {
      // A locked cover can be cleaned up on a later launch.
    }
  }
  return removed;
}

async function cleanupOrphanBackgrounds() {
  if (!backgroundDir || !stateReadOk) return 0;
  const current = lastState.settings?.background?.path
    ? mediaPathKey(lastState.settings.background.path)
    : '';
  let entries;
  try {
    entries = await fsp.readdir(backgroundDir, { withFileTypes: true });
  } catch {
    return 0;
  }
  let removed = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const filePath = path.join(backgroundDir, entry.name);
    if (current && mediaPathKey(filePath) === current) continue;
    try {
      await fsp.unlink(filePath);
      removed += 1;
    } catch {
      // A locked background can be cleaned up on a later launch.
    }
  }
  return removed;
}

async function parseAudio(filePath) {
  const stat = await fsp.stat(filePath);
  if (!stat.isFile()) throw new Error(mainText('invalidAudioFile'));
  if (!isAudioFile(filePath)) throw new Error(mainText('unsupportedAudioFormat'));

  const { parseFile, selectCover } = await import('music-metadata');
  let metadata = null;
  try {
    metadata = await parseFile(filePath, { duration: true, skipCovers: false });
  } catch (error) {
    console.warn(`Metadata parse failed for ${filePath}:`, error.message);
  }

  const id = crypto.randomUUID();
  const common = metadata?.common || {};
  const fallbackTitle = path.basename(filePath, path.extname(filePath));
  const picture = selectCover(common.picture) || common.picture?.[0] || null;
  let coverPath = '';
  try {
    coverPath = await persistCover(picture, id);
  } catch (error) {
    console.warn('Unable to save cover art:', error.message);
  }

  const sidecar = await readSidecarLyrics(filePath);
  const lyrics = sidecar || embeddedLyrics(metadata);

  return {
    id,
    path: filePath,
    fileName: path.basename(filePath),
    title: cleanText(common.title, fallbackTitle),
    artist: cleanText(common.artist || common.albumartist, '未知艺术家'),
    album: cleanText(common.album),
    duration: clampNumber(metadata?.format?.duration, 0, 24 * 60 * 60, 0),
    coverPath,
    lyrics,
    lyricsSource: sidecar ? 'sidecar' : lyrics ? 'embedded' : '',
    played: false,
    addedAt: Date.now(),
    size: stat.size,
    missing: false,
  };
}

async function expandPaths(inputPaths) {
  const result = [];
  const seen = new Set();
  const walk = async (target, depth = 0) => {
    if (depth > 8) return;
    let stat;
    try {
      stat = await fsp.stat(target);
    } catch {
      return;
    }
    if (stat.isDirectory()) {
      const entries = await fsp.readdir(target, { withFileTypes: true });
      entries.sort((a, b) =>
        a.name.localeCompare(b.name, 'zh-CN', { numeric: true, sensitivity: 'base' }),
      );
      for (const entry of entries) {
        await walk(path.join(target, entry.name), depth + 1);
      }
    } else if (stat.isFile() && isAudioFile(target)) {
      const key = mediaPathKey(target);
      if (key && !seen.has(key)) {
        seen.add(key);
        result.push(target);
      }
    }
  };
  for (const target of inputPaths) {
    if (typeof target === 'string' && target.trim()) await walk(target);
  }
  return [...new Set(result)];
}

async function importAudioPaths(inputPaths, existingPaths = []) {
  const expandedPaths = await expandPaths(Array.isArray(inputPaths) ? inputPaths : []);
  const knownPaths = new Set(
    (Array.isArray(existingPaths) ? existingPaths : []).map(mediaPathKey).filter(Boolean),
  );
  const expanded = expandedPaths.filter((filePath) => !knownPaths.has(mediaPathKey(filePath)));
  const skipped = expandedPaths.length - expanded.length;
  if (!expanded.length) {
    return {
      items: [],
      errors: skipped
        ? []
        : [{ path: '', code: 'NO_AUDIO_FILES', message: mainText('noAudioFiles') }],
      skipped,
    };
  }

  const items = [];
  const errors = [];
  const order = new Map(expanded.map((filePath, index) => [filePath, index]));
  let cursor = 0;
  let finished = 0;
  const workers = Array.from({ length: Math.min(3, expanded.length) }, async () => {
    while (cursor < expanded.length) {
      const index = cursor++;
      const filePath = expanded[index];
      try {
        const item = await parseAudio(filePath);
        allowMediaPath(item.path);
        items.push(item);
      } catch (error) {
        errors.push({
          path: filePath,
          code: error.code || 'IMPORT_FAILED',
          message: error.message || '导入失败',
        });
      } finally {
        finished += 1;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('import:progress', {
            finished,
            total: expanded.length,
            name: path.basename(filePath),
          });
        }
      }
    }
  });
  await Promise.all(workers);

  items.sort((a, b) => (order.get(a.path) ?? 0) - (order.get(b.path) ?? 0));
  return { items, errors, skipped };
}

function startMediaServer() {
  return new Promise((resolve, reject) => {
    mediaServer = http.createServer(async (request, response) => {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range',
        'Access-Control-Expose-Headers': 'Accept-Ranges, Content-Length, Content-Range',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Cache-Control': 'no-store',
      };
      try {
        const url = new URL(request.url || '/', 'http://127.0.0.1');
        if (url.pathname !== `/${mediaToken}/media`) {
          response.writeHead(403, { ...corsHeaders, 'Content-Type': 'text/plain' });
          response.end('Forbidden');
          return;
        }
        const filePath = url.searchParams.get('path');
        if (!filePath) {
          response.writeHead(400, { ...corsHeaders, 'Content-Type': 'text/plain' });
          response.end('Missing media path');
          return;
        }
        if (!isAllowedMediaPath(filePath)) {
          response.writeHead(403, { ...corsHeaders, 'Content-Type': 'text/plain' });
          response.end('Forbidden media path');
          return;
        }
        if (request.method === 'OPTIONS') {
          response.writeHead(204, corsHeaders);
          response.end();
          return;
        }
        const stat = await fsp.stat(filePath);
        const mimeType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        const rangeHeader = request.headers.range;
        let start = 0;
        let end = stat.size - 1;
        let status = 200;

        if (rangeHeader) {
          const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
          if (!match) {
            response.writeHead(416, {
              ...corsHeaders,
              'Content-Range': `bytes */${stat.size}`,
            });
            response.end();
            return;
          }
          if (!match[1] && match[2]) {
            const suffixLength = Number(match[2]);
            start = Math.max(0, stat.size - suffixLength);
            end = stat.size - 1;
          } else {
            start = match[1] ? Number(match[1]) : 0;
            const requestedEnd = match[2] ? Number(match[2]) : stat.size - 1;
            end = Math.min(Math.max(start, requestedEnd), stat.size - 1);
          }
          if (start >= stat.size || start > end) {
            response.writeHead(416, {
              ...corsHeaders,
              'Content-Range': `bytes */${stat.size}`,
            });
            response.end();
            return;
          }
          status = 206;
        }

        const headers = {
          ...corsHeaders,
          'Accept-Ranges': 'bytes',
          'Content-Type': mimeType,
          'Content-Length': String(end - start + 1),
        };
        if (status === 206) {
          headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
        }
        response.writeHead(status, headers);
        if (request.method === 'HEAD') {
          response.end();
          return;
        }
        const stream = fs.createReadStream(filePath, { start, end });
        stream.on('error', () => response.destroy());
        stream.pipe(response);
      } catch (error) {
        if (!response.headersSent) {
          response.writeHead(404, { ...corsHeaders, 'Content-Type': 'text/plain' });
        }
        response.end(error.message);
      }
    });
    mediaServer.on('error', reject);
    mediaServer.listen(0, '127.0.0.1', () => {
      const address = mediaServer.address();
      mediaBaseUrl = `http://127.0.0.1:${address.port}/${mediaToken}`;
      resolve();
    });
  });
}

function extractAudioPathsFromArgv(argv) {
  return [...new Set(
    (Array.isArray(argv) ? argv : [])
      .filter((value) => typeof value === 'string' && value && !value.startsWith('--'))
      .map((value) => path.resolve(value))
      .filter((value) => isAudioFile(value) && fs.existsSync(value)),
  )];
}

function associationExecutablePath() {
  const portablePath = process.env.PORTABLE_EXECUTABLE_FILE;
  if (portablePath && fs.existsSync(portablePath)) return portablePath;
  return process.execPath;
}

async function regAdd(key, valueName, type, data) {
  const args = ['add', key];
  if (valueName) args.push('/v', valueName);
  else args.push('/ve');
  args.push('/t', type, '/d', String(data ?? ''), '/f');
  await execFileAsync('reg.exe', args, { windowsHide: true });
}

async function regQueryValue(key, valueName) {
  try {
    const { stdout } = await execFileAsync('reg.exe', ['query', key, '/v', valueName], {
      windowsHide: true,
    });
    const line = stdout
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(valueName));
    if (!line) return '';
    return line.split(/\s{2,}/).at(-1)?.trim() || '';
  } catch {
    return '';
  }
}

async function removeLegacyAudioAssociations() {
  if (process.platform !== 'win32' || !app.isPackaged) return;
  const bestEffort = (args) =>
    execFileAsync('reg.exe', args, { windowsHide: true }).catch(() => {});
  await bestEffort([
    'delete',
    'HKCU\\Software\\RegisteredApplications',
    '/v',
    LEGACY_ASSOCIATION_APP_NAME,
    '/f',
  ]);
  await bestEffort(['delete', 'HKCU\\Software\\Lingyin\\Capabilities', '/f']);
  await bestEffort(['delete', `HKCU\\Software\\Classes\\${LEGACY_ASSOCIATION_PROG_ID}`, '/f']);
  await bestEffort(['delete', 'HKCU\\Software\\Classes\\Applications\\聆音.exe', '/f']);
  for (const extension of [...OPEN_WITH_EXTENSIONS, 'aiff', 'aif']) {
    await bestEffort([
      'delete',
      `HKCU\\Software\\Classes\\.${extension}\\OpenWithProgids`,
      '/v',
      LEGACY_ASSOCIATION_PROG_ID,
      '/f',
    ]);
  }
}

async function registerAudioAssociations() {
  if (process.platform !== 'win32') return { ok: false, skipped: true };
  if (!app.isPackaged && process.env.QUZHAN_FORCE_ASSOCIATIONS !== '1') {
    return { ok: false, skipped: true };
  }
  const executable = associationExecutablePath();
  const executableName = path.basename(executable);
  const icon = `"${executable}",0`;
  const command = `"${executable}" "%1"`;
  try {
    await regAdd(
      `HKCU\\Software\\Classes\\${ASSOCIATION_PROG_ID}`,
      '',
      'REG_SZ',
      '曲栈',
    );
    await regAdd(
      `HKCU\\Software\\Classes\\${ASSOCIATION_PROG_ID}`,
      'FriendlyTypeName',
      'REG_SZ',
      '曲栈音频文件',
    );
    await regAdd(
      `HKCU\\Software\\Classes\\${ASSOCIATION_PROG_ID}\\DefaultIcon`,
      '',
      'REG_SZ',
      icon,
    );
    await regAdd(
      `HKCU\\Software\\Classes\\Applications\\${executableName}`,
      'FriendlyAppName',
      'REG_SZ',
      '曲栈',
    );
    await regAdd(
      `HKCU\\Software\\Classes\\Applications\\${executableName}\\DefaultIcon`,
      '',
      'REG_SZ',
      icon,
    );
    await regAdd(
      `HKCU\\Software\\Classes\\Applications\\${executableName}\\shell\\open\\command`,
      '',
      'REG_SZ',
      command,
    );
    await regAdd(
      `HKCU\\Software\\Classes\\${ASSOCIATION_PROG_ID}\\shell\\open\\command`,
      '',
      'REG_SZ',
      command,
    );
    await regAdd(
      `HKCU\\Software\\Classes\\${ASSOCIATION_PROG_ID}\\Application`,
      'ApplicationName',
      'REG_SZ',
      '曲栈',
    );
    await regAdd(
      `HKCU\\Software\\Classes\\${ASSOCIATION_PROG_ID}\\Application`,
      'ApplicationIcon',
      'REG_SZ',
      icon,
    );

    for (const extension of OPEN_WITH_EXTENSIONS) {
      await regAdd(
        `HKCU\\Software\\Classes\\.${extension}\\OpenWithProgids`,
        ASSOCIATION_PROG_ID,
        'REG_SZ',
        '',
      );
      await regAdd(
        'HKCU\\Software\\Quzhan\\Capabilities\\FileAssociations',
        `.${extension}`,
        'REG_SZ',
        ASSOCIATION_PROG_ID,
      );
    }

    await regAdd(
      'HKCU\\Software\\Quzhan\\Capabilities',
      'ApplicationName',
      'REG_SZ',
      '曲栈',
    );
    await regAdd(
      'HKCU\\Software\\Quzhan\\Capabilities',
      'ApplicationDescription',
      'REG_SZ',
      '曲栈本地音乐播放器',
    );
    await regAdd(
      'HKCU\\Software\\Quzhan\\Capabilities',
      'ApplicationIcon',
      'REG_SZ',
      icon,
    );
    await regAdd(
      'HKCU\\Software\\RegisteredApplications',
      ASSOCIATION_APP_NAME,
      'REG_SZ',
      'Software\\Quzhan\\Capabilities',
    );
    execFile('ie4uinit.exe', ['-show'], { windowsHide: true }, () => {});
    return { ok: true, executable };
  } catch (error) {
    console.error('Unable to register audio associations:', error);
    return { ok: false, error: error.message };
  }
}

async function getAssociationStatus() {
  if (process.platform !== 'win32') {
    return { registered: false, defaultCount: 0, total: 0, platform: process.platform };
  }
  const registeredLocation = await regQueryValue(
    'HKCU\\Software\\RegisteredApplications',
    ASSOCIATION_APP_NAME,
  );
  let defaultCount = 0;
  for (const extension of OPEN_WITH_EXTENSIONS) {
    const progId = await regQueryValue(
      `HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\FileExts\\.${extension}\\UserChoice`,
      'ProgId',
    );
    if (progId === ASSOCIATION_PROG_ID) defaultCount += 1;
  }
  return {
    registered: Boolean(registeredLocation),
    defaultCount,
    total: OPEN_WITH_EXTENSIONS.length,
    allDefault: defaultCount === OPEN_WITH_EXTENSIONS.length,
  };
}

async function openDefaultAppsSettings() {
  if (process.platform !== 'win32') {
    return { ok: false, message: mainText('defaultAppsWindowsOnly') };
  }
  await registerAudioAssociations();
  try {
    const build = Number(os.release().split('.')[2]) || 0;
    if (build >= 22000) {
      await shell.openExternal(
        `ms-settings:defaultapps?registeredAppUser=${encodeURIComponent(ASSOCIATION_APP_NAME)}`,
      );
    } else {
      await shell.openExternal('ms-settings:defaultapps');
    }
    return {
      ok: true,
      message: mainText('defaultAppsOpened'),
    };
  } catch (error) {
    try {
      await shell.openExternal('ms-settings:defaultapps');
      return {
        ok: true,
        message: mainText('defaultAppsOpened'),
      };
    } catch {
      return { ok: false, message: `${mainText('defaultAppsUnavailable')}：${error.message}` };
    }
  }
}

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    return;
  }
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function sendTrayAction(action) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('tray:action', action);
}

function buildTrayMenu() {
  return Menu.buildFromTemplate([
    { label: mainText('trayOpen'), click: showMainWindow },
    { type: 'separator' },
    { label: mainText('trayPlayPause'), click: () => sendTrayAction('toggle-play') },
    { label: mainText('trayPrevious'), click: () => sendTrayAction('previous') },
    { label: mainText('trayNext'), click: () => sendTrayAction('next') },
    {
      label: mainText('traySettings'),
      click: () => {
        showMainWindow();
        sendTrayAction('open-settings');
      },
    },
    { type: 'separator' },
    {
      label: mainText('trayQuit'),
      click: () => {
        quitting = true;
        app.quit();
      },
    },
  ]);
}

function refreshTrayMenu() {
  if (!tray) return;
  tray.setContextMenu(buildTrayMenu());
  tray.setToolTip(mainText('trayTooltip'));
}

function createTray() {
  if (tray) return tray;
  try {
    const trayIconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'icon.ico')
      : path.join(__dirname, 'assets', 'icon.ico');
    let icon = nativeImage.createFromPath(trayIconPath);
    if (!icon.isEmpty()) icon = icon.resize({ width: 16, height: 16 });
    tray = new Tray(icon);
    tray.setToolTip('曲栈');
    refreshTrayMenu();
    tray.on('click', showMainWindow);
    tray.on('double-click', showMainWindow);
  } catch (error) {
    console.warn('Unable to create tray icon:', error);
  }
  return tray;
}

function sendWindowState(window = mainWindow) {
  if (!window || window.isDestroyed()) return;
  window.webContents.send('window:maximized', window.isMaximized());
}

function createMainWindow() {
  const savedBounds = fitBoundsToDisplays(lastState.windowBounds, 1360, 860);

  mainWindow = new BrowserWindow({
    width: savedBounds.width,
    height: savedBounds.height,
    x: savedBounds.x,
    y: savedBounds.y,
    minWidth: 980,
    minHeight: 640,
    frame: false,
    show: false,
    backgroundColor: '#080b10',
    title: '曲栈',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
      backgroundThrottling: false,
    },
  });

  mainWindow.setMenu(null);
  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('maximize', () => sendWindowState());
  mainWindow.on('unmaximize', () => sendWindowState());
  mainWindow.on('enter-full-screen', () => sendWindowState());
  mainWindow.on('leave-full-screen', () => sendWindowState());
  mainWindow.on('close', (event) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      lastState.windowBounds = mainWindow.isMaximized()
        ? lastState.windowBounds
        : mainWindow.getBounds();
    }
    writeStateAtomically();
    if (quitting) return;
    const closeAction = lastState.settings?.closeAction || 'ask';
    if (closeAction === 'tray') {
      event.preventDefault();
      mainWindow.hide();
      return;
    }
    if (closeAction === 'ask') {
      event.preventDefault();
      mainWindow.webContents.send('window:request-close');
    }
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (overlayWindow && !overlayWindow.isDestroyed()) overlayWindow.close();
    if (!quitting) app.quit();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  mainWindow.webContents.once('did-finish-load', () => {
    if (!pendingOpenDefaultSettings) return;
    pendingOpenDefaultSettings = false;
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('app:open-default-settings');
      }
    }, 700);
  });
  if (process.env.QUZHAN_DEV_LOG || process.argv.includes('--dev')) {
    mainWindow.webContents.on('console-message', (details) => {
      console.log(
        `[renderer:${details.level}] ${details.message} (${details.sourceId}:${details.lineNumber})`,
      );
    });
    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      console.error('Renderer process gone:', details);
    });
    mainWindow.webContents.on('preload-error', (_event, preloadPath, error) => {
      console.error('Preload failed:', preloadPath, error);
    });
  }

  if (process.env.QUZHAN_CAPTURE_PATH) {
    mainWindow.webContents.once('did-finish-load', async () => {
      setTimeout(async () => {
        try {
          if (process.env.QUZHAN_SMOKE_QUEUE === '1') {
            const queueResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                for (const index of [1, 2]) {
                  document
                    .querySelectorAll('.queue-row')[index]
                    .dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }));
                  await wait(80);
                }
                document.getElementById('markPlayedButton').click();
                document.getElementById('moveTopButton').click();
                await wait(500);
                return {
                  order: [...document.querySelectorAll('.row-title')].map((node) => node.textContent),
                  selection: document.getElementById('selectionCount').textContent,
                };
              })();
            `);
            console.log('Smoke queue:', queueResult);
          }
          if (process.env.QUZHAN_SMOKE_DRAG === '1') {
            const dragResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const rows = [...document.querySelectorAll('.queue-row')];
                const source = rows[0];
                const target = rows[2];
                const sourceRect = source.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                const options = {
                  bubbles: true,
                  pointerId: 71,
                  pointerType: 'mouse',
                  button: 0,
                  buttons: 1,
                  clientX: sourceRect.left + 100,
                  clientY: sourceRect.top + 22,
                };
                source.dispatchEvent(new PointerEvent('pointerdown', options));
                await wait(360);
                document.dispatchEvent(
                  new PointerEvent('pointermove', {
                    ...options,
                    clientY: targetRect.bottom - 5,
                  }),
                );
                await wait(100);
                document.dispatchEvent(
                  new PointerEvent('pointerup', {
                    ...options,
                    buttons: 0,
                    clientY: targetRect.bottom - 5,
                  }),
                );
                await wait(350);
                return {
                  order: [...document.querySelectorAll('.row-title')].map((node) => node.textContent),
                };
              })();
            `);
            console.log('Smoke drag:', dragResult);
          }
          if (process.env.QUZHAN_SMOKE_SORT === '1') {
            const sortResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const readOrder = () =>
                  [...document.querySelectorAll('.row-title')].map((node) => node.textContent);
                document.getElementById('queueSortButton').click();
                await wait(80);
                document.querySelector('[data-sort="title"]').click();
                await wait(350);
                const titleOrder = readOrder();
                document.getElementById('queueSortButton').click();
                await wait(80);
                document.querySelector('[data-sort="default"]').click();
                await wait(350);
                const defaultOrder = readOrder();
                document.getElementById('queueSortButton').click();
                await wait(250);
                return {
                  titleOrder,
                  defaultOrder,
                  sortPopoverHidden: document.getElementById('sortPopover').hidden,
                  sortPopoverDisplay: getComputedStyle(
                    document.getElementById('sortPopover'),
                  ).display,
                };
              })();
            `);
            console.log('Smoke sort:', sortResult);
          }
          if (process.env.QUZHAN_SMOKE_SHUFFLE === '1') {
            const shuffleResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                document.getElementById('playButton').click();
                await wait(1000);
                const names = [];
                for (let index = 0; index < 4; index += 1) {
                  document.getElementById('nextButton').click();
                  await wait(800);
                  names.push(document.getElementById('trackTitle').textContent);
                }
                return { names, audioTime: document.getElementById('audio').currentTime };
              })();
            `);
            console.log('Smoke shuffle:', shuffleResult);
          }
          if (process.env.QUZHAN_SMOKE_PLAY) {
            const playback = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                document.getElementById('playButton').click();
                await new Promise((resolve) => setTimeout(resolve, 1600));
                const audio = document.getElementById('audio');
                return {
                  time: audio.currentTime,
                  paused: audio.paused,
                  readyState: audio.readyState,
                  error: audio.error ? audio.error.message : null,
                };
              })();
            `);
            console.log('Smoke playback:', playback);
          }
          if (process.env.QUZHAN_SMOKE_SEEK === '1') {
            const seekResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const audio = document.getElementById('audio');
                document.getElementById('playButton').click();
                await wait(700);
                audio.currentTime = 30;
                await wait(900);
                return {
                  time: audio.currentTime,
                  paused: audio.paused,
                  readyState: audio.readyState,
                  error: audio.error ? audio.error.message : null,
                };
              })();
            `);
            console.log('Smoke seek:', seekResult);
          }
          if (process.env.QUZHAN_SMOKE_SETTINGS === '1') {
            const settingsResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                document.getElementById('settingsButton').click();
                await wait(650);
                return {
                  visible: !document.getElementById('settingsBackdrop').hidden,
                  version: document.getElementById('settingsAppVersion').textContent,
                  closeAction: [...document.querySelectorAll('#settingsCloseOptions button')]
                    .find((button) => button.classList.contains('selected'))?.dataset.closeAction,
                };
              })();
            `);
            console.log('Smoke settings:', settingsResult);
          }
          if (process.env.QUZHAN_SMOKE_SETTINGS_CHANGE === '1') {
            const settingsResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                document.getElementById('settingsButton').click();
                await wait(250);
                document.querySelector('[data-settings-rate="1.25"]').click();
                const volume = document.getElementById('settingsVolumeSlider');
                volume.value = '55';
                volume.dispatchEvent(new Event('input', { bubbles: true }));
                volume.dispatchEvent(new Event('change', { bubbles: true }));
                const spectrum = document.getElementById('settingsSpectrumToggle');
                spectrum.checked = false;
                spectrum.dispatchEvent(new Event('change', { bubbles: true }));
                document.querySelector('[data-close-action="tray"]').click();
                await wait(500);
                return {
                  rate: document.getElementById('audio').playbackRate,
                  volume: document.getElementById('audio').volume,
                  spectrumHidden: document.getElementById('appShell').classList.contains('spectrum-disabled'),
                  closeAction: [...document.querySelectorAll('#settingsCloseOptions button')]
                    .find((button) => button.classList.contains('selected'))?.dataset.closeAction,
                };
              })();
            `);
            console.log('Smoke settings change:', settingsResult);
          }
          if (process.env.QUZHAN_SMOKE_FEATURES === '1') {
            const featureResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                document.getElementById('settingsButton').click();
                await wait(220);
                document.querySelector('[data-language="en"]').click();
                await wait(260);
                const enTitle = document.getElementById('settingsTitle').textContent;
                const enQueue = document.getElementById('queueCount').textContent;
                document.querySelector('[data-language="zh-TW"]').click();
                await wait(260);
                const twTitle = document.getElementById('settingsTitle').textContent;
                document.querySelector('[data-language="zh-CN"]').click();
                await wait(260);
                const search = document.getElementById('queueSearchInput');
                search.value = '潮汐';
                search.dispatchEvent(new Event('input', { bubbles: true }));
                await wait(180);
                const searchCount = document.getElementById('queueCount').textContent;
                const searchRows = document.querySelectorAll('.queue-row').length;
                search.value = '';
                search.dispatchEvent(new Event('input', { bubbles: true }));
                document.querySelector('[data-queue-filter="played"]').click();
                await wait(180);
                const playedRows = document.querySelectorAll('.queue-row').length;
                document.querySelector('[data-queue-filter="all"]').click();
                const shortcutButton = document.querySelector(
                  '[data-shortcut-action="next"]',
                );
                shortcutButton.click();
                document.dispatchEvent(
                  new KeyboardEvent('keydown', {
                    code: 'KeyG',
                    key: 'g',
                    bubbles: true,
                  }),
                );
                await wait(180);
                const shortcutText = document.querySelector(
                  '[data-shortcut-action="next"]',
                ).textContent;
                document.querySelector('[data-theme="tide"]').click();
                await wait(220);
                const themeAccent = getComputedStyle(document.documentElement)
                  .getPropertyValue('--accent-rgb')
                  .trim();
                return {
                  enTitle,
                  enQueue,
                  twTitle,
                  searchCount,
                  searchRows,
                  playedRows,
                  shortcutText,
                  themeAccent,
                  searchPlaceholder: search.placeholder,
                };
              })();
            `);
            console.log('Smoke features:', featureResult);
          }
          if (process.env.QUZHAN_SMOKE_OVERLAY_SWITCH === '1') {
            const switchResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const audio = document.getElementById('audio');
                audio.pause();
                audio.currentTime = 0;
                document.getElementById('desktopLyricsButton').click();
                await wait(700);
                document.querySelectorAll('.queue-row')[1].click();
                await wait(600);
                return {
                  title: document.getElementById('trackTitle').textContent,
                  firstLine: document.querySelector('.lyric-line')?.textContent || '',
                };
              })();
            `);
            let overlayLine = '';
            if (overlayWindow && !overlayWindow.isDestroyed()) {
              overlayLine = await overlayWindow.webContents.executeJavaScript(
                `document.getElementById('currentLine').textContent`,
              );
            }
            console.log('Smoke overlay switch:', { ...switchResult, overlayLine });
          }
          if (process.env.QUZHAN_SMOKE_SETTINGS_SCROLL) {
            const scrollResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const panel = document.querySelector('.settings-scroll');
                panel.scrollTop = ${Number(process.env.QUZHAN_SMOKE_SETTINGS_SCROLL) || 'panel.scrollHeight'};
                await new Promise((resolve) => setTimeout(resolve, 300));
                return { scrollTop: panel.scrollTop, scrollHeight: panel.scrollHeight };
              })();
            `);
            console.log('Smoke settings scroll:', scrollResult);
          }
          if (process.env.QUZHAN_SMOKE_KEYS === '1') {
            const keyResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                const beforeTitle = document.getElementById('trackTitle').textContent;
                document.dispatchEvent(
                  new KeyboardEvent('keydown', { code: 'KeyD', key: 'd', bubbles: true }),
                );
                await wait(450);
                const afterTitle = document.getElementById('trackTitle').textContent;
                const beforeTime = document.getElementById('audio').currentTime;
                document.dispatchEvent(
                  new KeyboardEvent('keydown', {
                    code: 'ArrowRight',
                    key: 'ArrowRight',
                    bubbles: true,
                  }),
                );
                await wait(450);
                const afterTime = document.getElementById('audio').currentTime;
                document.dispatchEvent(
                  new KeyboardEvent('keydown', { code: 'KeyF', key: 'f', bubbles: true }),
                );
                await wait(450);
                return {
                  beforeTitle,
                  afterTitle,
                  beforeTime,
                  afterTime,
                  lyricsButton: document.getElementById('desktopLyricsButton').textContent,
                };
              })();
            `);
            console.log('Smoke keys:', keyResult);
          }
          if (process.env.QUZHAN_SMOKE_CLOSE_DIALOG === '1') {
            const closeResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                document.getElementById('windowClose').click();
                await wait(450);
                return {
                  visible: !document.getElementById('closeDialog').hidden,
                  selected: document.querySelector('.close-choice input:checked')?.value,
                };
              })();
            `);
            console.log('Smoke close dialog:', closeResult);
          }
          if (process.env.QUZHAN_SMOKE_CONFIRM_TRAY === '1') {
            const closeResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
                document.getElementById('windowClose').click();
                await wait(400);
                document.getElementById('rememberCloseChoice').checked = true;
                document.querySelector('.close-choice input[value="tray"]').checked = true;
                document.getElementById('closeDialogConfirm').click();
                await wait(650);
                return {
                  dialogHidden: document.getElementById('closeDialog').hidden,
                  documentHidden: document.hidden,
                };
              })();
            `);
            console.log('Smoke confirm tray:', closeResult, 'windowVisible:', mainWindow.isVisible());
          }
          if (process.env.QUZHAN_SMOKE_CLOSE_AUTO === '1') {
            const closeResult = await mainWindow.webContents.executeJavaScript(`
              (async () => {
                document.getElementById('windowClose').click();
                await new Promise((resolve) => setTimeout(resolve, 550));
                return { dialogHidden: document.getElementById('closeDialog').hidden };
              })();
            `);
            console.log('Smoke remembered close:', closeResult, 'windowVisible:', mainWindow.isVisible());
          }
          if (process.env.QUZHAN_CAPTURE_OVERLAY_PATH) {
            await mainWindow.webContents.executeJavaScript(
              `document.getElementById('desktopLyricsButton').click()`,
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (overlayWindow && !overlayWindow.isDestroyed()) {
              const overlayImage = await overlayWindow.webContents.capturePage();
              await fsp.writeFile(process.env.QUZHAN_CAPTURE_OVERLAY_PATH, overlayImage.toPNG());
              console.log(`Overlay screenshot saved to ${process.env.QUZHAN_CAPTURE_OVERLAY_PATH}`);
            } else {
              console.error('Overlay window was not created');
            }
          }
          const image = await mainWindow.webContents.capturePage();
          await fsp.writeFile(process.env.QUZHAN_CAPTURE_PATH, image.toPNG());
          console.log(`Screenshot saved to ${process.env.QUZHAN_CAPTURE_PATH}`);
        } catch (error) {
          console.error('Screenshot failed:', error);
        } finally {
          app.quit();
        }
      }, Number(process.env.QUZHAN_CAPTURE_DELAY || 1200));
    });
  }
}

function sendOverlayState() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  overlayWindow.webContents.send('overlay:state', {
    payload: overlayPayload,
    playback: overlayPlayback,
  });
}

function overlayDimensions(scale = lastState.settings?.overlay?.scale) {
  const safeScale = clampNumber(scale, 0.7, 1.6, 1);
  return {
    scale: safeScale,
    width: Math.round(820 * safeScale),
    height: Math.round(172 * safeScale),
  };
}

function clampOverlayPosition(bounds, width, height) {
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  const x = Number.isFinite(bounds?.x) ? Math.round(bounds.x) : null;
  const y = Number.isFinite(bounds?.y) ? Math.round(bounds.y) : null;
  const visible = x != null && y != null && displays.some((display) => {
    const area = display.workArea;
    return x + width > area.x && x < area.x + area.width &&
      y + height > area.y && y < area.y + area.height;
  });
  if (visible) return { x, y, width, height };
  const area = primary.workArea;
  return {
    x: Math.round(area.x + (area.width - width) / 2),
    y: Math.round(area.y + area.height - height - 72),
    width,
    height,
  };
}

function applyOverlayWindowSettings() {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const settings = lastState.settings?.overlay || {};
  const { scale, width, height } = overlayDimensions(settings.scale);
  const current = overlayWindow.getBounds();
  const next = clampOverlayPosition(
    {
      x: current.x + (current.width - width) / 2,
      y: current.y + (current.height - height) / 2,
    },
    width,
    height,
  );
  overlayWindow.setBounds(next);
  overlayWindow.webContents.setZoomFactor(scale);
  overlayWindow.setOpacity(clampNumber(settings.opacity, 0.25, 1, 0.92));
  overlayWindow.setIgnoreMouseEvents(Boolean(settings.clickThrough), { forward: true });
  overlayWindow.webContents.send('overlay:settings', {
    locked: Boolean(settings.locked),
    clickThrough: Boolean(settings.clickThrough),
  });
}

function createOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) return overlayWindow;
  const { width, height } = overlayDimensions();
  const saved = lastState.overlayBounds || {};
  const initialBounds = clampOverlayPosition(saved, width, height);
  overlayWindow = new BrowserWindow({
    width,
    height,
    x: initialBounds.x,
    y: initialBounds.y,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    focusable: true,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'overlay-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.loadFile(path.join(__dirname, 'src', 'overlay.html'));
  overlayWindow.once('ready-to-show', () => {
    overlayWindow.showInactive();
    applyOverlayWindowSettings();
    sendOverlayState();
  });
  overlayWindow.on('moved', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      lastState.overlayBounds = overlayWindow.getBounds();
      scheduleStateWrite();
    }
  });
  overlayWindow.on('closed', () => {
    overlayWindow = null;
    lastState.desktopLyrics = false;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('desktopLyrics:visibility', false);
    }
    writeStateAtomically();
  });
  overlayWindow.webContents.on('will-navigate', (event) => event.preventDefault());
  return overlayWindow;
}

function setOverlayVisible(visible) {
  lastState.desktopLyrics = Boolean(visible);
  if (visible) {
    createOverlayWindow();
  } else if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.close();
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('desktopLyrics:visibility', Boolean(visible));
  }
  writeStateAtomically();
}

function registerIpc() {
  ipcMain.handle('app:get-state', async () => lastState);
  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    userData: app.getPath('userData'),
  }));
  ipcMain.on('media:origin', (event) => {
    event.returnValue = mediaBaseUrl;
  });
  ipcMain.handle('app:take-launch-actions', () => {
    const actions = {
      paths: pendingOpenPaths,
      openDefaultSettings: pendingOpenDefaultSettings,
    };
    pendingOpenPaths = [];
    pendingOpenDefaultSettings = false;
    return actions;
  });
  ipcMain.on('state:save', (_event, nextState) => {
    if (!nextState || typeof nextState !== 'object') return;
    const previousLanguage = lastState.settings?.language;
    lastState = normalizeState({
      ...nextState,
      windowBounds: mainWindow && !mainWindow.isDestroyed()
        ? (mainWindow.isMaximized() ? lastState.windowBounds : mainWindow.getBounds())
        : lastState.windowBounds,
      overlayBounds: overlayWindow && !overlayWindow.isDestroyed()
        ? overlayWindow.getBounds()
        : lastState.overlayBounds,
    });
    refreshAllowedMediaPaths();
    if (previousLanguage !== lastState.settings.language) refreshTrayMenu();
    scheduleStateWrite();
  });
  ipcMain.handle('state:flush', (_event, nextState) => {
    const previousLanguage = lastState.settings?.language;
    if (nextState && typeof nextState === 'object') {
      lastState = normalizeState({
        ...nextState,
        windowBounds: mainWindow && !mainWindow.isDestroyed()
          ? (mainWindow.isMaximized() ? lastState.windowBounds : mainWindow.getBounds())
          : lastState.windowBounds,
        overlayBounds: overlayWindow && !overlayWindow.isDestroyed()
          ? overlayWindow.getBounds()
          : lastState.overlayBounds,
      });
    }
    refreshAllowedMediaPaths();
    if (previousLanguage !== lastState.settings.language) refreshTrayMenu();
    flushStateNow();
    return true;
  });
  ipcMain.handle('dialog:import-audio', async (_event, existingPaths = []) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: mainText('importAudioTitle'),
      buttonLabel: mainText('addToQueue'),
      properties: ['openFile', 'multiSelections'],
      filters: [
        {
          name: mainText('audioFiles'),
          extensions: ['mp3', 'flac', 'm4a', 'aac', 'wav', 'ogg', 'oga', 'opus', 'webm'],
        },
        { name: mainText('allFiles'), extensions: ['*'] },
      ],
    });
    if (result.canceled || !result.filePaths.length) return null;
    return importAudioPaths(result.filePaths, existingPaths);
  });
  ipcMain.handle('audio:import-paths', async (_event, payload) => {
    if (Array.isArray(payload)) return importAudioPaths(payload);
    return importAudioPaths(payload?.paths, payload?.existingPaths);
  });
  ipcMain.handle('cover:palette', async (_event, filePath) => {
    try {
      if (!isAllowedMediaPath(filePath)) return null;
      return extractCoverPalette(filePath);
    } catch {
      return null;
    }
  });
  ipcMain.handle('cover:artwork', async (_event, filePath) => {
    try {
      if (!isAllowedMediaPath(filePath)) return '';
      return coverArtworkDataUrl(filePath);
    } catch {
      return '';
    }
  });
  ipcMain.handle('background:import', () => importBackgroundImage());
  ipcMain.handle('background:clear', async () => {
    const current = lastState.settings?.background?.path;
    if (current && mediaPathKey(current).startsWith(mediaPathKey(backgroundDir))) {
      await fsp.unlink(current).catch(() => {});
    }
    if (lastState.settings?.background) lastState.settings.background.path = '';
    refreshAllowedMediaPaths();
    scheduleStateWrite();
    return true;
  });
  ipcMain.handle('covers:cleanup', () => cleanupOrphanCovers());
  ipcMain.handle('path:reveal', async (_event, filePath) => {
    if (isAllowedMediaPath(filePath)) shell.showItemInFolder(filePath);
  });
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:toggle-maximize', () => {
    if (!mainWindow) return false;
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
    return mainWindow.isMaximized();
  });
  ipcMain.handle('window:close', () => mainWindow?.close());
  ipcMain.handle('window:hide-to-tray', () => {
    createTray();
    if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
    return true;
  });
  ipcMain.handle('app:quit', () => {
    quitting = true;
    app.quit();
    return true;
  });
  ipcMain.handle('window:is-maximized', () => Boolean(mainWindow?.isMaximized()));
  ipcMain.handle('app:open-user-data', async () => {
    await shell.openPath(app.getPath('userData'));
    return app.getPath('userData');
  });
  ipcMain.handle('associations:register', () => registerAudioAssociations());
  ipcMain.handle('associations:status', () => getAssociationStatus());
  ipcMain.handle('associations:open-default-apps', () => openDefaultAppsSettings());
  ipcMain.handle('desktopLyrics:show', (_event, payload) => {
    overlayPayload = payload || null;
    setOverlayVisible(true);
    sendOverlayState();
    return true;
  });
  ipcMain.handle('desktopLyrics:hide', () => {
    setOverlayVisible(false);
    return false;
  });
  ipcMain.handle('desktopLyrics:configure', (_event, settings) => {
    if (!settings || typeof settings !== 'object') return false;
    const current = lastState.settings.overlay || {};
    lastState.settings.overlay = {
      scale: clampNumber(settings.scale, 0.7, 1.6, current.scale ?? 1),
      opacity: clampNumber(settings.opacity, 0.25, 1, current.opacity ?? 0.92),
      locked: Boolean(settings.locked),
      clickThrough: Boolean(settings.clickThrough),
    };
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      applyOverlayWindowSettings();
    }
    scheduleStateWrite();
    return true;
  });
  ipcMain.on('desktopLyrics:update', (_event, playback) => {
    overlayPlayback = {
      time: clampNumber(playback?.time, 0, 24 * 60 * 60, 0),
      playing: Boolean(playback?.playing),
    };
    sendOverlayState();
  });
  ipcMain.on('overlay:close', () => setOverlayVisible(false));
  ipcMain.on('overlay:drag-start', () => {
    // The frameless overlay uses a native draggable region in its title strip.
  });
}

app.on('second-instance', (_event, commandLine) => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  const paths = extractAudioPathsFromArgv(commandLine.slice(1));
  if (paths.length) mainWindow.webContents.send('files:open', paths);
});

app.whenReady().then(async () => {
  app.setAppUserModelId('com.irisli.quzhan');
  pendingOpenPaths = extractAudioPathsFromArgv(process.argv.slice(1));
  pendingOpenDefaultSettings = process.argv.includes('--open-default-apps');
  stateFile = path.join(app.getPath('userData'), 'library.json');
  coverDir = path.join(app.getPath('userData'), 'covers');
  backgroundDir = path.join(app.getPath('userData'), 'backgrounds');
  await fsp.mkdir(coverDir, { recursive: true });
  await fsp.mkdir(backgroundDir, { recursive: true });
  await readState();
  if (process.env.QUZHAN_SMOKE_BACKGROUND) {
    const backgroundPath = path.resolve(process.env.QUZHAN_SMOKE_BACKGROUND);
    if (fs.existsSync(backgroundPath)) {
      lastState.settings.background.path = backgroundPath;
      allowMediaPath(backgroundPath);
    }
  }
  if (process.env.QUZHAN_SMOKE_OVERLAY === '1') {
    lastState.settings.overlay = {
      scale: 1.2,
      opacity: 0.7,
      locked: true,
      clickThrough: false,
    };
  }
  if (['en', 'zh-CN', 'zh-TW'].includes(process.env.QUZHAN_SMOKE_LANGUAGE)) {
    lastState.settings.language = process.env.QUZHAN_SMOKE_LANGUAGE;
  }
  await cleanupOrphanCovers();
  await cleanupOrphanBackgrounds();
  await startMediaServer();
  registerIpc();
  createMainWindow();
  createTray();
  registerAudioAssociations().catch((error) => {
    console.warn('Unable to register audio file associations:', error);
  });
  removeLegacyAudioAssociations().catch((error) => {
    console.warn('Unable to clean up legacy file associations:', error);
  });

  if (process.env.QUZHAN_SMOKE_AUDIO) {
    mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        mainWindow.webContents.send('smoke:import', process.env.QUZHAN_SMOKE_AUDIO);
      }, 400);
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('before-quit', () => {
  quitting = true;
  if (mediaServer) {
    mediaServer.close();
    mediaServer = null;
  }
  if (tray) {
    tray.destroy();
    tray = null;
  }
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isMaximized()) {
    lastState.windowBounds = mainWindow.getBounds();
  }
  flushStateNow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
