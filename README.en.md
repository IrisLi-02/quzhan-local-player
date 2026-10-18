# 曲栈 Quzhan Local Player

[简体中文](README.md) | **English**

A local-first music player for Windows, built around two problems that are often ignored: **a play queue should not disappear when the app closes**, and **shuffle should not repeat songs before the current listening round is finished**.

Quzhan does not upload music, connect to online catalogs, or require an account. It only reads local files that you explicitly import, and keeps your queue, playback position, cover art, and lyrics on your computer.

> Interface preview (synthetic test data):  
> ![Quzhan player interface](docs/preview.png)
>
> ![Quzhan settings](docs/settings-preview.png)

## Core Features

- Plays local audio formats supported by Chromium, including MP3, FLAC, M4A/AAC, WAV, OGG/OPUS, and WEBM.
- Restores the play queue, current track, playback position, playback mode, default volume, and default speed after restarting.
- Imports files from a file picker or by dragging files and whole folders into the queue. New tracks are appended in import order.
- Collapsible queue panel with single-click playback, long-press drag reordering, Ctrl multi-select, Shift range selection, move-to-top, move-to-bottom, and batch removal.
- The queue automatically scrolls to the current track on track changes, with a Locate current track button in the queue header.
- Sorts the queue by artist, song title using pinyin/letter order, or the original import order.
- Main player controls include cover art, synchronized lyrics, seek bar, previous/next track, −10 s/+10 s seeking, volume, speed, sequential playback, round-aware shuffle, single-track loop, and a loop over selected tracks.
- Reads embedded lyrics and sidecar `.lrc` files. Timed lyric lines can be clicked to seek.
- Independent always-on-top desktop lyrics window that remains active when the main window is minimized or hidden to the tray.
- Real-time audio spectrum above the player controls, which can be disabled in Settings.
- Settings for default playback speed, default volume, spectrum visibility, close-button behavior, Windows integration, and application information.
- Six colorways including Follow cover art and five fixed palettes for borders and desktop lyrics.
- English, Simplified Chinese, and Traditional Chinese interfaces. The installer defaults to English and offers a language choice at the start.
- Remappable shortcuts for play/pause, next, previous, ±10 seconds, and desktop lyrics.
- Queue search across title, artist, album, and filename, with played/unplayed filters.
- Desktop lyrics size and opacity controls, position locking, and click-through mode.
- Custom local background images for the listening stage, with blur, dimming, and slow ambient motion; GIF and animated WebP keep their animation.
- Cover copies are resized to a maximum edge of 640 px and deduplicated by content hash to keep the data folder small.
- Registers supported audio formats with Windows “Open with” after the app runs. The Windows Default Apps page can be opened directly from Settings.
- The first close action asks whether to minimize to the tray or fully quit, with an option to remember the choice.

## What Makes It Different

### 1. A queue that survives the session

Many local players keep the temporary play queue only in memory. Quzhan persists the queue itself and keeps drag order, manual moves, and original import order as separate state. You can reorder the queue heavily and still restore the original import order later.

### 2. Invisible round-played markers

When switching to shuffle, Quzhan does not pick from the whole queue randomly. It first excludes songs that have already been played in the current round. The markers are deliberately not shown as list decorations. Once every song has been played, the markers are cleared and a new round starts.

Markers can still be applied or cleared for a multi-selection, and all markers can be cleared from the queue options. They persist across restarts with the queue.

### 3. Local-first playback without a cloud account

Audio is streamed to Chromium from a temporary loopback-only local server. This enables seeking, a real-time spectrum, and stable local playback without uploading files. No telemetry, ads, online catalog, or account is included.

## Technical Overview

- Electron + Chromium + vanilla HTML/CSS/JavaScript
- `music-metadata` for duration, artist, album, embedded cover art, and embedded lyrics
- A local HTTP Range server for reliable seeking and playback
- Web Audio API for the real-time spectrum
- LRC timestamp parsing and synchronized desktop lyrics
- Custom frameless window, collapsible queue, long-press drag, and multi-selection
- Electron Tray support
- Windows registry integration for “Open with” and Default Apps registration

## Download

Check the repository's **Releases** page for:

- `Quzhan-Setup-0.6.0-x64.exe` — installer
- `Quzhan-Portable-0.6.0-x64.exe` — portable build
- `SHA256SUMS.txt` — release checksums

The UI supports English, Simplified Chinese, and Traditional Chinese.

## Build From Source

Requirements:

- Windows 10/11 x64
- Node.js 20+
- npm 10+

```bash
npm install
npm start
```

Build an unpacked Windows directory:

```bash
npm run pack
```

Build the portable and installer executables:

```bash
npm run dist
```

Outputs are written to `dist/` and are not committed to the source repository.

## Windows Default Player Behavior

Windows 10/11 does not allow ordinary applications or installers to silently change default file associations. This is a deliberate operating-system protection, not a missing feature.

Quzhan does the following:

1. Registers the app and supported audio formats with Windows “Open with” and the Default Apps candidates.
2. If “set as default audio player” is checked in the installer, launches Quzhan and opens the relevant Windows Default Apps page after installation.
3. After the user confirms the association in Windows, double-clicking an audio file opens it in Quzhan.

The Settings page therefore opens the official Windows confirmation UI instead of falsely reporting that the system default was silently changed.

## Data and Privacy

The queue, played markers, settings, and lyrics cache are stored in `library.json` inside the app data directory. Embedded cover art is copied into a `covers/` subdirectory.

The application does not collect telemetry, send playback history, include advertising, or contact an online music service. File paths are used only on the local machine.

## Known Limitations

- WMA, APE, and AIFF are not currently supported because Chromium cannot decode them directly.
- Windows requires the user to confirm default-app changes in system UI.
- Line-by-line desktop lyrics require `.lrc` or embedded timed lyrics. Plain lyrics are displayed without synchronization.
- The current build is not code-signed, so Windows SmartScreen may show a warning.
- The application currently targets Windows x64 only.
- The UI is currently Simplified Chinese only.

## Project Status and Author

This is a personal project and the first complete desktop application I have developed and published. It will continue to change based on real usage feedback.

- Author: Iris Li
- Contact: IrisLi-02@outlook.com
- Version: `0.6.0`
- Platform: Windows 10/11 x64

### AI Assistance Disclosure

The project was developed with assistance from **DeepSeek-V4.1-Flash** for code, interface work, and documentation. The author is responsible for product decisions, feature choices, testing, publishing, and ongoing maintenance. AI assistance does not change the author's responsibility for the project, its third-party dependencies, or its distribution.

This is my first complete project. If any unintentionally protected material is found, please contact me at the email above. After verification, the relevant material will be removed and an apology will be published promptly.

## Third-Party Components and Copyright

The repository does not include music files, another player's proprietary icons, album artwork, or source code. The application icon is an original geometric design.

Open-source components used by the project include Electron, Chromium, Node.js, `music-metadata`, and `electron-builder`, each under its respective license. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

The project does not currently grant an open-source redistribution license. Copyright belongs to Iris Li. Reasonable quotation, commentary, and reviews with clear attribution and a link to the original repository are permitted. See [LICENSE](LICENSE).

“曲栈” / “Quzhan” is the public name selected before release to reduce confusion with similarly named audio products. At the time of writing, an exact-name GitHub search did not find a similarly named player repository. This is not a trademark clearance or a guarantee that no conflicting mark exists. Commercial distribution should include a search of the relevant trademark databases.

This project is not affiliated with or endorsed by any other music player or audio product.

## Feedback

Bug reports, compatibility notes, and feature requests are welcome through GitHub Issues or `IrisLi-02@outlook.com`.
