import json
import math
import struct
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "work" / "fixtures"
PROFILE = ROOT / "work" / "test-profile"
FIXTURES.mkdir(parents=True, exist_ok=True)
PROFILE.mkdir(parents=True, exist_ok=True)


def make_wav(path: Path, seconds: int, base: float, modulation: float) -> None:
    sample_rate = 44100
    frames = bytearray()
    for index in range(sample_rate * seconds):
        t = index / sample_rate
        fade = min(1.0, t / 1.8, (seconds - t) / 1.8)
        swell = 0.55 + 0.45 * math.sin(2 * math.pi * 0.13 * t) ** 2
        tone = (
            math.sin(2 * math.pi * base * t) * 0.24
            + math.sin(2 * math.pi * base * 1.5 * t) * 0.1
            + math.sin(2 * math.pi * modulation * t) * 0.06
        )
        sample = int(max(-1, min(1, tone * swell * fade)) * 32767)
        frames.extend(struct.pack("<h", sample))
    with wave.open(str(path), "wb") as output:
        output.setnchannels(1)
        output.setsampwidth(2)
        output.setframerate(sample_rate)
        output.writeframes(frames)


def make_cover(path: Path, palette: tuple[str, str, str], seed: int) -> None:
    size = 700
    image = Image.new("RGB", (size, size), palette[0])
    draw = ImageDraw.Draw(image, "RGBA")
    for radius in range(520, 30, -18):
        alpha = int(10 + (520 - radius) * 0.06)
        draw.ellipse(
            (size / 2 - radius, size / 2 - radius, size / 2 + radius, size / 2 + radius),
            outline=(255, 240, 220, alpha),
            width=2,
        )
    for index in range(18):
        x = (index * 97 + seed * 83) % size
        y = (index * 53 + seed * 47) % size
        width = 30 + (index * 17) % 110
        draw.rounded_rectangle(
            (x - width, y - 7, x + width, y + 7),
            radius=7,
            fill=palette[index % 2],
        )
    glow = Image.new("RGB", (size, size), palette[2])
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse((60, 70, size - 40, size - 20), fill=130)
    mask = mask.filter(ImageFilter.GaussianBlur(100))
    image.paste(glow, (0, 0), mask)
    image.save(path)


tracks = [
    {
        "title": "晚风经过旧唱片店",
        "artist": "林屿",
        "album": "夜行手记",
        "base": 196.0,
        "modulation": 293.66,
        "palette": ("#1b272c", "#dba272", "#71594f"),
        "lyrics": """[00:00.00]晚风经过旧唱片店
[00:03.50]街灯把影子拉得很长
[00:07.20]有人把旧歌翻到背面
[00:11.10]让没说完的话继续唱
[00:15.20]我们坐在时间的边缘
[00:19.00]听见城市慢慢入眠
[00:23.00]等最后一班车驶远
[00:27.00]再把这一夜轻轻收好
[00:31.00]♪
[00:34.00]晚风经过旧唱片店
[00:38.00]仍留着你的那一面""",
    },
    {
        "title": "潮汐以北",
        "artist": "南岸乐队",
        "album": "蓝色时刻",
        "base": 146.83,
        "modulation": 220.0,
        "palette": ("#101d2a", "#8db7b3", "#385d69"),
        "lyrics": """[00:01.00]海面把月光折成两半
[00:05.20]一半给远方一半给岸
[00:09.60]潮汐以北有风经过
[00:14.00]替我把沉默慢慢吹散
[00:19.40]如果黎明还没来得及
[00:24.30]照亮那些未寄出的信
[00:29.10]就让这首歌一直向前
[00:34.00]越过潮汐越过冬天""",
    },
    {
        "title": "凌晨四点的花",
        "artist": "周渡",
        "album": "无人花园",
        "base": 261.63,
        "modulation": 392.0,
        "palette": ("#251d28", "#d6a8a2", "#5e4558"),
        "lyrics": """[00:00.60]凌晨四点的花
[00:04.40]开在没人经过的窗台
[00:08.80]天色尚未决定醒来
[00:13.20]梦还停在昨夜的门外
[00:18.00]我看见很远的星星
[00:22.40]落进一杯微凉的茶
[00:27.10]等清晨的第一束光
[00:31.60]把所有心事都回答""",
    },
]

queue = []
for index, track in enumerate(tracks):
    audio_path = FIXTURES / f"{index + 1:02d}-{track['title']}.wav"
    if not audio_path.exists():
        make_wav(audio_path, 42, track["base"], track["modulation"])
    lrc_path = FIXTURES / f"{index + 1:02d}-{track['title']}.lrc"
    lrc_path.write_text(track["lyrics"], encoding="utf-8")
    cover_path = PROFILE / "covers" / f"demo-{index + 1}.png"
    cover_path.parent.mkdir(parents=True, exist_ok=True)
    make_cover(cover_path, track["palette"], index + 1)
    queue.append(
        {
            "id": f"demo-{index + 1}",
            "path": str(audio_path),
            "fileName": audio_path.name,
            "title": track["title"],
            "artist": track["artist"],
            "album": track["album"],
            "duration": 42,
            "coverPath": str(cover_path),
            "lyrics": track["lyrics"],
            "lyricsSource": "sidecar",
            "played": index < 1,
            "addedAt": 1760000000000 + index,
            "missing": False,
        }
    )

state = {
    "version": 1,
    "queue": queue,
    "currentId": "demo-1",
    "currentTime": 6.8,
    "volume": 0.72,
    "muted": False,
    "rate": 1,
    "mode": "shuffle",
    "queueOpen": True,
    "selectionLoopIds": [],
    "desktopLyrics": False,
    "updatedAt": 1760000000000,
}
(PROFILE / "library.json").write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
print(PROFILE / "library.json")
