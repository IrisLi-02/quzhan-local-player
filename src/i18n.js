(() => {
  'use strict';

  const EN = {
    '曲栈': 'Quzhan',
    '设置': 'Settings',
    '播放': 'Play',
    '播放设置': 'Playback',
    '默认倍速': 'Default speed',
    '每次启动曲栈时使用的初始播放速度': 'The speed Quzhan starts with each time',
    '默认音量': 'Default volume',
    '启动时使用，调整后会立即应用': 'Used at startup; changes apply immediately',
    '实时频谱': 'Live spectrum',
    '关闭后隐藏播放栏上方的音频响应柱状图': 'Hide the responsive spectrum above the player',
    'Windows 集成': 'Windows integration',
    '默认音频播放器': 'Default audio player',
    '正在检查文件关联状态…': 'Checking file associations…',
    '打开默认应用设置': 'Open Default Apps',
    'Windows 10/11 要求由用户本人在系统界面确认默认应用。曲栈会先把 MP3、FLAC、WAV 等格式登记到“打开方式”，再直接打开对应的系统设置页。': 'Windows 10/11 requires you to confirm default apps yourself. Quzhan registers MP3, FLAC, WAV and other formats under Open with, then opens the system settings page.',
    '关闭按钮行为': 'Close button behavior',
    '每次询问': 'Ask every time',
    '点击关闭时显示选择弹窗': 'Show a choice dialog when closing',
    '最小化到托盘': 'Minimize to tray',
    '音乐继续播放，应用留在任务栏托盘': 'Keep playing and leave Quzhan in the system tray',
    '完全退出': 'Quit completely',
    '停止播放并结束曲栈进程': 'Stop playback and end the Quzhan process',
    '应用信息': 'About',
    '版本': 'Version',
    '作者': 'Author',
    '联系': 'Contact',
    '技术': 'Built with',
    '许可': 'License',
    '保留所有权利，详见 LICENSE': 'All rights reserved. See LICENSE.',
    '打开应用数据目录': 'Open app data folder',
    '为本地音乐保留一条不会丢失的聆听路径': 'A listening path for local music that never gets lost',
    '播放队列': 'Play queue',
    '添加': 'Add',
    '排序': 'Sort',
    '曲目': 'Track',
    '队列': 'Queue',
    '本轮余下': 'Left this round',
    '歌词': 'Lyrics',
    '桌面歌词': 'Desktop lyrics',
    '顺序': 'Sequential',
    '随机': 'Shuffle',
    '单曲': 'Repeat one',
    '选中': 'Selected',
    '一轮随机': 'Round shuffle',
    '循环选中': 'Loop selection',
    '下一首': 'Next',
    '上一首': 'Previous',
    '播放 / 暂停': 'Play / Pause',
    '暂停': 'Pause',
    '后退 10 秒': 'Back 10 seconds',
    '前进 10 秒': 'Forward 10 seconds',
    '音量': 'Volume',
    '静音': 'Mute',
    '取消静音': 'Unmute',
    '播放速度': 'Playback speed',
    '速度': 'Speed',
    '最大化': 'Maximize',
    '还原': 'Restore',
    '最小化': 'Minimize',
    '收起播放队列': 'Collapse queue',
    '展开播放队列': 'Expand queue',
    '展开 / 收起播放队列': 'Expand / collapse queue',
    '展开或收起播放队列': 'Expand or collapse queue',
    '关闭': 'Close',
    '关闭设置': 'Close settings',
    '打开设置': 'Open settings',
    '在文件夹中显示': 'Show in folder',
    '在桌面上显示当前歌词': 'Show current lyrics on desktop',
    '队列选项': 'Queue options',
    '清空已听标记': 'Clear played marks',
    '清除全部已听标记': 'Clear all played marks',
    '清空播放队列': 'Clear queue',
    '排序播放队列': 'Sort queue',
    '队列排序': 'Queue sorting',
    '确定清空队列？': 'Clear the play queue?',
    '队列和其中的已听标记都会被清除。此操作无法撤销。': 'The queue and its played marks will be cleared. This cannot be undone.',
    '按歌手排序': 'Sort by artist',
    '按首字母排序': 'Sort by title',
    '恢复默认顺序': 'Restore import order',
    '按歌名拼音或字母顺序排列': 'Sort titles by pinyin or letter',
    '恢复为歌曲最初加入播放队列的顺序': 'Restore the original import order',
    '同一歌手的歌曲会排在一起，再按标题排列': 'Group tracks by artist, then title',
    '按队列从上到下播放，结束后从头继续': 'Play from top to bottom, then start over',
    '优先未听歌曲，整轮听完后自动清空标记': 'Prefer unplayed tracks; clear marks after a full round',
    '反复播放当前歌曲': 'Repeat the current track',
    '播放方式': 'Playback mode',
    '顺序播放': 'Sequential',
    '一轮随机：跳过本轮已听过的歌': 'Round shuffle: skip tracks already played this round',
    '单曲循环': 'Repeat one',
    '循环选中歌曲': 'Loop selected tracks',
    '标记为已听': 'Mark as played',
    '清除已听标记': 'Clear played mark',
    '从队列移除': 'Remove from queue',
    '全选队列': 'Select all',
    '取消全选': 'Clear selection',
    '移到队首': 'Move to top',
    '移到队尾': 'Move to bottom',
    '取消选择': 'Clear selection',
    '首已选': 'selected',
    'Ctrl 点击多选 · Shift 选择区间': 'Ctrl-click to multi-select · Shift-click for a range',
    '浏览本地音频': 'Browse local audio',
    '松手加入播放队列': 'Drop to add to the queue',
    '支持文件与整个文件夹': 'Files and whole folders are supported',
    '队列还是空的': 'The queue is empty',
    '播放队列还是空的': 'The play queue is empty',
    '点“添加”选择音乐，或把文件直接拖到这里。退出后队列会留在原处。': 'Choose music with Add, or drag files here. Your queue stays after you quit.',
    '选择本地音乐': 'Choose local music',
    '自动保存': 'Auto-saved',
    '播放队列已自动保存': 'Your queue is saved automatically',
    '还没有播放音乐': 'No music playing',
    '还没有正在播放的歌': 'Nothing playing yet',
    '从队列里挑一首，或把音乐拖进来': 'Pick a track from the queue, or drop music here',
    '把每一次聆听留在原处': 'Keep every listen where it belongs',
    '让声音慢下来': 'Let the sound slow down',
    '歌曲内嵌歌词或同名 .lrc 文件会在这里逐行浮现。': 'Embedded lyrics or a matching .lrc file will appear here line by line.',
    '加入第一首歌': 'Add your first track',
    '等待播放': 'Waiting',
    '暂无歌词': 'No lyrics',
    '这首歌没有歌词': 'This track has no lyrics',
    '可以在音频文件里嵌入歌词，或在歌曲旁边放一个同名 .lrc 文件，再重新导入这首歌。': 'Embed lyrics in the audio file, or place a matching .lrc file next to it and import the track again.',
    '同步歌词': 'Synced lyrics',
    '纯文本': 'Plain text',
    '未同步歌词': 'Unsynced lyrics',
    '同步歌词 · 内嵌': 'Synced lyrics · embedded',
    'LRC · 本地文件': 'LRC · local file',
    '确定': 'OK',
    '取消': 'Cancel',
    '确认': 'Confirm',
    '清空播放队列？': 'Clear the play queue?',
    '队列中的 {count} 首歌和本轮已听标记都会被清除。音乐文件本身不会被删除。': 'The {count} tracks in the queue and this round’s played marks will be cleared. Your music files will not be deleted.',
    '清空队列': 'Clear queue',
    '要关闭曲栈吗？': 'Close Quzhan?',
    '选择一个关闭方式。无论选哪一项，播放队列和已听标记都会自动保存。': 'Choose how to close. Either way, your queue and played marks are saved automatically.',
    '窗口隐藏，当前播放不会中断': 'Hide the window and keep playing',
    '完全退出程序': 'Quit completely',
    '记住我此次的选择，以后不再提示': 'Remember my choice and don’t ask again',
    '文件不可用': 'File unavailable',
    '未知艺术家': 'Unknown artist',
    '正在播放 · {title}': 'Now playing · {title}',
    '0 分钟': '0 min',
    '0 首': '0 tracks',
    '· 自动保存': '· Auto-saved',
    '{count} 分钟': '{count} min',
    '{hours} 小时': '{hours} hr',
    '{hours} 小时 {minutes} 分钟': '{hours} hr {minutes} min',
    '{count} 首': '{count} tracks',
    '{count} 首未听': '{count} unplayed',
    '正在读取 {count} 个位置…': 'Reading {count} locations…',
    '已加入 {count} 首歌曲，自动排到队尾': 'Added {count} tracks to the end of the queue',
    '已跳过 {count} 首已在队列中的歌曲': 'Skipped {count} tracks already in the queue',
    '部分文件导入失败': 'Some files could not be imported',
    '另有 {count} 个失败': '{count} more failed',
    '导入失败：{message}': 'Import failed: {message}',
    '无法打开文件': 'Unable to open the file',
    '无法读取文件': 'Unable to read the file',
    '没有找到可导入的音频文件': 'No supported audio files were found',
    '正在导入上一批歌曲，请稍候': 'Importing the previous batch. Please wait.',
    '无法开始播放，请检查文件是否仍然存在或格式是否受支持': 'Unable to play. Check that the file still exists and the format is supported.',
    '无法播放“{title}”，文件可能已移动或格式暂不支持': 'Unable to play “{title}”. The file may have moved, or the format is not supported.',
    '读取播放列表失败：{message}': 'Unable to load the play queue: {message}',
    '未知错误': 'Unknown error',
    '先选中想循环的歌曲，或点击工具栏里的“循环选中”': 'Select tracks to loop first, or use Loop selection in the toolbar.',
    '先选中想循环的歌曲': 'Select tracks to loop first',
    '将循环当前选中的 {count} 首歌曲': 'Loop the {count} selected tracks',
    '当前循环列表中有 {count} 首歌曲': '{count} tracks in the loop list',
    '先在队列中选中歌曲': 'Select tracks in the queue first',
    '先在队列里选择歌曲': 'Select tracks in the queue first',
    '已设置循环 {count} 首歌曲': 'Looping {count} tracks',
    '已为 {count} 首歌打上已听标记': 'Marked {count} tracks as played',
    '已清除 {count} 首歌的已听标记': 'Cleared played marks for {count} tracks',
    '已从队列移除 {count} 首': 'Removed {count} tracks from the queue',
    '已移到{edge}': 'Moved to {edge}',
    '队首': 'the top',
    '队尾': 'the bottom',
    '播放队列已清空': 'Play queue cleared',
    '已清除全部已听标记，新一轮随机从现在开始': 'All played marks cleared. A new round starts now.',
    '本轮已全部听完，已清空已听标记并开始新的一轮': 'You finished this round. Played marks were cleared and a new round began.',
    '已按歌手排序': 'Sorted by artist',
    '已按歌名首字母排序': 'Sorted by title',
    '已恢复最初导入顺序': 'Restored the original import order',
    '已切换为{title}': 'Switched to {title}',
    '一轮随机已开启，本轮还剩 {count} 首未听': 'Round shuffle is on. {count} tracks left this round.',
    '桌面歌词窗口打开失败': 'Unable to open the desktop lyrics window',
    '先播放一首带歌词的歌，再打开桌面歌词': 'Play a track with lyrics before opening desktop lyrics.',
    '这首歌还没有歌词，暂时无法显示桌面歌词': 'This track has no lyrics, so desktop lyrics cannot be shown.',
    '桌面歌词需要在歌词中加入时间轴，或使用同名 .lrc 文件': 'Desktop lyrics need a timeline in the lyrics or a matching .lrc file.',
    '关闭桌面歌词': 'Close desktop lyrics',
    '当前还没有播放歌曲': 'No track is playing',
    '无法打开应用数据目录': 'Unable to open the app data folder',
    '无法读取 Windows 文件关联状态': 'Unable to read Windows file association status',
    '尚未在 Windows 中登记，点击右侧按钮完成登记': 'Not registered with Windows yet. Use the button on the right.',
    '已关联 {count} / {total} 种音频格式': '{count} / {total} audio formats associated',
    '已出现在“打开方式”中，尚未设为默认播放器': 'Available under Open with, not yet the default player',
    '曲栈已是全部支持格式的默认播放器': 'Quzhan is the default player for every supported format',
    '已打开 Windows 默认应用设置，请在系统界面确认曲栈': 'Windows Default Apps is open. Confirm Quzhan there.',
    '无法打开默认应用设置：{message}': 'Unable to open Default Apps: {message}',
    '以后点击关闭按钮时会先询问': 'The close button will ask every time',
    '以后点击关闭按钮会最小化到托盘': 'The close button will minimize to the tray',
    '以后点击关闭按钮会直接退出': 'The close button will quit Quzhan',
    '跳转到 {time}': 'Seek to {time}',
    '主题': 'Theme',
    '外观': 'Appearance',
    '边框、强调色和桌面歌词会跟随所选配色': 'Borders, accent colors, and desktop lyrics follow the selected palette',
    '切换后立即应用，并会记住你的选择': 'Applies immediately and is remembered',
    '界面主题': 'Interface theme',
    '跟随封面': 'Follow cover art',
    '琥珀': 'Amber',
    '潮汐': 'Tide',
    '苔原': 'Moss',
    '夜莓': 'Berry',
    '靛蓝': 'Indigo',
    '语言': 'Language',
    '界面语言': 'Interface language',
    '简体中文': '简体中文',
    '繁體中文': '繁體中文',
    'English': 'English',
    '快捷键': 'Keyboard shortcuts',
    '应用快捷键': 'App shortcuts',
    '暂停 / 继续': 'Play / Pause',
    '下一首': 'Next track',
    '上一首': 'Previous track',
    '往后 10 秒': 'Forward 10 seconds',
    '往前 10 秒': 'Back 10 seconds',
    '桌面歌词开关': 'Toggle desktop lyrics',
    '恢复默认快捷键': 'Restore default shortcuts',
    '按下新的快捷键…': 'Press a new shortcut…',
    '快捷键冲突': 'Shortcut conflict',
    '这个快捷键已用于“{action}”': 'That shortcut is already used for “{action}”',
    '快捷键已更新': 'Shortcut updated',
    '快捷键已恢复默认': 'Default shortcuts restored',
    '点击右侧按键，然后按下新的组合键': 'Click a key on the right, then press a new combination',
    '桌面歌词设置': 'Desktop lyrics settings',
    '悬浮窗大小': 'Overlay size',
    '调整桌面歌词窗的整体尺寸': 'Adjust the overall size of the desktop lyrics window',
    '整体不透明度': 'Overall opacity',
    '同时影响背景、文字和进度线': 'Affects the background, text, and progress line together',
    '锁定位置': 'Lock position',
    '锁定后不能拖动悬浮窗': 'Prevent the overlay from being dragged',
    '鼠标穿透': 'Click-through',
    '开启后鼠标点击会穿过悬浮窗': 'Let mouse clicks pass through the overlay',
    '自定义背景': 'Custom background',
    '导入背景图片': 'Import background image',
    '更换背景': 'Change background',
    '移除背景': 'Remove background',
    '背景模糊': 'Background blur',
    '背景调暗': 'Background dim',
    '让背景退到文字和封面之后': 'Push the background behind text and cover art',
    '提高歌词和歌曲信息的可读性': 'Improve legibility of lyrics and track information',
    '动态效果': 'Motion effect',
    '静态图片会缓慢呼吸移动；GIF 和动态 WebP 会保留动画': 'Static images get a slow breathing motion; GIF and animated WebP keep their animation',
    '背景已导入': 'Background imported',
    '已移除背景': 'Background removed',
    '图片格式不受支持': 'Unsupported image format',
    '搜索': 'Search',
    '搜索歌曲、歌手或专辑': 'Search tracks, artists, or albums',
    '搜索播放列表': 'Search the play queue',
    '清除搜索': 'Clear search',
    '定位到当前歌曲': 'Locate current track',
    '筛选': 'Filter',
    '筛选播放列表': 'Filter the play queue',
    '全部': 'All',
    '已标记': 'Played',
    '未标记': 'Unplayed',
    '没有匹配的歌曲': 'No matching tracks',
    '尝试更换关键词，或关闭筛选。': 'Try another keyword, or turn off the filter.',
    '清除搜索和筛选': 'Clear search and filters',
    '显示 {visible} / {total} 首': '{visible} / {total} tracks',
    '音频频谱': 'Audio spectrum',
    '播放进度': 'Playback progress',
    '切换播放模式': 'Change playback mode',
    '当前筛选：已标记': 'Filter: played',
    '当前筛选：未标记': 'Filter: unplayed',
    '当前筛选：全部': 'Filter: all',
    '安装程序语言': 'Installer language',
    '请选择安装语言': 'Choose installer language',
    '安装语言': 'Installer language',
    '默认背景': 'Default background',
    '恢复默认背景': 'Restore default background',
    '背景预览': 'Background preview',
    '导入': 'Import',
    '移除': 'Remove',
    '已启用': 'Enabled',
    '未启用': 'Disabled',
  };

  const TW_WORDS = [
    ['默认', '預設'],
    ['设置', '設定'],
    ['队列', '佇列'],
    ['文件', '檔案'],
    ['应用', '應用程式'],
    ['程序', '程式'],
    ['视频', '影片'],
    ['图片', '圖片'],
    ['鼠标', '滑鼠'],
    ['点击', '點擊'],
    ['拖动', '拖曳'],
    ['选择', '選擇'],
    ['恢复', '還原'],
    ['保存', '儲存'],
    ['自动', '自動'],
    ['错误', '錯誤'],
    ['失败', '失敗'],
    ['当前', '目前'],
    ['这里', '這裡'],
    ['里面', '裡面'],
    ['后面', '後面'],
    ['播放列表', '播放清單'],
    ['播放队列', '播放佇列'],
    ['歌单', '歌單'],
    ['桌面歌词', '桌面歌詞'],
    ['实时频谱', '即時頻譜'],
    ['频谱', '頻譜'],
    ['关闭', '關閉'],
    ['打开', '開啟'],
    ['托盘', '系統匣'],
    ['完全退出', '完全結束'],
    ['快捷键', '快速鍵'],
    ['语言', '語言'],
    ['主题', '主題'],
    ['模糊', '模糊'],
    ['调暗', '調暗'],
    ['透明度', '透明度'],
    ['鼠标穿透', '滑鼠穿透'],
    ['锁定', '鎖定'],
    ['安装', '安裝'],
    ['支持', '支援'],
    ['简体中文', '簡體中文'],
    ['繁体中文', '繁體中文'],
    ['搜索', '搜尋'],
    ['筛选', '篩選'],
    ['标记', '標記'],
    ['全部', '全部'],
    ['歌曲', '歌曲'],
    ['歌手', '歌手'],
    ['专辑', '專輯'],
    ['音量', '音量'],
    ['速度', '速度'],
    ['循环', '循環'],
    ['选中', '選取'],
    ['队列', '佇列'],
    ['排序', '排序'],
    ['歌名', '歌名'],
    ['歌词', '歌詞'],
    ['悬浮窗', '懸浮視窗'],
    ['窗口', '視窗'],
    ['安装程序', '安裝程式'],
    ['界面', '介面'],
    ['网络', '網路'],
    ['视频', '影片'],
    ['在线', '線上'],
    ['账号', '帳號'],
    ['默认应用', '預設應用程式'],
    ['文件关联', '檔案關聯'],
  ];

  const TW_CHARS = {
    '这': '這', '个': '個', '为': '為', '无': '無', '显': '顯', '开': '開',
    '边': '邊', '强': '強', '调': '調', '让': '讓', '还': '還', '这': '這',
    '关': '關', '设': '設', '队': '隊', '环': '環', '选': '選', '择': '擇',
    '标': '標', '记': '記', '听': '聽', '随': '隨', '机': '機', '声': '聲',
    '频': '頻', '谱': '譜', '实': '實', '时': '時', '间': '間', '种': '種',
    '联': '聯', '统': '統', '应': '應', '程': '程', '语': '語', '简': '簡',
    '体': '體', '复': '復', '后': '後', '里': '裡', '来': '來', '会': '會',
    '对': '對', '过': '過', '还': '還', '发': '發', '现': '現', '际': '際',
    '线': '線', '图': '圖', '签': '籤', '导': '導', '转': '轉', '换': '換',
    '认': '認', '读': '讀', '写': '寫', '载': '載', '输': '輸', '网': '網',
    '络': '絡', '录': '錄', '剧': '劇', '频': '頻', '乐': '樂', '专': '專',
    '辑': '輯', '页': '頁', '项': '項', '视': '視', '觉': '覺', '风': '風',
    '格': '格', '样': '樣', '式': '式', '质': '質', '量': '量', '宽': '寬',
    '窄': '窄', '长': '長', '短': '短', '点': '點', '击': '擊', '拖': '拖',
    '动': '動', '静': '靜', '态': '態', '锁': '鎖', '定': '定', '透': '透',
    '过': '過', '启': '啟', '动': '動', '关': '關', '闭': '閉', '删': '刪',
    '除': '除', '预': '預', '览': '覽', '试': '試', '验': '驗', '证': '證',
    '错': '錯', '误': '誤', '败': '敗', '成功': '成功', '确': '確', '认': '認',
    '联': '聯', '系': '系', '统': '統', '注': '註', '册': '冊', '册': '冊',
    '装': '裝', '载': '載', '运': '運', '行': '行', '进': '進', '度': '度',
    '条': '條', '缓冲': '緩衝', '冲': '衝', '暂': '暫', '停': '停', '恢': '恢',
    '复': '復', '原': '原', '始': '始', '顺': '順', '序': '序', '首': '首',
    '次': '次', '轮': '輪', '剩': '剩', '余': '餘', '听': '聽', '过': '過',
    '的': '的', '无': '無', '法': '法', '将': '將', '会': '會', '与': '與',
    '为': '為', '个': '個', '们': '們', '这': '這', '那': '那', '么': '麼',
    '样': '樣', '种': '種', '样': '樣', '于': '於', '台': '臺', '湾': '灣',
    '门': '門', '问': '問', '题': '題', '页': '頁', '面': '面', '条': '條',
    '项': '項', '级': '級', '类': '類', '别': '別', '对': '對', '应': '應',
    '该': '該', '无': '無', '数': '數', '据': '據', '库': '庫', '档': '檔',
    '案': '案', '夹': '夾', '盘': '盤', '路径': '路徑', '径': '徑', '图': '圖',
    '标': '標', '题': '題', '签': '籤', '书': '書', '签': '籤', '写': '寫',
    '读': '讀', '取': '取', '删': '刪', '查': '查', '找': '找', '寻': '尋',
    '览': '覽', '观': '觀', '看': '看', '见': '見', '现': '現', '实': '實',
    '时': '時', '间': '間', '钟': '鐘', '点': '點', '分': '分', '秒': '秒',
    '长': '長', '短': '短', '高': '高', '低': '低', '大': '大', '小': '小',
    '开': '開', '关': '關', '启': '啟', '闭': '閉', '锁': '鎖', '定': '定',
    '解': '解', '锁': '鎖', '更': '更', '改': '改', '换': '換', '变': '變',
    '化': '化', '设': '設', '置': '置', '项': '項', '值': '值', '默': '默',
    '认': '認', '预': '預', '设': '設', '定': '定', '义': '義', '自': '自',
    '定': '定', '义': '義', '颜': '顏', '色': '色', '风': '風', '格': '格',
    '主': '主', '题': '題', '背': '背', '景': '景', '图': '圖', '片': '片',
  };

  const currentLanguage = 'zh-CN';
  let language = currentLanguage;
  const reverseEn = new Map();
  for (const [source, target] of Object.entries(EN)) {
    if (!reverseEn.has(target)) reverseEn.set(target, source);
  }

  function toTraditional(source) {
    let value = String(source ?? '');
    for (const [from, to] of TW_WORDS) value = value.replaceAll(from, to);
    for (const [from, to] of Object.entries(TW_CHARS)) value = value.replaceAll(from, to);
    return value;
  }

  const reverseTw = new Map();
  for (const source of Object.keys(EN)) {
    const target = toTraditional(source);
    if (!reverseTw.has(target)) reverseTw.set(target, source);
  }

  function resolveSource(value) {
    const text = String(value ?? '');
    if (EN[text]) return text;
    if (reverseEn.has(text)) return reverseEn.get(text);
    if (reverseTw.has(text)) return reverseTw.get(text);
    return text;
  }

  function translateValue(value) {
    const source = resolveSource(value);
    if (language === 'en') return EN[source] ?? source;
    if (language === 'zh-TW') return toTraditional(source);
    return source;
  }

  function format(template, params) {
    return String(template).replace(/\{(\w+)\}/g, (match, key) =>
      params && Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match,
    );
  }

  function t(source, params) {
    const translated = translateValue(source);
    return params ? format(translated, params) : translated;
  }

  function translateNode(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style, .svg-sprite')) {
          return NodeFilter.FILTER_REJECT;
        }
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const raw = node.nodeValue;
      const trimmed = raw.trim();
      const translated = translateValue(trimmed);
      if (translated !== trimmed) node.nodeValue = raw.replace(trimmed, translated);
    }
  }

  function translateAttributes(root) {
    if (!root?.querySelectorAll) return;
    for (const element of root.querySelectorAll('[title], [aria-label], [placeholder]')) {
      for (const attribute of ['title', 'aria-label', 'placeholder']) {
        const value = element.getAttribute(attribute);
        if (!value) continue;
        const translated = translateValue(value);
        if (translated !== value) element.setAttribute(attribute, translated);
      }
    }
  }

  function translateDocument(root = document) {
    translateNode(root);
    translateAttributes(root);
    document.documentElement.lang = language === 'zh-CN' ? 'zh-CN' : language;
  }

  function setLanguage(nextLanguage) {
    if (!['en', 'zh-CN', 'zh-TW'].includes(nextLanguage)) return;
    language = nextLanguage;
    if (typeof document !== 'undefined') translateDocument(document);
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('quzhan:languagechange', { detail: language }));
    }
  }

  window.quzhanI18n = {
    t,
    setLanguage,
    translateDocument,
    getLanguage: () => language,
    languages: [
      { id: 'en', label: 'English' },
      { id: 'zh-CN', label: '简体中文' },
      { id: 'zh-TW', label: '繁體中文' },
    ],
  };
})();
