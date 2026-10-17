from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)

SIZE = 1024
image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)

# Deep ink tile.
draw.rounded_rectangle((32, 32, SIZE - 32, SIZE - 32), radius=230, fill="#090d13")

# Warm halo.
halo = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
halo_draw = ImageDraw.Draw(halo)
halo_draw.ellipse((142, 142, SIZE - 142, SIZE - 142), fill=(230, 168, 115, 54))
halo = halo.filter(ImageFilter.GaussianBlur(115))
image.alpha_composite(halo)
draw = ImageDraw.Draw(image)

# Record ring.
draw.ellipse((214, 214, SIZE - 214, SIZE - 214), outline=(230, 168, 115, 92), width=9)
draw.ellipse((280, 280, SIZE - 280, SIZE - 280), outline=(241, 232, 219, 28), width=5)

# Lyric bars: a compact, recognizable listening signal.
bar_specs = [
    (348, 235, 392, 585),
    (433, 160, 477, 660),
    (518, 266, 562, 605),
    (603, 205, 647, 620),
]
for left, top, right, bottom in bar_specs:
    draw.rounded_rectangle(
        (left, top, right, bottom),
        radius=22,
        fill=(242, 231, 216, 235),
    )

# Center pin.
draw.ellipse((482, 482, 542, 542), fill="#090d13", outline=(230, 168, 115, 255), width=13)

image.save(ASSETS / "icon.png")
image.save(
    ASSETS / "icon.ico",
    format="ICO",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
print(ASSETS / "icon.ico")
