# 曲栈交接记录

最后更新：2026-10-18  
当前分支：`main`  
当前版本：`0.6.0`（已发布）
工作区：本轮新增封面缓存优化和队列定位功能，尚未提交 Git。

## 当前进度

本阶段完成了上一轮审查列出的已知 Bug、主要中优先级问题，以及用户提出的 8 项新功能。

### 本轮增量（尚未发布）

- 版本号确定为 `0.6.0`（新增功能和缓存优化，按语义化版本进入 MINOR）。
- 新增封面缓存优化：新封面压缩到最长边 640px、JPEG 质量 82，并按内容 SHA-256 去重；启动后会自动整理已有封面，旧文件在状态保存后清理。
- 新增队列定位按钮：切歌时队列自动滚动到当前歌曲；标题栏定位按钮可在队列收起、搜索或筛选隐藏当前歌曲时展开/清除筛选并高亮定位。

### 已明确不做：在线账号/链接模式

评估过“登录网易云音乐或 QQ 音乐账号、读取账户歌单并在曲栈内播放”的模式。技术上可行，但未经平台授权接入账号、歌单和音频流存在用户协议、账号风控、著作权及不正当竞争风险；即使不绕过 VIP 也不等于自动合规。用户已决定不开发该功能。

后续如再做在线音乐相关能力，只考虑官方授权合作，或“打开官方客户端 / 手动导入歌单 / 匹配本地文件”的低风险方案；不要使用逆向接口、Cookie 注入、第三方 API 镜像或 VIP 绕过。

### Bug 与中优先级修复

- AIFF/AIF 不再出现在支持格式、文件选择器和 Windows 关联中；Electron 44.9.0 实测无法解码标准 AIFF。
- 修复旧版数据迁移只复制封面、不重写 `coverPath` 的问题。
- 修复桌面歌词切歌后可能停留在上一首第一行的问题。
- 频谱关闭后不再在启动时启动 `requestAnimationFrame` 循环。
- 播放成功后清除 `missing` 标记。
- 按规范化路径去重导入，避免重复歌曲和重复封面。
- 启动时清理无引用的封面和背景文件。
- 修复窗口恢复坐标可能落在屏幕外的问题。
- 媒体服务增加已登记路径白名单，并移除未使用的 `quzhan-media://` 协议。
- 状态写入改为短延迟落盘，关闭/隐藏前使用真正的 `state:flush`。
- 上一版发布时已生成 `SHA256SUMS.txt`；发布脚本已从仓库移除。
- 设置页打开时只查询关联状态，不再顺带写注册表。
- `npm run dev` 的 `--dev` 现在会启用渲染进程日志。
- 修复空队列删除当前歌曲后桌面歌词窗未关闭的问题。
- 封面加载失败时有 fallback，不再显示破图。
- 进度条缓冲区域现在根据 `audio.buffered` 显示。

### 8 项新功能

1. **主题配色**：跟随封面 + 琥珀、潮汐、苔原、夜莓、靛蓝五种固定主题；主界面边框、强调色和桌面歌词同步换色。
2. **快捷键**：播放/暂停 `Space`、下一首 `KeyD`、上一首 `KeyA`、后 10 秒 `ArrowRight`、前 10 秒 `ArrowLeft`、桌面歌词 `KeyF`；可在设置中录制新组合键，检测冲突并持久化。
3. **三语**：English、简体中文、繁體中文；安装器提供语言选择并默认 English，应用内可随时切换。
4. **搜索**：队列工具栏下方可按歌名、歌手、专辑或文件名搜索；`Ctrl+F` 聚焦搜索框。
5. **筛选**：全部 / 已标记 / 未标记；筛选和搜索可组合使用，清除后恢复完整队列。
6. **桌面歌词属性**：缩放、整体不透明度、锁定位置、鼠标穿透；主进程通过 `BrowserWindow.setOpacity`、缩放和 `setIgnoreMouseEvents` 实现。
7. **频谱优化**：提高 FFT 分辨率、降低平滑系数、加快 attack/decay，并加入低频能量增强，让跳动更有律动。
8. **自定义背景**：可导入 JPG/PNG/WebP/GIF/BMP/AVIF，复制到应用数据目录；支持模糊、调暗、静态图片呼吸动画，GIF/动态 WebP 保留动画。

## 已验证

环境：

- Windows 10.0.26200
- Node.js `v24.19.0`
- npm `11.17.0`
- Electron `44.9.0`
- electron-builder `26.15.3`

已通过：

```powershell
npm ci
node node_modules\electron\install.js
node --check main.cjs
node --check preload.cjs
node --check overlay-preload.cjs
node --check src\app.js
node --check src\i18n.js
node --check src\overlay.js
npm run pack
node_modules\.bin\electron-builder.cmd --dir --config.electronDist=node_modules\electron\dist
node_modules\.bin\electron-builder.cmd --win portable nsis --prepackaged dist\win-unpacked
npm run dist
```

冒烟结果：

- 开发版播放：`time` 正常推进，`readyState=4`，`error=null`。
- 开发版功能冒烟：英文 Settings、繁体 設定、搜索 `1 / 3`、筛选、快捷键重绑为 `G`、主题色切到潮汐均成功。
- 打包版同样通过功能冒烟，说明 `src/i18n.js`、asar 和媒体白名单在打包后可用。
- 默认快捷键冒烟：`D` 切到下一首、`→` 前进约 10 秒、`F` 打开桌面歌词均成功。
- 背景 + 桌面歌词截图验证：背景模糊/调暗可见，桌面歌词按 1.2 倍大小和 0.7 不透明度显示。
- 切歌后桌面歌词首行刷新正常。
- `npm run dist` 使用本地 `node_modules\electron\dist` 成功生成便携版和 NSIS 安装版；自定义语言页和选项页编译通过。
- 0.5.1 构建产物已生成：`dist/Quzhan-Portable-0.5.1-x64.exe`、`dist/Quzhan-Setup-0.5.1-x64.exe`。
- 已把两个 0.5.1 安装包和 `SHA256SUMS.txt` 上传到 GitHub Release。
- 打包版设置页实测版本号为 `V 0.5.1`，播放 `readyState=4`、`error=null`。
- 已发布：commit `14eb036`，Release `v0.5.1`，便携版/安装版/校验和均为 uploaded 状态。
- 封面优化测试：309 个旧封面、约 477.59 MB；压缩后单张约 34 KB（测试夹具从约 79 KB 降到约 34 KB），重复封面 3 份复用 1 个文件。
- 真实旧数据验证：`covers` 从 477.59 MB / 309 文件降到 14.79 MB / 249 文件；309 条有封面的队列项全部指向有效文件。
- 定位冒烟：列表滚动、定位按钮、当前行高亮均通过；默认切歌滚动在受限列表高度下产生滚动位置。
- `0.6.0` 目录版和安装包构建成功：`dist-0.6.0\Quzhan-Portable-0.6.0-x64.exe`、`dist-0.6.0\Quzhan-Setup-0.6.0-x64.exe`；打包版设置页实测 `V 0.6.0`。
- 本地 `release/` 已放入 0.6.0 安装包并生成校验和；0.5.1 安装包归档到 `release/archive-0.5.1/`。
- 已发布：commit `a97927f`，Release `v0.6.0`，便携版/安装版/校验和均为 uploaded 状态。

`package.json` 已配置 `electronDist: node_modules/electron/dist`，因此完整构建不会再因
electron-builder 下载 Electron 而卡住；前提是本地 Electron 二进制已安装。

## 已做的决策

- **AIFF 移除而不是硬补解码**：当前没有可靠的 Chromium 解码路径，保留声明会继续误导用户；WAV/FLAC 等可用格式保留。
- **应用内默认语言为简体中文**：安装器按用户要求默认 English；已装用户升级时不会被强制切成英文。
- **主题“跟随封面”保留原有行为**：固定主题只覆盖强调色，不改变封面和歌词内容。
- **背景复制到 `userData/backgrounds/`**：不依赖原始图片路径，避免用户移动原图后背景失效。
- **背景和封面都走本地媒体服务白名单**：移除未使用的自定义协议，减少任意路径读取面。
- **快捷键使用 `KeyboardEvent.code`**：不受输入法或键盘布局字符影响；录制时忽略单独修饰键。
- **封面按内容哈希去重**：同一张封面只保留一个压缩文件；不直接保存原始内嵌大图，避免 `covers/` 长期膨胀。
- **切歌滚动只在队列打开时发生**；队列收起时点击定位按钮会先展开队列，再定位并高亮。
- **版本号已按用户要求改为 `0.5.1`**：功能和修复保留，已提交并发布。
- **发布脚本不上传**：`一键发布.ps1` 与 `docs/GITHUB_发布指南.md` 已从仓库移除，README/使用说明不描述维护者的上传方式。
- **不开发在线账号/链接模式**：无平台书面授权，不接入网易云/QQ 音乐账号、歌单同步或内嵌播放。

## 仍需注意

- 大队列仍未做虚拟列表；搜索每次输入会重建可见行，队列上千后可能卡顿。
- 设置页的背景预览不会实时呈现模糊/调暗的最终效果，实际背景已生效。
- 安装器语言页已编译通过，但没有用真实鼠标逐页走完安装流程；首次发布前建议手动点一遍英文/简中/繁中。
- `clickThrough` 开启后桌面歌词窗无法接收鼠标事件，必须先回主窗口设置关闭；设置页已有说明。
- 媒体白名单主要防止渲染层随意读取路径，但 `state:save` 本身仍信任本地渲染层；若未来加入远程内容，需要进一步收紧。
- 如果 `node_modules\electron\dist\electron.exe` 不存在，先运行 `node node_modules\electron\install.js`，否则打包无法使用本地 Electron。
- 当前版本为 `0.6.0`，已提交并发布。
- 真实旧数据已完成封面优化：`covers` 从 477.59 MB 降到 14.79 MB。

## 下一步建议

1. `0.6.0` 已完成源码推送和 Release 发布。
2. 后续改动按新版本号处理，并更新 `RELEASE_NOTES.md`、README/使用说明。
3. 若要继续打磨：优先做队列虚拟列表、背景预览实时化、安装器三语逐页验收。
4. 每次改动后按 `AGENTS.md` 的验收清单执行语法检查、`npm run pack`、隔离数据目录冒烟。

## 踩过的坑

- npm 11 会跳过 Electron 的安装脚本；`npm ci` 后要检查 `node_modules\electron\dist\electron.exe`。
- `app:get-state` 不能再调用 `readState()`，否则测试环境里主进程刚设置的临时语言/主题会被磁盘旧值覆盖。
- NSIS 自定义 `LangString` 必须在 electron-builder 的 `addLangs` 之前处理；`${LANG_ENGLISH}` 此时尚未定义，直接使用会触发 warning-as-error。改用 LCID：`1033`、`2052`、`1028`。
- `MUI_LANGDLL_ALWAYSSHOW` 与 `displayLanguageSelector` 配合才会在安装开始时稳定显示语言页。
- 桌面歌词冒烟如果先把 `desktopLyrics=true`，capture 分支再点击按钮会把它关掉；测试时应让 capture 分支自己打开。
- 搜索/筛选后的范围选择应基于可见行，而不是完整队列；当前实现已按可见行处理。
- 英文/繁体 UI 中歌曲标题、歌手、专辑、歌词属于用户内容，不会被翻译，这是预期行为。
- 封面优化会在启动后异步执行；如果旧的 `曲栈.exe` 实例仍在运行，新版本无法接管，需要先关闭旧实例再启动新版本。

## 关键文件

| 需求 | 文件 |
| --- | --- |
| 启动、窗口、托盘、IPC、媒体服务 | `main.cjs` |
| 队列/播放/歌词/频谱/设置/主题/快捷键/背景 | `src/app.js` |
| 三语字典和 DOM 翻译 | `src/i18n.js` |
| 主窗口结构 | `src/index.html` |
| 主窗口样式 | `src/styles.css` |
| 桌面歌词 | `src/overlay.js`、`src/overlay.html`、`src/overlay.css` |
| 安装器语言和选项页 | `build/installer.nsh`、`package.json` |
| 发布资产 | `release/`（本地忽略目录） |
| 测试数据 | `scripts/make-fixtures.py` |
