# 曲栈开发说明

本文件面向在本仓库中工作的编码代理和新对话。开始任何修改前，先读：

1. `docs/handoff.md`：当前进度、已做决策、已知问题和下一步。
2. 本文件：环境、命令、结构和不可违反的约定。

用户使用中文交流。代码注释和提交信息可以使用英文，但面向用户的界面文案、README 和使用说明必须保持中文为主；英文 README 需要与中文版同步。

## 项目快照

- 产品名：曲栈 / Quzhan Local Player
- 当前版本：`0.5.1`
- 平台：Windows 10/11 x64
- 技术栈：Electron 44、Chromium、原生 HTML/CSS/JavaScript、`music-metadata`
- 主进程：`main.cjs`（CommonJS）
- 渲染进程：`src/app.js`（单文件 IIFE，无框架、无打包器）
- 国际化：`src/i18n.js`（English / 简体中文 / 繁體中文）
- 预加载：`preload.cjs`、`overlay-preload.cjs`
- 当前没有自动化测试套件、lint 或 CI。不要声称存在 `npm test`。

## 版本号规则

使用语义化版本 `MAJOR.MINOR.PATCH`：

- `MAJOR`：不兼容变更，例如旧版数据/配置无法迁移、公开行为被移除、发布方式发生破坏性变化。达到 `1.0.0` 后尤其严格。
- `MINOR`：向后兼容的新功能，例如新增设置、主题、语言、搜索筛选。本轮 8 项功能原本可作为 `0.5.0`，最终按用户要求以 `0.5.1` 发布。
- `PATCH`：向后兼容的 Bug 修复、安全修复、性能优化、文案和小样式修正，例如 `0.4.1`。
- `0.x` 阶段可以更灵活：不兼容变更通常进 `MINOR`，但仍应在 Release Notes 里明确说明。

## 环境与命令

### 首次安装

要求 Node.js 20+、npm 10+。推荐使用锁文件安装：

```powershell
npm ci
```

npm 11 可能因为 allow-scripts 策略跳过 Electron 的二进制下载。若出现
`node_modules\electron\dist\electron.exe` 不存在，补跑：

```powershell
node node_modules\electron\install.js
```

### 开发运行

```powershell
npm start
```

`npm run dev` 目前只是 `electron . --dev`；主进程没有读取 `--dev`，行为与
`npm start` 基本相同。调试渲染进程时使用 `QUZHAN_DEV_LOG=1`。

### 构建

```powershell
# 目录版，输出到 dist\win-unpacked
npm run pack

# 便携版 + NSIS 安装版，输出到 dist
npm run dist
```

`package.json` 已配置使用本地 `node_modules/electron/dist`。如果该目录缺失，先补跑 Electron 安装脚本，再重新构建。

如果目录版已存在、只想重新生成安装包，可直接复用目录版：

```powershell
node_modules\.bin\electron-builder.cmd --win portable nsis --prepackaged dist\win-unpacked
```

如果 `npm run pack` 也卡在下载 Electron，可直接使用本地已下载的 Electron 目录：

```powershell
node_modules\.bin\electron-builder.cmd --dir --config.electronDist=node_modules\electron\dist
```

`release/` 是本地构建资产目录，已被 `.gitignore` 忽略；不要把安装包、发布脚本或上传指南提交到源码仓库。

### 语法检查

```powershell
node --check main.cjs
node --check preload.cjs
node --check overlay-preload.cjs
node --check src\app.js
node --check src\overlay.js
```

### 冒烟测试

项目没有单元测试，只有主进程内置的冒烟开关。所有冒烟动作都要求设置
`QUZHAN_CAPTURE_PATH`；否则主进程不会进入冒烟分支。

先生成测试音频、封面和测试档案（需要 Pillow）：

```powershell
python scripts\make-fixtures.py
```

一个最小验证命令：

```powershell
$env:QUZHAN_DATA_DIR = (Resolve-Path 'work\test-profile').Path
$env:QUZHAN_CAPTURE_PATH = (Join-Path (Get-Location) 'work\smoke.png')
$env:QUZHAN_SMOKE_PLAY = '1'
$env:QUZHAN_SMOKE_QUEUE = '1'
$env:QUZHAN_SMOKE_SEEK = '1'
$env:QUZHAN_SMOKE_SETTINGS = '1'
node_modules\.bin\electron.cmd .
```

可用开关：

| 环境变量 | 作用 |
| --- | --- |
| `QUZHAN_DATA_DIR` | 使用隔离的用户数据目录，测试时必填，避免污染真实队列 |
| `QUZHAN_CAPTURE_PATH` | 截图输出路径；同时启用冒烟分支 |
| `QUZHAN_CAPTURE_DELAY` | 截图/冒烟开始前延迟，默认 1200ms |
| `QUZHAN_CAPTURE_OVERLAY_PATH` | 桌面歌词窗截图路径 |
| `QUZHAN_SMOKE_AUDIO` | 启动后导入指定音频路径 |
| `QUZHAN_SMOKE_QUEUE` | 测试多选、标记已听、移到队首 |
| `QUZHAN_SMOKE_DRAG` | 测试长按拖拽排序 |
| `QUZHAN_SMOKE_SORT` | 测试排序和恢复导入顺序 |
| `QUZHAN_SMOKE_SHUFFLE` | 测试一轮随机切歌 |
| `QUZHAN_SMOKE_PLAY` | 测试播放，输出 `currentTime`、`readyState`、`error` |
| `QUZHAN_SMOKE_SEEK` | 测试跳转；注意它会在播放测试后再次点击播放按钮，可能把手动播放暂停 |
| `QUZHAN_SMOKE_SETTINGS` | 打开设置页并读取版本/关闭行为 |
| `QUZHAN_SMOKE_SETTINGS_CHANGE` | 修改默认倍速、音量和频谱设置 |
| `QUZHAN_SMOKE_CLOSE_DIALOG` | 打开关闭确认框 |
| `QUZHAN_SMOKE_CONFIRM_TRAY` | 选择“记住并最小化到托盘” |
| `QUZHAN_SMOKE_CLOSE_AUTO` | 验证已记住的关闭行为 |
| `QUZHAN_DEV_LOG` | 转发渲染进程控制台和 preload 错误 |
| `QUZHAN_FORCE_ASSOCIATIONS` | 开发模式下强制写 Windows 注册表；除非明确要求，不要使用 |
| `QUZHAN_SMOKE_FEATURES` | 验证三语切换、搜索、筛选、快捷键重绑和主题切换 |
| `QUZHAN_SMOKE_LANGUAGE` | 用 `en`、`zh-CN` 或 `zh-TW` 启动界面 |
| `QUZHAN_SMOKE_BACKGROUND` | 将指定图片作为测试背景 |
| `QUZHAN_SMOKE_OVERLAY` | 验证桌面歌词缩放和不透明度设置 |
| `QUZHAN_SMOKE_OVERLAY_SWITCH` | 验证切歌后桌面歌词刷新 |
| `QUZHAN_SMOKE_KEYS` | 验证默认快捷键（下一首/后 10 秒/桌面歌词） |
| `QUZHAN_SMOKE_SETTINGS_SCROLL` | 滚动设置页，用于检查下半部分布局 |

冒烟结束后检查控制台输出和 `work/smoke.png`。测试产物都在 `work/`，不要提交。

## 目录结构

| 路径 | 作用 |
| --- | --- |
| `main.cjs` | Electron 主进程：窗口、托盘、IPC、状态持久化、媒体 HTTP 服务、元数据、注册表集成 |
| `preload.cjs` | 通过 `contextBridge` 暴露受控的 `window.quzhan` API |
| `overlay-preload.cjs` | 桌面歌词窗的最小 API |
| `src/index.html` | 主窗口 DOM 和内联 SVG 图标 sprite |
| `src/app.js` | 主窗口全部交互、队列、歌词、频谱、设置和状态逻辑 |
| `src/i18n.js` | 三语字典、静态 DOM 翻译和语言切换 |
| `src/styles.css` | 主窗口样式、布局、动效和主题变量 |
| `src/overlay.html` / `overlay.js` / `overlay.css` | 独立置顶桌面歌词窗 |
| `build/installer.nsh` | NSIS 安装器自定义页面、快捷方式、默认播放器选项、旧版清理 |
| `scripts/make-fixtures.py` | 生成测试音频、封面和 `library.json` |
| `scripts/make-icon.py` | 生成应用图标 |
| `docs/` | 用户文档、截图和交接记录 |
| `release/` | 本地发布资产，已被忽略 |
| `dist/` | 构建输出，已被忽略 |
| `work/` | 测试档案、测试音频和截图，已被忽略 |

## 架构与数据流

### 主进程

- 启动时确定 `userData`，打包版会从旧 `lingyin-player` 数据目录迁移。
- `library.json` 保存队列、当前歌曲、进度、模式、设置、窗口位置等。
- `normalizeState()` 是持久化数据的唯一入口；任何从磁盘或渲染进程来的状态都必须经过它。
- `state:save` 只更新主进程内存中的 `lastState`；`state:flush` 才原子写入磁盘。
- 本地 HTTP 服务绑定 `127.0.0.1`，使用随机端口和高熵 token，支持 Range。
- 媒体请求只允许已登记的音频、封面和背景路径；不要再引入无路径白名单的自定义协议。

### 渲染进程

- `src/app.js` 是一个 IIFE，不依赖模块系统或构建步骤。
- `state` 是渲染层的可写状态；重要操作调用 `scheduleSave(true)`，普通进度用 `scheduleSave()`。
- 队列条目以 `id` 为稳定标识；`importOrder` 保存最初导入顺序，排序和手动拖动不应改写它。
- 播放模式：`sequential`、`shuffle`、`repeat-one`、`selection`。
- `played` 是一轮随机用的隐藏标记，不要把它做成队列的可见装饰，除非用户明确要求。

### 窗口与 IPC

- 主窗口和歌词窗都启用 `contextIsolation`、禁用 `nodeIntegration`。
- preload 只暴露具体方法，不暴露 `ipcRenderer` 本身。
- IPC 命名保持现有风格：`window:*`、`state:*`、`audio:*`、`desktopLyrics:*`、`associations:*`。
- 主窗口禁止导航和新窗口；外部链接只能通过受控的 `shell.openExternal` 打开。

## 代码约定

- 主进程和 preload 使用 CommonJS；渲染层保持原生 DOM API。
- 新增 DOM 内容时优先使用 `textContent` / `replaceChildren`；必须拼 HTML 时使用现有 `escapeHtml()`，不要把歌曲标题、歌手、歌词或文件路径直接插入 `innerHTML`。
- 用户可见文案使用简体中文；日期、版本和格式说明保持一致。
- 持久化数值必须使用 `clamp` / `clampNumber` 或 `normalizeState`，不要信任磁盘和渲染进程输入。
- 重要状态变更（队列、模式、设置、关闭行为、桌面歌词开关）使用 `scheduleSave(true)`；不要只修改内存。
- 新增设置项时同时处理：默认值、`normalizeState()`、`renderSettings()`、事件绑定、README/使用说明。
- 新增界面文案时优先写入 `src/i18n.js`，动态文本用 `t()`，静态 HTML 用可被 `translateDocument()` 识别的中文原文；不要只补简体中文。
- 新增主题时同时处理 `THEME_CONFIG`、主题色块、`applyTheme()` 和桌面歌词 payload。
- 新增快捷键时同时处理 `SHORTCUT_ACTIONS`、默认值、冲突检测、录制状态和持久化。
- 新增本地图片路径时，必须通过主进程 IPC 复制到应用数据目录，并加入 `allowedMediaPaths`；不要让渲染层直接读取任意路径。
- 新增音频格式时同时处理：`AUDIO_EXTENSIONS`、`OPEN_WITH_EXTENSIONS`、`MIME_TYPES`、文件选择器过滤器、文档和真实播放验证。
- 新增 IPC 时同时处理：preload 暴露、渲染层调用、错误处理、权限边界。
- 保持现有视觉语言：深色背景、暖色强调、无边框窗口、圆角和细线；不要引入与现有界面冲突的组件库。
- 图标优先复用 `src/index.html` 中的 SVG sprite；不要引入新的图标包。
- 依赖保持精简。新增生产依赖前确认许可证、包体积、Electron 兼容性和是否需要原生模块。
- 版本号只在用户明确要求发版时修改；`package.json`、README、使用说明、RELEASE_NOTES 要同步。

## 禁止事项

- 禁止提交 `node_modules/`、`dist/`、`release/`、`work/`、`library.json`、`covers/`、音频文件、日志或任何用户音乐数据。
- 禁止把真实用户目录、真实音乐路径或 `%APPDATA%` 内容写进仓库、测试夹具或截图。
- 禁止在未经平台书面授权的情况下，接入网易云音乐、QQ 音乐等平台的账号登录、歌单同步或音频流播放；不要使用逆向接口、Cookie 注入、二维码协议模拟、第三方 API 镜像或 VIP 绕过。需要在线音乐能力时，只能走官方合作/开放平台，或采用“打开官方客户端 / 手动导入歌单 / 匹配本地文件”的低风险方案。
- 禁止关闭 `contextIsolation`、开启 `nodeIntegration`、移除 CSP 或把 `ipcRenderer` 整体暴露给页面。
- 禁止在没有明确要求时修改 Windows 注册表或文件关联。
- 禁止在仓库中提交自动发布脚本、上传指南或其它发布凭据；README/使用说明不要描述维护者的上传方式。
- 禁止在开发/测试中删除、移动或改写用户的原始音乐文件；清理只允许针对该项目自己的 `work/` 或明确指定的测试目录。
- 禁止使用 `git reset --hard`、`git checkout --`、强制推送或删除未提交改动来“清理”工作区。
- 禁止把 `library.json` 的原始内容直接回写而不经过 `normalizeState()`。
- 禁止在测试中复用真实用户数据目录；始终设置隔离的 `QUZHAN_DATA_DIR`。
- 禁止在没有构建和冒烟验证的情况下宣称某个格式、安装器或发布流程可用。
- 禁止把未转义的歌曲元数据、歌词或文件路径拼进 `innerHTML`。
- 禁止为了修一个局部问题而引入大型框架、打包器或在线服务；本项目当前是原生 Electron 单体结构。

## 验收清单

改动后至少执行：

1. 五个 `node --check`。
2. `npm run pack`。
3. 使用隔离 `QUZHAN_DATA_DIR` 跑一次播放冒烟，确认 `error: null`、`readyState` 正常、截图可打开。
4. 如果改了队列：测试导入、排序、拖拽、删除、重启恢复。
5. 如果改了播放：测试顺序、随机、单曲循环、选中循环、上一首/下一首、进度恢复。
6. 如果改了歌词：测试内嵌歌词、`.lrc`、切歌、桌面歌词、主窗口隐藏到托盘。
7. 如果改了状态：关闭应用后重新启动，确认队列、当前歌曲、进度、模式和设置恢复。

AIFF/AIF 已从支持格式、文件选择器和 Windows 关联中移除：Electron/Chromium 实测无法解码标准 AIFF
（`DEMUXER_ERROR_COULD_NOT_OPEN`）。不要重新加入声明，除非先引入可靠的解码/转码路径。

## 交接要求

每个阶段结束更新 `docs/handoff.md`，至少包含：

- 当前进度和已验证的命令/结果；
- 已做的产品与技术决策；
- 未完成事项和下一步建议；
- 新踩的坑、失败复现方式、不要重复尝试的做法；
- 当前分支、版本和工作区是否干净。

下个对话开始先读 `docs/handoff.md`，再读本文件，不要从头重新调研。

## 法律与合规提醒

用户明确要求：以后提出新功能时，如果存在版权、平台条款、账号授权、隐私、商标、分发或其它法律风险，要在实现前主动指出，并说明风险等级和更安全的替代方案。高风险功能不要先写代码再补说明；先让用户确认是否继续。
