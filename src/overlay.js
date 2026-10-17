(() => {
  'use strict';

  const currentElement = document.getElementById('currentLine');
  const nextElement = document.getElementById('nextLine');
  const artistElement = document.getElementById('artist');
  const progressBar = document.getElementById('progressBar');
  const closeButton = document.getElementById('closeButton');

  let payload = null;
  let playback = { time: 0, playing: false };
  let activeIndex = -2;

  function findTimedIndex(lines, time) {
    let low = 0;
    let high = lines.length - 1;
    let result = -1;
    while (low <= high) {
      const middle = (low + high) >> 1;
      if (Number(lines[middle].time) <= time + 0.04) {
        result = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }
    return result;
  }

  function setLineText(element, value) {
    const text = String(value || '');
    if (element.textContent === text) return;
    element.classList.add('changing');
    setTimeout(() => {
      element.textContent = text;
      requestAnimationFrame(() => element.classList.remove('changing'));
    }, 90);
  }

  function render(nextPayload, nextPlayback) {
    payload = nextPayload || payload;
    playback = nextPlayback || playback;
    document.body.classList.toggle('paused', !playback.playing);

    if (!payload) {
      setLineText(currentElement, '把每一次聆听留在原处');
      setLineText(nextElement, '聆音');
      return;
    }

    artistElement.textContent = [payload.artist, payload.title].filter(Boolean).join(' · ') || '聆音';
    if (payload.accent) {
      document.documentElement.style.setProperty('--accent', payload.accent);
      document.documentElement.style.setProperty('--accent-rgb', payload.accentRgb || '230, 168, 115');
    }

    const lines = Array.isArray(payload.lines) ? payload.lines : [];
    if (!lines.length) {
      setLineText(currentElement, payload.title || '聆音');
      setLineText(nextElement, payload.artist || '正在播放');
      progressBar.style.width = '0%';
      return;
    }

    let index = payload.timed ? findTimedIndex(lines, playback.time || 0) : 0;
    if (index < 0) index = 0;

    if (index !== activeIndex) {
      activeIndex = index;
      setLineText(currentElement, lines[index]?.text || '♪');
      setLineText(nextElement, lines[index + 1]?.text || '');
    }

    if (payload.timed) {
      const currentTime = Number(lines[index]?.time) || 0;
      const nextTime = Number(lines[index + 1]?.time) || currentTime + 1;
      const span = Math.max(0.8, nextTime - currentTime);
      const ratio = Math.min(1, Math.max(0, ((playback.time || 0) - currentTime) / span));
      progressBar.style.width = `${(20 + ratio * 80).toFixed(1)}%`;
    } else {
      progressBar.style.width = '36%';
    }
  }

  window.overlay.onState((value) => {
    if (!value) return;
    render(value.payload, value.playback);
  });

  closeButton.addEventListener('click', (event) => {
    event.stopPropagation();
    window.overlay.close();
  });
})();
